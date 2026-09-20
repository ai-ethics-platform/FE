const STORAGE_KEY = 'dilemma.creator.diagnostics.v1';
const BUILD_ID = import.meta.env?.VITE_BUILD_ID || 'creator-diag-20260920-v2';
const isCreatorPath = path => /^\/(?:chatpage[23]?(?:\/renewal)?|create\d+|editor[\d_]+|creatorending)\/?$/.test(path);
const cleanId = value => String(value || '').replace(/[^\w-]/g, '').slice(0, 80);
let started = false;
let worker;
let active = false;
let queue = [];
let sequence = 0;
let dropped = 0;
let traceId;
let pageId;
let config;
let lastPointer;
let context = { path: '/', session_id: '', game_code: '', phase: '', busy: false,
  browser_versions: [], browser_version_status: 'pending' };
const pendingRequests = new Map();

export async function readBrowserVersions(userAgentData) {
  if (typeof userAgentData?.getHighEntropyValues !== 'function') {
    return { browser_versions: [], browser_version_status: 'unsupported' };
  }
  try {
    const { fullVersionList = [] } = await userAgentData.getHighEntropyValues(['fullVersionList']);
    const browser_versions = fullVersionList
      .filter(item => typeof item?.brand === 'string' && item.brand.length > 0 && item.brand.length <= 80 &&
        typeof item.version === 'string' && /^\d+(?:\.\d+){1,3}$/.test(item.version) && item.version.length <= 40)
      .slice(0, 8).map(({ brand, version }) => ({ brand, version }));
    return { browser_versions, browser_version_status: browser_versions.length ? 'available' : 'unavailable' };
  } catch {
    return { browser_versions: [], browser_version_status: 'error' };
  }
}

function persist() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ traceId, queue, context })); return true; }
  catch { return false; }
}

function acknowledge(ids) {
  queue = queue.filter(event => !ids.includes(event.id));
  persist();
}

function snapshot() {
  return { active, context: { ...context }, visible: document.visibilityState === 'visible', focused: document.hasFocus() };
}

let fallbackSending = false;
async function sendFallback() {
  if (!config || fallbackSending || !queue.length) return;
  const events = queue.slice(0, 20);
  while (new TextEncoder().encode(JSON.stringify({ ...config.batch, events })).length > 24000) events.pop();
  if (!events.length) return;
  fallbackSending = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(config.url, { method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json', 'x-api-key': config.key },
      body: JSON.stringify({ ...config.batch, events }), signal: controller.signal });
    if (response.ok) acknowledge(events.map(event => event.id));
  } catch { /* The next heartbeat or reload retries. */ }
  finally { clearTimeout(timer); fallbackSending = false; }
}

function publish() {
  try {
    if (worker) worker.postMessage({ events: queue, snapshot: snapshot() });
    else void sendFallback();
  } catch { /* Diagnostics must not change application behavior. */ }
}

export function diagnosticEvent(kind, details = {}) {
  if (!started || !active) return;
  try {
    queue.push({ ...context, id: `${pageId}.${++sequence}`, at: new Date().toISOString(), kind, details });
    if (queue.length > 200) { dropped += queue.length - 200; queue = queue.slice(-200); }
    persist();
    publish();
  } catch { /* Best effort, including unavailable storage and detached DOM nodes. */ }
}

export function diagnosticState(patch) {
  if (!started) return;
  const next = { ...context };
  for (const key of ['session_id', 'game_code', 'phase']) {
    if (key in patch) next[key] = cleanId(patch[key]);
  }
  if ('busy' in patch) next.busy = !!patch.busy;
  if (JSON.stringify(next) === JSON.stringify(context)) return;
  context = next;
  diagnosticEvent('state');
}

export function diagnosticRoute(path) {
  if (!started) return;
  const changed = context.path !== path;
  if (changed && active) diagnosticEvent('lifecycle', { event: 'route_leave' });
  active = isCreatorPath(path);
  context = { ...context, path: active ? path : '/', ...(changed ? { phase: '', busy: false } : {}) };
  try { context.game_code = active ? cleanId(localStorage.getItem('code')) : ''; } catch { /* optional */ }
  if (active && changed) diagnosticEvent('route');
  publish();
}

function targetName(target) {
  const element = target?.closest?.('[data-diagnostic],button,a,input,textarea,[role="button"]') || target;
  return String(element?.getAttribute?.('data-diagnostic') ||
    `${element?.tagName || 'unknown'}${element?.type ? `:${element.type}` : ''}.${String(element?.className || '').slice(0, 100)}`).slice(0, 160);
}

export function diagnosticError(kind, error, stack) {
  // No request bodies, headers, form values or arbitrary rejection objects.
  const redact = text => String(text || '').replace(/https?:\/\/[^\s)]+/g, url => url.split(/[?#]/)[0])
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, '[token]').slice(0, 1400);
  diagnosticEvent(kind, { name: redact(error?.name || 'Error'),
    message: redact(typeof error?.message === 'string' ? error.message : 'Non-Error rejection'),
    stack: redact(error?.stack || stack), ...(stack ? { source: redact(stack) } : {}) });
}

export function diagnosticRequestStart(method, url, timeout = 0) {
  if (!active) return null;
  let endpoint;
  try { endpoint = new URL(url, location.origin).pathname; } catch { endpoint = '/unknown'; }
  // Keep resource identifiers only as separate game/session correlation fields.
  endpoint = endpoint.replace(/(\/custom-games\/)[^/]+/, '$1:code').replace(/(\/chat\/session\/)[^/]+/, '$1:session');
  const request = { request_id: `${pageId}.r${++sequence}`, method: String(method).toUpperCase(),
    endpoint: endpoint.slice(0, 160), timeout_ms: timeout, startedAt: Date.now() };
  pendingRequests.set(request.request_id, request.startedAt);
  const { startedAt: _time, ...details } = request;
  diagnosticEvent('request_start', details);
  return request;
}

export function diagnosticRequestEnd(request, status, code) {
  if (!request) return;
  pendingRequests.delete(request.request_id);
  const { startedAt, ...details } = request;
  diagnosticEvent(code ? 'request_error' : 'request_end', { ...details, status: status || 0,
    duration_ms: Date.now() - startedAt, ...(code ? { code: String(code).slice(0, 80) } : {}) });
}

export function startCreatorDiagnostics() {
  if (started || typeof window === 'undefined' || !import.meta.env?.VITE_ADMIN_INGEST_URL) return;
  try {
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY)); } catch { /* optional */ }
    traceId = cleanId(saved?.traceId) || crypto.randomUUID();
    pageId = crypto.randomUUID();
    context.session_id = cleanId(saved?.context?.session_id);
    queue = Array.isArray(saved?.queue) ? saved.queue.slice(-200).filter(e => e?.id && e?.kind && e?.at) : [];
    config = { url: `${import.meta.env.VITE_ADMIN_INGEST_URL.replace(/\/$/, '')}/api/diagnostics`,
      key: import.meta.env.VITE_ADMIN_INGEST_API_KEY,
      batch: { trace_id: traceId, page_id: pageId, build_id: BUILD_ID, user_agent: navigator.userAgent.slice(0, 400) } };
    started = true;
    try {
      worker = new Worker(new URL('./creatorDiagnostics.worker.js', import.meta.url), { type: 'module' });
      const startupTimer = setTimeout(() => {
        worker?.terminate(); worker = null;
        diagnosticEvent('diagnostic_status', { worker: false, event: 'worker_start_timeout' });
      }, 8000);
      worker.onmessage = ({ data }) => {
        if (data.ready) {
          clearTimeout(startupTimer);
          diagnosticEvent('diagnostic_status', { worker: true, event: 'worker_ready' });
        }
        if (data.ack) acknowledge(data.ack);
        if (data.transportError) {
          diagnosticError('diagnostic_status', data.transportError);
          void sendFallback();
        }
      };
      worker.onerror = () => { clearTimeout(startupTimer); worker?.terminate(); worker = null; diagnosticEvent('diagnostic_status', { worker: false }); };
      worker.postMessage({ config });
    } catch { worker = null; }
    diagnosticRoute(location.pathname);
    diagnosticEvent('page_start', { worker: !!worker, storage_ok: persist(),
      build_asset: [...document.scripts].find(s => s.type === 'module')?.src.split(/[?#]/)[0].slice(0, 300) || '' });
    // Do not delay app startup. Keep versions on each event so replayed events retain their original browser.
    void readBrowserVersions(navigator.userAgentData).then(browserInfo => {
      context = { ...context, ...browserInfo };
      diagnosticEvent('diagnostic_status', { event: 'browser_version' });
      publish();
    });

    const throttledAt = new Map();
    for (const type of ['pointerdown', 'pointerup', 'click', 'keydown', 'input', 'dragstart', 'dragend', 'drop', 'pointercancel']) {
      window.addEventListener(type, event => {
        if (!active || event.target?.type === 'password') return;
        if (type === 'keydown' && !['Enter', 'Escape', 'Tab'].includes(event.key)) return;
        if (['input', 'pointerup'].includes(type) && Date.now() - (throttledAt.get(type) || 0) < 1000) return;
        throttledAt.set(type, Date.now());
        const details = { target: targetName(event.target), trusted: event.isTrusted,
          disabled: !!event.target?.closest?.(':disabled,[aria-disabled="true"]') };
        if (type === 'keydown') details.key = event.key;
        if (type === 'input') details.input_length = event.target?.value?.length || 0;
        if ('clientX' in event) { details.x = Math.round(event.clientX); details.y = Math.round(event.clientY); }
        diagnosticEvent(type, details);
      }, { capture: true, passive: true });
    }
    window.addEventListener('pointermove', e => { if (active) lastPointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
    document.addEventListener('selectionchange', () => {
      if (Date.now() - (throttledAt.get('selection') || 0) < 1000) return;
      throttledAt.set('selection', Date.now());
      diagnosticEvent('selection', { selection_length: String(document.getSelection() || '').length });
    });
    window.addEventListener('error', e => {
      if (e.error || e.message) diagnosticError('error', e.error || { message: e.message });
      else diagnosticEvent('resource_error', { target: targetName(e.target) });
    }, true);
    window.addEventListener('unhandledrejection', e => diagnosticError('unhandled_rejection', e.reason));
    for (const type of ['focus', 'blur', 'online', 'offline', 'pageshow', 'pagehide']) {
      window.addEventListener(type, e => {
        diagnosticEvent('lifecycle', { event: type, persisted: !!e.persisted });
        if (type === 'pagehide') void sendFallback();
      });
    }
    document.addEventListener('visibilitychange', () => {
      diagnosticEvent('lifecycle', { event: 'visibility', visible: document.visibilityState === 'visible' });
      if (document.visibilityState === 'hidden') void sendFallback();
    });
    if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
      new PerformanceObserver(list => {
        const entries = list.getEntries().filter(e => e.duration >= 200);
        if (entries.length) diagnosticEvent('long_task', { count: entries.length,
          duration_ms: Math.round(Math.max(...entries.map(e => e.duration))) });
      }).observe({ type: 'longtask', buffered: false });
    }
    let lastBeat = Date.now();
    setInterval(() => {
      const now = Date.now();
      if (active) {
        const hit = lastPointer && document.elementFromPoint?.(lastPointer.x, lastPointer.y);
        const style = hit && getComputedStyle(hit);
        diagnosticEvent('main_heartbeat', { lag_ms: Math.max(0, now - lastBeat - 5000),
          visible: document.visibilityState === 'visible', focused: document.hasFocus(), online: navigator.onLine,
          pending_requests: pendingRequests.size, dropped, hit_target: hit ? targetName(hit) : '',
          cursor: style?.cursor || '', pointer_events: style?.pointerEvents || '',
          language: document.documentElement.lang.slice(0, 40),
          translated: /translated/.test(document.documentElement.className) });
      }
      lastBeat = now;
      publish();
    }, 5000);
  } catch { /* Failure of monitoring must never prevent app startup. */ }
}

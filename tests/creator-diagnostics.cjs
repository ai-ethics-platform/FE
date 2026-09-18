// JSDOM_MODULE=/path/to/jsdom node tests/creator-diagnostics.cjs
// Executes the real entry point and worker code; no production requests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const esbuild = require('esbuild');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');
const root = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'creator-diagnostics-'));
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/create03', pretendToBeVisual: true });
Object.assign(global, { window: dom.window, document: dom.window.document, location: dom.window.location,
  sessionStorage: dom.window.sessionStorage, localStorage: dom.window.localStorage,
  getComputedStyle: dom.window.getComputedStyle, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
const React = require('react');
const intervals = [];
const realInterval = global.setInterval;
global.setInterval = fn => { intervals.push(fn); return intervals.length; };
const posted = [];
let worker;
global.Worker = class {
  constructor() { worker = this; }
  postMessage(data) { posted.push(structuredClone(data)); if (data.config) queueMicrotask(() => this.onmessage({ data: { ready: true } })); }
  terminate() {}
};
const ingest = [];
global.fetch = async (url, options) => { ingest.push({ url, body: options.body }); return { ok: true, status: 200 }; };

(async () => {
  sessionStorage.setItem('dilemma.admin.pending', JSON.stringify({ test: {
    session_id: 'test', event: 'complete', messages: [], game_code: 'TEST',
  } }));
  localStorage.setItem('code', 'TEST');
  const file = path.join(tmp, 'entry.cjs');
  await esbuild.build({ stdin: { contents: `import '${root}/src/main.jsx'; export * from '${root}/src/utils/creatorDiagnostics.js';`, resolveDir: root },
    outfile: file, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', logLevel: 'silent',
    external: ['react', 'react-dom/client', 'react-router-dom'],
    define: { 'import.meta.url': JSON.stringify('file:///test/creatorDiagnostics.js'),
      'import.meta.env': JSON.stringify({ VITE_ADMIN_INGEST_URL: 'https://mock.invalid', VITE_ADMIN_INGEST_API_KEY: 'test' }) },
    plugins: [{ name: 'pages-only', setup(build) {
      build.onResolve({ filter: /(?:\.\.\/pages\/|\.\.\/components\/|\.\.\/Web(?:Socket|RTC)Provider)/ }, args => ({ path: args.path, namespace: 'empty-page' }));
      build.onLoad({ filter: /.*/, namespace: 'empty-page' }, () => ({ contents: 'export default function Page(){return null}' }));
    } }],
  });
  // Resolve the app's installed React from the temporary bundle.
  process.env.NODE_PATH = path.join(root, 'node_modules'); require('module').Module._initPaths();
  let diag;
  await React.act(async () => { diag = require(file); });
  assert.ok(posted.some(p => p.config), 'Actual main.jsx must initialize the worker');
  assert.ok(ingest.some(p => p.url.endsWith('/api/ingest')), 'Mounted Router must flush saved completion');
  sessionStorage.setItem('dilemma.admin.pending', '{}');
  window.dispatchEvent(new dom.window.Event('online'));
  const getEvents = () => posted.flatMap(p => p.events || []);
  diag.diagnosticState({ session_id: 'renewal-test', phase: 'ending', busy: false });
  const input = document.createElement('textarea'); input.value = 'PRIVATE CHAT CONTENT'; document.body.append(input);
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'p', bubbles: true }));
  input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  input.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const request = diag.diagnosticRequestStart('PUT', '/custom-games/SECRET_CODE/dilemma?token=SECRET', 20000);
  diag.diagnosticRequestEnd(request, 0, 'ECONNABORTED');
  diag.diagnosticError('react_error', new Error('removeChild test@example.com https://site/path?token=SECRET'));
  intervals[0]();
  const events = getEvents();
  for (const kind of ['page_start', 'route', 'input', 'keydown', 'click', 'request_start', 'request_error', 'react_error', 'main_heartbeat']) {
    assert.ok(events.some(e => e.kind === kind), `Missing ${kind}`);
  }
  assert.ok(events.some(e => e.kind === 'request_error' && e.details.duration_ms >= 0));
  const serialized = JSON.stringify(events);
  for (const secret of ['PRIVATE CHAT CONTENT', 'SECRET', 'test@example.com']) assert.ok(!serialized.includes(secret));
  assert.ok(!events.some(e => e.kind === 'keydown' && e.details.key === 'p'));
  assert.ok(events.some(e => e.session_id === 'renewal-test' && e.game_code === 'TEST'));
  const last = events.at(-1);
  worker.onmessage({ data: { ack: [last.id] } });
  assert.ok(!JSON.parse(sessionStorage.getItem('dilemma.creator.diagnostics.v1')).queue.some(e => e.id === last.id));
  diag.diagnosticRoute('/game01');
  const before = getEvents().length;
  diag.diagnosticEvent('action', { action: 'not_creator' });
  assert.equal(getEvents().length, before, 'Game play must not be collected');
  console.log('PASS actual main/Router wiring, completion replay, creator route scope, errors/API/DOM events, redaction, ACK persistence');

  // Run the exact worker source with a controlled clock and network.
  let now = Date.now();
  const timers = [];
  const ticks = [];
  const batches = [];
  const acks = [];
  let fail = true;
  const clock = class extends Date { constructor(...args) { super(...(args.length ? args : [now])); } static now() { return now; } };
  const scope = { self: { postMessage: message => acks.push(message) }, Date: clock, Set, TextEncoder, AbortController,
    setTimeout: fn => { timers.push(fn); return timers.length; }, clearTimeout() {},
    setInterval: fn => ticks.push(fn),
    fetch: async (_url, options) => { batches.push(JSON.parse(options.body)); return { ok: !fail, status: fail ? 503 : 200 }; } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src/utils/creatorDiagnostics.worker.js'), 'utf8'), scope);
  const cfg = posted.find(p => p.config).config;
  const sample = { id: 'page.1', at: new Date(now).toISOString(), kind: 'click', path: '/create03', details: {} };
  scope.self.onmessage({ data: { config: cfg, events: [sample], snapshot: {
    active: true, visible: true, focused: true, context: { path: '/create03', session_id: 'renewal-test', phase: 'ending', busy: false, game_code: 'TEST' },
  } } });
  timers.shift()();
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(!acks.some(a => a.ack), 'HTTP failure must retain pending events');
  assert.equal(acks.find(a => a.transportError).transportError.message, 'HTTP 503');
  now += 21000;
  fail = false;
  ticks[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.ok(batches.at(-1).events.some(e => e.id === sample.id), 'Failed event must be retried');
  assert.ok(batches.at(-1).events.some(e => e.kind === 'main_unresponsive' && e.details.main_age_ms === 21000));
  assert.ok(acks.at(-1).ack.includes(sample.id));
  scope.self.onmessage({ data: { snapshot: { active: true, visible: false, focused: false, context: { path: '/create03' } } } });
  now += 60000; ticks[0]();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(batches.at(-1).events.at(-1).kind, 'worker_heartbeat', 'Hidden tab is not classified as a main-thread stall');
  assert.ok(batches.every(b => Buffer.byteLength(JSON.stringify(b)) <= 24000 && b.events.length <= 20));
  console.log('PASS worker survives absent main pulses, distinguishes hidden tab, retries 503, ACKs, and bounds payloads');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { global.setInterval = realInterval; dom.window.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

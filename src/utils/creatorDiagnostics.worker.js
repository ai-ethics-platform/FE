// This thread can report a stalled React/main thread. It cannot survive a browser crash.
let config;
let snapshot;
let lastPulse = Date.now();
let sequence = 0;
let sending = false;
let scheduled;
let queue = [];
let lastFailure = 0;

async function flush() {
  if (sending || !config || !queue.length) return;
  const events = queue.slice(0, 20);
  while (new TextEncoder().encode(JSON.stringify({ ...config.batch, events })).length > 24000) events.pop();
  if (!events.length) return;
  sending = true;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(config.url, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': config.key },
      body: JSON.stringify({ ...config.batch, events }), signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const ids = events.map(event => event.id);
    queue = queue.filter(event => !ids.includes(event.id));
    self.postMessage({ ack: ids });
  } catch (error) {
    if (Date.now() - lastFailure > 60000) {
      lastFailure = Date.now();
      self.postMessage({ transportError: { name: error.name, message: error.message } });
    }
    // Retry bounded pending events on the next pulse; never block the UI.
  }
  finally { clearTimeout(timer); sending = false; }
}

self.onmessage = ({ data }) => {
  if (data.config) { config = data.config; self.postMessage({ ready: true }); }
  if (data.snapshot) { snapshot = data.snapshot; lastPulse = Date.now(); }
  if (data.events) {
    const ids = new Set(queue.map(event => event.id));
    queue.push(...data.events.filter(event => !ids.has(event.id)));
    queue = queue.slice(-200);
  }
  if (!scheduled) scheduled = setTimeout(() => { scheduled = null; flush(); }, 1000);
};

setInterval(() => {
  if (!config || !snapshot) return;
  const age = Date.now() - lastPulse;
  // Hidden tabs, OS sleep and suspended workers can delay timers too; log visibility and age.
  if (snapshot.active) {
    queue.push({ ...snapshot.context, id: `${config.batch.page_id}.w${++sequence}`,
      at: new Date().toISOString(),
      kind: snapshot.visible && age > 15000 ? 'main_unresponsive' : 'worker_heartbeat',
      details: { main_age_ms: age, visible: snapshot.visible, focused: snapshot.focused } });
    queue = queue.slice(-200);
  }
  flush();
}, 15000);

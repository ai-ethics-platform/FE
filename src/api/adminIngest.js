// Latest unsent snapshot per session. Router navigation keeps this sender alive;
// sessionStorage also preserves it across a reload in the same tab.
const STORAGE_KEY = 'dilemma.admin.pending';
let pending = {};
let inFlight;
try { pending = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch { /* Storage may be unavailable. */ }
if (!pending || typeof pending !== 'object' || Array.isArray(pending)) pending = {};
pending = Object.fromEntries(Object.entries(pending).filter(([id, record]) =>
  record?.session_id === id && ['start', 'progress', 'complete', 'abandon'].includes(record.event)));

function persistPending() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending)); }
  catch (error) { console.warn('관리자 기록 재전송 보관 실패:', error); }
}

export function flushPendingIngest() {
  if (inFlight) return inFlight;
  const baseUrl = import.meta.env.VITE_ADMIN_INGEST_URL;
  if (!baseUrl || !Object.keys(pending).length) return Promise.resolve();
  inFlight = (async () => {
    const failed = new Set();
    for (;;) {
      const id = Object.keys(pending).find(key => !failed.has(key));
      if (!id) break;
      const record = pending[id];
      let sent = false;
      for (let attempt = 0; attempt < 2 && !sent; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        try {
          const response = await fetch(`${baseUrl}/api/ingest`, {
            method: 'POST', signal: controller.signal,
            headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ADMIN_INGEST_API_KEY },
            body: JSON.stringify(record),
            // Full transcripts exceed the browser's keepalive body budget.
          });
          if (!response.ok) throw new Error(`Admin ingest HTTP ${response.status}`);
          sent = true;
        } catch (error) {
          console.warn('sendIngestEvent failed:', error);
        } finally { clearTimeout(timer); }
      }
      if (!sent) {
        // A failed session must not block delivery of another session's completion.
        if (pending[id] === record) failed.add(id);
        continue; // Retain for the next event, online event or page reload.
      }
      if (pending[id] === record) delete pending[id];
      persistPending();
    }
  })().finally(() => { inFlight = null; });
  return inFlight;
}

// Best effort delivery must never block or throw into the game/chat handlers.
export function sendIngestEvent(event, payload) {
  try {
    if (!import.meta.env.VITE_ADMIN_INGEST_URL || !payload.session_id) return Promise.resolve();
    const previous = pending[payload.session_id];
    if (previous?.event === 'complete' && event !== 'complete') return flushPendingIngest();
    if (!previous || !['complete', 'abandon'].includes(previous.event) || ['complete', 'abandon'].includes(event)) {
      pending[payload.session_id] = { ...payload, event };
      persistPending();
    }
    return flushPendingIngest();
  } catch (err) {
    console.warn("sendIngestEvent failed:", err);
    return Promise.resolve();
  }
}

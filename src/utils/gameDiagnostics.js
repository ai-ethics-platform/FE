import { readGameRequestContext } from './gameRequestContext.js';

let sequence = 0;
let timer;
let sending = false;
let failures = 0;
let owner;
const queue = [];
const strings = new Set(['source', 'phase', 'before_code', 'before_loaded_code', 'after_code', 'after_loaded_code',
  'requested_code', 'load_attempt_id', 'message_id', 'message_type', 'destination', 'story_source', 'next_page_path', 'error_code',
  'code_source', 'diagnostic_version', 'opening_fingerprint', 'story_fingerprint', 'role_descriptions_fingerprint']);
const numbers = new Set(['duration_ms', 'status_code', 'opening_count', 'roles_count', 'participant_count',
  'ready_count', 'assigned_role_count', 'slide_index', 'paragraph_index', 'description_role_id', 'role_id']);
const booleans = new Set(['custom_mode', 'custom_game_ready', 'code_present', 'loaded_code_matches',
  'room_game_bound', 'custom_game_code_present', 'opening_parse_failed', 'room_topic_matches_game_title']);

// Bounded metadata only. Never pass text, tokens or arbitrary websocket payloads.
export function snapshotGameDiagnostic() {
  try {
    const id = globalThis.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const n = Math.floor(Math.random() * 16);
      return (c === 'x' ? n : (n & 3) | 8).toString(16);
    });
    return { account: localStorage.getItem('user_id') || '', id, at: new Date().toISOString(), sequence: ++sequence, context: readGameRequestContext() };
  } catch { return null; }
}

export function recordGameDiagnostic(event, properties = {}, snapshot = snapshotGameDiagnostic()) {
  try {
    const token = localStorage.getItem('access_token');
    const account = localStorage.getItem('user_id') || '';
    if (owner !== undefined && owner !== account) queue.length = 0;
    owner = account;
    const details = {};
    for (const [key, value] of Object.entries(properties)) {
      if (strings.has(key) && typeof value === 'string' && /^[\w./:-]{0,120}$/.test(value)) details[key] = value;
      if (numbers.has(key) && Number.isInteger(value) && value >= 0 && value <= 100000000) details[key] = value;
      if (booleans.has(key) && typeof value === 'boolean') details[key] = value;
    }
    // Pre-login state is already recorded by the login request header; do not attribute it to a later account.
    if (!token || !snapshot || snapshot.account !== account) return;
    const { id, at, sequence: observedSequence, context } = snapshot;
    queue.push({ id, at, sequence: observedSequence, context, event, details });
    if (queue.length > 100) queue.shift();
    if (!timer && !sending) timer = setTimeout(flush, 500);
  } catch { /* Diagnostics must never change game behavior. */ }
}

async function flush() {
  timer = undefined;
  if (sending || !queue.length) return;
  let timeout;
  sending = true;
  try {
    if ((localStorage.getItem('user_id') || '') !== owner) { queue.length = 0; return; }
    const token = localStorage.getItem('access_token');
    if (!token) { queue.length = 0; return; }
    const batch = queue.slice(0, 5);
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'https://dilemmai-idl.com').replace(/\/$/, '')}/game-diagnostics`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ events: batch }), signal: controller.signal, keepalive: true,
    });
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        const rejected = new Set(batch.map(item => item.id));
        for (let i = queue.length - 1; i >= 0; i--) if (rejected.has(queue[i].id)) queue.splice(i, 1);
      }
      throw new Error('Diagnostic delivery failed');
    }
    const delivered = new Set(batch.map(item => item.id));
    for (let i = queue.length - 1; i >= 0; i--) if (delivered.has(queue[i].id)) queue.splice(i, 1);
    failures = 0;
  } catch { failures = Math.min(failures + 1, 5); }
  finally {
    clearTimeout(timeout);
    sending = false;
    // shortcut: The last 100 unsent events live in memory; a forced browser kill may lose them.
    if (queue.length) timer = setTimeout(flush, failures ? Math.min(30000, 1000 * 2 ** failures) : 500);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => { clearTimeout(timer); void flush(); });
}

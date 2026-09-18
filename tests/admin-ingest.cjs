// node tests/admin-ingest.cjs — all requests are local mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const esbuild = require('esbuild');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ingest-retry-'));
const filename = path.join(directory, 'ingest.cjs');
const storage = new Map();
global.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
const key = 'dilemma.admin.pending';
const calls = [];
const payload = { session_id: 'renewal-test', teacher_name: '테스트', teacher_school: '학교',
  teacher_email: 'test@example.com', started_at: '2026-09-18T00:00:00Z', messages: [{role:'assistant',content:'긴 대화'.repeat(12000)}] };
const load = () => { delete require.cache[filename]; return require(filename); };
const warn = console.warn;
const warnings = [];
console.warn = (...args) => warnings.push(args);

(async () => {
  await esbuild.build({ entryPoints: [path.join(__dirname, '../src/api/adminIngest.js')], outfile: filename,
    bundle: true, format: 'cjs', platform: 'node', logLevel: 'silent',
    define: { 'import.meta.env': JSON.stringify({ VITE_ADMIN_INGEST_URL: 'http://mock.invalid', VITE_ADMIN_INGEST_API_KEY: 'test' }) } });
  let ingest = load();
  global.fetch = async (_url, options) => { calls.push(options); return { ok: true }; };
  ingest.flushPendingIngest(); // An empty startup flush must not swallow a start event in the same tick.
  await ingest.sendIngestEvent('start', payload);
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(storage.get(key)), {});
  assert.ok(Buffer.byteLength(calls[0].body) > 65536);
  assert.notEqual(calls[0].keepalive, true);
  assert.ok(calls[0].signal instanceof AbortSignal);

  global.fetch = async () => ({ ok: false, status: 503 });
  await ingest.sendIngestEvent('complete', { ...payload, game_code: 'TEST', ended_at: '2026-09-18T01:00:00Z' });
  assert.equal(warnings.length, 2, 'HTTP errors must be noticed and retried');
  assert.equal(JSON.parse(storage.get(key))[payload.session_id].event, 'complete');
  ingest = load(); // Reload after a failed completion; the chat page may already be gone.
  global.fetch = async (_url, options) => { calls.push(options); return { ok: true }; };
  await ingest.flushPendingIngest();
  assert.equal(JSON.parse(calls.at(-1).body).game_code, 'TEST');
  assert.deepEqual(JSON.parse(storage.get(key)), {});

  let release;
  global.fetch = async (_url, options) => {
    calls.push(options);
    if (JSON.parse(options.body).event === 'progress') return new Promise(resolve => { release = resolve; });
    return { ok: true };
  };
  const checkpoint = ingest.sendIngestEvent('progress', payload);
  const completion = ingest.sendIngestEvent('complete', { ...payload, game_code: 'FINISHED' });
  ingest.sendIngestEvent('progress', payload); // A late checkpoint cannot replace the queued completion.
  ingest.sendIngestEvent('abandon', payload); // Neither can an exit after a successful game creation.
  release({ ok: true });
  await Promise.all([checkpoint, completion]);
  assert.equal(JSON.parse(calls.at(-1).body).event, 'complete');
  assert.equal(JSON.parse(calls.at(-1).body).game_code, 'FINISHED');
  assert.deepEqual(JSON.parse(storage.get(key)), {});

  global.fetch = async () => { throw new TypeError('offline'); };
  await ingest.sendIngestEvent('progress', payload);
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    calls.push(options);
    return { ok: body.session_id !== payload.session_id, status: 503 };
  };
  await ingest.sendIngestEvent('complete', { ...payload, session_id: 'renewal-other', game_code: 'OTHER' });
  assert.equal(JSON.parse(calls.at(-1).body).game_code, 'OTHER');
  assert.equal(JSON.parse(storage.get(key))['renewal-other'], undefined);
  assert.ok(JSON.parse(storage.get(key))[payload.session_id]);
  console.log('PASS ingest: >64KiB transcript, HTTP/network retry, reload recovery, concurrent completion and session isolation');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { console.warn = warn; fs.rmSync(directory, { recursive: true, force: true }); });

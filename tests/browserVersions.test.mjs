import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { build } from 'esbuild';
import { readBrowserVersions } from '../src/utils/creatorDiagnostics.js';

const versions = [
  { brand: 'Chromium', version: '153.0.8010.37' },
  { brand: 'Not_A Brand', version: '99.0.0.0' },
  { brand: 'Microsoft Edge', version: '153.0.4234.48' },
];

test('full versions come from Client Hints; absence and rejection remain explicit', async () => {
  assert.deepEqual(await readBrowserVersions({ getHighEntropyValues: async hints => {
    assert.deepEqual(hints, ['fullVersionList']);
    return { fullVersionList: [...versions, { brand: 'invalid', version: 'secret' }] };
  } }), { browser_versions: versions, browser_version_status: 'available' });
  for (const [input, status] of [
    [undefined, 'unsupported'],
    [{ getHighEntropyValues: async () => ({ brands: [{ brand: 'Microsoft Edge', version: '153' }] }) }, 'unavailable'],
    [{ getHighEntropyValues: async () => { throw new Error('denied'); } }, 'error'],
  ]) assert.deepEqual(await readBrowserVersions(input), { browser_versions: [], browser_version_status: status });
});

test('collection does not block startup; events, worker and fallback preserve per-event versions', async () => {
  let resolveHints;
  const posted = [];
  const stored = new Map();
  const batches = [];
  const previous = { id: 'old.1', kind: 'click', at: '2026-09-19T00:00:00Z', path: '/create03',
    browser_versions: [{ brand: 'Microsoft Edge', version: '152.0.4191.88' }], browser_version_status: 'available', details: {} };
  stored.set('dilemma.creator.diagnostics.v1', JSON.stringify({ traceId: 'trace', queue: [previous] }));
  const scope = {
    exports: {}, window: { addEventListener() {} }, location: { pathname: '/create03' },
    document: { scripts: [], visibilityState: 'visible', hasFocus: () => true, addEventListener() {},
      documentElement: { lang: 'ko', className: '' } },
    navigator: { userAgent: 'Chrome/153.0.0.0 Edg/153.0.0.0', userAgentData: {
      getHighEntropyValues: () => new Promise(resolve => { resolveHints = resolve; }),
    } },
    sessionStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value) },
    localStorage: { getItem: () => '' }, crypto: { randomUUID: () => 'new-page' },
    URL, TextEncoder, AbortController, setTimeout: () => 1, clearTimeout() {}, setInterval() {},
    Worker: class { postMessage(data) { posted.push(structuredClone(data)); } },
    fetch: async (_url, options) => { batches.push(JSON.parse(options.body)); return { ok: true }; },
  };
  const result = await build({ entryPoints: [new URL('../src/utils/creatorDiagnostics.js', import.meta.url).pathname],
    bundle: true, write: false, format: 'cjs', platform: 'node', logLevel: 'silent', define: {
      'import.meta.env': JSON.stringify({ VITE_ADMIN_INGEST_URL: 'https://mock.invalid' }),
      'import.meta.url': JSON.stringify('file:///test/creatorDiagnostics.js'),
    } });
  scope.module = { exports: scope.exports };
  vm.runInNewContext(result.outputFiles[0].text, scope);
  const diag = scope.module.exports;
  diag.startCreatorDiagnostics();
  assert.ok(posted.flatMap(p => p.events || []).some(e => e.kind === 'page_start'), 'Startup must not wait for Client Hints');
  resolveHints({ fullVersionList: versions });
  await new Promise(resolve => setImmediate(resolve));
  diag.diagnosticEvent('click');
  const snapshot = posted.at(-1).snapshot;
  const events = posted.at(-1).events;
  assert.deepEqual(events.at(-1).browser_versions, versions);
  assert.equal(events.at(-1).browser_version_status, 'available');
  assert.deepEqual(events.find(e => e.id === previous.id), previous, 'Replay must not overwrite an old browser version');
  assert.equal(events.find(e => e.kind === 'page_start').browser_version_status, 'pending');
  assert.deepEqual(JSON.parse(stored.get('dilemma.creator.diagnostics.v1')).queue.at(-1).browser_versions, versions);

  // Actual worker emits its own events and resends queued events with their original metadata.
  let tick;
  const workerScope = { self: { postMessage() {} }, TextEncoder, AbortController,
    setTimeout: () => 1, clearTimeout() {}, setInterval: fn => { tick = fn; }, fetch: scope.fetch };
  vm.runInNewContext(readFileSync(new URL('../src/utils/creatorDiagnostics.worker.js', import.meta.url), 'utf8'), workerScope);
  workerScope.self.onmessage({ data: { config: posted[0].config, events, snapshot } });
  tick();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(batches.at(-1).events.find(e => e.kind === 'worker_heartbeat').browser_versions, versions);
  assert.deepEqual(batches.at(-1).events.find(e => e.id === previous.id), previous);

  // Browser collection also survives unavailable Worker support and uses the existing fallback.
  scope.Worker = class { constructor() { throw new Error('unavailable'); } };
  scope.navigator.userAgentData = { getHighEntropyValues: async () => ({ fullVersionList: versions }) };
  scope.exports = {}; scope.module = { exports: scope.exports };
  vm.runInNewContext(result.outputFiles[0].text, scope);
  scope.module.exports.startCreatorDiagnostics();
  await new Promise(resolve => setImmediate(resolve));
  scope.module.exports.diagnosticEvent('click');
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(batches.at(-1).events.at(-1).browser_versions, versions);
});

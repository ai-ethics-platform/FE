// JSDOM_MODULE=/path/to/jsdom node tests/approval-route-keeps-game-mounted.cjs
// Navigating between protected game screens must not remount the game providers (WebSocket/WebRTC).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');
const dom = new JSDOM('<body></body>', { url: 'http://localhost/gameintro' });
Object.assign(global, { window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const esbuild = require('esbuild');

const pending = [];
global.__approval = { get: () => new Promise(resolve => pending.push(resolve)) };
fs.mkdirSync(path.join(__dirname, '../node_modules/.cache'), { recursive: true });
const directory = fs.mkdtempSync(path.join(__dirname, '../node_modules/.cache/approval-route-'));
const entry = path.join(directory, 'entry.jsx');
fs.writeFileSync(entry, `
import { useEffect } from 'react';
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Guard from ${JSON.stringify(path.resolve(__dirname, '../src/components/playApproval/PlayApprovalProtectedRoute.jsx'))};
export let go;
export const mounts = [];
function Providers() { useEffect(() => { mounts.push('mount'); }, []); return <Nav />; }
function Nav() { go = useNavigate(); return 'game'; }
export default () => <MemoryRouter initialEntries={['/gameintro']}><Routes>
  <Route element={<Guard />}><Route element={<Providers />}>
    <Route path="/gameintro" element={null} /><Route path="/selecthomemate" element={null} />
  </Route></Route></Routes></MemoryRouter>;`);
const out = path.join(directory, 'out.cjs');
const built = esbuild.build({ entryPoints: [entry], bundle: true, platform: 'node', format: 'cjs', outfile: out, jsx: 'automatic',
  external: ['react', 'react-dom', 'react-router-dom'], nodePaths: [path.resolve(__dirname, '../node_modules')],
  plugins: [{ name: 'stub-axios', setup(build) {
    build.onResolve({ filter: /api\/axiosInstance$/ }, () => ({ path: 'axios-stub', namespace: 'stub' }));
    build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default global.__approval;', loader: 'js' }));
  } }] });
(async () => {
  await built;
  const app = require(out);
  localStorage.setItem('access_token', 'token');
  const root = createRoot(document.body);
  await act(async () => root.render(React.createElement(app.default)));
  assert.equal(document.body.textContent.includes('game'), false, 'blocks until first approval check');
  await act(async () => pending.shift()({ data: { status: 'approved' } }));
  assert.deepEqual(app.mounts, ['mount']);

  await act(async () => app.go('/selecthomemate'));
  assert.equal(document.body.textContent, 'game', 'game stays rendered while re-checking');
  await act(async () => pending.shift()({ data: { status: 'approved' } }));
  assert.deepEqual(app.mounts, ['mount'], 'providers were not remounted');
  console.log('ok');
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });

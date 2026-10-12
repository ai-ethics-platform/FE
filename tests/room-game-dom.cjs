// JSDOM_MODULE=/path/to/jsdom node tests/room-game-dom.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');
const dom = new JSDOM('<body><div id="root"></div></body>', { url: 'http://localhost/gameintro', pretendToBeVisual: true });
Object.assign(global, { window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage, IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const { MemoryRouter } = require('react-router-dom');
const esbuild = require('esbuild');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'room-game-dom-'));
const game = { code: 'SAME_GAME', title: '맞춤 수업', data: {
  opening: ['우리 반의 이야기'], roles: [1, 2, 3].map(role => ({ name: `역할 ${role}`, description: `설명 ${role}` })),
} };
let pending;
const roots = new Set();
global.__roomGame = {
  room: { room_code: '123456', topic: game.title, custom_game_code: game.code }, paths: [],
  get(url) {
    if (url.startsWith('/rooms/code/')) return Promise.resolve({ data: this.room });
    if (url.startsWith('/custom-games/')) return new Promise((resolve, reject) => { pending = { resolve, reject, url }; });
    if (url === '/rooms/ai-name') return Promise.resolve({ data: { ai_name: 'HomeMate' } });
    throw new Error(`Unexpected API request: ${url}`);
  },
};
const mocks = {
  '../api/axiosInstance': 'export default { get: (...args) => global.__roomGame.get(...args) };',
  '../utils/posthog': 'export async function captureGameContext(){}',
  '../WebSocketProvider': `const noop=()=>{}; export function useWebSocket(){return {isConnected:false,addMessageHandler:noop,removeMessageHandler:noop,sendMessage:noop,initializeVoiceWebSocket:async()=>{}};}`,
  '../WebRTCProvider': `const initializeWebRTC=async()=>{}; export function useWebRTC(){return {isInitialized:false,initializeWebRTC};}`,
  '../utils/voiceManager': 'export default {};',
  '../hooks/useWebSocketMessage': 'export function useHostActions(){return {}}; export function useWebSocketNavigation(_navigate,{nextPagePath}){global.__roomGame.paths.push(nextPagePath)}',
  '../components/Userprofile': 'export default function UserProfile(){return null}',
  '../hooks/useTypingEffect': 'export default function useTypingEffect(text){return text}',
};

(async () => {
  await esbuild.build({
    stdin: { contents: `export {default as Guard} from './src/components/RoomGameGuard.jsx'; export {default as Intro} from './src/pages/GameIntro.jsx'; export * from './src/utils/customGameStorage.js';`, resolveDir: path.join(__dirname, '..'), loader: 'js' },
    outfile: path.join(directory, 'pages.cjs'), bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl' }, logLevel: 'silent',
    plugins: [{ name: 'controlled-runtime', setup(build) {
      build.onResolve({ filter: /^react(?:-dom|-router-dom)?(?:\/.*)?$/ }, args => ({ path: require.resolve(args.path), external: true }));
      build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'mock' } : undefined);
      build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path], loader: 'js' }));
    } }],
  });
  const { Guard, Intro, setCustomGameCode, saveCustomGame, customGameStorage } = require(path.join(directory, 'pages.cjs'));
  localStorage.setItem('category', game.title);
  let oldRoot = createRoot(document.getElementById('root'));
  roots.add(oldRoot);
  await act(async () => { oldRoot.render(React.createElement(MemoryRouter, null, React.createElement(Intro))); });
  assert.equal(customGameStorage.getItem('code'), null);
  assert.ok(document.body.textContent.includes('지금은 2036년'), 'Without a room guard, a missing code reproduces the reported android intro');
  assert.equal(global.__roomGame.paths.at(-1), '/selecthomemate');
  await act(async () => oldRoot.unmount());
  const render = async () => {
    const root = createRoot(document.getElementById('root'));
    roots.add(root);
    await act(async () => { root.render(React.createElement(MemoryRouter, { initialEntries: ['/gameintro'] }, React.createElement(Guard, null, React.createElement(Intro)))); });
    return root;
  };
  for (const [index, mode] of ['complete', 'missing', 'other'].entries()) {
    localStorage.clear(); sessionStorage.clear(); pending = null; global.__roomGame.paths = [];
    localStorage.setItem('room_code', '123456'); localStorage.setItem('myrole_id', index + 1); localStorage.setItem('host_id', '1');
    if (mode !== 'missing') {
      const code = mode === 'other' ? 'OTHER_GAME' : game.code;
      setCustomGameCode(code); saveCustomGame({ ...game, code }, code);
    }
    const root = await render();
    assert.ok(!document.body.textContent.includes('지금은 2036년'), 'A custom room must never render the basic intro');
    if (mode !== 'complete') {
      assert.ok(document.body.textContent.includes('확인하고 있습니다'));
      assert.equal(pending.url, '/custom-games/SAME_GAME');
      await act(async () => { pending.resolve({ data: game }); });
    }
    assert.ok(document.body.textContent.includes('AI 윤리 딜레마 게임에 오신 걸 환영합니다'));
    assert.equal(customGameStorage.getItem('code'), game.code);
    assert.equal(global.__roomGame.paths.at(-1), '/game01');
    await act(async () => root.unmount());
  }
  sessionStorage.clear(); pending = null;
  let root = await render();
  await act(async () => { pending.reject(new Error('load failed')); });
  assert.ok(document.querySelector('[role="alert"]'));
  assert.ok(!document.body.textContent.includes('지금은 2036년'));
  await act(async () => { document.querySelector('button').click(); });
  await act(async () => { pending.resolve({ data: game }); });
  assert.ok(document.body.textContent.includes('AI 윤리 딜레마 게임에 오신 걸 환영합니다'));
  await act(async () => root.unmount());

  global.__roomGame.room = { room_code: '123456', topic: '안드로이드', custom_game_code: null };
  localStorage.setItem('category', '안드로이드');
  root = await render();
  assert.ok(document.body.textContent.includes('지금은 2036년'));
  assert.equal(customGameStorage.getItem('code'), null);
  assert.equal(global.__roomGame.paths.at(-1), '/selecthomemate');
  await act(async () => root.unmount());
  console.log('PASS reported android intro reproduced without guard; room guard covers 3 player states, failed load/retry, basic room isolation');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await act(async () => { for (const root of roots) root.unmount(); });
  fs.rmSync(directory, { recursive: true, force: true }); dom.window.close();
});

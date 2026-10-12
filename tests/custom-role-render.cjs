// Run with node tests/custom-role-render.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const esbuild = require('esbuild');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'custom-role-render-'));
const originalSession = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
const originalLocal = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const storage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};
const mocks = {
  '../components/Layout': 'export default function Layout({children}) { return children; }',
  '../api/axiosInstance': 'export default {defaults:{baseURL:"https://example.com"}};',
  '../WebSocketProvider': 'export function useWebSocket(){return {isConnected:true};}',
  '../utils/voiceManager': 'export default {};',
  '../hooks/useWebSocketMessage': 'export function useWebSocketNavigation(){}',
  '../utils/posthog': 'export async function captureGameContext(){}',
};

(async () => {
  await esbuild.build({
    entryPoints: Object.fromEntries([1, 2, 3].map(role => [`role${role}`, path.join(__dirname, `../src/pages/CD${role}.jsx`)]).concat([
      ['storage', path.join(__dirname, '../src/utils/customGameStorage.js')],
      ['translations', path.join(__dirname, '../src/utils/language/index.js')],
    ])),
    outdir: directory, outExtension: { '.js': '.cjs' }, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.svg': 'dataurl', '.jpg': 'dataurl', '.png': 'dataurl' }, logLevel: 'silent',
    plugins: [{ name: 'isolated-runtime', setup(build) {
      build.onResolve({ filter: /^react(?:-dom|-router-dom)?(?:\/.*)?$/ }, args => ({ path: require.resolve(args.path), external: true }));
      build.onResolve({ filter: /.*/ }, args => mocks[args.path] ? { path: args.path, namespace: 'mock' } : undefined);
      build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: mocks[args.path], loader: 'js' }));
    } }],
  });
  const gameStorage = require(path.join(directory, 'storage.cjs'));
  const { translations } = require(path.join(directory, 'translations.cjs'));
  const game = { code: 'ROLE_TEST', title: '커스텀 게임', data: {
    opening: ['커스텀 오프닝'],
    roles: [1, 2, 3].map(role => ({ name: `역할 ${role}`, description: `커스텀 역할 설명 ${role}` })),
  } };
  for (const role of [1, 2, 3]) {
    const RolePage = require(path.join(directory, `role${role}.cjs`)).default;
    for (const mode of ['basic', 'complete', 'missing', 'sentinel', 'invalid', 'basic-invalid']) {
      Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage() });
      Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage() });
      localStorage.setItem('app_lang', 'ko');
      localStorage.setItem('myrole_id', role);
      const customMode = !mode.startsWith('basic');
      if (customMode) {
        gameStorage.setCustomGameCode(game.code);
        gameStorage.saveCustomGame(game, game.code);
        if (mode !== 'complete') {
          const cached = JSON.parse(sessionStorage.getItem('custom_game_data'));
          cached[`charDes${role}`] = mode === 'sentinel' ? '-' : mode === 'invalid' ? 123 : '';
          sessionStorage.setItem('custom_game_data', JSON.stringify(cached));
          assert.equal(gameStorage.isCustomGameReady(), false);
        }
      } else if (mode === 'basic-invalid') {
        sessionStorage.setItem('custom_game_data', JSON.stringify({ [`charDes${role}`]: 123 }));
      }
      const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(RolePage)));
      assert.equal(html.includes(`커스텀 역할 설명 ${role}`), mode === 'complete');
      assert.equal(html.includes('역할 설명을 불러오지 못했습니다'), customMode && mode !== 'complete');
      const defaultText = translations.ko.CharacterDescription[`cd${role}_android_home`].split('{{')[0];
      assert.equal(html.includes(defaultText), !customMode, 'Built-in descriptions must only appear in basic mode');
    }
  }
  console.log('PASS 18 role renders: custom descriptions, missing/sentinel/invalid errors, basic mode preserved');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => {
    for (const [key, descriptor] of [['sessionStorage', originalSession], ['localStorage', originalLocal]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });

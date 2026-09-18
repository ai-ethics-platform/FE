// JSDOM_MODULE=/path/to/jsdom node tests/recovery-dom.cjs
// Real React pages, controlled API promises. No production requests or teacher data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');
const dom = new JSDOM('<body></body>', { url: 'http://localhost/chatpage2', pretendToBeVisual: true });
Object.assign(global, { window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage,
  IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(global, 'navigator', { configurable: true, value: dom.window.navigator });
dom.window.HTMLDialogElement.prototype.showModal = function() { this.open = true; };
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');
const esbuild = require('esbuild');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chat-recovery-'));
const pending = [];
const events = [];
const requests = [];
const navigations = [];
global.__recovery = {
  call(payload) { requests.push(payload); return new Promise((resolve, reject) => pending.push({ resolve, reject })); },
  get(url, config) { return this.call({ url, config }); },
  put(url, data, config) { return this.call({ url, data, config }); },
  post(url, data) { requests.push({ url, data }); return Promise.resolve({ data: { code: 'LOCAL-TEST', url: '/?code=LOCAL-TEST' } }); },
  navigate: to => navigations.push(to), ingest: (...args) => events.push(args),
  renderOutlet() { if (this.failRender) throw new Error('simulated render failure'); return 'approved content'; },
};
const jwt = sub => `header.${Buffer.from(JSON.stringify({ sub })).toString('base64url')}.signature`;
localStorage.setItem('access_token', jwt('account-one'));
localStorage.setItem('teacher_name', '테스트 교사');
const sample = { topic: 'AI와 학교', opening: ['학교 이야기'], dilemma_situation: ['서로 다른 선택'],
  question: 'AI를 사용할까요?', choice1: '예', choice2: '아니오',
  flips_agree_texts: ['찬성 결과'], flips_disagree_texts: ['반대 결과'],
  char1: '학생', char2: '교사', char3: '학부모', chardes1: '배웁니다', chardes2: '가르칩니다', chardes3: '돌봅니다',
  agreeEnding: '찬성 마무리', disagreeEnding: '반대 마무리', agree_label: '찬성', disagree_label: '반대' };
let root;
let host;
const errors = [];
const button = text => [...host.querySelectorAll('button')].find(node => node.textContent === text);
async function mount(Component) {
  host = document.createElement('div'); document.body.append(host);
  root = createRoot(host, { onUncaughtError: error => errors.push(error) });
  await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Component))));
}
async function unmount() { await act(async () => root.unmount()); host.remove(); }
async function resolve(value) { const request = pending.shift(); assert.ok(request); await act(async () => request.resolve(value)); }
async function reject() { const request = pending.shift(); assert.ok(request); await act(async () => request.reject(new Error('simulated timeout'))); }
async function type(text) {
  await act(async () => {
    const input = host.querySelector('textarea');
    Object.getOwnPropertyDescriptor(dom.window.HTMLTextAreaElement.prototype, 'value').set.call(input, text);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}
async function send() { await act(async () => host.querySelector('.rn-send').click()); }

(async () => {
  await esbuild.build({
    entryPoints: { chat: path.join(__dirname, '../src/pages/ChatPage2.jsx'),
      editor: path.join(__dirname, '../src/pages/Create03.jsx'),
      gate: path.join(__dirname, '../src/components/playApproval/PlayApprovalProtectedRoute.jsx'),
      api: path.join(__dirname, '../src/api/axiosInstance.js'),
      draft: path.join(__dirname, '../src/utils/renewalDraft.js') },
    outdir: directory, outExtension: { '.js': '.cjs' }, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.css': 'empty' }, logLevel: 'silent', define: { 'import.meta.env': '{}' },
    plugins: [{ name: 'controlled-io', setup(build) {
      build.onResolve({ filter: /^(react(\/.*)?|axios)$/ }, args => ({ path: require.resolve(args.path), external: true }));
      build.onResolve({ filter: /(?:api\/axiosInstance|api\/adminIngest|react-router-dom)$/ }, args => ({ path: args.path, namespace: 'mock' }));
      build.onLoad({ filter: /.*/, namespace: 'mock' }, ({ path: name }) => ({ contents: name.includes('axiosInstance')
        ? 'export const callChatbot = p => globalThis.__recovery.call(p); export default globalThis.__recovery;'
        : name.includes('adminIngest') ? 'export const sendIngestEvent = (...args) => globalThis.__recovery.ingest(...args);'
          : 'export const useNavigate = () => globalThis.__recovery.navigate; export const useLocation = () => ({pathname:globalThis.__recovery.pathname || "/chatpage2"}); export const Navigate = ({to}) => "redirect:"+to; export const Outlet = () => globalThis.__recovery.renderOutlet();' }));
    } }],
  });
  const Chat = require(path.join(directory, 'chat.cjs')).default;
  const Gate = require(path.join(directory, 'gate.cjs')).default;
  const Editor = require(path.join(directory, 'editor.cjs')).default;
  const draft = require(path.join(directory, 'draft.cjs'));
  await mount(Chat);
  assert.equal(requests.length, 1, 'StrictMode must issue INIT once');
  assert.equal(events.length, 1, 'StrictMode must send start once');
  await resolve({ response_text: '어떤 주제로 만들까요?', context: { topic: 'AI' } });
  const sessionId = requests[0].session_id;
  await type('입력한 내용을 보관해 주세요');
  await send();
  assert.equal(host.querySelector('textarea').disabled, true);
  assert.equal(pending.length, 1);
  await reject();
  assert.equal(host.querySelector('textarea').value, '입력한 내용을 보관해 주세요');
  assert.equal(host.querySelectorAll('.rn-message.is-user').length, 0, 'Failed send rolls back the pending bubble');
  assert.equal(host.querySelector('textarea').disabled, false);
  await act(async () => button('다시 시도').click());
  assert.equal(pending.length, 1);
  await resolve({ response_text: '다시 연결됐어요.', context: { topic: 'AI' } });
  assert.equal(host.querySelectorAll('.rn-message.is-user').length, 1);
  await type('새로고침 중에도 보관'); await send();
  await unmount();
  const before = requests.length;
  await mount(Chat);
  assert.equal(requests.length, before, 'Reload must not replay an interrupted request or INIT');
  assert.equal(host.querySelector('textarea').value, '새로고침 중에도 보관');
  assert.equal(draft.loadRenewalSession().sessionId, sessionId);
  assert.ok(host.textContent.includes('다시 연결됐어요.'));
  await reject(); // Settle the request belonging to the unmounted page.
  await unmount();
  console.log('PASS full chat: single INIT, timeout unlock/retry, completed conversation and pending-input restore');

  const snapshot = { sessionId: 'renewal-test-ending', step: 'ending', context: sample,
    messages: [{ role: 'assistant', content: process.env.RECOVERY_ENDING_TEXT_FILE
      ? fs.readFileSync(process.env.RECOVERY_ENDING_TEXT_FILE, 'utf8')
      : '학교에서 AI를 사용하는 게임 초안입니다.\n\n이 초안으로 확정지을까요?' }],
    stepBoundaries: { ending: 0 }, showTemplateButton: false };
  draft.clearRenewalSession(); assert.equal(draft.saveRenewalSession(snapshot), true);
  await mount(Chat);
  await act(async () => button('확정').click());
  assert.equal(pending.length, 1, 'Displayed final draft confirmation must reach the API');
  assert.ok(requests.at(-1).user_input.endsWith('user: 확정'));
  await resolve({ response_text: '완성됐어요.', context: sample });
  assert.ok(button('템플릿 생성'));
  await unmount();
  draft.renewalDraft.removeItem('final_dilemma_payload');
  await mount(Chat);
  await act(async () => button('템플릿 생성').click());
  assert.equal(navigations.at(-1), '/create00');
  assert.equal(localStorage.getItem('code'), 'LOCAL-TEST');
  assert.equal(draft.loadRenewalSession(), null);
  assert.equal(events.at(-1)[0], 'complete');
  assert.equal(events.at(-1)[1].game_code, 'LOCAL-TEST');
  assert.equal(events.at(-1)[1].messages.length, 3);
  await unmount();
  console.log('PASS final draft: confirmation, template creation, editor handoff and completion event');

  draft.saveRenewalSession({ ...snapshot,
    messages: Array.from({ length: 9 }, (_, index) => ({ role: 'assistant', content: `대화 ${index}` })),
    stepBoundaries: { opening: 0, question: 1, flip: 3, roles: 5, ending: 7 },
  });
  await mount(Chat);
  for (const step of ['roles', 'flip']) {
    await act(async () => button('이전 단계').click());
    await act(async () => button('다시 만들기').click());
    await resolve({ response_text: '다시 작성해 주세요.', context: {} });
    assert.equal(draft.loadRenewalSession()?.step, step, 'Repeated back steps must retain a restorable snapshot');
  }
  await unmount();
  console.log('PASS repeated back-step recovery without stale future message boundaries');

  draft.saveRenewalSession(snapshot);
  localStorage.setItem('access_token', jwt('different-account'));
  assert.equal(draft.loadRenewalSession(), null, 'Another account must not restore the previous teacher draft');
  localStorage.setItem('access_token', jwt('account-one'));
  const originalSet = dom.window.Storage.prototype.setItem;
  dom.window.Storage.prototype.setItem = function(key, value) {
    if (key === 'dilemma.renewal.flow') throw new dom.window.DOMException('Full', 'QuotaExceededError');
    return originalSet.call(this, key, value);
  };
  await mount(Chat);
  assert.ok(host.textContent.includes('대화를 임시 저장하지 못했어요'));
  assert.equal(host.querySelector('textarea').disabled, false);
  assert.ok(button('대화기록 다운로드'));
  await unmount();
  dom.window.Storage.prototype.setItem = originalSet;
  sessionStorage.setItem('dilemma.renewal.flow', '{corrupted');
  assert.equal(draft.loadRenewalSession(), null);
  console.log('PASS account isolation, storage quota recovery and corrupted snapshot handling');

  await mount(Gate);
  assert.ok(host.textContent.includes('불러오고 있어요'));
  await reject(); // StrictMode's first request was aborted; ignore its eventual failure.
  assert.equal(requests.at(-2).config.signal.aborted, true);
  await reject();
  assert.ok(host.textContent.includes('다시 시도'));
  assert.ok(!host.textContent.includes('redirect:'));
  await act(async () => button('다시 시도').click());
  assert.equal(requests.at(-1).config.timeout, 20000);
  await resolve({ data: { status: 'approved' } });
  assert.equal(host.textContent, 'approved content');
  assert.ok(host.querySelector('[translate="no"]'));
  global.__recovery.failRender = true;
  await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Gate))));
  assert.ok(button('화면 다시 열기'));
  assert.equal(JSON.parse(sessionStorage.getItem('dilemma.creator.lastError')).message, 'simulated render failure');
  await unmount();
  assert.deepEqual(errors, []);
  console.log('PASS approval loading, cancellation, retry, translation protection and render-error recovery');

  global.__recovery.pathname = '/create03';
  localStorage.setItem('dilemma_image_3', 'https://example.invalid/local-image.png');
  localStorage.setItem('dilemma_situation', JSON.stringify(Array.from({ length: 8 }, (_, i) => `상황 ${i + 1}`)));
  localStorage.setItem('question', sample.question);
  localStorage.setItem('agree_label', sample.agree_label);
  localStorage.setItem('disagree_label', sample.disagree_label);
  await mount(Editor);
  assert.equal(pending.length, 0, 'Editor uses the existing local draft');
  await act(async () => host.querySelector('img[alt="next"]').click());
  assert.equal(pending.length, 1);
  assert.equal(requests.at(-1).data.situation.length, 8);
  assert.ok(host.textContent.includes('저장하고 있어요'));
  await act(async () => host.querySelector('img[alt="next"]').click());
  assert.equal(pending.length, 1, 'Repeated next clicks must not submit multiple saves');
  const navigatedBeforeFailure = navigations.length;
  await reject();
  assert.equal(navigations.length, navigatedBeforeFailure);
  assert.ok(host.textContent.includes('입력한 내용은 유지됩니다'));
  await act(async () => host.querySelector('img[alt="next"]').click());
  await resolve({ data: {} });
  assert.equal(navigations.at(-1), '/create04');
  await unmount();
  console.log('PASS editor: eight paragraphs, visible save, duplicate-click guard, failed-save retention and next-step retry');

  const { default: api, callChatbot } = require(path.join(directory, 'api.cjs'));
  const axios = require('axios');
  const configs = [];
  api.defaults.adapter = async config => { configs.push(config); return { data: {}, status: 200, headers: {}, config }; };
  await api.get('/custom-games/LOCAL-TEST');
  await api.put('/custom-games/LOCAL-TEST', {});
  await api.get('/play-applications/me');
  assert.deepEqual(configs.map(config => config.timeout), [20000, 20000, 20000]);
  await api.post('/custom-games/LOCAL-TEST/images', {}, { timeout: 180000 });
  assert.equal(configs.at(-1).timeout, 180000, 'Preserve explicit upload timeouts');
  await callChatbot({ session_id: 'renewal-test', user_input: '확정', step: 'ending', context: {} });
  assert.equal(configs.at(-1).timeout, 90000);
  localStorage.setItem('refresh_token', 'local-only');
  api.defaults.adapter = async config => { throw { config, response: { status: 401 } }; };
  let refreshed = 0;
  axios.defaults.adapter = async config => {
    refreshed++;
    assert.ok(config.url.endsWith('/auth/refresh'));
    assert.equal(config.timeout, 20000, 'Refresh must not defeat the editor timeout');
    throw new Error('refresh timeout');
  };
  await assert.rejects(api.put('/custom-games/LOCAL-TEST', {}), /refresh timeout/);
  assert.equal(refreshed, 1);
  console.log('PASS shared API bounds: editor/preview, chat, explicit uploads and failed authentication refresh');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { fs.rmSync(directory, { recursive: true, force: true }); dom.window.close(); });

// Run with JSDOM_MODULE=/path/to/jsdom node tests/translation-dom.cjs.
// Simulate the text-node replacement performed by browser translation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { JSDOM } = require(process.env.JSDOM_MODULE || 'jsdom');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' });
Object.assign(global, { window: dom.window, document: dom.window.document });
const React = require('react');
const { createRoot } = require('react-dom/client');
const { flushSync } = require('react-dom');
const esbuild = require('esbuild');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'preview-translation-'));

(async () => {
  await esbuild.build({
    entryPoints: {
      preview: path.join(__dirname, '../src/components/Expanded/CreateTextBox.jsx'),
      chat: path.join(__dirname, '../src/components/renewal/RenewalChat.jsx'),
    },
    outdir: directory, outExtension: { '.js': '.cjs' }, bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic',
    loader: { '.svg': 'dataurl', '.css': 'empty' }, logLevel: 'silent',
    plugins: [{ name: 'shared-react', setup(build) {
      build.onResolve({ filter: /^react(\/.*)?$/ }, args => ({ path: require.resolve(args.path), external: true }));
    } }],
  });
  const TextBox = require(path.join(directory, 'preview.cjs')).default;
  function replaceText(element) {
    const walker = document.createTreeWalker(element, dom.window.NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const font = document.createElement('font');
      font.textContent = node.textContent;
      node.replaceWith(font);
    }
  }
  const paragraphs = ['첫 문단', '두 번째 문단\n둘째 줄', '다음 문단', '', '마지막\n\n빈 줄 뒤'];
  for (const translated of [false, true]) {
    const host = document.createElement('div');
    document.body.append(host);
    const errors = [];
    const root = createRoot(host, { onUncaughtError: error => errors.push(error) });
    function Harness() {
      const [index, setIndex] = React.useState(0);
      return React.createElement(TextBox, {
        paragraphs: paragraphs.map(main => ({ main })), currentIndex: index, setCurrentIndex: setIndex,
      });
    }
    flushSync(() => root.render(React.createElement(Harness)));
    const content = () => host.querySelector('.preview-text-scroll > div');
    for (const direction of ['next', 'prev']) {
      for (let count = 1; count < paragraphs.length; count++) {
        if (translated) replaceText(content());
        flushSync(() => host.querySelector(`img[alt="${direction}"]`).click());
        assert.deepEqual(errors, [], 'Translation must not crash the React tree');
        const index = direction === 'next' ? count : paragraphs.length - 1 - count;
        assert.equal(content().textContent.replace(/\n/g, ''), paragraphs[index].replace(/\n/g, ''), 'Visible paragraph must follow navigation');
      }
    }
    flushSync(() => root.unmount());
    host.remove();
  }
  console.log('PASS preview next/back, multiline/empty paragraphs, translated text-node replacement');
  const Chat = require(path.join(directory, 'chat.cjs')).default;
  const host = document.createElement('div');
  document.body.append(host);
  const errors = [];
  const root = createRoot(host, { onUncaughtError: error => errors.push(error) });
  const props = { context: {}, messages: [], input: '', inputRef: React.createRef(), renderMessage: text => text };
  const steps = ['opening', 'question', 'flip', 'roles', 'ending'];
  for (const [index, step] of steps.entries()) {
    flushSync(() => root.render(React.createElement(Chat, { ...props, step })));
    assert.deepEqual(errors, []);
    assert.equal(host.querySelector('.rn-progress-label').lastElementChild.textContent, `${index} / 5 완료`);
    assert.equal(host.querySelector('.rn-eyebrow').textContent, `STEP 0${index + 1} / 05`);
    replaceText(host.querySelector('.rn-progress-label'));
    replaceText(host.querySelector('.rn-eyebrow'));
  }
  flushSync(() => root.render(React.createElement(Chat, { ...props, step: 'ending', showTemplateButton: true })));
  assert.equal(host.querySelector('.rn-progress-label').lastElementChild.textContent, '5 / 5 완료');
  assert.deepEqual(errors, []);
  flushSync(() => root.render(React.createElement(Chat, { ...props, step: 'question',
    context: { question: 'AI를 사용할까요?', choice1: '예', choice2: '아니오' },
    messages: [{ role: 'assistant', content: "수정할 부분이 있다면 알려주세요.\n(이대로 확정하고 넘어가고 싶다면 '다음 단계'를 입력해주세요.)" }],
  })));
  assert.equal(host.querySelector('.rn-next')?.disabled, false, 'Question must not wait for the situation produced in the later flip stage');
  flushSync(() => root.unmount());
  host.remove();
  console.log('PASS translated chat stage labels and completed progress');
})().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => { fs.rmSync(directory, { recursive: true, force: true }); dom.window.close(); });

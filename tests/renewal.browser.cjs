/* Local-only browser regression suite. Set PLAYWRIGHT_MODULE if Playwright is
 * installed elsewhere. All application API traffic is mocked; no game is published. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.RENEWAL_ORIGIN || 'http://localhost:5173';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname), 'Use a local app server');
const output = process.env.RENEWAL_SCREENSHOTS;
const greeting = '안녕하세요! AI 윤리 딜레마 게임을 함께 만들어 볼까요?\n\n먼저 어떤 주제로 게임을 만들고 싶으신가요?\n관심 있는 AI 기술이나 수업에서 다루고 싶은 이야기를 알려주세요.\n없다면 제가 몇 가지 주제를 추천해 드릴 수도 있어요.';
const values = {
  opening: { topic: 'AI와 학교 과제', opening: ['생성형 AI가 일상에 들어온 학교입니다.'] },
  question: { dilemma_situation: ['학생들이 AI로 과제를 작성합니다.'], question: 'AI로 작성한 과제를 허용해야 할까요?', choice1: '허용한다', choice2: '허용하지 않는다' },
  flip: { flips_agree_texts: ['스스로 생각하는 시간이 줄었습니다.'], flips_disagree_texts: ['AI를 활용하는 기회를 놓쳤습니다.'] },
  roles: { char1: '학생', chardes1: '새로운 도구를 사용하고 싶어요.', char2: '교사', chardes2: '학습 과정을 지키고 싶어요.', char3: '학부모', chardes3: '공정한 평가를 원해요.' },
  ending: { agreeEnding: 'AI와 함께 배우는 방법을 고민합니다.', disagreeEnding: '스스로 생각하는 가치를 고민합니다.', agree_label: '허용한다', disagree_label: '허용하지 않는다' },
};

(async () => {
  const legacySource = await fs.readFile(path.join(__dirname, '../src/pages/ChatPage2Legacy.jsx'), 'utf8');
  const placeholderBlock = legacySource.slice(legacySource.lastIndexOf('  const placeholder = useMemo'));
  const legacyPlaceholders = Object.fromEntries([...placeholderBlock.matchAll(/case "(\w+)":\s*return "([^"]+)";/g)].map(match => [match[1], match[2]]));
  assert.equal(Object.keys(legacyPlaceholders).length, 5);
  async function assertLegacyInputCopy(page, step) {
    assert.equal(await page.getByLabel('AI에게 보낼 메시지').getAttribute('placeholder'), legacyPlaceholders[step]);
    const examples = legacyPlaceholders[step].replace(/^예\)\s*/, '').split(' / ');
    return examples;
  }
  async function sendInput(page, text) {
    await page.getByLabel('AI에게 보낼 메시지').fill(text);
    await page.getByLabel('AI에게 보낼 메시지').press('Enter');
    await page.waitForFunction(() => !document.querySelector('#rn-chat-input').disabled);
  }
  async function assertReplyStartVisible(page, withQuestion = true) {
    const viewport = await page.locator('.rn-conversation').boundingBox();
    const answer = await page.locator('[role="log"] > .is-assistant').last().boundingBox();
    assert.ok(answer.y >= viewport.y && answer.y < viewport.y + 180, 'The new answer starts inside the visible conversation');
    if (withQuestion) {
      const question = await page.locator('[role="log"] > .is-user').last().boundingBox();
      assert.ok(Math.abs(question.y - viewport.y - 24) < 2, 'The preceding question stays at the top');
    } else {
      assert.ok(Math.abs(answer.y - viewport.y - 24) < 2, 'Long questions leave room for the start of the answer');
    }
  }
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const errors = [];
  if (output) await fs.mkdir(output, { recursive: true });
  async function setup() {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => errors.push(error.message));
    const state = { calls: [], games: [], fail: null, denied: false, longReply: false, delay: 80, replyOverride: null };
    await page.addInitScript(() => {
      localStorage.setItem('app_lang', 'ko');
      localStorage.setItem('access_token', 'local-test-token');
      sessionStorage.setItem('hasSeenIntro', 'true');
      localStorage.setItem('dilemma.flow.v1', 'legacy-sentinel');
      localStorage.setItem('chat_session_id', 'legacy-session');
      localStorage.setItem('opening', 'legacy-opening');
      localStorage.setItem('data', 'legacy-game-data');
    });
    await page.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin || !['fetch', 'xhr'].includes(request.resourceType())) return route.continue();
      if (url.pathname === '/play-applications/me') return route.fulfill({ json: { status: state.denied ? 'pending' : 'approved' } });
      if (url.pathname === '/chat/multi-step') {
        const payload = request.postDataJSON();
        state.calls.push(payload);
        await new Promise(resolve => setTimeout(resolve, state.delay));
        if (state.fail === 'chat') { state.fail = null; return route.fulfill({ status: 503, json: { detail: 'Test unavailable' } }); }
        const init = payload.user_input === '__INIT__';
        const responseContext = { ...payload.context, ...(init ? {} : values[payload.step]) };
        if (!init && payload.step === 'flip') responseContext.flip_flips_agree_texts = values.flip.flips_agree_texts;
        // The following step must receive values extracted by the confirmation response.
        if (!init && payload.user_input.endsWith('user: 다음 단계')) responseContext.confirmation_marker = payload.step;
        let text = init && payload.step === 'opening' ? greeting : `## ${payload.step === 'ending' ? '게임 전체 초안' : '함께 만든 이야기'}\n\n**${responseContext.topic || '주제'}**\n\n${Object.values(values[payload.step]).flat().join('\n\n')}\n\n내용이 마음에 들면 다음 단계로 이동해 주세요.`;
        if (state.longReply) text += '\n\n' + '토론에서 다양한 관점과 선택의 이유를 함께 살펴봅니다.\n'.repeat(70);
        if (state.replyOverride !== null) { text = state.replyOverride; state.replyOverride = null; }
        return route.fulfill({ json: { response_text: text, context: responseContext, parsed_variables: init ? {} : values[payload.step] } });
      }
      if (url.pathname === '/custom-games') {
        state.games.push(request.postDataJSON());
        if (state.fail === 'game') { state.fail = null; return route.fulfill({ status: 503, json: { detail: 'Test unavailable' } }); }
        return route.fulfill({ json: { code: 'RENEWAL-TEST', url: 'https://example.com/game/RENEWAL-TEST' } });
      }
      return route.fulfill({ json: {} });
    });
    return { page, state, context };
  }

  try {
    for (const flag of ['', '?isRenewal=false', '?isRenewal=1', '?isRenewal=true', '?isRenewal=True']) {
      const { page, state, context } = await setup();
      await page.goto(origin + '/selectroom' + flag);
      await page.getByText('딜레마 만들기', { exact: true }).click();
      await page.getByPlaceholder('이름을 입력하세요').fill('테스트 교사');
      await page.getByPlaceholder('학교를 입력하세요').fill('테스트 학교');
      await page.getByPlaceholder('학교 메일을 입력하세요').fill('teacher@example.com');
      await page.getByRole('button', { name: '시작하기', exact: true }).click();
      await page.waitForURL(origin + '/chatpage2');
      await page.locator('.rn-message-content').first().waitFor();
      assert.equal(await page.locator('.renewal-chat').count(), 1);
      assert.equal(state.calls.length, 1, 'StrictMode must initialize the renewal chat once');
      assert.match(state.calls[0].session_id, /^renewal-/);
      await context.close();
    }
    console.log('PASS default renewal routing regardless of query flag; single initialization');

    const { page, state, context } = await setup();
    await page.goto(origin + '/chatpage2/renewal');
    await page.waitForURL(origin + '/chatpage2');
    await page.locator('.rn-message-content').first().waitFor();
    assert.equal(state.calls.length, 1, 'The old renewal URL redirects without duplicate initialization');
    await assertLegacyInputCopy(page, 'opening');
    assert.equal(await page.locator('.rn-topic-starters').count(), 0, 'No newly invented topic prompts');
    assert.equal(await page.getByRole('img', { name: 'DilemmA.I.', exact: true }).isVisible(), true);
    assert.equal(await page.locator('.rn-brand').innerText(), 'Creator');
    assert.equal(await page.locator('.rn-project-heading, .rn-summary, .rn-sidebar-tip, .rn-sidebar-footer, .rn-guide-status, .rn-beta, .rn-workspace-name').count(), 0);
    assert.equal(await page.locator('.rn-sidebar').evaluate(el => el.firstElementChild.className), 'rn-progress-label');
    assert.equal(await page.locator('.is-assistant .rn-message-author').first().evaluate(el => getComputedStyle(el).fontSize), '15px');
    assert.notEqual(await page.locator('.rn-main-heading').evaluate(el => getComputedStyle(el).backgroundColor), await page.locator('.rn-main').evaluate(el => getComputedStyle(el).backgroundColor));
    if (output) await page.screenshot({ path: output + '/renewal-desktop.png' });
    for (const size of [{ width: 390, height: 844 }, { width: 320, height: 640 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(size);
      const dimensions = await page.locator('.renewal-chat').evaluate(el => ({ width: el.scrollWidth, screen: innerWidth }));
      assert.ok(dimensions.width <= dimensions.screen + 1, 'No horizontal overflow');
      const composer = await page.locator('.rn-composer').boundingBox();
      assert.ok(composer.y >= 0 && composer.y + composer.height <= size.height, 'Composer remains in viewport');
      if (size.width === 390) {
        if (output) await page.screenshot({ path: output + '/renewal-mobile.png' });
        await page.getByRole('button', { name: '제작 현황 열기' }).click();
        assert.equal(await page.locator('#rn-sidebar').isVisible(), true);
        await page.getByRole('button', { name: '제작 현황 닫기', exact: true }).first().click();
      }
    }
    console.log('PASS mobile/tablet sizes and accessible progress toggle');
    await page.setViewportSize({ width: 1440, height: 1000 });
    const input = page.getByLabel('AI에게 보낼 메시지');
    await input.fill('첫 번째 줄');
    await input.press('Shift+Enter');
    await input.type('두 번째 줄');
    assert.ok((await input.inputValue()).includes('\n'));
    const callsBeforeComposition = state.calls.length;
    await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true });
    assert.equal(state.calls.length, callsBeforeComposition, 'Korean composition must not submit');
    await input.fill('');
    await sendInput(page, 'AI 판사로 하자');
    assert.equal(await page.locator('.is-user .rn-message-author').last().evaluate(el => getComputedStyle(el).fontSize), '15px');
    assert.ok(state.calls.at(-1).user_input.endsWith('user: AI 판사로 하자'));
    assert.equal(await page.evaluate(() => localStorage.getItem('data')), 'legacy-game-data');
    assert.equal(await page.evaluate(() => localStorage.getItem('opening')), 'legacy-opening');
    assert.equal(await page.evaluate(() => localStorage.getItem('dilemma.flow.v1')), 'legacy-sentinel');
    assert.equal(await page.evaluate(() => localStorage.getItem('chat_session_id')), 'legacy-session');
    console.log('PASS suggestions, Korean IME, multiline input, legacy storage isolation');

    state.fail = 'chat';
    await input.fill('다른 관점도 제안해줘');
    await input.press('Enter');
    await page.getByRole('alert').waitFor();
    assert.equal(await input.inputValue(), '다른 관점도 제안해줘');
    await page.getByRole('button', { name: '다시 시도' }).click();
    await page.waitForFunction(() => !document.querySelector('#rn-chat-input').disabled && !document.querySelector('.rn-error'));
    console.log('PASS send failure preserves input and retry recovers');

    for (const stage of ['question', 'flip', 'roles', 'ending']) {
      await page.getByRole('button', { name: '다음 단계', exact: true }).click();
      await page.waitForFunction(expected => document.querySelector('.rn-steps [aria-current="step"] .rn-step-label')?.textContent === expected, { question: '딜레마 만들기', flip: '예상하지 못한 결과', roles: '등장인물 정하기', ending: '마무리하기' }[stage]);
      if (stage === 'question') assert.equal(await page.locator('.rn-main-heading p').innerText(), '학생들이 딜레마를 느낄 수 있는 질문과 두 가지 선택지를 함께 다듬어요.');
      const initCall = state.calls.at(-1);
      assert.equal(initCall.step, stage);
      assert.ok(initCall.context.confirmation_marker, 'Next stage receives latest confirmed context');
      assert.ok(initCall.variable, 'Backend stage contract is populated');
      const examples = await assertLegacyInputCopy(page, stage);
      await sendInput(page, examples[0]);
      assert.ok(state.calls.at(-1).user_input.endsWith(`user: ${examples[0]}`), 'Example wording must reach the chatbot unchanged');
    }
    await page.getByRole('button', { name: '템플릿 생성', exact: true }).waitFor();
    if (output) await page.screenshot({ path: output + '/renewal-complete.png' });
    console.log('PASS all five stages, original placeholders and verbatim example requests, completion');
    state.fail = 'game';
    await page.getByRole('button', { name: '템플릿 생성', exact: true }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('data')), 'legacy-game-data', 'Failed creation must not overwrite editor');
    await page.getByRole('button', { name: '다시 시도' }).click();
    await page.waitForURL(origin + '/create00');
    assert.equal(state.games.length, 2);
    assert.equal(state.games[1].data.roles.length, 3);
    assert.equal(state.games[1].data.dilemma.question, values.question.question);
    assert.equal(state.games[1].data.finalMessages.agree, values.ending.agreeEnding);
    assert.equal(await page.evaluate(() => localStorage.getItem('code')), 'RENEWAL-TEST');
    assert.equal(await page.evaluate(() => localStorage.getItem('chat_session_id')), 'legacy-session');
    assert.equal(await page.evaluate(() => localStorage.getItem('dilemma.flow.v1')), 'legacy-sentinel');
    await context.close();
    console.log('PASS failed creation isolation and successful editor handoff');

    const retry = await setup();
    retry.state.fail = 'chat';
    await retry.page.goto(origin + '/chatpage2');
    await retry.page.getByRole('alert').waitFor();
    await retry.page.getByRole('button', { name: '다시 시도' }).click();
    await retry.page.locator('.rn-message-content').first().waitFor();
    await retry.page.getByRole('button', { name: '나가기', exact: true }).click();
    await retry.page.getByRole('dialog').waitFor();
    await retry.page.keyboard.press('Escape');
    assert.equal(await retry.page.getByRole('dialog').count(), 0);
    await retry.page.getByRole('button', { name: '나가기', exact: true }).click();
    await retry.page.getByRole('dialog').getByRole('button', { name: '나가기', exact: true }).click();
    await retry.page.waitForURL(origin + '/selectroom');
    const previousSession = retry.state.calls.at(-1).session_id;
    await retry.page.getByText('딜레마 만들기', { exact: true }).click();
    await retry.page.getByPlaceholder('이름을 입력하세요').fill('테스트');
    await retry.page.getByPlaceholder('학교를 입력하세요').fill('테스트');
    await retry.page.getByPlaceholder('학교 메일을 입력하세요').fill('test@example.com');
    await retry.page.getByRole('button', { name: '시작하기', exact: true }).click();
    await retry.page.waitForURL(origin + '/chatpage2');
    await retry.page.locator('.rn-message-content').first().waitFor();
    assert.equal(await retry.page.locator('.renewal-chat').count(), 1);
    assert.notEqual(retry.state.calls.at(-1).session_id, previousSession, 'Re-entering starts a new chat');
    if (output) await retry.page.screenshot({ path: output + '/renewal-after-reentry.png' });
    await retry.context.close();
    console.log('PASS initialization retry, exit dialog and renewal re-entry without a query flag');

    const back = await setup();
    await back.page.goto(origin + '/chatpage2');
    await back.page.locator('.rn-message-content').first().waitFor();
    await sendInput(back.page, '주제 추천해줘');
    for (const stage of ['딜레마 만들기', '예상하지 못한 결과']) {
      await back.page.getByRole('button', { name: '다음 단계', exact: true }).click();
      await back.page.waitForFunction(expected => document.querySelector('.rn-steps [aria-current="step"] .rn-step-label')?.textContent === expected, stage);
      await sendInput(back.page, '상황을 추천해줘');
    }
    await back.page.getByRole('button', { name: '다음 단계', exact: true }).click();
    await back.page.waitForFunction(() => document.querySelector('.rn-steps [aria-current="step"] .rn-step-label')?.textContent === '등장인물 정하기');
    await back.page.getByRole('button', { name: '이전 단계', exact: true }).click();
    await back.page.getByRole('dialog').getByRole('button', { name: '다시 만들기', exact: true }).click();
    await back.page.waitForFunction(() => !document.querySelector('#rn-chat-input').disabled);
    const backPayload = back.state.calls.at(-1);
    assert.equal(backPayload.step, 'flip');
    assert.equal(backPayload.context.question, values.question.question);
    assert.equal(backPayload.context.flips_agree_texts, undefined);
    assert.equal(backPayload.context.flip_flips_agree_texts, undefined, 'Backtracking removes aliases as well as canonical values');
    assert.equal(await back.page.getByRole('button', { name: '다음 단계', exact: true }).isDisabled(), true);
    back.state.longReply = true;
    await sendInput(back.page, '상황을 추천해줘');
    await assertReplyStartVisible(back.page);
    assert.equal(await back.page.getByRole('button', { name: '최근 대화 보기 ↓', exact: true }).count(), 0, 'Automatic positioning still follows the latest turn');
    await sendInput(back.page, '긴 질문입니다.\n'.repeat(50));
    await assertReplyStartVisible(back.page, false);
    await back.page.setViewportSize({ width: 390, height: 844 });
    await sendInput(back.page, '모바일에서도 답변을 처음부터 보여줘');
    await assertReplyStartVisible(back.page);
    if (output) await back.page.screenshot({ path: output + '/renewal-answer-start-mobile.png' });
    await back.page.setViewportSize({ width: 1440, height: 1000 });
    back.state.delay = 500;
    await back.page.getByLabel('AI에게 보낼 메시지').fill('더 구체적으로 설명해줘');
    await back.page.getByLabel('AI에게 보낼 메시지').press('Enter');
    await back.page.locator('.rn-conversation').evaluate(el => { el.scrollTop = 0; el.dispatchEvent(new Event('scroll', { bubbles: true })); });
    await back.page.waitForFunction(() => !document.querySelector('#rn-chat-input').disabled);
    assert.ok(await back.page.locator('.rn-conversation').evaluate(el => el.scrollTop < 80), 'New replies do not interrupt reading older messages');
    await back.page.getByRole('button', { name: '최근 대화 보기 ↓', exact: true }).click();
    await back.page.waitForFunction(() => {
      const el = document.querySelector('.rn-conversation');
      return el.scrollHeight - el.scrollTop - el.clientHeight < 2;
    });
    assert.equal(await back.page.getByRole('button', { name: '최근 대화 보기 ↓', exact: true }).count(), 0);
    if (output) await back.page.screenshot({ path: output + '/renewal-latest-bottom-desktop.png' });
    await sendInput(back.page, '다음 답변은 처음부터 보여줘');
    await assertReplyStartVisible(back.page);
    await back.context.close();
    console.log('PASS backtracking clears stale aliases; long-reply scrolling respects reading position');

    const dynamic = await setup();
    await dynamic.page.goto(origin + '/chatpage2');
    await dynamic.page.getByRole('button', { name: '주제 추천해줘', exact: true }).waitFor();
    assert.deepEqual(await dynamic.page.locator('.rn-suggestions button').allTextContents(), ['주제 추천해줘', '직접 입력하기']);
    dynamic.state.replyOverride = '추천 주제입니다.\n1. **AI 판사**: 판결을 지원하는 기술입니다.\n2. **자율주행차**: 스스로 운전합니다.\n3. **딥페이크 기술**: 영상을 합성합니다.\n어떤 주제로 할까요?';
    dynamic.state.delay = 500;
    await dynamic.page.getByRole('button', { name: '주제 추천해줘', exact: true }).click();
    assert.equal(await dynamic.page.locator('.rn-suggestions').count(), 0, 'Previous suggestions disappear during a request');
    await dynamic.page.getByRole('button', { name: 'AI 판사', exact: true }).waitFor();
    assert.deepEqual(await dynamic.page.locator('.rn-suggestions button').allTextContents(), ['AI 판사', '자율주행차', '딥페이크 기술']);
    if (output) await dynamic.page.screenshot({ path: output + '/renewal-dynamic-topics.png' });
    dynamic.state.replyOverride = "선택하신 주제는 AI 판사입니다.\n(이대로 확정하고 넘어가고 싶다면 '다음 단계'를 입력해주세요.)";
    await dynamic.page.getByRole('button', { name: 'AI 판사', exact: true }).click();
    await dynamic.page.getByRole('button', { name: '다음 단계', exact: true }).waitFor();
    assert.ok(dynamic.state.calls.at(-1).user_input.endsWith('user: AI 판사'));
    await dynamic.page.getByRole('button', { name: '다음 단계', exact: true }).click();
    await dynamic.page.waitForFunction(() => document.querySelector('.rn-steps [aria-current="step"] .rn-step-label')?.textContent === '딜레마 만들기');
    dynamic.state.replyOverride = '- 선택지1: 허용한다\n- 선택지2: 허용하지 않는다\n이 방향으로 정리해볼까요?';
    await sendInput(dynamic.page, '이 갈등으로 질문을 만들어줘');
    await dynamic.page.getByRole('button', { name: '확정해줘', exact: true }).waitFor();
    assert.deepEqual(await dynamic.page.locator('.rn-suggestions button').allTextContents(), ['확정해줘', '수정할 내용 입력']);
    const beforeFocus = dynamic.state.calls.length;
    await dynamic.page.getByLabel('AI에게 보낼 메시지').fill('작성 중인 수정 의견');
    await dynamic.page.getByRole('button', { name: '수정할 내용 입력', exact: true }).click();
    assert.equal(dynamic.state.calls.length, beforeFocus, 'Focus action does not send a fabricated reply');
    assert.equal(await dynamic.page.getByLabel('AI에게 보낼 메시지').inputValue(), '작성 중인 수정 의견');
    assert.equal(await dynamic.page.getByLabel('AI에게 보낼 메시지').evaluate(el => document.activeElement === el), true);
    dynamic.state.replyOverride = "수정할 부분이 있다면 알려주세요.\n(이대로 확정하고 넘어가고 싶다면 '다음 단계'를 입력해주세요.)";
    await dynamic.page.getByRole('button', { name: '확정해줘', exact: true }).click();
    await dynamic.page.getByRole('button', { name: '다음 단계', exact: true }).waitFor();
    assert.ok(dynamic.state.calls.at(-1).user_input.endsWith('user: 확정해줘'));
    dynamic.state.replyOverride = '어떤 부분을 어떻게 바꾸고 싶으신가요? 구체적으로 말씀해 주세요.';
    await sendInput(dynamic.page, '일부를 수정하고 싶어');
    assert.equal(await dynamic.page.locator('.rn-suggestions').count(), 0, 'Free-form question hides old choices');
    assert.equal(await dynamic.page.locator('.rn-next').count(), 0, 'Earlier advance instruction is not reused');
    await assertLegacyInputCopy(dynamic.page, 'question');
    await dynamic.context.close();
    console.log('PASS live reply extraction, verbatim selections, confirmation, focus-only editing and stale suggestion removal');

    const denied = await setup();
    denied.state.denied = true;
    await denied.page.goto(origin + '/chatpage2');
    await denied.page.waitForURL(origin + '/play-approval/pending');
    assert.equal(denied.state.calls.length, 0, 'Protected route must block chatbot calls');
    await denied.context.close();
    assert.deepEqual(errors, []);
    console.log('PASS approval gate; no browser JavaScript errors');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

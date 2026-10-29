// Local-only browser checks; all backend calls are intercepted.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:5191';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(origin).hostname));
const game = { code: 'preview-test', title: '학교 AI 체험', data: {
  opening: ['배경 첫 문단', '배경 두 번째 문단'], rolesBackground: '세 사람의 공통 배경',
  roles: [{ name: '학생', description: '학생 관점 설명' }, { name: '교사', description: '교사 관점 설명' }, { name: '학부모', description: '학부모 관점 설명' }],
  dilemma: { situation: ['학교에서 AI를 사용합니다.'], question: 'AI를 허용할까요?', options: { agree_label: '허용한다', disagree_label: '허용하지 않는다' } },
  flips: { agree_texts: ['허용한 이후 이야기'], disagree_texts: ['금지한 이후 이야기'] },
  finalMessages: { agree: '허용 엔딩', disagree: '금지 엔딩' },
} };
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const calls = [], errors = [];
    let unavailable = false;
    await context.addInitScript(() => {
      localStorage.setItem('access_token', `test.${btoa(JSON.stringify({ sub: 'teacher-account' }))}.test`);
      localStorage.setItem('room_code', 'ROOM-SENTINEL');
      localStorage.setItem('myrole_id', '3');
      localStorage.setItem('opening', 'EDITOR-SENTINEL');
      sessionStorage.setItem('hasSeenIntro', 'true');
    });
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      if (/^\/(?:play-applications|custom-games|rooms|chat|gpt|voice|auth)(?:\/|$)/.test(url.pathname)) calls.push({ path: url.pathname, method: request.method() });
      if (url.pathname === '/play-applications/me') return route.fulfill({ json: { status: 'approved' } });
      if (url.pathname === '/custom-games' && request.method() === 'POST') return route.fulfill({ json: { code: game.code, edit_code: 'teacher-secret', url: `/?code=${game.code}` } });
      if (url.pathname === '/custom-games/preview-test/title' && request.method() === 'PUT') return route.fulfill(request.headers()['x-edit-code'] === 'teacher-secret' ? { json: { message: 'updated' } } : { status: 403, json: {} });
      if (url.pathname === '/custom-games/preview-test/preview') {
        if (unavailable) { unavailable = false; return route.fulfill({ status: 503, json: {} }); }
        return route.fulfill(request.headers()['x-edit-code'] === 'teacher-secret'
          ? { json: game } : { status: 403, json: { detail: 'Forbidden' } });
      }
      return route.fulfill({ json: {} });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/preview/preview-test`);
    await page.getByLabel('제작자 수정 코드').waitFor();
    assert.equal(await page.getByText('배경 첫 문단', { exact: true }).count(), 0);
    await page.getByLabel('제작자 수정 코드').fill('preview-test');
    await page.getByRole('button', { name: '권한 확인 후 체험하기' }).click();
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByText('배경 첫 문단', { exact: true }).count(), 0);
    unavailable = true;
    await page.getByLabel('제작자 수정 코드').fill('teacher-secret');
    await page.getByRole('button', { name: '권한 확인 후 체험하기' }).click();
    await page.getByRole('alert').filter({ hasText: '잠시 후' }).waitFor();
    await page.getByRole('button', { name: '권한 확인 후 체험하기' }).click();
    await page.getByText('배경 첫 문단', { exact: true }).waitFor();
    await page.getByRole('button', { name: '다음 문단' }).click();
    await page.getByText('배경 두 번째 문단', { exact: true }).waitFor();
    const next = () => page.getByRole('button', { name: '다음으로', exact: true }).click();
    const role = name => page.getByRole('button', { name, exact: true }).click();
    await next();
    for (const [name, description] of [['학생', '학생 관점 설명'], ['교사', '교사 관점 설명'], ['학부모', '학부모 관점 설명']]) {
      await role(name);
      await page.getByRole('button', { name: '다음 문단' }).click();
      await page.getByText(description, { exact: true }).waitFor();
    }
    await next(); await next();
    assert.equal(await page.getByRole('button', { name: '다음으로', exact: true }).isDisabled(), true);
    for (const name of ['학생', '교사', '학부모']) {
      await role(name); await page.getByRole('button', { name: '허용한다', exact: true }).click();
    }
    await next();
    await page.getByRole('button', { name: '허용한다', exact: true }).click();
    await next(); await page.getByText('허용한 이후 이야기', { exact: true }).waitFor();
    await next(); await next(); await page.getByText('허용 엔딩', { exact: true }).waitFor();
    await page.getByRole('button', { name: '이전 단계' }).click();
    await page.getByRole('button', { name: '허용하지 않는다', exact: true }).click();
    await next(); await page.getByText('금지 엔딩', { exact: true }).waitFor();
    await page.getByRole('button', { name: '처음부터 다시 체험' }).click();
    await page.getByText('배경 첫 문단', { exact: true }).waitFor();
    for (let i = 0; i < 3; i++) await next();
    for (const name of ['학생', '교사', '학부모']) {
      await role(name); await page.getByRole('button', { name: '허용하지 않는다', exact: true }).click();
    }
    await next(); await page.getByRole('button', { name: '허용하지 않는다', exact: true }).click();
    await next(); await page.getByText('금지한 이후 이야기', { exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await next(); await next(); await page.getByText('금지 엔딩', { exact: true }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile page must fit horizontally');
    await page.screenshot({ path: '/tmp/game-preview-mobile.png', fullPage: true });
    assert.deepEqual(await page.evaluate(() => ['room_code', 'myrole_id', 'opening'].map(key => localStorage.getItem(key))), ['ROOM-SENTINEL', '3', 'EDITOR-SENTINEL']);
    assert.ok(calls.every(call => ['/play-applications/me', '/custom-games/preview-test/preview'].includes(call.path)), JSON.stringify(calls));
    await page.reload();
    assert.equal(await page.getByLabel('제작자 수정 코드').inputValue(), 'teacher-secret');
    await page.getByRole('button', { name: '권한 확인 후 체험하기' }).click();
    await page.getByText('배경 첫 문단', { exact: true }).waitFor();
    await page.goto(`${origin}/creatorending`);
    await page.evaluate(() => localStorage.setItem('url', '/?code=preview-test'));
    await page.reload();
    await page.getByRole('button', { name: '혼자 체험하기', exact: true }).waitFor();
    await page.screenshot({ path: '/tmp/game-preview-complete.png', fullPage: true });
    await page.getByRole('button', { name: '혼자 체험하기', exact: true }).click();
    await page.waitForURL('**/preview/preview-test');
    const access = await page.evaluate(async () => {
      const api = (await import('/src/api/axiosInstance.js')).default;
      const preview = await import('/src/utils/previewAccess.js');
      preview.forgetPreviewAccess('preview-test');
      await api.post('/custom-games', {});
      const remembered = preview.readPreviewAccess('preview-test');
      await api.put('/custom-games/preview-test/title', { title: 'Test' });
      const original = localStorage.getItem('access_token');
      localStorage.setItem('access_token', `test.${btoa(JSON.stringify({ sub: 'student-account' }))}.test`);
      const otherAccount = preview.readPreviewAccess('preview-test');
      localStorage.setItem('access_token', original);
      return { remembered, otherAccount };
    });
    assert.deepEqual(access, { remembered: 'teacher-secret', otherAccount: '' });
    await page.goto(`${origin}/preview`);
    await page.getByLabel('게임 코드', { exact: true }).fill('preview-test');
    await page.getByRole('button', { name: '게임 불러오기', exact: true }).click();
    await page.waitForURL('**/preview/preview-test');
    assert.deepEqual(errors, []);
    console.log('PASS private access gate, retry, three roles, both branches and endings, restart, reload, entry links, mobile layout, no AI/room calls or editor/game storage changes');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

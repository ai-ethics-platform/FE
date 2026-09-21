/* npm run dev -- --port 5199
 * EDITOR_ORIGIN=http://127.0.0.1:5199 PLAYWRIGHT_MODULE=/path/to/playwright node tests/editor-layout.browser.cjs
 * Real components, isolated browser storage and mocked fixture API; no server writes. */
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.EDITOR_ORIGIN || 'http://127.0.0.1:5199';
assert.ok(['127.0.0.1', 'localhost'].includes(new URL(origin).hostname));
const routes = ['create01', 'create02', 'create03', 'create04', 'create05', 'editor01', 'editor02_1', 'editor02_2', 'editor02_3', 'editor02', 'editor03', 'editor04', 'editor05', 'editor06', 'editor07', 'editor07_1', 'editor08', 'editor09', 'editor10', 'editor10_1'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.dismiss());
  await page.route('**/*', route => new URL(route.request().url()).origin === origin || route.request().url().startsWith('data:') ? route.continue() : route.abort());
  let unbroken = false;
  const visit = async route => {
    await page.goto(`${origin}/tests/editor-layout.html${unbroken ? '?unbroken=1' : ''}#/${route}`);
    await page.locator('.creator-layout').waitFor();
    await page.evaluate(() => document.fonts.ready);
  };
  try {
    if (!process.argv.includes('--interactions-only')) for (const [width, height, stress = false] of [[1440, 900], [1280, 720], [1200, 700], [1024, 768], [768, 1024], [390, 844], [320, 640], [390, 844, true], [320, 640, true]]) {
      unbroken = stress;
      await page.setViewportSize({ width, height });
      for (const route of routes) {
        await visit(route);
        const issues = await page.evaluate(() => {
          const issues = [];
          for (const el of document.querySelectorAll('.creator-layout div, .creator-layout p, .creator-layout h2, .creator-layout textarea')) {
            const style = getComputedStyle(el);
            if (!el.getBoundingClientRect().width) continue;
            if (el.scrollWidth > el.clientWidth + 3 && !['auto', 'scroll'].includes(style.overflowX)) issues.push(`Horizontal overflow: ${el.className || el.tagName} ${el.scrollWidth}/${el.clientWidth} ${el.textContent.slice(0, 30)}`);
          }
          const banner = document.querySelector('[role="banner"]').getBoundingClientRect();
          const active = document.querySelector('[aria-current="step"]').getBoundingClientRect();
          if (active.bottom > banner.bottom || active.left < 0 || active.right > innerWidth) issues.push('Active step is clipped');
          const title = document.querySelector('.creator-title');
          const text = title.querySelector(':scope > div > div').getBoundingClientRect();
          const edit = title.querySelector('button').getBoundingClientRect();
          if (text.right > edit.left + 1) issues.push('Title overlaps edit control');
          for (const button of document.querySelectorAll('.creator-layout button:not(:disabled)')) {
            if (!button.getAttribute('aria-label') && !button.textContent.trim() && !button.querySelector('img[alt]:not([alt=""])')) issues.push('Unnamed button');
          }
          return issues;
        });
        assert.deepEqual(issues, [], `${route} at ${width}x${height}`);
      }
      console.log(`PASS 20 screens at ${width}x${height}${stress ? ' (unbroken text)' : ''}`);
    }
    unbroken = false;
    await page.setViewportSize({ width: 320, height: 640 });
    for (const route of ['create05', 'editor10_1']) {
      await visit(route);
      await page.getByRole('button', { name: '완료하기', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      const box = await dialog.boundingBox();
      assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 320 && box.y + box.height <= 640, 'Dialog fits viewport');
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Tab');
        assert.ok(await dialog.evaluate(el => !document.hasFocus() || el.contains(document.activeElement)), 'Modal excludes background controls from keyboard focus');
      }
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(), 0);
    }
    await visit('editor10');
    assert.equal(await page.getByRole('button', { name: '완료하기', exact: true }).isDisabled(), true);
    await visit('create01');
    await page.getByRole('button', { name: 'home', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await page.getByRole('button', { name: '닫기', exact: true }).press('Enter');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.getByRole('button', { name: 'home', exact: true }).click();
    await page.mouse.click(2, 2);
    assert.equal(await page.getByRole('dialog').count(), 0, 'Backdrop click closes modal');
    for (const route of ['create01', 'create02', 'create03', 'create04']) {
      await visit(route);
      console.log('Checking image chooser', route);
      const chooser = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: '이미지 변경', exact: true }).first().press('Enter');
      await chooser;
    }
    console.log('PASS responsive dialogs, keyboard close and backdrop');
    await visit('editor01');
    const scroll = page.locator('.preview-text-scroll');
    await scroll.evaluate(el => { el.scrollTop = el.scrollHeight; });
    assert.ok(await scroll.evaluate(el => el.scrollTop > 0));
    await page.getByRole('button', { name: '다음 문단' }).press('Enter');
    assert.equal(await scroll.evaluate(el => el.scrollTop), 0, 'New paragraph starts at the top');
    assert.equal(await page.locator('.creator-pagination-count').innerText(), '2 / 3');
    await page.getByRole('button', { name: '제목 수정' }).click();
    const title = page.getByRole('textbox', { name: '게임 제목' });
    const original = await title.inputValue();
    await title.fill('취소할 제목');
    await title.press('Escape');
    assert.equal(await page.evaluate(() => localStorage.getItem('creatorTitle')), original);
    await page.getByRole('button', { name: '제목 수정' }).click();
    await title.fill('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234');
    await title.press('Enter');
    assert.equal(await page.evaluate(() => localStorage.getItem('creatorTitle')), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234');
    for (const route of ['editor05', 'editor09']) {
      await visit(route);
      await page.getByRole('button', { name: '확신도 5점' }).press('Enter');
      assert.equal(await page.getByRole('button', { name: '확신도 5점' }).getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', { name: '다음 화면', exact: true }).press('Enter');
      assert.ok(!page.url().endsWith('/' + route));
    }
    await visit('create01');
    assert.equal(await page.locator('textarea').count(), 3);
    await page.getByRole('button', { name: '화면 3 삭제', exact: true }).click();
    assert.equal(await page.locator('textarea').count(), 2);
    await page.getByRole('button', { name: '입력 필드 추가', exact: true }).click();
    assert.equal(await page.locator('textarea').count(), 3);
    for (const input of await page.locator('textarea').all()) await input.fill('짧은 테스트 문단입니다.');
    await page.evaluate(() => { window.layoutRequests = []; window.layoutSaveDelay = 250; });
    await page.getByRole('button', { name: '미리보기 모드', exact: true }).press('Enter');
    await page.waitForURL(url => url.hash === '#/editor01');
    const puts = await page.evaluate(() => window.layoutRequests.filter(r => r.method === 'put'));
    assert.equal(puts.filter(r => r.url.endsWith('/opening')).length, 1, 'Enter triggers one navigation save');
    assert.match(await scroll.innerText(), /짧은 테스트 문단입니다/);
    assert.deepEqual(errors, []);
    console.log('PASS modal fit/focus/Escape, keyboard image controls, paragraph scroll reset, title save/cancel, confidence selection, navigation and single save');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

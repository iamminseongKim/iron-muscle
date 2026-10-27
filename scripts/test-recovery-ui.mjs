import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5175', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear(); localStorage.setItem('iron_language', 'ko');
    const sets = Array.from({ length: 5 }, (_, index) => ({ id: `set-${index + 1}`, setNumber: index + 1, weight: 40 + index * 5, reps: 12 - index, completed: true }));
    const press = { id: 'press', exerciseId: 'custom-recovery-press', exerciseName: '머신 체스트 프레스', equipmentType: 'machine', weightUnit: 'kg', sets };
    const extension = { ...press, id: 'extension', exerciseId: 'custom-recovery-extension', exerciseName: '케이블 오버헤드 트라이셉스 익스텐션', sets: [sets[0]] };
    const session = { id: 'main-session', title: '가슴 & 삼두 루틴', date: '2026-10-23', startTime: '2026-10-23T01:00:00Z', durationSeconds: 3600, completed: true, exercises: [press, extension] };
    const another = { ...session, id: 'other-session', title: '등 루틴', date: '2026-10-24' };
    const items = [...sets.slice(0, 4).map((set, index) => ({ id: `trash-${index + 1}`, deletedAt: Date.now() - index * 60000, kind: 'set', location: 'history', session, exerciseId: press.id, setId: set.id })),
      { id: 'trash-extension', deletedAt: Date.now() - 5 * 60000, kind: 'exercise', location: 'history', session, exerciseId: extension.id },
      { id: 'trash-session', deletedAt: Date.now() - 86400_000 * 28, kind: 'session', location: 'history', session: another }];
    localStorage.setItem('iron_recovery_v1', JSON.stringify(items));
    localStorage.setItem('iron_workout_sessions_v1', JSON.stringify([{ ...session, exercises: [{ ...press, sets: [sets[4]] }] }]));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  const click = async text => assert.ok(await page.evaluate(text => {
    const button = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && node.textContent.trim() === text); button?.click(); return !!button;
  }, text), `button ${text}`);
  const waitFor = async (...args) => { try { return await page.waitForFunction(...args); } catch (error) { throw new Error('UI wait failed: ' + String(args[0]), { cause: error }); } };
  await click('MY'); await page.waitForSelector('[data-recovery-item]');
  const source = await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1'));
  const panel = await page.$('[data-recovery-panel]');
  assert.equal(await page.$$eval('[data-recovery-panel] h3', nodes => nodes.length), 2, 'grouped workout titles');
  assert.ok(await page.$eval('[data-recovery-item="trash-1"]', node => node.textContent.includes('#1 · 40 kg × 12')));
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `list layout ${width}`);
  }
  await page.type('[aria-label="복구함 검색"]', '오버헤드');
  await waitFor(() => document.querySelectorAll('[data-recovery-item]').length === 1);
  await page.$eval('[aria-label="복구함 검색"]', input => { const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, ''); input.dispatchEvent(new Event('input', { bubbles: true })); });
  await waitFor(() => document.querySelectorAll('[data-recovery-item]').length === 6);
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await panel.screenshot({ path: join(tmpdir(), 'iron-recovery-list.png') });
  await page.click('[data-recovery-item="trash-1"] button[aria-label^="영구 삭제"]');
  await page.waitForSelector('[role="dialog"]'); await page.keyboard.press('Escape');
  await page.waitForSelector('[role="dialog"]', { hidden: true });
  assert.equal(await page.$$eval('[data-recovery-item]', nodes => nodes.length), 6);
  await click('항목 선택');
  await page.$eval('input[aria-label="전체 선택 · 가슴 & 삼두 루틴"]', input => input.scrollIntoView({ block: 'center' }));
  await page.click('input[aria-label="전체 선택 · 가슴 & 삼두 루틴"]');
  await waitFor(() => document.querySelector('[data-recovery-selection]').textContent.includes('선택한 항목 · 5'));
  await page.click('[data-recovery-item="trash-1"] input');
  await click('선택 삭제'); await page.waitForSelector('[data-confirm-recovery-delete]');
  // A deletion confirmation is a snapshot: newly arrived items must survive it.
  await page.evaluate(() => {
    const items = JSON.parse(localStorage.getItem('iron_recovery_v1'));
    items.unshift({ ...items[0], id: 'arrived', deletedAt: Date.now() });
    localStorage.setItem('iron_recovery_v1', JSON.stringify(items)); window.dispatchEvent(new Event('iron_recovery_change'));
  });
  await page.click('[data-confirm-recovery-delete]');
  await waitFor(() => JSON.parse(localStorage.getItem('iron_recovery_v1')).length === 3);
  assert.equal(await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1')), source, 'purge leaves saved records untouched');
  assert.ok(await page.$('[data-recovery-item="arrived"]'));
  await page.click('[data-recovery-selection] input'); await click('선택 복원');
  await waitFor(() => JSON.parse(localStorage.getItem('iron_recovery_v1')).length === 0);
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_workout_sessions_v1')));
  assert.equal(restored.length, 2);
  assert.deepEqual(restored.find(session => session.id === 'main-session').exercises[0].sets.map(set => set.id), ['set-1', 'set-5']);
  // Reload fresh trash and verify failure feedback, clear-all snapshot, translations, and modal focus.
  await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('iron_workout_sessions_v1'))[0];
    localStorage.setItem('iron_recovery_v1', JSON.stringify([{ id: 'final', deletedAt: Date.now(), kind: 'session', location: 'history', session }]));
    window.dispatchEvent(new Event('iron_recovery_change'));
  });
  await page.waitForSelector('[data-recovery-item="final"]');
  await click('복구함 비우기'); await page.waitForSelector('[data-confirm-recovery-delete]');
  await page.evaluate(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'iron_recovery_v1') throw Error('quota'); return window.originalSetItem.call(this, key, value); }; });
  await page.click('[data-confirm-recovery-delete]');
  await page.waitForSelector('[data-recovery-panel] [role="alert"]');
  assert.equal(await page.$$eval('[data-recovery-item]', nodes => nodes.length), 1);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  for (const language of ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de']) {
    const title = await page.evaluate(async language => { const i18n = await import('/src/i18n/index.ts'); i18n.setLanguage(language); return i18n.t('복구함'); }, language);
    await waitFor(title => document.querySelector('[data-recovery-panel] h2').textContent.includes(title), {}, title);
    await page.setViewport({ width: 320, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `translated list ${language}`);
    await page.evaluate(() => { if (!document.querySelector('[data-recovery-selection]')) document.querySelector('[data-recovery-panel] button[aria-pressed]').click(); });
    await page.waitForSelector('[data-recovery-selection]');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `translated selection ${language}`);
    await page.evaluate(() => document.querySelector('[data-recovery-panel] > div button').click());
    await page.waitForSelector('[role="dialog"]');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `translated modal ${language}`);
    await page.keyboard.press('Escape'); await page.waitForSelector('[role="dialog"]', { hidden: true });
  }
  await page.evaluate(async () => (await import('/src/i18n/index.ts')).setLanguage('ko'));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await click('다크');
  await waitFor(() => getComputedStyle(document.querySelector('.iron-app-shell')).backgroundColor === 'rgb(18, 16, 25)');
  await panel.screenshot({ path: join(tmpdir(), 'iron-recovery-dark.png') });
  await click('복구함 비우기'); await page.waitForSelector('[role="dialog"]');
  await page.screenshot({ path: join(tmpdir(), 'iron-recovery-confirm.png') });
  await page.click('[data-confirm-recovery-delete]');
  await waitFor(() => JSON.parse(localStorage.getItem('iron_recovery_v1')).length === 0);
  assert.deepEqual(errors, []);
  console.log('PASS grouped readable recovery, set metadata, selection/group/all, atomic restore, deletion confirmation/cancel/failure, new-entry protection, 320/390/768px, 8 languages and dark mode');
} finally { await browser.close(); }

import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const url = process.env.TEST_URL || 'http://127.0.0.1:3012';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle2' });
  const seed = async (counts, grouped = false) => {
    await page.evaluate(({ counts, grouped }) => {
      localStorage.clear();
      localStorage.setItem('iron_language', 'ko');
      const exercises = counts.map((count, index) => ({
        id: `e${index}`, exerciseId: index ? 'lat-pulldown' : 'bench-press', equipmentType: index ? 'cable' : 'barbell', weightUnit: index ? 'lbs' : 'kg',
        ...(grouped ? { groupId: 'pair', groupType: 'superset', groupLabel: `슈퍼세트 A-${index + 1}` } : {}),
        sets: Array.from({ length: count }, (_, i) => ({ id: `e${index}s${i + 1}`, setNumber: i + 1, weight: index ? 100 : 40, reps: index ? 12 : 10, completed: false, rpe: null, setType: 'WORKING', plannedSetType: 'WORKING', plannedRestSeconds: 90, provenance: 'recorded' })),
      }));
      localStorage.setItem('iron_active_session_v1', JSON.stringify({ id: 'group-ui', date: '2026-11-19', title: 'Group flow UI', startTime: new Date().toISOString(), durationSeconds: 0, completed: false, exercises }));
    }, { counts, grouped });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-workout-exercise="e0"]');
  };
  const active = () => page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')));
  const clickText = async (text, contains = false) => {
    const found = await page.evaluate(({ text, contains }) => {
      const button = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && (contains ? node.textContent.trim().startsWith(text) : node.textContent.trim() === text));
      button?.click();
      return Boolean(button);
    }, { text, contains });
    assert.ok(found, `button ${text}`);
  };
  const start = async (exercise, round) => {
    const selector = `[data-workout-exercise="${exercise}"] button[aria-label="${round}세트 시작"]`;
    await page.waitForSelector(selector);
    await page.$eval(selector, node => node.click());
  };
  const complete = async (exercise, round) => {
    await page.$eval(`[data-workout-exercise="${exercise}"] button[aria-label="${round}세트 완료"]`, node => node.click());
    await page.waitForSelector('[aria-label="세트 피드백"]');
    await clickText('건너뛰고 완료');
  };
  const finishRest = async () => {
    if (await page.$('[data-rest-timer-capsule]')) await page.$eval('[data-rest-timer-capsule] button', node => node.click());
    await page.waitForSelector('[data-rest-timer-dialog]');
    await clickText('휴식 타이머 닫기', true);
    await page.waitForFunction(() => !document.querySelector('[data-rest-timer-overlay]'));
  };
  await seed([2, 2]);
  await start('e0', 1);
  assert.equal(await page.$eval('[data-workout-exercise="e1"] button[aria-label="1세트 대기"]', node => node.disabled), true, 'other exercise waits during active set');
  await complete('e0', 1);
  await page.waitForSelector('[data-rest-timer-overlay]');
  await page.$eval('[data-rest-timer-overlay]', node => node.click());
  await page.waitForSelector('[data-rest-timer-capsule]');
  assert.equal(await page.$eval('[data-workout-exercise="e1"] button[aria-label="1세트 대기"]', node => node.disabled), true, 'minimized rest blocks other start');
  assert.equal(await page.$eval('[data-workout-exercise="e0"] button[aria-label="2세트 대기"]', node => node.disabled), true, 'rest also blocks next set');
  await page.$eval('[data-workout-exercise="e1"] button[aria-label="1세트 대기"]', node => node.click());
  assert.equal((await active()).exercises[1].sets[0].startedAt, undefined);
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-rest-timer-overlay]');
  await page.$eval('[data-rest-timer-overlay]', node => node.click());
  assert.equal(await page.$eval('[data-workout-exercise="e1"] button[aria-label="1세트 대기"]', node => node.disabled), true, 'rest lock survives reload');
  await finishRest();
  await start('e1', 1);
  assert.ok((await active()).exercises[1].sets[0].startedAt);
  console.log('PASS active/rest start guards, minimized and reloaded rest, explicit end unlocks');

  await seed([1]);
  await start('e0', 1);
  await page.evaluate(() => {
    window.originalStorageWrite = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'iron_active_session_v1') throw new DOMException('test quota', 'QuotaExceededError'); return window.originalStorageWrite.call(this, key, value); };
  });
  await complete('e0', 1);
  assert.equal((await active()).exercises[0].sets[0].completed, false, 'failed completion save preserves active record');
  assert.equal(await page.$('[data-workout-finish-confirm]'), null, 'failed completion save never opens finish prompt');
  assert.equal(await page.$('[data-rest-timer-overlay]'), null);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; });
  await complete('e0', 1);
  await page.waitForSelector('[data-workout-finish-confirm]');
  assert.equal(await page.$('[data-rest-timer-overlay]'), null, 'final set bypasses rest');
  assert.equal((await active()).exercises[0].sets[0].completed, true);
  await clickText('계속 기록하기');
  assert.ok(await active(), 'continue does not finish session');
  await clickText('기록 수정');
  await page.waitForSelector('[aria-label="세트 피드백"]');
  await clickText('저장');
  assert.equal(await page.$('[data-workout-finish-confirm]'), null, 'editing completed feedback does not re-prompt finish');
  assert.equal(await page.$('[data-rest-timer-overlay]'), null, 'editing completed feedback does not restart rest');
  await clickText('세트 추가');
  await start('e0', 2);
  await complete('e0', 2);
  await page.waitForSelector('[data-workout-finish-confirm]');
  await page.evaluate(() => {
    Storage.prototype.setItem = function(key, value) { if (key === 'iron_workout_sessions_v1') throw new DOMException('test history quota', 'QuotaExceededError'); return window.originalStorageWrite.call(this, key, value); };
  });
  await clickText('운동 마치기');
  assert.ok(await page.$('[data-workout-finish-confirm]'), 'failed history save keeps confirmation open');
  assert.ok(await active());
  await page.evaluate(() => { Storage.prototype.setItem = window.originalStorageWrite; });
  await clickText('운동 마치기');
  await page.waitForFunction(() => localStorage.getItem('iron_active_session_v1') === null);
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_workout_sessions_v1')));
  assert.equal(history.length, 1);
  assert.equal(history[0].exercises[0].sets.filter(set => set.completed).length, 2, 'history includes latest final set');
  console.log('PASS final-set prompt, continue/add set, completion failure, history save recovery and latest-set preservation');

  await seed([4, 2], true);
  assert.equal(await page.$$eval('[data-workout-group]', nodes => nodes.length), 1, 'one group card');
  assert.equal((await active()).exercises[0].sets.length, 4, 'group display does not silently align mismatched counts');
  await mkdir('output/group-workout', { recursive: true });
  await page.screenshot({ path: 'output/group-workout/compact.png', fullPage: true });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'compact mobile layout has no horizontal overflow');
  await page.$eval('[data-group-settings]', node => { if (node.tagName === 'DETAILS') node.open = true; });
  const setNumber = async (selector, value) => page.$eval(selector, (node, value) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, String(value));
  await setNumber('[data-group-round-count]', 3);
  await setNumber('[data-group-rest-seconds]', 120);
  await page.$eval('[data-group-apply]', node => node.click());
  const aligned = await active();
  assert.deepEqual(aligned.exercises.map(ex => ex.sets.length), [3, 3]);
  assert.deepEqual(aligned.exercises.map(ex => ex.sets[0].weight), [40, 100]);
  assert.deepEqual(aligned.exercises.map(ex => ex.weightUnit), ['kg', 'lbs']);
  assert.ok(aligned.exercises.every(ex => ex.sets.every(set => set.plannedRestSeconds === 120)));
  await page.$eval('[data-group-details-button]', node => node.click());
  for (const exercise of ['e0', 'e1']) await page.$eval(`[data-workout-exercise="${exercise}"]`, node => [...node.querySelectorAll('button')].find(button => button.textContent.trim() === '세트 추가').click());
  await page.waitForFunction(() => document.querySelector('[data-group-round-count]').value === '4');
  await setNumber('[data-group-rest-seconds]', 60);
  await page.$eval('[data-group-apply]', node => node.click());
  assert.deepEqual((await active()).exercises.map(ex => ex.sets.length), [4, 4], 'changing rest after adding sets keeps new rounds');
  await setNumber('[data-group-round-count]', 3);
  await page.$eval('[data-group-apply]', node => node.click());
  await page.$eval('[data-group-details-button]', node => node.click());
  await clickText('모두 접기');
  assert.equal(await page.$$eval('[data-workout-group] input', nodes => nodes.filter(node => node.getClientRects().length).length), 0, 'collapse all includes group');
  await clickText('모두 펼치기');
  await start('e0', 1);
  await complete('e0', 1);
  assert.equal(await page.$('[data-rest-timer-overlay]'), null, 'partner transition does not rest');
  await start('e1', 1);
  await complete('e1', 1);
  await page.waitForSelector('[data-rest-timer-overlay]');
  await finishRest();
  await start('e0', 2);
  await complete('e0', 2);
  assert.equal(await page.$('[data-rest-timer-overlay]'), null);
  await start('e1', 2);
  await complete('e1', 2);
  await page.waitForSelector('[data-rest-timer-overlay]');
  await finishRest();
  await start('e0', 3);
  await complete('e0', 3);
  await start('e1', 3);
  await complete('e1', 3);
  await page.waitForSelector('[data-workout-finish-confirm]');
  assert.equal(await page.$('[data-rest-timer-overlay]'), null, 'last grouped round ends with confirmation');
  await clickText('계속 기록하기');
  await page.$eval('[data-group-details-button]', node => node.click());
  assert.ok(await page.$('[data-workout-exercise="e0"] button[aria-label="3세트 완료 취소"]') || (await active()).exercises[0].sets.every(set => set.completed));
  await seed([2, 2], true);
  for (const language of ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de']) {
    await page.evaluate(language => localStorage.setItem('iron_language', language), language);
    await page.setViewport({ width: 320, height: 844, isMobile: true, hasTouch: true });
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-workout-group]');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `compact layout ${language}`);
    await page.click('[data-group-settings] > summary');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `settings layout ${language}`);
    if (language !== 'ko') assert.notEqual(await page.$eval('[data-group-apply]', node => node.textContent.trim()), '설정 적용');
  }
  assert.deepEqual(errors, []);
  console.log('PASS compact group, fresh settings after set edits, collapse all, explicit rounds/rest, separate kg/lbs, round transitions, final confirmation and eight-language mobile layout');
} finally {
  await browser.close();
}

import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const chrome = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  const dialogs = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', async dialog => {
    dialogs.push(dialog.type());
    await dialog.accept(dialog.type() === 'prompt' ? 'Machine occupied' : undefined);
  });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('iron_language', 'ko');
    const planned = { weight: 30, reps: 10, plannedWeight: 30, plannedReps: 10, plannedTempo: { eccentric: 3, pause: 1, concentric: 1 }, targetRpe: 8, rpe: null, plannedRestSeconds: 120, provenance: 'recorded', setType: 'WORKING', plannedSetType: 'WORKING', plannedNotes: 'Keep original plan' };
    localStorage.setItem('iron_active_session_v1', JSON.stringify({ id: 'replace-ui', title: 'Prescription replacement', date: '2026-11-05', startTime: new Date().toISOString(), durationSeconds: 0, completed: false, exercises: [{ id: 'original', exerciseId: 'lat-pulldown', exerciseName: '와이드그립 랫 풀다운', equipmentType: 'machine', loadType: 'pin-loaded', weightUnit: 'kg', notes: 'Original notes', sets: [{ ...planned, id: 'completed', setNumber: 1, completed: true, tempo: { eccentric: 3, pause: 1, concentric: 1 }, tempoSource: 'prescribed', completedAt: new Date().toISOString() }, { ...planned, id: 'pending', setNumber: 2, completed: false }] }] }));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  const active = () => page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')));
  const original = await active();
  await page.click('[data-workout-exercise="original"] button[title="다른 종목으로 교체 (기구 사용 중/대체)"]');
  await page.waitForSelector('input[aria-label="운동 검색"]');
  await page.type('input[aria-label="운동 검색"]', 'Machine High Row');
  const selectReplacement = async () => page.evaluate(() => {
    const dialog = document.querySelector('[aria-labelledby="exercise-picker-title"]');
    const button = [...dialog.querySelectorAll('button')].find(node => node.querySelector('p.exercise-picker-english')?.textContent.trim() === 'Machine High Row');
    button?.click();
    return !!button;
  });
  await page.waitForFunction(() => [...document.querySelectorAll('p.exercise-picker-english')].some(node => node.textContent.trim() === 'Machine High Row'));
  assert.ok(await selectReplacement());
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises.length === 2);
  const replaced = await active();
  assert.deepEqual(replaced.exercises[0].sets, [original.exercises[0].sets[0]]);
  assert.equal(replaced.exercises[0].exerciseId, 'lat-pulldown');
  const replacement = replaced.exercises[1];
  assert.equal(replacement.exerciseId, 'machine-high-row');
  assert.equal(replacement.sets[0].id, 'pending');
  assert.deepEqual(replacement.sets[0].plannedTempo, original.exercises[0].sets[1].plannedTempo);
  assert.equal(replacement.sets[0].targetRpe, 8);
  assert.equal(replacement.sets[0].plannedRestSeconds, 120);
  assert.equal(replacement.sets[0].plannedNotes, 'Keep original plan');
  assert.equal(replacement.sets[0].weight, 0);
  assert.equal(replacement.sets[0].weightNeedsConfirmation, true);
  assert.equal(replacement.replacementHistory[0].reason, 'Machine occupied');
  assert.deepEqual(dialogs, ['confirm', 'prompt']);
  assert.ok(await page.$eval('[data-workout-set="pending"] button[aria-label="1세트 시작"]', node => node.disabled));
  await page.reload({ waitUntil: 'networkidle0' });
  const reloaded = await active();
  assert.equal(reloaded.exercises.length, 2);
  assert.equal(reloaded.exercises[1].sets[0].weightNeedsConfirmation, true);
  assert.ok(await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find(node => node.textContent.trim() === '종목 교체 되돌리기');
    button?.click();
    return !!button;
  }));
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises.length === 1);
  assert.deepEqual((await active()).exercises, original.exercises);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log('PASS actual replacement confirmation and reason, completed original attribution, pending prescription/load gate, reload and exact undo.');
} finally {
  await browser.close();
}

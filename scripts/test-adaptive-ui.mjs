import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const baseUrl = process.env.TEST_URL || 'http://127.0.0.1:3000';
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(baseUrl);
  await page.evaluate(() => {
    localStorage.clear(); localStorage.setItem('iron_language', 'ko');
    const set = (id, n) => ({ id, setNumber: n, weight: 80, reps: 8, plannedWeight: 80, plannedReps: 8, targetRpe: 8, plannedRestSeconds: 90, setType: 'WORKING', plannedSetType: 'WORKING', rpe: null, provenance: 'recorded', completed: false });
    const session = { id: 'adaptive-ui', title: 'Adaptive UI', date: '2026-10-31', startTime: new Date().toISOString(), durationSeconds: 0, completed: false, exercises: [
      { id: 'bench', exerciseId: 'bench-press', equipmentType: 'barbell', groupId: 'pair', groupType: 'superset', sets: [set('first', 1), set('next', 2)] },
      { id: 'row', exerciseId: 'lat-pulldown', equipmentType: 'cable', groupId: 'pair', groupType: 'superset', sets: [set('partner', 1)] },
    ] };
    localStorage.setItem('iron_active_session_v1', JSON.stringify(session));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  const active = () => page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')));
  const click = async text => {
    assert.ok(await page.evaluate(text => { const button = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && node.textContent.trim() === text); button?.click(); return !!button; }, text), text);
  };
  const selectRpe = async value => {
    await page.focus('input[type=range][aria-label="실제 RPE"]');
    await page.keyboard.press('Home');
    for (let step = 6; step < value; step += 0.5) await page.keyboard.press('ArrowRight');
  };
  const completeFirst = async () => {
    const start = await page.$('[data-workout-exercise="bench"] button[aria-label="1세트 시작"]');
    if (start) await start.click();
    await page.click('[data-workout-exercise="bench"] button[aria-label="1세트 완료"]');
    await page.waitForSelector('[role="dialog"][aria-label="세트 피드백"]');
  };
  assert.ok(await page.$eval('[data-workout-exercise="bench"] button[aria-label="2세트 대기"]', node => node.disabled), 'later set waits for earlier set');
  await page.click('[data-workout-exercise="bench"] button[aria-label="1세트 시작"]');
  assert.ok(await page.$eval('[data-workout-exercise="row"] button[aria-label="1세트 대기"]', node => node.disabled), 'other exercise waits while a set is active');
  assert.ok((await active()).exercises[0].sets[0].startedAt);
  await completeFirst();
  assert.equal((await active()).exercises[0].sets[0].rpe, null);
  await page.evaluate(() => {
    window.rpeWrites = 0; window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'iron_active_session_v1' && JSON.parse(value).exercises[0].sets[0].rpe !== null) window.rpeWrites++; return window.originalSetItem.call(this, key, value); };
  });
  const slider = await page.$('input[type=range][aria-label="실제 RPE"]');
  const sliderBox = await slider.boundingBox();
  await page.mouse.move(sliderBox.x + sliderBox.width / 2, sliderBox.y + sliderBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(sliderBox.x + sliderBox.width * 0.723, sliderBox.y + sliderBox.height / 2, { steps: 12 });
  assert.equal((await active()).exercises[0].sets[0].rpe, null, 'pointer preview is not saved while dragging');
  assert.equal(await page.evaluate(() => window.rpeWrites), 0, 'no RPE persistence during drag');
  const continuousPosition = await slider.evaluate(node => Number(node.value));
  assert.notEqual(continuousPosition * 2 % 1, 0, 'thumb moves continuously between half steps');
  await page.mouse.up();
  assert.equal((await active()).exercises[0].sets[0].rpe, Math.round(continuousPosition * 2) / 2, 'release commits half step');
  assert.equal(await page.evaluate(() => window.rpeWrites), 1, 'one RPE write on release');
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.click('[aria-label="세트 피드백"] button[aria-label="미기록"]');

  await selectRpe(9.5);
  await mkdir('output/adaptive-training', { recursive: true });
  await page.screenshot({ path: 'output/adaptive-training/smooth-rpe.png' });
  await click('저장하고 완료');
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises[0].sets[0].completed);
  let saved = await active();
  assert.equal(saved.exercises[0].sets[0].targetRpe, 8);
  assert.equal(saved.exercises[0].sets[0].rpe, 9.5);
  assert.equal(saved.exercises[1].sets[0].completed, false, 'group partner independent');
  assert.equal(saved.exercises[0].sets[1].weight, 80, 'suggestion never automatically applied');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(node => node.textContent.startsWith('휴식 타이머 닫기')).click());
  await click('제안 적용');
  assert.equal((await active()).exercises[0].sets[1].weight, 77.5, 'only approval changes next weight');
  assert.equal((await active()).exercises[0].sets[1].plannedWeight, 80, 'prescription retained');
  await page.click('[data-workout-exercise="bench"] button[aria-label="1세트 완료 취소"]');
  await completeFirst(); await selectRpe(9.5); await click('저장하고 완료');
  await page.reload({ waitUntil: 'networkidle2' });
  assert.equal((await active()).exercises[0].sets[0].rpe, 9.5, 'feedback recovered');
  assert.ok(await page.evaluate(() => [...document.querySelectorAll('button')].some(node => node.getClientRects().length && node.textContent.startsWith('휴식 타이머 닫기'))), 'rest timer UI recovered');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(node => node.textContent.startsWith('휴식 타이머 닫기')).click());
  assert.equal((await active()).exercises[0].sets[0].restSeconds, undefined, 'timer dismissal is not measured rest');
  await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('iron_active_session_v1'));
    session.exercises[0].sets[0].completedAt = new Date(Date.now() - 10000).toISOString();
    localStorage.setItem('iron_active_session_v1', JSON.stringify(session));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.click('[data-workout-exercise="row"] button[aria-label="1세트 시작"]');
  saved = await active();
  assert.ok(saved.exercises[1].sets[0].restSeconds >= 10);
  assert.equal(saved.exercises[1].sets[0].restKind, 'transition');
  await page.click('[data-workout-exercise="row"] button[aria-label="1세트 상세 옵션"]');
  await page.evaluate(() => [...document.querySelectorAll('[data-workout-exercise="row"] button')].find(node => node.textContent === '시작 취소').click());
  assert.equal((await active()).exercises[1].sets[0].startedAt, undefined, 'cancel start releases active state');
  await page.click('[data-workout-exercise="bench"] button[aria-label="1세트 완료 취소"]');
  saved = await active();
  assert.equal(saved.exercises[0].sets[0].completed, false);
  assert.equal(saved.exercises[0].sets[0].rpe, null);
  assert.equal(saved.exercises[0].sets.length, 2);
  await completeFirst();
  await mkdir('output/adaptive-training', { recursive: true });
  await page.screenshot({ path: 'output/adaptive-training/feedback.png' });
  await click('건너뛰고 완료');
  assert.equal((await active()).exercises[0].sets[0].rpe, null);
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no overflow ${width}`);
  }
  await mkdir('output/adaptive-training', { recursive: true });
  await page.screenshot({ path: 'output/adaptive-training/mobile.png', fullPage: true });
  await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem('iron_active_session_v1'));
    session.id = 'legacy-feedback-draft';
    session.exercises = [session.exercises[0]];
    session.exercises[0].sets = [{ id: 'legacy-draft-set', setNumber: 1, weight: 20, reps: 10, rpe: 8, completed: false, provenance: 'legacy-unknown' }];
    localStorage.setItem('iron_active_session_v1', JSON.stringify(session));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await completeFirst();
  await selectRpe(9);
  await page.click('[aria-label="세트 피드백"] button[aria-label="닫기"]');
  await completeFirst();
  assert.equal((await active()).exercises[0].sets[0].rpe, 9, 'explicit legacy draft RPE survives closing and reopening feedback');
  assert.equal((await active()).exercises[0].sets[0].legacyRpe, 8, 'original ambiguous RPE preserved');
  await click('저장하고 완료');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(node => node.textContent.startsWith('휴식 타이머 닫기')).click());
  await click('기록 수정');
  assert.ok(!(await page.$eval('[aria-label="세트 피드백"]', node => node.textContent)).includes('건너뛰고 완료'), 'editing a completed record cannot skip and erase feedback');
  assert.deepEqual(errors, []);
  console.log('PASS mobile adaptive feedback, plan/actual split, null RPE, independent supersets, timestamp rest, reload, undo and responsive layout');
} finally { await browser.close(); }

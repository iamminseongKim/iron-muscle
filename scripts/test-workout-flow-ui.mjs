import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const url = process.env.TEST_URL || 'http://127.0.0.1:5173';
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear(); localStorage.setItem('iron_language', 'ko');
    const make = (id, groupId) => ({ id, exerciseId: id === 'one' ? 'bench-press' : id === 'two' ? 'barbell-squat' : 'lat-pulldown', equipmentType: 'barbell', weightUnit: 'kg', groupId, groupType: groupId ? 'superset' : undefined,
      sets: [{ id: `s-${id}`, setNumber: 1, weight: 50, reps: 10, completed: true, comment: 'private', restSeconds: 65 }, { id: `pending-${id}`, setNumber: 2, weight: 200, reps: 4, completed: false }] });
    const old = { id: 'source', title: '반복 운동', date: '2026-10-20', startTime: '2026-10-20T01:00:00Z', endTime: '2026-10-20T02:00:00Z', durationSeconds: 3600, completed: true, notes: 'old private note', exercises: [make('one'), make('two', 'pair'), make('three', 'pair')] };
    localStorage.setItem('iron_workout_sessions_v1', JSON.stringify([old]));
    window.sourceRecord = JSON.stringify(old);
  });
  const sourceSnapshot = await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1'));
  await page.reload({ waitUntil: 'networkidle2' });
  const click = async text => {
    assert.ok(await page.evaluate(text => { const button = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && node.textContent.trim() === text); button?.click(); return !!button; }, text), `button: ${text}`);
  };
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `repeat layout ${width}`);
  }
  await click('지난 운동 그대로 시작');
  await page.waitForSelector('[data-workout-exercise]');
  let active = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')));
  assert.notEqual(active.id, 'source');
  assert.equal(active.exercises.length, 3);
  assert.ok(active.exercises.every(ex => ex.sets.length === 1 && !ex.sets[0].completed && !ex.sets[0].comment && !ex.sets[0].restSeconds));
  assert.equal(await page.evaluate(() => localStorage.getItem('iron_workout_sessions_v1')), sourceSnapshot);
  const continuedTiming = await page.evaluate(async () => {
    const initial = JSON.parse(localStorage.getItem('iron_active_session_v1')).durationSeconds;
    await new Promise(resolve => {
      const edit = setInterval(() => {
        const current = JSON.parse(localStorage.getItem('iron_active_session_v1'));
        current.exercises[0].sets[0].reps = current.exercises[0].sets[0].reps === 10 ? 11 : 10;
        localStorage.setItem('iron_active_session_v1', JSON.stringify(current));
        window.dispatchEvent(new CustomEvent('iron_active_session_change', { detail: current }));
      }, 100);
      setTimeout(() => { clearInterval(edit); resolve(); }, 2250);
    });
    return JSON.parse(localStorage.getItem('iron_active_session_v1')).durationSeconds - initial;
  });
  assert.ok(continuedTiming >= 2, 'frequent set edits must not reset the workout clock');
  const originalIds = active.exercises.map(ex => ex.id);
  await click('순서 변경');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(node => node.getAttribute('aria-label')?.startsWith('아래로 이동') && !node.disabled).click());
  await page.waitForFunction(first => JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises[0].id !== first, {}, originalIds[0]);
  active = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')));
  assert.deepEqual(active.exercises.map(ex => ex.id), [originalIds[1], originalIds[2], originalIds[0]]);
  await page.reload({ waitUntil: 'networkidle2' });
  assert.deepEqual(await page.$$eval('[data-workout-exercise]', nodes => nodes.map(node => node.dataset.workoutExercise)), [originalIds[1], originalIds[2], originalIds[0]]);
  // Complete a realistic snapshot, keeping pause-corrected elapsed time below wall time.
  await page.evaluate(() => {
    const active = JSON.parse(localStorage.getItem('iron_active_session_v1'));
    active.durationSeconds = 600; active.startTime = new Date(Date.now() - 3600_000).toISOString();
    active.exercises.forEach(ex => { ex.sets[0].completed = true; ex.sets[0].weight = 60; ex.sets[0].reps = 10; });
    localStorage.setItem('iron_active_session_v1', JSON.stringify(active));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const complete = await page.$('.md\\:hidden [role="button"]');
  assert.ok(complete, 'mobile hold-to-complete button');
  await complete.focus(); await page.keyboard.down('Space');
  await page.waitForSelector('[data-workout-complete]', { timeout: 6000 });
  await page.keyboard.up('Space');
  assert.equal(await page.evaluate(() => localStorage.getItem('iron_active_session_v1')), null);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('iron_workout_sessions_v1')));
  assert.equal(saved.length, 2);
  assert.ok(saved[0].durationSeconds < 700, 'paused time must not be added back on completion');
  const text = await page.$eval('[data-workout-complete]', node => node.textContent);
  assert.ok(text.includes('1,800 kg') && text.includes('+300 kg') && text.includes('최고 기록 경신'));
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async value => { window.copiedMarkdown = value; } } });
  });
  await click('오늘 기록 복사');
  await page.waitForFunction(() => window.copiedMarkdown?.includes('반복 운동'));
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw Error('denied'); }; document.execCommand = () => false; });
  await click('오늘 기록 복사');
  await page.waitForSelector('textarea[aria-label="복사할 기록"]');
  assert.ok(await page.$eval('textarea[aria-label="복사할 기록"]', node => node.value.includes('반복 운동')));
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `summary layout ${width}`);
  }
  for (const language of ['ko', 'en', 'ja', 'zh-CN', 'zh-TW', 'es', 'fr', 'de']) {
    const expected = await page.evaluate(async language => {
      const source = await (await fetch('/src/components/workout/WorkoutCompleteSummary.tsx')).text();
      const modulePath = source.match(/from ["']([^"']*i18n\/index\.ts[^"']*)["']/)?.[1] || '/src/i18n/index.ts';
      const i18n = await import(modulePath); i18n.setLanguage(language);
      return i18n.t('운동 완료 요약', language);
    }, language);
    await page.waitForFunction(expected => document.querySelector('#workout-summary-title')?.textContent === expected, {}, expected);
    await page.setViewport({ width: 320, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `translated summary ${language}`);
  }
  await page.evaluate(async () => { const source = await (await fetch('/src/components/workout/WorkoutCompleteSummary.tsx')).text(); const modulePath = source.match(/from ["']([^"']*i18n\/index\.ts[^"']*)["']/)?.[1] || '/src/i18n/index.ts'; (await import(modulePath)).setLanguage('ko'); });
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.screenshot({ path: join(tmpdir(), 'iron-flow-summary.png'), fullPage: true });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'dark summary');
  await page.screenshot({ path: join(tmpdir(), 'iron-flow-summary-dark.png'), fullPage: true });
  await click('기록 보기');
  await page.waitForFunction(() => document.querySelector('[data-bottom-navigation] [aria-current="page"]')?.textContent.includes('기록'));
  assert.deepEqual(errors, []);
  console.log('PASS repeat via real app, source preservation, grouped reorder and reload, paused duration, completion save/comparison/PR, clipboard success/failure, 320/390/768px layout, 8 languages, dark mode and history navigation');
} finally { await browser.close(); }

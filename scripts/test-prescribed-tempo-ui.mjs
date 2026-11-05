import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const defaultChrome = process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || defaultChrome, headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('iron_language', 'ko');
    localStorage.setItem('iron_active_session_v1', JSON.stringify({ id: 'tempo-session', title: 'Tempo regression', date: '2026-11-05', startTime: new Date().toISOString(), durationSeconds: 0, completed: false, exercises: [{ id: 'tempo-bench', exerciseId: 'bench-press', equipmentType: 'barbell', sets: [{ id: 'tempo-set', setNumber: 1, weight: 0, reps: 10, rpe: null, plannedTempo: { eccentric: 0, pause: 2, concentric: 0 }, completed: false, provenance: 'recorded', weightNeedsConfirmation: true }] }] }));
  });
  await page.reload({ waitUntil: 'networkidle0' });
  const click = async text => {
    assert.ok(await page.evaluate(text => {
      const button = [...document.querySelectorAll('button')].find(button => button.getClientRects().length && button.textContent.includes(text));
      button?.click();
      return Boolean(button);
    }, text), text);
  };
  const savedSet = () => page.evaluate(() => JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises[0].sets[0]);
  await page.waitForSelector('[data-workout-set="tempo-set"]');
  assert.ok(await page.$eval('button[aria-label="1세트 시작"]', node => node.disabled));
  await page.click('button[aria-label="1세트 상세 옵션"]');
  await click('계획 템포 0-2-0s');
  await page.waitForFunction(() => [...document.querySelectorAll('h3')].some(node => node.textContent === '계획 템포'));
  const phaseValues = () => page.$$eval('.grid.grid-cols-3 span.font-mono', nodes => nodes.map(node => node.textContent));
  assert.deepEqual(await phaseValues(), ['0초', '2초', '0초']);
  await page.evaluate(() => document.querySelector('.grid.grid-cols-3 button').click());
  assert.deepEqual(await phaseValues(), ['0초', '2초', '0초']);
  await click('템포 적용하기');
  assert.deepEqual((await savedSet()).plannedTempo, { eccentric: 0, pause: 2, concentric: 0 });
  assert.equal((await savedSet()).tempo, undefined);
  await click('계획 템포 0-2-0s');
  await click('네거티브 과부하');
  await click('취소');
  await click('계획 템포 0-2-0s');
  assert.deepEqual(await phaseValues(), ['0초', '2초', '0초'], 'cancelled draft does not survive modal reopen');
  await click('취소');
  const weight = await page.$('[data-workout-set="tempo-set"] input[aria-label="1세트 무게"]');
  await weight.click();
  await weight.type('25');
  assert.equal((await savedSet()).weightNeedsConfirmation, false);
  assert.equal(await page.$eval('button[aria-label="1세트 시작"]', node => node.disabled), false);
  await page.reload({ waitUntil: 'networkidle0' });
  assert.deepEqual((await savedSet()).plannedTempo, { eccentric: 0, pause: 2, concentric: 0 });
  assert.equal((await savedSet()).tempo, undefined);
  assert.equal((await savedSet()).weightNeedsConfirmation, false);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS planned tempo display, plan-only edits, zero duration, modal cancel/reopen, replacement weight gate, reload persistence, mobile width.');
} finally {
  await browser.close();
}


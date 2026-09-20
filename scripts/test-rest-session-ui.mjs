import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3011', { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('iron_language', 'ko');
    const now = new Date();
    const date = [now.getFullYear(), String(now.getMonth()+1).padStart(2,'0'), String(now.getDate()).padStart(2,'0')].join('-');
    localStorage.setItem('iron_active_session_v1', JSON.stringify({ id: 'rest-ui', title: 'Timer test', date, startTime: now.toISOString(), durationSeconds: 120, completed: false, weightUnit: 'kg', targetCategories: ['chest'], targetPartIds: ['chest'], exercises: [
      { id: 'first', exerciseId: 'bench-press', equipmentType: 'barbell', sets: [{id: 'set-first',setNumber: 1,weight: 20,reps: 10,completed:false}] },
      { id: 'second', exerciseId: 'bench-press', equipmentType: 'barbell', sets: [{id: 'set-second',setNumber: 1,weight: 20,reps: 10,completed:false}] },
    ] }));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  const clickText = async text => {
    assert.ok(await page.evaluate(text => {
      const button = [...document.querySelectorAll('button')].find(node => node.getClientRects().length && node.textContent.includes(text));
      button?.click(); return Boolean(button);
    }, text), `Button: ${text}`);
    await wait(80);
  };
  await page.click('header button[title*="화면 잠금"]');
  await page.waitForSelector('#touch-lock-title');
  assert.ok(await page.$('[inert]'));
  const hold = await page.$('[role="dialog"] [role="button"]');
  const box = await hold.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
  await page.mouse.down(); await wait(200); await page.mouse.up();
  assert.ok(await page.$('#touch-lock-title'), 'Short tap must keep screen locked');
  const paused = await page.$eval('header', node => node.textContent);
  await wait(1100);
  assert.equal(await page.$eval('header', node => node.textContent), paused, 'Workout time must remain paused');
  await hold.hover();
  await page.mouse.down(); await wait(1750); await page.mouse.up();
  await page.waitForSelector('#touch-lock-title', { hidden: true });
  assert.equal(await page.$('[inert]'), null);
  await page.click('#exercise-first button[aria-label="1세트 완료"]');
  await page.waitForFunction(() => document.body.textContent.includes('🎉 종목 완료! 다음 운동 준비'));
  await clickText('+60초 (기구 정리/이동)');
  assert.ok(await page.evaluate(() => document.body.textContent.includes('02:')));
  await page.screenshot({ path: '/tmp/iron-rest-transition.png' });
  await page.evaluate(async () => {
    const { soundManager } = await import('/src/utils/audio.ts');
    window.restCompletionCount = 0;
    soundManager.playTimerComplete = () => { window.restCompletionCount++; };
    window.originalDateNow = Date.now;
    Date.now = () => window.originalDateNow() + 180000;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await wait(800);
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  assert.equal(await page.evaluate(() => window.restCompletionCount), 1, 'Background catch-up must sound exactly once');
  assert.ok(await page.evaluate(() => document.body.textContent.includes('🎉 목표 휴식 완료')));
  await page.evaluate(() => { Date.now = window.originalDateNow; });
  await clickText('다음 종목:');
  assert.ok(await page.$('button[title="탭하여 크게 보기"]'));
  await page.click('button[title="타이머 닫기"]');
  await page.click('#exercise-first button[aria-label="1세트 완료"]');
  assert.equal(await page.$('button[title="타이머 닫기"]'), null, 'Unchecking a set must not trigger rest');
  assert.equal(await page.$('button[title="최소화"]'), null);
  await page.click('#exercise-second button[aria-label="1세트 완료"]');
  await clickText('+ 다음 운동 추가');
  await page.waitForSelector('[aria-label="운동 검색"]');
  assert.ok(await page.$('button[title="탭하여 크게 보기"]'));
  assert.deepEqual(errors, []);
  console.log('PASS: pause lock, short tap rejection, held unlock, final set mode, +60s, next exercise, uncheck guard, add exercise with minimized timer, background catch-up and single completion sound');
} finally { await browser.close(); }

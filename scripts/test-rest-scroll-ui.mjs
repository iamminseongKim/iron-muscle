import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5180', { waitUntil: 'networkidle2' });
  if (process.env.DESIGN_SCREENSHOT) await page.screenshot({ path: process.env.DESIGN_SCREENSHOT });
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    assert.ok(await page.$('[data-workout-target-grid] [aria-pressed="true"]'));
  }
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.click('header button[title="다크"]');
  await page.waitForFunction(() => document.documentElement.classList.contains('dark') && !document.documentElement.hasAttribute('data-theme-changing'));
  assert.equal(await page.evaluate(() => localStorage.getItem('iron_theme_dark')), 'true');
  await page.click('header button[title="라이트"]');
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark') && !document.documentElement.hasAttribute('data-theme-changing'));
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  assert.equal(await page.$eval('[data-workout-target-grid] button', node => getComputedStyle(node).transitionDuration), '0s');
  await page.emulateMediaFeatures([]);
  await page.evaluate(() => {
    localStorage.setItem('iron_language', 'ko');
    localStorage.setItem('iron_active_session_v1', JSON.stringify({
      id: 'rest-scroll-test', title: 'Scroll test', date: new Date().toISOString().slice(0, 10),
      startTime: new Date().toISOString(), durationSeconds: 120, completed: false, weightUnit: 'kg',
      exercises: Array.from({ length: 5 }, (_, i) => ({ id: `scroll-${i}`, exerciseId: 'bench-press', equipmentType: 'barbell',
        sets: [{ id: `set-${i}`, setNumber: 1, weight: 20, reps: 10, completed: false }] }))
    }));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  const originalY = await page.evaluate(() => { window.scrollTo(0, 240); return scrollY; });
  assert.ok(originalY > 0);
  await page.$eval('#exercise-scroll-0 button[aria-label="1세트 완료"]', button => button.click());
  await page.waitForSelector('[data-rest-timer-dialog]');
  assert.equal(await page.evaluate(() => document.body.style.top), `-${originalY}px`);
  const client = await page.target().createCDPSession();
  const swipe = async (x, from, to) => {
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from }] });
    for (let i = 1; i <= 8; i++) {
      await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * i / 8 }] });
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  await swipe(5, 500, 280);
  assert.equal(await page.evaluate(() => document.body.style.top), `-${originalY}px`, 'backdrop must keep background locked');
  const box = await page.$eval('[data-rest-timer-dialog]', node => { const r = node.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 25 }; });
  await swipe(box.x, box.y, box.y + 120);
  await page.waitForSelector('[data-rest-timer-capsule]');
  assert.equal(await page.evaluate(() => scrollY), originalY, 'minimize must restore exact scroll position');
  assert.equal(await page.evaluate(() => document.body.style.position), '');
  const capsule = await page.$eval('[data-rest-timer-capsule]', node => { const r = node.getBoundingClientRect(); return { x: r.x + 15, y: r.y + 15 }; });
  await swipe(capsule.x, capsule.y, capsule.y - 90);
  assert.equal(await page.evaluate(() => scrollY), originalY, 'capsule drag must not scroll background');
  await page.$eval('button[title="탭하여 크게 보기"]', node => node.click());
  // A drag deliberately suppresses its follow-up click. A new tap restores the timer.
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: capsule.x, y: capsule.y - 90 }] });
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.$eval('button[title="탭하여 크게 보기"]', node => node.click());
  await page.waitForSelector('[data-rest-timer-dialog]');
  await page.setViewport({ width: 390, height: 500, isMobile: true, hasTouch: true });
  const innerScroll = await page.$eval('[data-rest-timer-dialog]', node => { node.scrollTop = 80; return node.scrollTop; });
  assert.ok(innerScroll > 0, 'short screen must retain internal scrolling');
  const shortBox = await page.$eval('[data-rest-timer-dialog]', node => { const r = node.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + 100 }; });
  await swipe(shortBox.x, shortBox.y, shortBox.y + 90);
  assert.ok(await page.$('[data-rest-timer-dialog]'), 'scrolling content must not minimize timer');
  await page.$eval('button[title="닫기"]', node => node.click());
  await page.waitForSelector('[data-rest-timer-overlay]', { hidden: true });
  assert.equal(await page.evaluate(() => document.body.style.position), '');
  assert.equal(await page.evaluate(() => scrollY), originalY, 'close must restore scroll');
  assert.deepEqual(errors, []);
  console.log('PASS: responsive selection, background lock, real touch minimize, scroll restoration, capsule drag, short-screen inner scroll, close cleanup');
} finally { await browser.close(); }

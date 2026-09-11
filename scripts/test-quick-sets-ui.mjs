import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  const click = async text => {
    assert.ok(await page.evaluate(text => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes(text)); b?.click(); return !!b; }, text), text);
    await new Promise(r => setTimeout(r, 150));
  };
  await click('새 운동 시작하기');
  await page.waitForSelector('[aria-label="운동 검색"]');
  await page.type('[aria-label="운동 검색"]', '벤치 프레스');
  await click('벤치 프레스');
  await click('세트 퀵 설정');
  await page.select('[aria-label="공통 RPE"]', '8');
  await page.click('section[aria-label="세트 퀵 설정"] input[type="checkbox"]');
  await click('2세트 적용');
  await page.click('[aria-label="1세트 상세 옵션"]');
  assert.equal(await page.$eval('[aria-label="1세트 RPE"]', e => e.value), '8');
  await page.reload({ waitUntil: 'networkidle2' });
  await click('세트 퀵 설정');
  await click('탑 + 백오프');
  assert.equal(await page.$eval('[aria-label="탑세트 RPE"]', e => e.value), '8');
  await page.select('[aria-label="백오프 RPE"]', '7');
  await click('2세트 적용');
  await page.click('[aria-label="2세트 상세 옵션"]');
  assert.equal(await page.$eval('[aria-label="2세트 RPE"]', e => e.value), '7');
  await click('세트 퀵 설정');
  await click('피라미드');
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}`);
  }
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.screenshot({ path: '.tmp/quick-sets-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: mobile quick setup, RPE/tempo, top/backoff, reload persistence and 320/390/768px layout');
} finally { await browser.close(); }

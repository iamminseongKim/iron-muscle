import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });

  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.$('[data-workout-idle]'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `idle overflow at ${width}px`);
    assert.ok(await page.$eval('.glass-dock', node => getComputedStyle(node).backdropFilter.includes('blur')));
    assert.ok(await page.evaluate(() => getComputedStyle(document.querySelector('.iron-app-shell')).backgroundColor === 'rgb(255, 255, 255)'));
    assert.ok(await page.$eval('[data-workout-target-card]', node => getComputedStyle(node).backgroundColor === 'rgb(244, 243, 248)'));
    assert.ok(await page.evaluate(() => !document.querySelector('main').textContent.includes('루틴 레시피 · 복구함')));
    if (width === 390) await page.screenshot({ path: join(tmpdir(), 'iron-redesign-idle.png') });
  }

  await page.evaluate(() => {
    localStorage.setItem('iron_active_session_v1', JSON.stringify({
      id: 'redesign-check', title: '가슴 루틴', date: '2026-09-28',
      startTime: new Date().toISOString(), durationSeconds: 1200, completed: false,
      exercises: [{
        id: 'redesign-exercise', exerciseId: 'Machine_Bench_Press', equipmentType: 'machine',
        sets: [
          { id: 'redesign-set-1', setNumber: 1, weight: 40, reps: 12, completed: true },
          { id: 'redesign-set-2', setNumber: 2, weight: 50, reps: 10, completed: false },
        ],
      }],
    }));
  });
  await page.reload({ waitUntil: 'networkidle2' });
  for (const width of [320, 390, 768]) {
    await page.setViewport({ width, height: 844, isMobile: true, hasTouch: true });
    assert.ok(await page.$('#exercise-redesign-exercise'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `active overflow at ${width}px`);
    if (width === 390) await page.screenshot({ path: join(tmpdir(), 'iron-redesign-active.png') });
  }

  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.includes('운동 종목 추가하기'))?.click());
  await page.waitForSelector('#exercise-picker-title');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'picker overflow');
  await page.screenshot({ path: join(tmpdir(), 'iron-redesign-picker.png') });
  await page.keyboard.press('Escape');
  await page.waitForSelector('#exercise-picker-title', { hidden: true });
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === '다크')?.click());
  await page.waitForFunction(() => document.documentElement.classList.contains('dark') && getComputedStyle(document.querySelector('.iron-app-shell')).backgroundColor === 'rgb(18, 16, 25)');
  await page.screenshot({ path: join(tmpdir(), 'iron-redesign-active-dark.png') });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'dark mode overflow');
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent.trim() === '라이트')?.click());
  await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
  for (const [label, name] of [
    ['운동 탐색', 'explore'],
    ['기록 조회', 'history'],
    ['통계 & 성장', 'analytics'],
    ['MY', 'my'],
  ]) {
    await page.evaluate(label => [...document.querySelectorAll('[data-bottom-navigation] button')].find(button => button.textContent.includes(label))?.click(), label);
    await page.waitForFunction(label => [...document.querySelectorAll('[data-bottom-navigation] button')].some(button => button.textContent.includes(label) && button.getAttribute('aria-current') === 'page'), {}, label);
    await page.waitForFunction(() => !document.querySelector('main > [role="status"]'));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflow`);
    await page.screenshot({ path: join(tmpdir(), `iron-redesign-${name}.png`) });
  }
  await page.setViewport({ width: 320, height: 844, isMobile: true, hasTouch: true });
  for (const [language, label] of [
    ['en', 'English'], ['ja', '日本語'], ['zh-CN', '简体中文'], ['zh-TW', '繁體中文'],
    ['es', 'Español'], ['fr', 'Français'], ['de', 'Deutsch'], ['ko', '한국어'],
  ]) {
    await page.evaluate(label => [...document.querySelectorAll('main button')].find(button => button.textContent.includes(label))?.click(), label);
    await page.waitForFunction(language => document.documentElement.lang === language, {}, language);
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      elements: [...document.querySelectorAll('body *')]
        .filter(node => node.getBoundingClientRect().right > innerWidth + 1)
        .slice(0, 8)
        .map(node => ({ tag: node.tagName, text: node.textContent?.slice(0, 50), right: Math.round(node.getBoundingClientRect().right) })),
    }));
    assert.ok(overflow.scrollWidth <= overflow.width, `${language} overflow: ${JSON.stringify(overflow)}`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS redesigned idle/active/picker/dark views at 320/390/768px, all tabs and 8 languages; glass dock retained; no page errors');
} finally {
  await browser.close();
}

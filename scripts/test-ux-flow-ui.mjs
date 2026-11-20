import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import puppeteer from 'puppeteer-core';

const url = process.env.TEST_URL || 'http://127.0.0.1:3012';
await mkdir('output/ux-flow-tests', { recursive: true });
await build({ stdin: { contents: `
  import React from 'react';
  import {createRoot} from 'react-dom/client';
  import {BackupPanel} from './src/components/history/BackupPanel';
  import {RoutineLibrary} from './src/components/library/RoutineLibrary';
  import {AddExerciseModal} from './src/components/workout/AddExerciseModal';
  const panel = new URLSearchParams(location.search).get('panel');
  createRoot(document.getElementById('root')).render(panel === 'backup'
    ? <BackupPanel onRestored={()=>{}} /> : panel === 'routine'
    ? <RoutineLibrary /> : <AddExerciseModal isOpen={true} onClose={()=>{}} onSelect={()=>{}} />);
`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, format: 'esm', outfile: 'output/ux-flow-tests/harness.js', jsx: 'automatic' });
await writeFile('output/ux-flow-tests/harness.html', '<html lang="ko"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/index.css"></head><body><div id="root"></div><script type="module" src="./harness.js"></script></body></html>');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.setItem('iron_language', 'ko'));
  await page.reload({ waitUntil: 'networkidle2' });
  const setText = async (selector, value) => page.$eval(selector, (node, value) => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(node, value);
    node.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  const clickText = async (text, scope = 'body') => {
    await page.waitForFunction((text, scope) => [...document.querySelector(scope).querySelectorAll('button')].some(n => n.textContent.trim() === text), {}, text, scope);
    await page.$eval(scope, (node, text) => [...node.querySelectorAll('button')].find(n => n.textContent.trim() === text).click(), text);
  };
  await page.waitForSelector('[data-ai-routine-paste]');
  assert.equal(await page.$eval('[data-ai-routine-preview-button]', n => n.textContent.trim()), '루틴 확인');
  await page.click('[data-ai-routine-paste] > summary');
  await setText('[data-ai-routine-input]', 'x');
  await clickText('전체 삭제', '[data-ai-routine-paste]');
  assert.equal(await page.$eval('[data-ai-routine-paste]', n => n.open), true, 'clear keeps paste panel open');
  assert.equal(await page.$eval('[data-ai-routine-input]', n => n === document.activeElement), true, 'clear returns focus to input');
  await setText('[data-ai-routine-input]', 'x');
  await page.focus('[data-ai-routine-input]');
  await page.keyboard.press('Backspace');
  assert.equal(await page.$eval('[data-ai-routine-paste]', n => n.open), true, 'deleting last character keeps panel open');
  const raw = JSON.stringify({ title: 'UX flow', exercises: [{ name: 'Unknown UX movement', sets: 2, reps: 10 }] });
  await setText('[data-ai-routine-input]', raw);
  await page.click('[data-ai-routine-preview-button]');
  await page.waitForSelector('[data-ai-exercise-select]');
  await page.select('[data-ai-exercise-select]', 'bench-press');
  await page.click('[data-ai-routine-preview] button[aria-label="닫기"]');
  await page.click('[data-ai-routine-preview-button]');
  await page.waitForSelector('[data-ai-exercise-select]');
  assert.equal(await page.$eval('[data-ai-exercise-select]', n => n.value), 'bench-press', 'reopening preserves mapping');
  await page.click('[data-ai-routine-preview] button[aria-label="닫기"]');
  await clickText('MY', '[data-bottom-navigation]');
  await clickText('운동 기록', '[data-bottom-navigation]');
  assert.equal(await page.$eval('[data-ai-routine-input]', n => n.value), raw, 'tab switch preserves input');
  await page.click('[data-ai-routine-preview-button]');
  await page.waitForSelector('[data-ai-exercise-select]');
  assert.equal(await page.$eval('[data-ai-exercise-select]', n => n.value), 'bench-press', 'tab switch preserves reviewed mapping');
  await page.click('[data-ai-routine-preview] button[aria-label="닫기"]');
  await setText('[data-ai-routine-input]', JSON.stringify({ title: 'New input', exercises: [{ name: 'Another unknown motion', sets: 1, reps: 5 }] }));
  await page.click('[data-ai-routine-preview-button]');
  await page.waitForSelector('[data-ai-exercise-select]');
  assert.equal(await page.$eval('[data-ai-exercise-select]', n => n.value), '', 'changed input invalidates previous mapping');
  console.log('PASS AI clear, last-character deletion, focus, preview label, mapping retention, tab retention and input invalidation');

  await page.goto(`${url}/output/ux-flow-tests/harness.html?panel=backup`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('textarea');
  await page.$eval('details', n => { n.open = true; });
  const backup = JSON.stringify({ format: 'iron-muscle-backup', version: 1, exportedAt: new Date().toISOString(), sessions: [], customExercises: [], activeSession: null });
  const restoreVisible = () => page.$$eval('button', nodes => nodes.some(n => n.textContent.includes('기존 기록과 합치기')));
  await setText('textarea', backup);
  await clickText('일지 내용 확인');
  assert.equal(await restoreVisible(), true);
  await setText('textarea', '{broken');
  assert.equal(await restoreVisible(), false, 'editing invalidates old backup');
  await clickText('일지 내용 확인');
  assert.equal(await restoreVisible(), false, 'invalid backup never restores previous input');
  await setText('textarea', backup);
  await clickText('일지 내용 확인');
  const fileInput = await page.$('input[type=file]');
  await writeFile('output/ux-flow-tests/invalid.json', '{invalid');
  await fileInput.uploadFile(resolve('output/ux-flow-tests/invalid.json'));
  await page.waitForFunction(() => document.body.textContent.includes('올바른 마크다운'));
  assert.equal(await restoreVisible(), false, 'invalid file clears previous preview');
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    const file = new File(['delayed'], 'delayed.json');
    file.text = () => new Promise(resolve => { window.finishBackupRead = resolve; });
    transfer.items.add(file);
    const input = document.querySelector('input[type=file]');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await setText('textarea', 'newer input');
  await page.evaluate(backup => window.finishBackupRead(backup), backup);
  assert.equal(await page.$eval('textarea', n => n.value), 'newer input', 'late file read does not replace newer input');
  assert.equal(await restoreVisible(), false, 'late file read does not revive old preview');
  await setText('textarea', backup);
  await clickText('일지 내용 확인');
  await page.evaluate(() => {
    const transfer = new DataTransfer();
    const file = new File(['unreadable'], 'unreadable.json');
    file.text = () => Promise.reject(new Error('test file read failed'));
    transfer.items.add(file);
    const input = document.querySelector('input[type=file]');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => document.body.textContent.includes('test file read failed'));
  assert.equal(await restoreVisible(), false, 'failed file read invalidates old preview');
  console.log('PASS backup text edits, invalid text/file, file read failure and late read invalidate restore target');

  const routine = { format: 'iron-muscle-routine', version: 1, id: 'ux-saved', name: 'Saved UX routine', exercises: [{ exerciseId: 'bench-press', name: 'Bench press', equipment: 'barbell', mode: 'bilateral', sets: [{ reps: 10, rest: 90, side: 'both' }] }] };
  await page.evaluate(routine => localStorage.setItem('iron_routines_v1', JSON.stringify([routine])), routine);
  await page.goto(`${url}/output/ux-flow-tests/harness.html?panel=routine`, { waitUntil: 'networkidle2' });
  await clickText(routine.name);
  await page.waitForSelector('[data-testid="routine-preview"]');
  assert.equal(await page.$$eval('[data-testid="routine-preview"] button', nodes => nodes.find(n => n.textContent.trim() === '저장됨')?.disabled), true);
  await page.evaluate(() => [...document.querySelectorAll('[data-testid="routine-preview"] button')].find(n => n.textContent.trim() === '저장됨').click());
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iron_routines_v1')).length), 1, 'saved routine cannot be duplicated accidentally');
  await page.$eval('details', n => { n.open = true; });
  await setText('textarea[aria-label="루틴 링크 또는 JSON"]', JSON.stringify({ ...routine, id: 'ux-imported', name: 'Imported UX routine' }));
  await clickText('가져오기 미리보기');
  await clickText('내 루틴으로 저장', '[data-testid="routine-preview"]');
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('iron_routines_v1')).length), 2, 'new routine still saves');
  assert.equal(await page.$$eval('[data-testid="routine-preview"] button', nodes => nodes.find(n => n.textContent.trim() === '저장됨')?.disabled), true);
  console.log('PASS stored routine save is disabled and imported routine saves exactly once');

  await page.goto(`${url}/output/ux-flow-tests/harness.html?panel=filter`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#exercise-picker-filters');
  const gymButton = '#exercise-picker-filters button';
  await page.click(gymButton);
  assert.equal(await page.$eval(gymButton, n => n.className.includes('shadow-sm')), true);
  await clickText('필터 초기화');
  assert.equal(await page.$eval(gymButton, n => n.className.includes('shadow-sm')), false, 'reset also disables gym filter');
  assert.deepEqual(errors, []);
  await page.screenshot({ path: 'output/ux-flow-tests/filter-reset.png', fullPage: true });
  console.log('PASS reset includes gym filter; no browser runtime errors');
} finally {
  await browser.close();
}

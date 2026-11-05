import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import puppeteer from 'puppeteer-core';

const original = execFileSync('git', ['show', '86a8edd:src/components/workout/SetFeedbackModal.tsx'], { encoding: 'utf8' });
await mkdir('output/feedback-ux', { recursive: true });
await build({ stdin: { contents: `import React from 'react'; import { createRoot } from 'react-dom/client'; import { SetFeedbackModal } from './src/components/workout/SetFeedbackModal'; localStorage.setItem('iron_language','ko'); createRoot(document.getElementById('root')).render(React.createElement(SetFeedbackModal,{set:{id:'baseline',setNumber:1,weight:20,reps:15,completed:false,setType:'WARMUP',targetRpe:6,plannedTempo:{eccentric:2,pause:1,concentric:1},rpe:null,provenance:'recorded'},unit:'kg',onUpdate(){},onConfirm(){},onClose(){}}));`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, format: 'esm', outfile: 'output/feedback-ux/baseline.js', jsx: 'automatic', plugins: [{ name: 'original-feedback', setup(builder) { builder.onLoad({ filter: /SetFeedbackModal\.tsx$/ }, () => ({ contents: original, loader: 'tsx', resolveDir: resolve('src/components/workout') })); } }] });
await writeFile('output/feedback-ux/baseline.html', '<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/src/index.css"></head><body><div id="root"></div><script type="module" src="./baseline.js"></script></body></html>');
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto(`${process.env.TEST_URL || 'http://127.0.0.1:3020'}/output/feedback-ux/baseline.html`);
  await page.waitForSelector('input[aria-label="실제 RPE"]');
  assert.equal(await page.$eval('input[aria-label="실제 RPE"]', node => node.closest('details').open), false);
  assert.equal(await page.$$eval('[data-feedback-tempo] input[type=number]', nodes => nodes.length), 3);
  await page.screenshot({ path: 'output/feedback-ux/baseline.png', fullPage: true });
  console.log('REPRODUCED v3.44.0 warmup RPE collapsed and three keyboard tempo inputs.');
} finally { await browser.close(); }

import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
mkdirSync('.tmp', { recursive: true });
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','3015','--strictPort'], {stdio:'ignore'});
let browser;
try {
  for(let tries=0;tries<40;tries++) {
    try { if((await fetch('http://127.0.0.1:3015')).ok) break; } catch {}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
  const page=await browser.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:3015',{waitUntil:'networkidle2'});
  const click=async(text)=>{
    assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('.exercise-picker button')].find(b=>b.textContent.trim()===text);b?.click();return !!b;},text),text);
    await new Promise(r=>setTimeout(r,100));
  };
  await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes('새 운동 시작하기')).click());
  const input='[aria-label="운동 검색"]';
  await page.waitForSelector(input);
  assert.equal(await page.$eval(input,e=>e===document.activeElement),false);
  const firstName=()=>page.$eval('.exercise-picker-results button.group',e=>e.textContent);
  assert.ok((await firstName()).includes('바벨 벤치프레스'));
  assert.ok(!(await page.$eval('.exercise-picker-results',e=>e.textContent)).includes('길로틴'));
  const initialCount = (await page.$$('.exercise-picker-results button.group')).length;
  await page.click('.exercise-picker-results > button');
  assert.ok((await page.$$('.exercise-picker-results button.group')).length > initialCount);
  await page.click('.exercise-picker-results > button');
  assert.equal((await page.$$('.exercise-picker-results button.group')).length,initialCount);
  await page.screenshot({path:'.tmp/discovery-browse.png'});
  await page.type(input,'덤벨 RDL');
  assert.ok((await firstName()).includes('덤벨 루마니안 데드리프트'));
  await page.click('[aria-controls="exercise-picker-filters"]');
  await click('가슴');
  assert.equal(await page.$('.exercise-picker-results button.group'),null,'Explicit chest filter stays active');
  await click('전체 부위에서 찾기');
  assert.ok((await firstName()).includes('덤벨 루마니안 데드리프트'));
  await page.focus(input);
  await page.setViewport({width:390,height:440,isMobile:true,hasTouch:true});
  await page.evaluate(()=>document.documentElement.classList.add('dark'));
  await new Promise(r=>setTimeout(r,200));
  assert.ok(await page.$eval('.exercise-picker-results',e=>e.clientHeight>=180));
  await page.screenshot({path:'.tmp/discovery-search-dark.png'});
  await page.keyboard.press('Enter');
  assert.equal(await page.$eval(input,e=>e===document.activeElement),false);
  await page.click('.exercise-picker-results button.group');
  await page.waitForSelector('.exercise-picker',{hidden:true});
  assert.ok((await page.$eval('body',e=>e.textContent)).includes('덤벨 루마니안 데드리프트'));
  assert.deepEqual(errors,[]);
  console.log('PASS: curated first-open, no autofocus, new exercise search, explicit filter, global recovery, small dark viewport and exercise selection');
} finally { await browser?.close(); server.kill(); }

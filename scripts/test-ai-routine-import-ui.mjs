import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new', args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const url=process.env.TEST_URL || 'http://127.0.0.1:3000';
  await browser.defaultBrowserContext().overridePermissions(new URL(url).origin,['clipboard-read','clipboard-write']);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('iron_language','ko'); });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.waitForSelector('[data-ai-routine]');
  console.log('AI import panel ready');
  assert.equal(await page.$eval('[data-ai-routine-copy]',node=>node.textContent),'외부 AI용 질문 복사');
  assert.ok(await page.$eval('[data-ai-routine-copy]',node=>{const rect=node.getBoundingClientRect();return rect.top>=0 && rect.bottom<innerHeight-100;}),'copy button is visible above mobile navigation on first screen');
  assert.equal(await page.$eval('[data-ai-routine-paste]',node=>node.open),false,'paste starts collapsed while copy is visible');
  await page.focus('[data-ai-routine-copy]'); await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-ai-routine] [role="status"]')?.textContent.includes('복사했습니다'));
  const prompt=await page.evaluate(()=>navigator.clipboard.readText());
  console.log('Native browser clipboard write/read passed');
  await mkdir('output',{recursive:true});
  await page.screenshot({path:'output/ai-routine-external-first-screen.png',fullPage:true});
  for(const text of ['앱 밖','대화','운동 목적','원하는 부위','운동 경력과 난이도','이용 가능한 기구','확정한 뒤에만','최종 JSON','exerciseId를 만들지','1회 운동 루틴','bilateral과 side=both','명시적으로 요청한 경우에만','restSeconds','pin-loaded','tempo']) assert.ok(prompt.includes(text),`prompt ${text}`);
  assert.ok(!prompt.includes('"exerciseId":'),'prompt sample must not supply invented IDs');
  await page.$eval('[data-ai-routine-paste]', node => { node.open = true; });
  const paste = async raw => {
    await page.$eval('[data-ai-routine-input]', (field,value) => {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(field,value);
      field.dispatchEvent(new Event('input',{bubbles:true}));
    }, raw);
  };
  const check = async () => {
    await page.waitForFunction(()=>!document.querySelector('[data-ai-routine-preview-button]')?.disabled);
    await page.focus('[data-ai-routine-preview-button]'); await page.keyboard.press('Enter');
  };
  await paste(JSON.stringify({title:'Unresolved',exercises:[{name:'Missing unknown motion',sets:2,reps:10}]}));
  await check();
  await page.waitForSelector('[data-ai-routine-preview]');
  assert.equal(await page.$eval('[data-ai-routine-start]',button=>button.disabled),true);
  await page.select('[data-ai-exercise-select]','bench-press');
  assert.equal(await page.$eval('[data-ai-routine-start]',button=>button.disabled),false);
  await paste('{}');
  assert.equal(await page.$('[data-ai-routine-preview]'),null,'editing invalidates old preview');
  console.log('Unresolved selection and preview invalidation passed');
  const routine = {title:'AI metadata UI',notes:'Session note',exercises:[{exerciseId:'lat-pulldown',equipmentType:'machine',loadType:'pin-loaded',executionMode:'unilateral',notes:'Seat 4',sets:[{weight:30,reps:12,restSeconds:120,rpe:7.5,tempo:{eccentric:3,pause:1,concentric:1},comment:'Slow pull',side:'left'},{weight:30,reps:12,restSeconds:120,side:'right'}]}]};
  await paste(JSON.stringify(routine)); await check();
  await page.waitForSelector('[data-ai-routine-preview]');
  const preview = await page.$eval('[data-ai-routine-preview]',node=>node.textContent);
  for (const text of ['RPE 7.5','3-1-1','Seat 4','Slow pull','권장 휴식','2분','핀머신','편측']) assert.ok(preview.includes(text),text);
  console.log('Metadata preview passed');
  for (const language of ['ko','en','ja','zh-CN','zh-TW','es','fr','de','ko']) {
    await page.evaluate(language => localStorage.setItem('iron_language',language),language);
    await page.reload({waitUntil:'networkidle2'});
    await page.waitForSelector('[data-ai-routine]');
    await page.$eval('[data-ai-routine-paste]',node=>{node.open=true;});
    await paste(JSON.stringify(routine)); await check();
    try { await page.waitForSelector('[data-ai-routine-preview]',{timeout:5000}); } catch (error) { console.log(language,await page.$eval('[data-ai-routine]',node=>node.textContent)); throw error; }
    console.log(`Locale ${language} preview ready`);
    const label=await page.$eval('[data-ai-routine-start]',node=>node.textContent);
    if(language!=='ko') assert.notEqual(label,'이 루틴으로 운동 시작',`translated ${language}`);
    await page.setViewport({width:320,height:844,isMobile:true,hasTouch:true});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`mobile ${language}`);
  }
  await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
  await mkdir('output',{recursive:true});
  await page.screenshot({path:'output/ai-routine-import-preview.png',fullPage:true});
  for (const existing of [JSON.stringify({id:'keep-existing',exercises:[]}),'{corrupt-existing']) {
    await page.evaluate(raw=>localStorage.setItem('iron_active_session_v1',raw),existing);
    await page.click('[data-ai-routine-start]');
    assert.equal(await page.evaluate(()=>localStorage.getItem('iron_active_session_v1')),existing,'never overwrite existing raw data');
    assert.ok((await page.$eval('[data-ai-routine]',node=>node.textContent)).includes('먼저 진행 중인 운동'));
    await page.evaluate(()=>localStorage.removeItem('iron_active_session_v1'));
  }
  await page.evaluate(()=>{
    window.aiOriginalGetItem=Storage.prototype.getItem;
    Storage.prototype.getItem=function(key){ if(key==='iron_active_session_v1') throw new Error('temporary read failure'); return window.aiOriginalGetItem.call(this,key); };
  });
  await page.click('[data-ai-routine-start]');
  await page.evaluate(()=>{Storage.prototype.getItem=window.aiOriginalGetItem;delete window.aiOriginalGetItem;});
  assert.equal(await page.evaluate(()=>localStorage.getItem('iron_active_session_v1')),null,'read errors abort before writing');
  await page.click('[data-ai-routine-start]');
  await page.waitForSelector('button[aria-label="1세트 완료"]');
  const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')));
  assert.equal(saved.title,routine.title);
  assert.equal(saved.notes,routine.notes);
  assert.equal(saved.exercises[0].executionMode,'unilateral');
  assert.equal(saved.exercises[0].loadType,'pin-loaded');
  assert.equal(saved.exercises[0].notes,'Seat 4');
  assert.ok((await page.$eval('[data-exercise-notes]',node=>node.textContent)).includes('Seat 4'));
  assert.equal(saved.exercises[0].sets[0].rpe,7.5);
  assert.equal(saved.exercises[0].sets[0].tempo.eccentric,3);
  assert.equal(saved.exercises[0].sets[0].comment,'Slow pull');
  assert.equal(saved.exercises[0].sets[0].side,'left');
  assert.equal(saved.exercises[0].sets[1].side,'right');
  assert.equal(saved.exercises[0].sets[0].plannedRestSeconds,120);
  assert.equal(saved.exercises[0].sets[0].restSeconds,undefined);
  assert.equal(saved.exercises[0].machineBrand,undefined);
  assert.ok(saved.exercises[0].sets.every(set=>!set.completed));
  assert.equal(await page.$('[title="닫기"]'),null,'import does not open rest timer');
  await page.click('button[aria-label="1세트 완료"]');
  await page.waitForFunction(()=>document.body.textContent.includes('02:00') || document.body.textContent.includes('01:59'));
  const completed = await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')));
  assert.equal(completed.exercises[0].sets[0].completed,true);
  assert.equal(completed.exercises[0].sets[0].restSeconds,undefined,'timer has not yet recorded actual rest');
  await page.screenshot({path:'output/ai-routine-import-timer.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('AI routine UI passed preview, metadata, all 8 locales, mobile overflow, unresolved names, stale preview, existing/corrupt storage guards, read failures, persistence, and 120-second rest timer.');
  console.log('Screenshots: output/ai-routine-import-preview.png and output/ai-routine-import-timer.png');
} finally { await browser.close(); }

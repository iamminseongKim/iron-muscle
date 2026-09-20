import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:'new', args:['--no-sandbox'] });
const wait = ms => new Promise(r => setTimeout(r,ms));
try {
 const page = await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('iron_language','ko');}catch{}});
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 const url=process.env.TEST_URL||'http://127.0.0.1:3012/';
 await page.goto(url,{waitUntil:'networkidle2'});
 await page.waitForFunction(()=>navigator.serviceWorker.controller && document.body.textContent.includes('오프라인 준비 완료'));
 await page.evaluate(()=> {
  const now=new Date();const date=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
  localStorage.setItem('iron_workout_sessions_v1',JSON.stringify([{id:'history-ui',title:'PRIVATE session',date,startTime:now.toISOString(),durationSeconds:60,completed:true,notes:'PRIVATE note',bodyWeight:70,exercises:[{id:'old-ex',exerciseId:'bench-press',equipmentType:'barbell',sets:[{id:'old-set',setNumber:1,weight:60,reps:10,completed:true,comment:'PRIVATE comment'},{id:'old-set2',setNumber:2,weight:60,reps:8,completed:true}]}]}]));
 });
 const click = async text => {
  assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&b.textContent.trim()===text);b?.click();return !!b;},text),text);await wait(120);
 };
 await click('MY');await page.waitForSelector('#routine-title');
 await page.type('[aria-label="루틴 이름"]','공유 테스트');
 await page.select('#routine-title ~ label select','history-ui');
 await click('이 구성으로 루틴 저장');await page.waitForSelector('[data-testid="routine-preview"]');
 await click('공유 링크 만들기');
 const link=await page.$eval('[aria-label="공유 링크"]',e=>e.value);
 assert.ok(!Buffer.from(link.split('#routine=')[1],'base64').toString().includes('PRIVATE'));
 await page.setOfflineMode(true);await page.goto(link,{waitUntil:'networkidle2'});
 await page.waitForSelector('[data-testid="routine-preview"]');
 assert.ok(await page.evaluate(()=>document.body.textContent.includes('오프라인 · 이 기기에 기록 중')));
 await click('루틴 시작');await page.waitForSelector('button[title="운동 취소"]');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises[0].sets[0].weight),0);
 // Delete an exercise through the actual UI, then undo without losing the session.
 await page.evaluate(()=>document.querySelector('button[aria-label$=" 삭제"]').click());
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises.length),0);
 await click('삭제 취소');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises.length),1);
 await page.click('button[title="운동 취소"]');
 await page.waitForFunction(()=>localStorage.getItem('iron_active_session_v1')===null);
 await page.reload({waitUntil:'networkidle2'});await click('MY');
 await click('복원');
 assert.ok(await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1'))));
 await click('운동 기록');await page.waitForSelector('button[title="운동 취소"]');
 await page.reload({waitUntil:'networkidle2'});await page.waitForSelector('button[title="운동 취소"]');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_active_session_v1')).exercises[0].sets.length),2);
 for(const width of [320,390,768]) { await page.setViewport({width,height:844,isMobile:true,hasTouch:true}); await click('MY');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`); }
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.$eval('#routine-title',e=>e.scrollIntoView());await page.screenshot({path:'/tmp/iron-routine-offline.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS production SW cache, offline reload, private-field exclusion, shared link preview, routine start, exercise undo, cancelled session recovery after reload and responsive layout');
} finally { await browser.close(); }

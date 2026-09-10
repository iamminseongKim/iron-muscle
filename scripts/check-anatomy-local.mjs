import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
const page=await browser.newPage();await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('console',m.text());});
page.on('response',r=>{if(r.status()>=400) console.log(r.status(),r.url());});
await page.goto('http://127.0.0.1:3000');
const click=async text=>{const button=await page.evaluateHandle(text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)),text);await button.asElement().click();};
await click('운동 탐색');
await page.waitForSelector('[data-model="bodyparts3d-z-anatomy"]',{timeout:90000});
console.log('targets',await page.$eval('[data-model]',e=>e.dataset.targetCount));
await new Promise(r=>setTimeout(r,1200));await page.screenshot({path:'/tmp/anatomy-both.png'});
await click('전면·회전');await new Promise(r=>setTimeout(r,800));await page.screenshot({path:'/tmp/anatomy-front.png'});
await page.mouse.click(162,378);
await page.waitForFunction(()=>document.body.innerText.includes('선택된 근육:'),{timeout:10000});
console.log('selected',await page.$eval('[aria-label="통합 3D 근육 해부도"]',e=>e.innerText));
await click('필터 해제');
// Rotate by dragging: camera must change without triggering another selection.
const beforeDrag=await page.screenshot();
await page.mouse.move(195,320);await page.mouse.down();await page.mouse.move(285,340,{steps:12});await page.mouse.up();
await new Promise(r=>setTimeout(r,800));
assert.notDeepEqual(await page.screenshot(),beforeDrag);
await click('후면·회전');await new Promise(r=>setTimeout(r,800));await page.screenshot({path:'/tmp/anatomy-back.png'});
await page.$eval('[aria-label="인체 확대"]',e=>e.click());
await click('앞뒤 함께');
assert.equal(await page.$$eval('[aria-label="통합 3D 근육 해부도"] canvas',els=>els.length),1);
// Loading failure must have a visible retry path, then recover.
await page.setRequestInterception(true);
let failModels=true;
page.on('request',req=>{if(failModels && req.url().endsWith('.glb'))req.abort();else req.continue();});
await click('운동 기록');await click('운동 탐색');
await page.waitForFunction(()=>document.body.innerText.includes('3D 모델을 표시하지 못했어요'),{timeout:30000});
failModels=false;await click('다시 불러오기');
await page.waitForSelector('[data-model="bodyparts3d-z-anatomy"]',{timeout:90000});
assert.deepEqual(errors,[]);console.log('PASS: models load, front/back/both and no runtime errors');
} finally {await browser.close();}

import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox']});
try {
 const page=await browser.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
 const click=async(text)=>{assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));b?.click();return !!b;},text));await new Promise(r=>setTimeout(r,150));};
 await click('새 운동 시작하기');
 await page.type('[aria-label="운동 검색"]','바이킹');await click('바이킹 프레스');
 const selector='[aria-label="1세트 무게"]';
 await page.focus(selector);
 await page.evaluate(()=>{window.scrollBy(0,80);window.dispatchEvent(new Event('scroll'));document.querySelector('main').dispatchEvent(new Event('touchstart',{bubbles:true}));document.querySelector('main').dispatchEvent(new Event('touchend',{bubbles:true}));});
 await new Promise(r=>setTimeout(r,250));
 assert.equal(await page.$eval(selector,e=>document.activeElement===e && !e.disabled),true,'Scroll/touch must preserve active numeric input');
 await page.setViewport({width:390,height:440,isMobile:true,hasTouch:true});await new Promise(r=>setTimeout(r,250));
 assert.equal(await page.$eval(selector,e=>document.activeElement===e && !e.disabled),true,'Keyboard resize must preserve focus');
 await page.keyboard.type('42');assert.equal(await page.$eval(selector,e=>e.value),'42');
 await page.keyboard.press('Enter');
 await click('운동 종목 추가하기');
 await page.focus('[aria-label="운동 검색"]');
 // Session events rerender the parent while its search modal is open.
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('iron_active_session_change',{detail:JSON.parse(localStorage.getItem('iron_active_session_v1'))})));
 await new Promise(r=>setTimeout(r,300));
 assert.equal(await page.$eval('[aria-label="운동 검색"]',e=>document.activeElement===e),true,'Parent rerender must not restore focus outside modal');
 assert.ok(await page.$eval('[role="dialog"]',e=>e.getBoundingClientRect().bottom <= (visualViewport?.offsetTop || 0) + (visualViewport?.height || innerHeight) + 1));
 await page.click('[aria-label="운동 선택 닫기"]');
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await click('근육 보기');
 const loaded=await page.evaluate(()=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth>0);i.onerror=()=>resolve(false);i.src='/anatomy/muscle-atlas.png';}));
 assert.ok(loaded,'Packaged anatomy image must decode');
 // Simulate a WebView where WebGL creation is unavailable.
 await page.evaluate(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).includes('webgl')?null:original.call(this,type,...args);};});
 await click('3D 모델');
 assert.ok((await page.$eval('body',e=>e.textContent)).includes('3D 표시를 사용할 수 없어'));
 assert.ok(await page.$('[aria-label="전면·후면 근육 해부도"]'));
 assert.deepEqual(errors,[]);console.log('PASS: numeric focus through scroll/touch/resize, text entry, modal focus across rerenders, asset decoding, WebGL fallback');
}finally{await browser.close();}

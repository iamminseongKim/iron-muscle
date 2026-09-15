import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-sandbox']});
try {
 const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
 await page.evaluate(async()=>{const {setLanguage}=await import('/src/i18n/index.ts');setLanguage('ko');});
 await page.waitForSelector('[data-workout-start]');
 for(const [width,height] of [[320,568],[360,640],[390,844],[430,932],[844,390],[768,1024]]) {
  await page.setViewport({width,height,isMobile:true,hasTouch:true});
  for(const safe of [0,34]) {
   await page.evaluate(safe=>{document.querySelector('[data-bottom-navigation]').style.paddingBottom=safe+'px';document.querySelector('main').scrollTop=100000;},safe);
   await new Promise(r=>setTimeout(r,100));
   const bounds=await page.evaluate(()=>{const b=document.querySelector('[data-workout-start]').closest('button').getBoundingClientRect(),n=document.querySelector('[data-bottom-navigation]').getBoundingClientRect();return {buttonBottom:b.bottom,buttonTop:b.top,navTop:n.top,navBottom:n.bottom,scroll:document.documentElement.scrollWidth,width:innerWidth,height:innerHeight};});
   assert.ok(bounds.buttonBottom<=bounds.navTop && bounds.buttonTop>=0,JSON.stringify({width,height,safe,...bounds}));
   assert.ok(bounds.navBottom<=height && bounds.scroll<=width);
  }
 }
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.evaluate(()=>document.querySelector('main').scrollTop=100000);
 await page.screenshot({path:process.env.SCREENSHOT_PATH || '.layout-review.png'});
 await page.click('[data-workout-start]');
 await page.waitForSelector('#exercise-picker-title');
 await page.keyboard.press('Escape');
 await page.evaluate(async()=>{window.equipmentFixture=await import('/scripts/fixtures/equipment-review.tsx');window.equipmentFixture.setup();window.equipmentFixture.gym();});
 const click=async(text)=>{assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&b.textContent.includes(text));b?.click();return !!b;},text),text);};
 await page.waitForSelector('input[placeholder*="머신 이름 검색"]');
 await page.type('input[placeholder*="머신 이름 검색"]','머신 체스트 프레스');
 await click('2대');
 await page.waitForSelector('input[aria-label="머신 브랜드 직접 입력"]');
 await page.type('input[aria-label="머신 브랜드 직접 입력"]','내 브랜드');
 await click('저장하기');
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('iron_gym_equipment_profile_v1')));
 assert.equal(state.gyms[0].machines.Machine_Bench_Press[0].brand,'내 브랜드');
 assert.equal(state.gyms[0].machines.Machine_Bench_Press[0].weightUnit,'lbs');
 assert.equal(state.gyms[0].machines.Machine_Bench_Press[1].brand,'Other brand');
 await page.evaluate(()=>window.equipmentFixture.gym(1));
 await page.waitForSelector('input[placeholder*="머신 이름 검색"]');
 await page.type('input[placeholder*="머신 이름 검색"]','머신 체스트 프레스');await click('2대');
 await page.waitForSelector('input[aria-label="머신 브랜드 직접 입력"]');
 assert.equal(await page.$eval('input[aria-label="머신 브랜드 직접 입력"]',e=>e.value),'내 브랜드');
 await page.select('select','');await page.select('select','기타 (직접 입력)');
 await page.waitForSelector('input[aria-label="머신 브랜드 직접 입력"]');
 await page.type('input[aria-label="머신 브랜드 직접 입력"]','다른 이름');await click('저장하기');
 await page.evaluate(()=>window.equipmentFixture.picker());await page.waitForSelector('[aria-label="운동 검색"]');await click('스미스');
 const labels=await page.$$eval('button',bs=>bs.filter(b=>b.textContent.includes('Smith')&&b.getClientRects().length).map(b=>b.textContent));assert.ok(labels.length>0);
 assert.deepEqual(errors,[]);
 console.log('PASS: 6 viewports x 2 safe-area sizes; start button above menu; custom brand edit/save/reopen and second machine preserved; Smith picker');
} finally { await browser.close(); }

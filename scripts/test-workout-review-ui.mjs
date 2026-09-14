import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox']});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:3001',{waitUntil:'networkidle2'});
 await page.evaluate(async()=>{window.fixture=await import('/scripts/fixtures/workout-review.tsx');window.fixture.setup();window.fixture.picker(false);});
 const render=async(method,...args)=>{await page.evaluate((method,args)=>window.fixture[method](...args),method,args);await new Promise(r=>setTimeout(r,100));};
 const click=async text=>{assert.ok(await page.evaluate(text=>{const button=[...document.querySelectorAll('button')].find(b=>b.getClientRects().length&&b.textContent.includes(text));button?.click();return Boolean(button);},text),text);};
 for(let i=0;i<3;i++){await render('picker',true);await page.waitForSelector('[aria-label="운동 검색"]');await render('picker',false);}
 await render('picker',true);await page.type('[aria-label="운동 검색"]','체스트 프레스');
 await click('머신 체스트 프레스');await page.waitForSelector('#machine-picker-title');
 await page.keyboard.press('Escape');await page.waitForSelector('#machine-picker-title',{hidden:true});
 assert.ok(await page.$('#exercise-picker-title'));
 await click('머신 체스트 프레스');await page.waitForSelector('#machine-picker-title');
 await page.evaluate(()=>[...document.querySelectorAll('#machine-picker-title')][0].closest('[role="dialog"]').querySelectorAll('button')[2].click());
 const selected=await page.evaluate(()=>window.selectedMachine);assert.equal(selected[5],'lbs');assert.equal(selected[6],'gym-1:b');
 await render('machine');
 assert.equal(await page.$$eval('button[aria-pressed="true"]',nodes=>nodes.filter(n=>n.textContent.includes('호기')).length),1);
 await click('2호기');const updated=await page.evaluate(()=>window.updatedMachine);assert.equal(updated.weightUnit,'lbs');assert.equal(updated.sets[0].weight,44);assert.equal(updated.machineConfigId,'gym-1:b');assert.equal(updated.machineSetting,undefined);
 await render('machine',true);assert.ok(await page.$$eval('button',nodes=>nodes.filter(n=>n.textContent.includes('호기')).every(n=>n.disabled)));
 await render('share');await page.waitForSelector('img[alt*="운동 인증 카드"]');await click('문구 목록');
 assert.equal(await page.$$eval('#workout-quotes button',nodes=>nodes.length),31);
 await click('Light weight baby!');assert.equal(await page.$eval('input[aria-label="인증 문구"]',e=>e.value),'Light weight baby!');
 assert.ok(await page.$('a[href="https://ronniecoleman.net/pages/youtube-2"]'));
 await click('랜덤 선택');assert.notEqual(await page.$eval('input[aria-label="인증 문구"]',e=>e.value),'Light weight baby!');
 await click('Never give up.');await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('이미지 저장 / 공유')&&!b.disabled));
 for(const width of [320,390,768]) {await page.setViewport({width,height:844,isMobile:true,hasTouch:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);}
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await page.screenshot({path:'/tmp/iron-workout-review.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS picker reopen, nested Escape, same-brand identity, safe machine switching, 31 captions, random exclusion, source links and 320/390/768px layout');
} finally {await browser.close();}

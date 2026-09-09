import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage(), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
 const click=async(text)=>{assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));b?.click();return !!b;},text),text);await new Promise(r=>setTimeout(r,250));};
 await click('새 운동 시작하기');
 await page.type('[aria-label="운동 검색"]','바이킹 프레스');
 await click('바이킹 프레스');
 await click('근육 보기');
 await page.waitForSelector('[aria-label="전면·후면 근육 해부도"] image');
 await page.waitForFunction(() => {const image = new Image();image.src='/anatomy/muscle-atlas.png';return image.complete;});
 assert.ok(await page.$$eval('[data-muscle="deltoid_side"][data-active="primary"]',es=>es.length>0));
 const atlas=await page.$('[aria-label="전면·후면 근육 해부도"]');
 await atlas.evaluate(e=>e.scrollIntoView({block:'center'}));
 await page.evaluate(()=>document.querySelectorAll('.fixed,.sticky').forEach(e=>e.style.visibility='hidden'));
 await atlas.screenshot({path:'/tmp/iron-atlas.png'});
 await click('후면');
 assert.equal(await atlas.$eval('svg',e=>e.getAttribute('viewBox')),'561 0 561 1402');
 await click('전면');
 assert.equal(await atlas.$eval('svg',e=>e.getAttribute('viewBox')),'0 0 561 1402');
 for(const width of [320,390,768]) { await page.setViewport({width,height:844});await new Promise(r=>setTimeout(r,250));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)); }
 assert.deepEqual(errors,[]);
 console.log('PASS: atlas asset, exercise highlight regions, front/back controls, responsive layout');
} finally {await browser.close();}

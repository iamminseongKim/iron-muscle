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
 await click('근육 보기'); await click('3D 모델');
 await page.waitForSelector('[aria-label="회전 가능한 인체 근육 모델"] canvas');
 await new Promise(r=>setTimeout(r,1000));
 const viewer=await page.$('[aria-label="회전 가능한 인체 근육 모델"]');
 await viewer.evaluate(e=>e.parentElement.scrollIntoView({block:'center'}));
 await page.evaluate(()=>{ const header=document.querySelector('header'); if(header) header.style.visibility='hidden'; });
 const frame=await viewer.evaluateHandle(e=>e.parentElement);
 await frame.asElement().screenshot({path:'/tmp/iron-model-front.png'});
 const canvas=await page.$('canvas');
 await page.click('[title="360도 회전"]');
 await click('후면');
 assert.ok(await canvas.evaluate(e=>e.isConnected),'Rotation does not rebuild canvas');
 await frame.asElement().screenshot({path:'/tmp/iron-model-back.png'});
 await page.click('[title="확대"]'); await page.click('[title="축소"]');
 await page.evaluate(()=>{ const header=document.querySelector('header'); if(header) header.style.visibility='visible'; });
 await click('다크');
 await page.evaluate(()=>{ const header=document.querySelector('header'); if(header) header.style.visibility='hidden'; });
 await new Promise(r=>setTimeout(r,800));
 await frame.asElement().screenshot({path:'/tmp/iron-model-dark.png'});
 for(const width of [320,768]) { await page.setViewport({width,height:844}); await new Promise(r=>setTimeout(r,250)); const overflow=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).slice(0,8).map(e=>({tag:e.tagName,cls:e.className,right:e.getBoundingClientRect().right}))); assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),JSON.stringify(overflow)); }
 assert.deepEqual(errors,[]);
 console.log('PASS: 3D mount, persistent rotation canvas, front/back, zoom, theme and responsive layout');
} finally {await browser.close();}

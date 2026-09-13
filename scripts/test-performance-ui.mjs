import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();page.setDefaultTimeout(30000);const urls=[],errors=[];page.on('request',r=>urls.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173',{waitUntil:'networkidle2'});
 assert.ok(!urls.some(u=>u.includes('HumanMuscle3DViewer')||u.includes('.glb')),'3D must not load on home');
 await page.select('[aria-label="Language / 언어"]','en');
 await page.evaluate(()=>[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('Exercises')).click());
 await page.waitForSelector('[data-target-count]',{timeout:45000}).catch(async e=>{console.log(await page.evaluate(()=>document.body.innerText));throw e});
 assert.ok(urls.some(u=>u.includes('anatomy.glb')));assert.ok(urls.some(u=>u.includes('skeleton.glb')));
 assert.ok(await page.$eval('[data-target-count]',e=>Number(e.dataset.targetCount)>=17));
 assert.deepEqual(errors,[]);
 console.log('PASS production compressed models, 17 target groups, no initial 3D requests');
}finally{browser.process().kill('SIGTERM')}

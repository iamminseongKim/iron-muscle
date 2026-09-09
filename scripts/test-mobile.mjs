import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
const browser = await puppeteer.launch({executablePath:chrome,headless:'new',args:['--no-sandbox']});
try {
 const page=await browser.newPage(); const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
 const click=async(text)=>{
   assert.ok(await page.evaluate(text=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text));b?.click();return !!b;},text),text);
   await new Promise(r=>setTimeout(r,200));
 };
 await click('새 운동 시작하기'); await page.waitForSelector('[role="dialog"]');
 await click('가슴'); // Deliberately choose an unrelated category.
 await page.type('[aria-label="운동 검색"]','짐레코 바이킹');
 assert.ok((await page.$eval('[role="dialog"]',e=>e.textContent)).includes('바이킹 프레스'));
 await click('바이킹 프레스');
 await click('운동 종목 추가하기');
 await page.type('[aria-label="운동 검색"]','아스널 스탠딩 사레레');
 await click('스탠딩 레터럴 레이즈 머신');
 assert.equal(await page.$$eval('details[open]',es=>es.length),0);
 await page.$eval('summary',e=>e.click());
 await page.select('[aria-label="머신 브랜드"]','Gymleco (짐레코)');
 await page.$eval('summary',e=>e.click());
 await page.reload({waitUntil:'networkidle2'});
 const body=await page.$eval('body',e=>e.textContent);
 assert.ok(body.includes('바이킹 프레스') && body.includes('스탠딩 레터럴 레이즈 머신'));
 assert.ok(body.includes('Gymleco'));
 assert.ok(await page.$$eval('summary',es=>es.some(e=>e.textContent.includes('핀머신'))),'Standing lateral raise uses pin load');
 for(const width of [320,390,768]) {
   await page.setViewport({width,height:844,isMobile:true,hasTouch:true});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}`);
 }
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 const firstOptions = await page.$('[aria-label="1세트 상세 옵션"]');
 assert.equal(await firstOptions.evaluate(e=>e.getAttribute('aria-expanded')),'false');
 const rowHeight = await firstOptions.evaluate(e=>e.parentElement.parentElement.getBoundingClientRect().height);
 assert.ok(rowHeight <= 48, `Compact row height: ${rowHeight}`);
 await firstOptions.click();
 assert.equal(await firstOptions.evaluate(e=>e.getAttribute('aria-expanded')),'true');
 await page.select('[aria-label="1세트 RPE"]', '8');
 await firstOptions.click();
 await click('모두 접기');
 assert.equal(await page.$$eval('h3 button',es=>es.filter(e=>e.getAttribute('aria-expanded')==='true').length),0);
 await page.$eval('h3',e=>e.scrollIntoView({block:'start'}));
 await page.screenshot({path:'/tmp/iron-collapsed.png'});
 await page.$eval('h3 button',e=>e.click());
 assert.equal(await page.$$eval('h3 button',es=>es.filter(e=>e.getAttribute('aria-expanded')==='true').length),1);
 await click('모두 펼치기');
 assert.equal(await page.$$eval('h3 button',es=>es.filter(e=>e.getAttribute('aria-expanded')==='true').length),2);
 await page.click('[aria-label="1세트 상세 옵션"]');
 assert.equal(await page.$eval('[aria-label="1세트 RPE"]',e=>e.value),'8');
 await page.click('[aria-label="1세트 상세 옵션"]');
 console.log(`Compact set row: ${rowHeight}px; options and collapse retain edits`);
 await page.$eval('h3',e=>e.scrollIntoView({block:'start'}));
 await page.screenshot({path:'/tmp/iron-compact-light.png'});
 await click('다크');
 await new Promise(r=>setTimeout(r,400));
 await page.screenshot({path:'/tmp/iron-compact-dark.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: cross-category search, both requested machines, brand persistence, collapsed settings, 320/390/768px overflow and runtime checks');
} finally {await browser.close();}

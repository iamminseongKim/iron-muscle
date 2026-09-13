import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox']});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3001',{waitUntil:'networkidle2'});
 for(const [lang,title] of [['en',"Start today's workout"],['ja','今日のトレーニング'],['zh-CN','开始今日训练'],['zh-TW','開始今日訓練'],['es','Entrenar hoy'],['fr','Entraînement du jour'],['de','Heutiges Training'],['ko','오늘의 운동 시작하기']]){
  await page.select('[aria-label="Language / 언어"]',lang);await page.waitForFunction(title=>document.body.innerText.includes(title),{},title);
  assert.equal(await page.evaluate(()=>document.documentElement.lang),lang);
 }
 await page.select('[aria-label="Language / 언어"]','en');await page.reload({waitUntil:'networkidle2'});assert.equal(await page.$eval('select',s=>s.value),'en');
 
 for(const width of [320,390,768]){await page.setViewport({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);console.log('PASS 8 languages, persistence, document lang, mobile overflow');
}finally{await browser.close()}

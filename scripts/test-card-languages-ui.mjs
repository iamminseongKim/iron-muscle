import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:'new',args:['--no-sandbox']});
try {
 const page=await browser.newPage();await page.goto(process.env.TEST_URL||'http://127.0.0.1:3001',{waitUntil:'networkidle2'});
 const results=await page.evaluate(async()=>{
  const {setLanguage,t}=await import('/src/i18n/index.ts');const {summarizeWorkoutDay,renderWorkoutCard,recommendWorkoutQuote,WORKOUT_QUOTE_CATALOG}=await import('/src/utils/workoutCard.ts');
  await document.fonts.ready;const anatomy=new Image();anatomy.src='/anatomy/muscle-atlas.png';await anatomy.decode();
  const sessions=[{id:'x',date:'2026-09-13',title:'USER TITLE',durationSeconds:3600,exercises:[{exerciseId:'bench-press',equipmentType:'barbell',groupId:'g',groupType:'compound',sets:[{weight:60,reps:10,completed:true}]}]}];
  const original=CanvasRenderingContext2D.prototype.fillText;let drawn=[];
  CanvasRenderingContext2D.prototype.fillText=function(value,x,y,...args){drawn.push({value,width:this.measureText(value).width,x,y,canvasWidth:this.canvas.width});return original.call(this,value,x,y,...args)};
  const results=[];
  try {for(const language of ['ko','en','ja','zh-CN','zh-TW','es','fr','de']){
   setLanguage(language);drawn=[];const summary=summarizeWorkoutDay(sessions,'2026-09-13');
   const quote=recommendWorkoutQuote();const next=recommendWorkoutQuote(quote);
   if(next===quote)throw new Error('Duplicate suggested quote');
   for (const entry of WORKOUT_QUOTE_CATALOG) {
    const caption = t(entry.text);
    if(caption.length > 60) throw new Error(`${language}: caption exceeds input limit`);
    drawn=[];
    renderWorkoutCard(summary,{light:true,title:caption,author:entry.author?t(entry.author):undefined,anatomy,textColor:'auto',overlay:0.45});
    if(drawn.some(text=>text.x+text.width>text.canvasWidth-30)) throw new Error(`${language}: quote text overflow`);
    if(language!=='ko'&&drawn.some(text=>/[가-힣]/.test(text.value)))throw new Error(`${language}: untranslated quote ${entry.text}: ${drawn.filter(text=>/[가-힣]/.test(text.value)).map(text=>text.value).join(" | ")}`);
    if(entry.author&&!drawn.map(text=>text.value).join('').includes(t(entry.author)))throw new Error(`${language}: missing attribution`);
   }
   drawn=[];
   const png=renderWorkoutCard(summary,{light:true,title:quote,anatomy,textColor:'auto',overlay:0.45});
   results.push({language,png,texts:drawn,expected:t('주동근')});
  }
  setLanguage('ko');drawn=[];
  const names=['원레그 머신 레그 익스텐션','시티드 레그 컬','루마니안 데드리프트','원레그 핵프레스','V-스쿼트 (V-Squat)','덤벨 풀오버','바벨 벤치프레스 (미디엄 그립)','케이블 크로스오버','딥스 (체스트 가슴 버전)','머신 인클라인 프레스','케이블 크로스오버 리어 델트 플라이','스미스 머신 숄더 프레스','스미스머신 비하인드 넥 프레스','원암 케이블 레터럴 레이즈','인클라인 EZ바 트라이셉스 익스텐션'];
  const longSummary=summarizeWorkoutDay([{date:'2026-09-13',durationSeconds:7920,exercises:names.map((name,i)=>({exerciseId:`custom-${i}`,exerciseName:name,sets:[{completed:true,weight:20,reps:10}]}))}],'2026-09-13');
  const densePng=renderWorkoutCard(longSummary,{light:true,title:'완벽하지 않아도, 꾸준하게.',anatomy,textColor:'auto',overlay:0.45});
  const denseImage=new Image();denseImage.src=densePng;await denseImage.decode();
  return {results,dense:{png:densePng,height:denseImage.naturalHeight,texts:drawn,names}};
  }finally{CanvasRenderingContext2D.prototype.fillText=original;}
 });
 for(const result of results.results){
  assert.ok(result.png.startsWith('data:image/png;base64,'));
  assert.ok(result.texts.some(text=>text.value.includes(result.expected)));
  if(result.language!=='ko')assert.ok(result.texts.every(text=>!/[가-힣]/.test(text.value)),result.language);
  assert.ok(result.texts.every(text=>text.x+text.width<=text.canvasWidth-30),`${result.language} text overflow`);
  if(process.env.SCREENSHOT_DIR){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});fs.writeFileSync(`${process.env.SCREENSHOT_DIR}/card-${result.language}.png`,Buffer.from(result.png.split(',')[1],'base64'));}
 }
 assert.ok(results.dense.height<=2200,`15-exercise card too tall: ${results.dense.height}`);
 for(const name of results.dense.names)assert.ok(results.dense.texts.some(text=>text.value===name),`missing exercise: ${name}`);
 assert.ok(results.dense.texts.every(text=>text.x+text.width<=text.canvasWidth-30),'dense card text overflow');
 if(process.env.SCREENSHOT_DIR)fs.writeFileSync(`${process.env.SCREENSHOT_DIR}/card-dense-ko.png`,Buffer.from(results.dense.png.split(',')[1],'base64'));
 console.log('PASS all 31 captions and athlete attribution in 8 languages; PNG output, translated legends/groups, distinct captions and text bounds');
 console.log(`PASS 15-exercise compact card: ${results.dense.height}px high with all exercise names visible`);
}finally{await browser.close()}

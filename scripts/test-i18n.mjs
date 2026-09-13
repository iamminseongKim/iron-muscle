import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
const data=JSON.parse(fs.readFileSync('src/i18n/messages.json','utf8'));
for(const [key,values] of Object.entries(data)){assert.equal(values.length,8,key);assert.ok(values.every(v=>typeof v==='string'&&v.trim()),key);assert.equal(values[0],key);}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};globalThis.document={documentElement:{lang:'ko'}};
const bundle=await build({entryPoints:['src/i18n/index.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {detectLanguage,setLanguage,t,getLanguage,displayExercise,displayMuscle,displayExerciseDescription,displayExerciseInstructions}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
assert.equal(detectLanguage('zh-Hant-TW'),'zh-TW');assert.equal(detectLanguage('zh-Hans-CN'),'zh-CN');assert.equal(detectLanguage('es-MX'),'es');assert.equal(detectLanguage('xx'),'en');
for(const lang of ['ko','en','ja','zh-CN','zh-TW','es','fr','de']){setLanguage(lang);assert.equal(getLanguage(),lang);assert.equal(storage.get('iron_language'),lang);assert.equal(document.documentElement.lang,lang);assert.ok(t('운동 기록'));}
assert.equal(displayExercise({name:'사용자 이름'}),'사용자 이름');assert.equal(t('custom note'),'custom note');

// Test muscle localization
setLanguage('ko');
assert.equal(displayMuscle('triceps'), '상완삼두근');
assert.equal(displayMuscle('chest'), '대흉근');

setLanguage('ja');
assert.equal(displayMuscle('triceps'), '上腕三頭筋');
assert.equal(displayMuscle('chest'), '大胸筋');
assert.ok(!/[가-힣]/.test(displayMuscle('triceps')));

setLanguage('en');
assert.equal(displayMuscle('triceps'), 'Triceps Brachii');
assert.equal(displayMuscle('chest'), 'Pectoralis Major');
assert.ok(!/[가-힣]/.test(displayMuscle('triceps')));

setLanguage('zh-CN');
assert.equal(displayMuscle('triceps'), '肱三头肌');
assert.ok(!/[가-힣]/.test(displayMuscle('triceps')));

setLanguage('de');
assert.equal(displayMuscle('triceps'), 'Trizeps');
assert.ok(!/[가-힣]/.test(displayMuscle('triceps')));

// Test exercise description & instructions localization
const testEx = {
  name: '인클라인 트라이셉스 익스텐션',
  nameEn: 'Incline EZ-Bar Triceps Extension',
  description: '이지바를 이용한 인클라인 삼두 운동입니다.',
  descriptionEn: 'An incline variation of the EZ-bar skull crusher targeting the long head of the triceps.',
  instructions: ['벤치에 눕습니다.', '바를 내립니다.'],
  instructionsEn: ['Lie back on an incline bench.', 'Lower the bar under control.']
};

setLanguage('ko');
assert.equal(displayExerciseDescription(testEx), '이지바를 이용한 인클라인 삼두 운동입니다.');
assert.deepEqual(displayExerciseInstructions(testEx), ['벤치에 눕습니다.', '바를 내립니다.']);

setLanguage('ja');
assert.equal(displayExerciseDescription(testEx), 'An incline variation of the EZ-bar skull crusher targeting the long head of the triceps.');
assert.deepEqual(displayExerciseInstructions(testEx), ['Lie back on an incline bench.', 'Lower the bar under control.']);

setLanguage('en');
assert.equal(displayExerciseDescription(testEx), 'An incline variation of the EZ-bar skull crusher targeting the long head of the triceps.');
assert.deepEqual(displayExerciseInstructions(testEx), ['Lie back on an incline bench.', 'Lower the bar under control.']);

// Test exercise without descriptionEn in English mode (fallback to clean English without Korean leakage)
const noEnEx = {
  name: '운동 A',
  nameEn: 'Exercise A',
  description: '운동 A는 대흉근을 발달시키는 운동입니다.'
};
assert.ok(!/[가-힣]/.test(displayExerciseDescription(noEnEx)));
assert.ok(displayExerciseDescription(noEnEx).includes('Exercise A'));

console.log(`PASS ${Object.keys(data).length} labels in 8 languages, muscle localization, English fallback guides, persistence and custom text preservation`);


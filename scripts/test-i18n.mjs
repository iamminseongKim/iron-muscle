import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
const data=JSON.parse(fs.readFileSync('src/i18n/messages.json','utf8'));
for(const [key,values] of Object.entries(data)){assert.equal(values.length,8,key);assert.ok(values.every(v=>typeof v==='string'&&v.trim()),key);assert.equal(values[0],key);}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};globalThis.document={documentElement:{lang:'ko'}};
const bundle=await build({entryPoints:['src/i18n/index.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {detectLanguage,setLanguage,t,getLanguage,displayExercise}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
assert.equal(detectLanguage('zh-Hant-TW'),'zh-TW');assert.equal(detectLanguage('zh-Hans-CN'),'zh-CN');assert.equal(detectLanguage('es-MX'),'es');assert.equal(detectLanguage('xx'),'en');
for(const lang of ['ko','en','ja','zh-CN','zh-TW','es','fr','de']){setLanguage(lang);assert.equal(getLanguage(),lang);assert.equal(storage.get('iron_language'),lang);assert.equal(document.documentElement.lang,lang);assert.ok(t('운동 기록'));}
assert.equal(displayExercise({name:'사용자 이름'}),'사용자 이름');assert.equal(t('custom note'),'custom note');
console.log(`PASS ${Object.keys(data).length} labels in 8 languages, region detection, persistence and custom text preservation`);

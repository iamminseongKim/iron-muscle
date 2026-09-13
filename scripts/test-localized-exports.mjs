import assert from 'node:assert/strict';
import fs from 'node:fs';
import { build } from 'esbuild';
const bundle=await build({entryPoints:['src/utils/aiPromptGenerator.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {generateAiCoachingMarkdown}=await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const fixture=[{id:'one',date:'2026-09-13',title:'My session',durationSeconds:3600,notes:'KEEP | USER\nTEXT',exercises:[{exerciseId:'bench-press',equipmentType:'dumbbell',weightUnit:'lbs',groupId:'g',groupType:'superset',sets:[{setNumber:1,weight:22.5,reps:12,completed:true,rpe:8,side:'left',restSeconds:90,tempo:{eccentric:3,pause:1,concentric:1},tags:['웜업'],comment:'CUSTOM COMMENT'},{setNumber:2,weight:0,reps:15,completed:false}]}]}];
const before=JSON.stringify(fixture);
for(const language of ['en','ja','zh-CN','zh-TW','es','fr','de'])for(const scope of ['day','week','month','custom','all'])for(const selectedBodyPart of ['all','chest','back','legs','shoulders','biceps','triceps','arms','core']){
 const md=generateAiCoachingMarkdown(fixture,{language,scope,selectedBodyPart,selectedDate:'2026-09-13'});
 assert.ok(!/[가-힣]/.test(md),`${language}/${scope}/${selectedBodyPart} contains untranslated generated text`);
 assert.ok(md.includes('22.5 lbs'));assert.ok(md.includes('CUSTOM COMMENT'));assert.ok(md.includes('KEEP \\| USER<br>TEXT'));
 assert.ok(md.includes('1. ')&&md.includes('4. '));
 assert.ok(!/[가-힣]/.test(generateAiCoachingMarkdown([],{language,scope,selectedBodyPart,selectedDate:'2026-09-13'})));
}
assert.equal(JSON.stringify(fixture),before);
const messages=JSON.parse(fs.readFileSync('src/i18n/exportMessages.json','utf8'));
for(const language of Object.keys(messages))assert.deepEqual(Object.keys(messages[language]),Object.keys(messages.en));
console.log('PASS 315 localized MD combinations, empty states, units, translated built-in tags, user notes and record preservation');

import assert from 'node:assert/strict';
import {build} from 'esbuild';
const result = await build({entryPoints:['src/utils/storage.ts','src/utils/exerciseResolver.ts','src/utils/backup.ts'],outdir:'out',bundle:true,write:false,platform:'node',format:'esm'});
const [storage,resolver,backup] = await Promise.all(result.outputFiles.map(f=>import(`data:text/javascript;base64,${Buffer.from(f.text).toString('base64')}`)));
const memory = new Map();
globalThis.localStorage = {getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
globalThis.window = {dispatchEvent:()=>{}};
globalThis.CustomEvent = class {};
const custom={id:'custom_regression_ex',name:'암컬 머신',nameEn:'Arm Curl',category:'arms',categories:['arms'],equipment:'machine',loadType:'pin-loaded',primaryMuscles:['biceps'],secondaryMuscles:[],description:'사용자 종목',instructions:[],tips:[]};
assert.equal(storage.saveCustomExercise(custom),true);
const item={id:'item-1',exerciseId:custom.id,equipmentType:'machine',loadType:'pin-loaded',weightUnit:'lbs',machineBrand:'Cybex',sets:[{id:'set-1',setNumber:1,weight:50,reps:15,completed:true}]};
const session={id:'custom-session',title:'등 & 이두',date:'2026-09-10',startTime:'2026-09-10T00:00:00Z',durationSeconds:60,completed:true,exercises:[item]};
// Existing records created before name snapshots must resolve from the custom catalog.
localStorage.setItem('iron_workout_sessions_v1',JSON.stringify([session]));
assert.equal(resolver.resolveRecordedExercise(item).name,'암컬 머신');
const loaded=storage.loadSavedSessions();
assert.equal(loaded[0].exercises[0].exerciseName,'암컬 머신');
assert.deepEqual(loaded[0].exercises[0].sets,item.sets);
assert.equal(loaded[0].exercises[0].weightUnit,'lbs');
assert.equal(loaded[0].exercises[0].machineBrand,'Cybex');
storage.saveSessions(loaded);
storage.saveActiveSession(session);
assert.equal(storage.loadActiveSession().exercises[0].exerciseName,'암컬 머신');
const exported=backup.createBackup();
assert.equal(backup.parseBackup(JSON.stringify(exported)).sessions[0].exercises[0].exerciseName,'암컬 머신');
const invalid=structuredClone(exported); invalid.sessions[0].exercises[0].exerciseName=123;
assert.throws(()=>backup.parseBackup(JSON.stringify(invalid)));
localStorage.removeItem('iron_custom_exercises_v1');
assert.equal(resolver.resolveRecordedExercise(storage.loadSavedSessions()[0].exercises[0]).name,'암컬 머신');
assert.equal(resolver.resolveRecordedExercise(item).id,custom.id,'Missing old metadata must not be guessed as another catalog exercise');
const setItem=localStorage.setItem, log=console.error;
try {
 localStorage.setItem=()=>{throw new Error('Quota exceeded');}; console.error=()=>{};
 assert.equal(storage.saveCustomExercise(custom),false,'UI must be able to reject a failed custom save');
} finally {localStorage.setItem=setItem;console.error=log;}
console.log('PASS: legacy custom names, saved name snapshots, reload, lbs/brand/set preservation, backup validation and failed custom save');

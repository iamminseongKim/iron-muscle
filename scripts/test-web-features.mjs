import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { build } from 'esbuild';
const bundle = async file => {
 const result = await build({entryPoints:[file],bundle:true,write:false,format:'esm',platform:'node'});
 return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
};
globalThis.crypto ??= webcrypto;
const data = new Map();
globalThis.localStorage = {getItem: k => data.get(k) ?? null,setItem:(k,v) => data.set(k,v),removeItem:k => data.delete(k)};
globalThis.window = { dispatchEvent: () => {} };
globalThis.CustomEvent = class {};
const recovery = await bundle('src/utils/recovery.ts');
const routines = await bundle('src/utils/routines.ts');
const session = {id:'s',title:'Private title',date:'2026-09-20',startTime:'2026-09-20T08:00:00Z',durationSeconds:60,completed:false,notes:'PRIVATE',bodyWeight:75,
 exercises:[{id:'e',exerciseId:'custom-example',exerciseName:'Custom curl',equipmentType:'machine',machineBrand:'PRIVATE',machineConfigId:'gym-id',notes:'PRIVATE',sets:[{id:'a',setNumber:1,weight:40,reps:10,completed:true,restSeconds:120,comment:'PRIVATE'},{id:'b',setNumber:2,weight:45,reps:8,completed:false}]}]};
const active = 'iron_active_session_v1';
localStorage.setItem(active, JSON.stringify(session));
const recipe = routines.recipeFromSession(session, 'Recipe', 90);
assert.equal(recipe.exercises[0].name,'Custom curl');
assert.ok(!JSON.stringify(recipe).includes('PRIVATE'));
assert.ok(!JSON.stringify(recipe).includes('weight'));
assert.equal(recipe.exercises[0].sets[0].rest,90,'Actual rest must not leak into planned rest');
const started = routines.sessionFromRoutine(recipe);
assert.notEqual(started.id,session.id);assert.equal(started.exercises[0].sets[0].weight,0);assert.equal(started.exercises[0].sets[0].completed,false);
assert.equal(started.exercises[0].sets[0].plannedRestSeconds,90);
assert.equal(started.exercises[0].exerciseId,'custom-example');
assert.throws(()=>routines.parseRoutine('{"format":"wrong"}'));
assert.throws(()=>routines.parseRoutine(JSON.stringify({...recipe,exercises:[{...recipe.exercises[0],sets:[{reps:-1,rest:90,side:'both'}]}]})));
const extra = routines.parseRoutine(JSON.stringify({...recipe,notes:'PRIVATE',exercises:recipe.exercises.map(e=>({...e,machineBrand:'PRIVATE'}))}));
assert.ok(!JSON.stringify(extra).includes('PRIVATE'));
routines.saveRoutine(recipe); assert.equal(routines.loadRoutines().length,1);
const backup = await bundle('src/utils/backup.ts');
assert.equal(backup.createBackup().routines.length,1);
const removed = structuredClone(session); removed.exercises[0].sets.shift();
recovery.saveWithRecovery(removed,'active');
const item = recovery.loadRecovery()[0]; assert.equal(item.kind,'set');
// Later edits must survive restoration.
const later = JSON.parse(localStorage.getItem(active));later.exercises[0].sets[0].weight=99;localStorage.setItem(active,JSON.stringify(later));
recovery.restoreRecovery(item.id);
const restored=JSON.parse(localStorage.getItem(active));
assert.equal(restored.exercises[0].sets.length,2);assert.equal(restored.exercises[0].sets[1].weight,99);
recovery.restoreRecovery(item.id);assert.equal(JSON.parse(localStorage.getItem(active)).exercises[0].sets.length,2);
recovery.removeSession('s','active');assert.equal(localStorage.getItem(active),null);
const deleted = recovery.loadRecovery()[0];localStorage.setItem(active,JSON.stringify({...session,id:'other'}));
assert.throws(()=>recovery.restoreRecovery(deleted.id));assert.equal(JSON.parse(localStorage.getItem(active)).id,'other');
localStorage.removeItem(active);recovery.restoreRecovery(deleted.id);assert.equal(JSON.parse(localStorage.getItem(active)).id,'s');
// A write failure after archiving must restore both source and recovery list.
const before = new Map(data); const original = localStorage.setItem;let writes=0;
localStorage.setItem=(k,v)=>{if(++writes===2)throw new Error('Quota');original(k,v);};
assert.throws(()=>recovery.saveWithRecovery({...session,exercises:[]},'active'));
assert.deepEqual(data,before);localStorage.setItem=original;
// Expired entries are unavailable, and a deleted set can be restored after workout completion.
recovery.saveWithRecovery(removed,'active');const late=recovery.loadRecovery()[0];
localStorage.setItem('iron_workout_sessions_v1',JSON.stringify([{...removed,completed:true}]));localStorage.removeItem(active);
recovery.restoreRecovery(late.id);assert.equal(JSON.parse(localStorage.getItem('iron_workout_sessions_v1'))[0].exercises[0].sets.length,2);
assert.equal(localStorage.getItem(active),null);
localStorage.setItem('iron_recovery_v1',JSON.stringify([{...late,deletedAt:Date.now()-recovery.RETENTION_MS-1}]));assert.equal(recovery.loadRecovery().length,0);
console.log('PASS recipe privacy, validation, backup, fresh IDs, planned rest; targeted recovery, conflict protection, expiry, post-completion restore and quota rollback');

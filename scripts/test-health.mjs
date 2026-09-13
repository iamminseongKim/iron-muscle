import assert from 'node:assert/strict';
import { build } from 'esbuild';
const data = new Map();
globalThis.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v), removeItem: k => data.delete(k) };
let writes = [], fail = false, query;
globalThis.healthTest = {
  status: async () => ({ available: true, writeWorkout: true }),
  authorize: async () => {}, latestWeight: async () => query,
  writeWorkout: async w => { writes.push(w); if (fail) throw Error('revoked'); },
};
const result = await build({ stdin: { contents: `export * from './src/services/health/healthStore'; export * from './src/services/health/healthService'; export * from './src/utils/backup';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm', plugins: [{ name: 'native-test-double', setup(b) { b.onResolve({filter:/^@capacitor\/core$/}, () => ({path:'capacitor',namespace:'test'})); b.onLoad({filter:/.*/,namespace:'test'}, () => ({contents: `export const Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android'}; export const registerPlugin=()=>globalThis.healthTest;`})); } }] });
const h = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
assert.deepEqual(h.loadHealthPreferences(), { autoWeight:false,autoExport:false,weight:undefined,lastWeightSync:undefined });
for (const value of [0,-1,NaN,Infinity,501]) assert.throws(() => h.saveManualWeight(value));
h.saveManualWeight(75);
assert.equal(h.loadHealthPreferences().weight.kg,75);
const session = {id:'session-test',title:'Test',date:'2026-01-01',startTime:'2026-01-01T10:00:00Z',endTime:'2026-01-01T11:00:00Z',completed:true,durationSeconds:3600,bodyWeight:75,exercises:[{id:'e',exerciseId:'pull-up',equipmentType:'bodyweight',sets:[{id:'s',setNumber:1,weight:0,reps:5,completed:true}]}]};
const original = JSON.stringify(session);
assert.equal(h.enqueueWorkout(session),false); // Opt-in only.
h.updateHealthPreferences({autoExport:true});
assert.equal(h.enqueueWorkout({...session,completed:false}),false);
assert.equal(h.enqueueWorkout({...session,endTime:session.startTime}),false);
assert.equal(h.enqueueWorkout({...session,exercises:[]}),false);
assert.equal(h.enqueueWorkout(session),true);
assert.equal(h.enqueueWorkout(session),false);
fail=true;
await h.flushWorkoutExports();
assert.equal(h.loadExportJobs()[0].state,'failed');
h.updateHealthPreferences({autoExport:false});
await h.flushWorkoutExports();
assert.equal(writes.length,1); // Disconnected jobs stay queued.
h.updateHealthPreferences({autoExport:true});fail=false;
await Promise.all([h.flushWorkoutExports(),h.flushWorkoutExports()]);
assert.equal(writes.length,2); // One retry, same identity, no duplicate concurrent write.
assert.deepEqual(writes[0],writes[1]);
assert.equal(h.loadExportJobs()[0].state,'sent');
await h.flushWorkoutExports();assert.equal(writes.length,2);
query={kg:76,measuredAt:new Date().toISOString()};
await h.enableHealthFeature('autoWeight');
assert.equal(h.loadHealthPreferences().weight.kg,76);
query={};assert.equal(await h.syncWeight(),false);
assert.equal(h.loadHealthPreferences().weight.kg,76); // Empty/denied reads do not erase the last weight.
query={kg:Infinity,measuredAt:new Date().toISOString()};assert.equal(await h.syncWeight(),false);
let resolveQuery;
globalThis.healthTest.latestWeight=()=>new Promise(resolve=>{resolveQuery=resolve;});
const pending=h.syncWeight();
h.saveManualWeight(77);
resolveQuery({kg:90,measuredAt:new Date().toISOString()});
assert.equal(await pending,false);
assert.equal(h.loadHealthPreferences().weight.kg,77); // In-flight read cannot undo a manual edit.
assert.equal(JSON.stringify(session),original);
localStorage.setItem('iron_workout_sessions_v1',JSON.stringify([session]));
const backup=h.createBackup();
assert.equal(h.parseBackup(JSON.stringify(backup)).sessions[0].bodyWeight,75);
assert.equal(JSON.stringify(backup).includes('autoExport'),false);
const before=JSON.stringify(h.loadHealthPreferences());
const setItem=localStorage.setItem;
localStorage.setItem=()=>{throw Error('quota');};
assert.throws(()=>h.saveManualWeight(80));
localStorage.setItem=setItem;
assert.equal(JSON.stringify(h.loadHealthPreferences()),before);
console.log('PASS: health opt-in, snapshot and backup preservation, input validation, revoked permissions, durable retry, duplicate/concurrent writes, manual import race and storage failure');

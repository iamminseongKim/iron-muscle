import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
const built = await build({stdin:{contents:`export * from './src/utils/exerciseDiscovery'; export * from './src/data/exercises'; export * from './src/data/exerciseDiscovery'; export * from './src/utils/exerciseSearch';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm'});
const {rankExercises, buildExerciseUsage, EXERCISES_DATABASE:db, CORE_EXERCISE_IDS, DISCOVERY_DUPLICATES, DISCOVERY_ALIASES, matchesExerciseSearch} = await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const byId = new Map(db.map(ex=>[ex.id,ex]));
for(const id of [...CORE_EXERCISE_IDS,...Object.keys(DISCOVERY_ALIASES),...Object.keys(DISCOVERY_DUPLICATES),...Object.values(DISCOVERY_DUPLICATES)]) assert.ok(byId.has(id),`Missing metadata ID: ${id}`);
assert.equal(new Set(db.map(e=>e.id)).size,db.length);
assert.equal(byId.get('Dead_Bug').category,'core');
assert.equal(byId.get('EZ-Bar_Skullcrusher').category,'arms');
for(const [query,id] of [['벤치','bench-press'],['랫풀','lat-pulldown'],['사레레','lateral-raise'],['케이블 사레레','single-arm-cable-lateral-raise'],['덤벨 RDL','dumbbell-romanian-deadlift'],['스미스 RDL','smith-romanian-deadlift'],['리버스펙덱','Reverse_Machine_Flyes'],['트랩바 데드리프트','Trap_Bar_Deadlift']]) assert.equal(rankExercises(db,query)[0]?.id,id,query);
assert.ok(rankExercises(db,'ㄹㅍ').some(e=>e.id==='lat-pulldown'));
assert.ok(rankExercises(db,'등 케이블').every(e=>e.categories.includes('back') && e.equipment==='cable'));
assert.equal(rankExercises(db,'등')[0].id,'lat-pulldown');
assert.ok(rankExercises(db,'등').every(e=>e.categories.includes('back')));
assert.equal(rankExercises(db,'존재하지않는운동XYZ').length,0);
const session=(id,date,exerciseId,completed=true)=>({id,date,exercises:[{exerciseId,sets:[{completed}]}]});
const history=[session('1','2026-09-01','bench-press'),session('2','2026-09-13','barbell-jm-press'),session('3','2026-09-14','deadlift',false)];
const original=JSON.stringify(history);
const usage=buildExerciseUsage([...history,history[0]]);
assert.equal(usage.get('bench-press').sessions,1);
assert.ok(!usage.has('deadlift'));
assert.equal(rankExercises(db,'',usage)[0].id,'barbell-jm-press');
assert.equal(rankExercises(db,'벤치',usage)[0].id,'bench-press');
assert.equal(rankExercises(db,'Barbell JM Press')[0].id,'barbell-jm-press');
assert.equal(JSON.stringify(history),original);
assert.deepEqual(rankExercises([...db].reverse(),'').map(e=>e.id),rankExercises(db,'').map(e=>e.id),'Catalog order cannot affect ranking');
for(const lang of ['ko','en','ja','zh-CN','zh-TW','es','fr','de']) {
 const pack=JSON.parse(readFileSync(`src/i18n/locales/${lang}/exercises.json`,'utf8'));
 for(const id of ['dumbbell-romanian-deadlift','smith-romanian-deadlift','seated-cable-fly']) {
  assert.ok(pack[id]);assert.ok(matchesExerciseSearch(byId.get(id),pack[id]),`${lang}: ${id}`);
 }
}
console.log('PASS: representative IDs, ranked aliases, rare exact matches, personal recency, completed records, broad context, multilingual additions and deterministic order');

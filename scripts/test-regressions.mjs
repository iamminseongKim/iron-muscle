import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({entryPoints: ['src/utils/exerciseResolver.ts', 'src/data/exercises.ts'], bundle:true, write:false, outdir:'out', platform:'node',format:'esm'});
const modules = await Promise.all(result.outputFiles.map(f => import(`data:text/javascript;base64,${Buffer.from(f.text).toString('base64')}`)));
const {resolveExercise,sanitizeSessionExercises} = modules[0];
const {EXERCISES_DATABASE: db} = modules[1];
assert.equal(new Set(db.map(e=>e.id)).size,db.length,'Exercise IDs must be unique');
assert.ok(db.length >= 897);
assert.ok(db.filter(e=>e.equipment==='machine').length >= 89);
for(const e of db) { assert.ok(e.name && e.nameEn); assert.ok(e.categories.includes(e.category)); }
for(const id of ['deleted_custom_123','!!!','unknown-squat','한글종목']) {
 assert.equal(resolveExercise(id).id,id);
 const session={exercises:[{exerciseId:id,sets:[{weight:42,reps:8}]}]};
 assert.deepEqual(sanitizeSessionExercises(session),session);
}
assert.equal(resolveExercise('bench').id,'bench-press');
assert.equal(resolveExercise('belt-squat-machine').equipment,'machine');
console.log('PASS: catalog integrity, legacy ID resolution, unknown record preservation');

const searchBuild = await build({entryPoints:['src/utils/exerciseSearch.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {matchesExerciseSearch} = await import(`data:text/javascript;base64,${Buffer.from(searchBuild.outputFiles[0].text).toString('base64')}`);
for (const [query,id] of [
 ['바이킹 프레스','viking_press_machine'], ['짐레코 바이킹','viking_press_machine'],
 ['스탠딩 래터럴 레이즈','standing_lateral_raise_machine'], ['아스널 스탠딩 사레레','standing_lateral_raise_machine'],
 ['ㅂㅇㅋ','viking_press_machine'], ['프라임 익스트림 로우','prime-extreme-row-machine'],
 ['파나타 서큘러','circular-lat-pulldown-machine']
]) assert.ok(matchesExerciseSearch(db.find(e=>e.id===id),query),query);
console.log('PASS: manufacturer, alias, spacing and initial-consonant search');

// Catch assets that exist locally but would be absent from a clean CI checkout.
const { readFileSync } = await import('node:fs');
const { spawnSync } = await import('node:child_process');
const atlasPath = 'public/anatomy/muscle-atlas.png';
const atlasBytes = readFileSync(atlasPath);
assert.equal(atlasBytes.subarray(1,4).toString(),'PNG');
assert.equal(spawnSync('git',['check-ignore','--no-index','-q',atlasPath]).status,1,'Runtime atlas must not be ignored by Git');
console.log('PASS: runtime atlas exists and is not excluded from Git');

assert.equal(db.length, 903);
assert.equal(db.filter(e => e.equipment === 'machine').length, 95);
assert.ok(db.every(e => !e.defaultBrand), 'Built-in exercises must not assign a brand');
for (const [query, id] of [
 ['수직레그프레스', 'vertical-leg-press-machine'],
 ['몸통 회전', 'torso-rotation-machine'],
 ['ㄱㄹㅌㅋㅂ', 'glute-kickback-machine'],
 ['허리머신', 'seated-back-extension-machine'],
 ['독립암 풀다운', 'iso-lateral-pulldown-machine'],
 ['독립암 삼두', 'iso-lateral-triceps-machine'],
]) assert.ok(matchesExerciseSearch(db.find(e => e.id === id), query), query);
console.log('PASS: new machine search and brand-neutral catalog');

const growthBuild = await build({entryPoints:['src/utils/growthExercises.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {buildGrowthExerciseOptions} = await import(`data:text/javascript;base64,${Buffer.from(growthBuild.outputFiles[0].text).toString('base64')}`);
const fixtureCatalog = db.slice(0, 4);
const session = (date, id, weight, completed = true) => ({date, exercises:[{exerciseId:id, sets:[{weight,reps:10,completed}]}]});
const growthOptions = buildGrowthExerciseOptions(fixtureCatalog, [
 session('2026-09-01',fixtureCatalog[1].id,50),
 session('2026-09-09',fixtureCatalog[2].id,60),
 session('2026-09-10',fixtureCatalog[0].id,80,false),
 session('2026-09-10',fixtureCatalog[3].id,0),
]);
assert.equal(growthOptions[0].exercise.id,fixtureCatalog[2].id,'Most recent usable record comes first');
assert.equal(growthOptions[1].exercise.id,fixtureCatalog[1].id);
assert.equal(growthOptions.filter(o=>o.recordCount>0).length,2,'Incomplete and zero-weight sets must not claim growth data');
assert.ok(buildGrowthExerciseOptions(fixtureCatalog,[]).every(o=>o.recordCount===0));
console.log('PASS: growth picker prioritizes usable records, recency and empty history');

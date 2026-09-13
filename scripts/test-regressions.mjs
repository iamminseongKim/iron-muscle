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

assert.equal(db.length, 1032);
assert.equal(db.filter(e => e.equipment === 'machine').length, 149);
assert.ok(db.every(e => !e.defaultBrand), 'Built-in exercises must not assign a brand');
for (const [query, id] of [
 ['인클라인 트라이셉스', 'incline-dumbbell-triceps-extension'],
 ['카타나 익스텐션', 'crossbody-cable-triceps-extension'],
 ['스미스 jm', 'smith-jm-press'],
 ['수직레그프레스', 'vertical-leg-press-machine'],
 ['몸통 회전', 'torso-rotation-machine'],
 ['ㄱㄹㅌㅋㅂ', 'glute-kickback-machine'],
 ['허리머신', 'seated-back-extension-machine'],
 ['독립암 풀다운', 'iso-lateral-pulldown-machine'],
 ['독립암 삼두', 'iso-lateral-triceps-machine'],
 ['어시스트 풀업', 'machine_assisted_pull_up'],
 ['어시스트 딥스', 'machine_assisted_dips'],
 ['ㅇㅅㅅㅌㅍㅇ', 'machine_assisted_pull_up'],
 ['밴드 딥스', 'band_assisted_dips'],
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

// Real anatomy assets must ship in clean checkouts and retain their provenance.
const glbJson = path => {
 const bytes=readFileSync(path);
 assert.equal(bytes.subarray(0,4).toString(),'glTF');
 assert.equal(bytes.readUInt32LE(4),2);
 assert.equal(bytes.readUInt32LE(8),bytes.length);
 assert.equal(spawnSync('git',['check-ignore','--no-index','-q',path]).status,1);
 return JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
};
const anatomy=glbJson('public/anatomy/anatomy.glb');
const skeleton=glbJson('public/anatomy/skeleton.glb');
assert.equal(anatomy.meshes.length,467);
assert.equal(skeleton.meshes.length,201);
for(const model of [anatomy,skeleton]) {
 assert.ok(model.buffers.every(buffer=>!buffer.uri),'GLB must not require external buffers');
 assert.ok(!model.images?.length,'No remote textures required');
}
const modelBuild=await build({entryPoints:['src/components/3d/anatomyModel.ts'],bundle:true,write:false,platform:'node',format:'esm',define:{'import.meta.env.BASE_URL':'"/"'}});
const {muscleTargetForName}=await import(`data:text/javascript;base64,${Buffer.from(modelBuild.outputFiles[0].text).toString('base64')}`);
const mapped=new Set(anatomy.meshes.map(mesh=>muscleTargetForName(mesh.name)).filter(Boolean));
assert.equal(mapped.size,17,'All exercise muscle groups need actual geometry');
assert.equal(muscleTargetForName('clavicular_part_of_left_pectoralis_major'),'chest_upper');
assert.equal(muscleTargetForName('spinal_part_of_right_deltoid'),'deltoid_rear');
assert.equal(muscleTargetForName('long_head_of_right_biceps_femoris'),'hamstrings');
assert.equal(muscleTargetForName('left_inferior_oblique'),undefined,'Eye muscles are not abdominal obliques');
assert.ok(readFileSync('public/anatomy/NOTICE.html','utf8').includes('ShareAlike'));
console.log('PASS: bundled real anatomy, 17 target groups, no external textures and attribution');

for (const query of ['암컬', '암 컬 머신', '머신 암컬', '이두 컬 머신', 'arm curl', '머신 바이셉 컬']) {
 assert.ok(matchesExerciseSearch(db.find(e=>e.id==='Machine_Bicep_Curl'),query), query);
}
for (const muscle of ['biceps','triceps','lats','deltoid_front','chest','quads','glutes','abs','obliques']) {
 assert.ok(db.some(e=>e.equipment==='machine' && e.primaryMuscles.includes(muscle)), muscle);
}
console.log('PASS: 121 machines, arm curl aliases and all requested muscle groups');

// Assisted exercise detection and safety tests
const calcBuild = await build({entryPoints:['src/utils/calculations.ts'],bundle:true,write:false,platform:'node',format:'esm'});
const {isAssistedExercise, calculate1RM, calculateSessionVolume} = await import(`data:text/javascript;base64,${Buffer.from(calcBuild.outputFiles[0].text).toString('base64')}`);
assert.ok(isAssistedExercise(db.find(e=>e.id==='machine_assisted_pull_up')));
assert.ok(isAssistedExercise(db.find(e=>e.id==='machine_assisted_dips')));
assert.ok(isAssistedExercise(db.find(e=>e.id==='band_assisted_dips')));
assert.ok(!isAssistedExercise(db.find(e=>e.id==='viking_press_machine')));
assert.equal(calculate1RM(-30, 10), 0, 'Negative assisted weights must not produce invalid 1RM');
const testSession = {
  id: 's1', title: 'T', date: '2026-09-13', startTime: '2026-09-13T10:00:00Z',
  exercises: [{ id: 'e1', exerciseId: 'machine_assisted_pull_up', equipmentType: 'machine', sets: [{ id: 's1', setNumber: 1, weight: -30, reps: 10, completed: true }] }]
};
assert.equal(calculateSessionVolume(testSession), 0, 'Assisted negative counterweight must not corrupt total session volume');
console.log('PASS: assisted exercises detection, safety, and negative counterweight handling');


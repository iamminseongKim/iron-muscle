import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { webcrypto } from 'node:crypto';
globalThis.crypto ??= webcrypto;
const built = await build({ stdin: { contents: "export * from './src/utils/aiRoutineImport'; export { EXERCISES_DATABASE } from './src/data/exercises'; export { getAllExerciseTranslations } from './src/i18n';", resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { parseImportedWorkout: parse, sessionFromImportedWorkout: session, AI_ROUTINE_EXAMPLE, AI_ROUTINE_MARKDOWN_EXAMPLE, buildAiRoutinePrompt, EXERCISES_DATABASE: catalog, getAllExerciseTranslations } = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
const wrap = row => JSON.stringify({ title: 'AI test', exercises: [row] });
for (const sample of [AI_ROUTINE_EXAMPLE, AI_ROUTINE_MARKDOWN_EXAMPLE]) {
  const parsed = parse(sample, catalog);
  assert.equal(parsed.exercises[0].exerciseId, 'bench-press');
  assert.equal(parsed.exercises[0].sets.length, 3);
}
const bench = catalog.find(item => item.id === 'bench-press');
for (const name of getAllExerciseTranslations(bench)) assert.equal(parse(wrap({ name, sets: 2 }), catalog).exercises[0].exerciseId, 'bench-press', name);
const custom = { ...bench, id: 'custom-personal', name: 'My personal press', nameEn: 'My personal press', aliases: ['My press'] };
assert.equal(parse(wrap({ name: 'My press' }), [...catalog, custom]).exercises[0].exerciseId, custom.id);
assert.equal(parse(wrap({ name: 'Unknown exercise' }), catalog).exercises[0].exerciseId, null);
assert.equal(parse(wrap({ name: 'My press' }), [custom, { ...custom, id: 'duplicate' }]).exercises[0].exerciseId, null);
assert.equal(parse(wrap({ name: 'Bench' }), [bench]).exercises[0].exerciseId, null, 'partial matches are never selected');
const raw = wrap({ exerciseId: 'bench-press', weightUnit: 'lbs', sets: [{ reps: 12, weight: 45.5, restSeconds: 30 }, { reps: 8, weight: 55, restSeconds: 120 }] });
const draft = parse('```json\n' + raw + '\n```', catalog);
const next = session(draft, catalog);
const other = session(draft, catalog);
assert.equal(next.completed, false);
assert.equal(next.durationSeconds, 0);
assert.notEqual(next.id, other.id);
assert.equal(next.exercises[0].weightUnit, 'lbs');
assert.deepEqual(next.exercises[0].sets.map(set => [set.weight, set.reps, set.plannedRestSeconds, set.completed]), [[45.5,12,30,false],[55,8,120,false]]);
assert.equal(next.exercises[0].machineBrand, undefined);
const allIds = [next.id, ...next.exercises.flatMap(item => [item.id, ...item.sets.map(set => set.id)])];
assert.equal(new Set(allIds).size, allIds.length);
assert.throws(() => session(parse(wrap({ name: 'Unknown' }), catalog), catalog));
const markdown = '# 가슴\n| 종목 | 세트 | 반복 | 무게 | 휴식 |\n| --- | --- | --- | --- | --- |\n| 바벨 벤치프레스 | 2 | 12회 | 40kg | 60초 |';
const table = parse(markdown, catalog);
assert.equal(table.title, '가슴');
assert.equal(table.exercises[0].sets[0].restSeconds, 60);
assert.equal(table.exercises[0].sets[0].weight, 40);
for (const invalid of [
  '', '{}', '{broken', 'x'.repeat(100001),
  wrap({name:'Barbell Bench Press',sets:0}), wrap({name:'Barbell Bench Press',sets:51}),
  wrap({name:'Barbell Bench Press',sets:1.5}), wrap({name:'Barbell Bench Press',sets:[]}),
  wrap({name:'Barbell Bench Press',sets:[null]}), wrap({name:'Barbell Bench Press',sets:[{reps:null}]}),
  wrap({name:'Barbell Bench Press',reps:0}), wrap({name:'Barbell Bench Press',reps:1001}),
  wrap({name:'Barbell Bench Press',reps:'10'}), wrap({name:'Barbell Bench Press',reps:null}),
  wrap({name:'Barbell Bench Press',weight:-1}), wrap({name:'Barbell Bench Press',weight:2001}),
  wrap({name:'Barbell Bench Press',weight:null}), wrap({name:'Barbell Bench Press',restSeconds:3601}),
  wrap({name:'Barbell Bench Press',restSeconds:null}), wrap({name:'Barbell Bench Press',weightUnit:'lb'}),
  wrap({name:'Barbell Bench Press',sets:[{reps:10,weightUnit:'lbs'}]}),
  wrap({name:'Lat Pulldown',exerciseId:'bench-press'}),
  JSON.stringify({exercises:Array.from({length:51},()=>({name:'Barbell Bench Press'}))}),
  markdown + '\nnot a table row', markdown.replace('12회','8-12'), markdown.replace('40kg','Infinity'),
  '| name | sets | reps | weight | unit |\n| Barbell Bench Press | 3 | 10 | 40kg | lbs |',
  '| name | sets | reps | unit | weight |\n| Barbell Bench Press | 3 | 10 | lbs | 40kg |',
]) assert.throws(() => parse(invalid, catalog), `must reject ${invalid.slice(0,100)}`);
console.log('AI routine import validates formats, numbers, units, identities, translations, custom exercises, and new incomplete sessions.');
const metadata = parse(JSON.stringify({ title: 'Metadata', notes: 'Session note', exercises: [{ exerciseId: 'lat-pulldown', equipmentType: 'machine', loadType: 'pin-loaded', executionMode: 'unilateral', notes: 'Seat 4', sets: [{ weight: 25, reps: 12, restSeconds: 120, rpe: 7.5, tempo: { eccentric: 3, pause: 1, concentric: 1 }, comment: 'Slow', side: 'right' }, { reps: 10 }] }] }), catalog);
const planned = session(metadata, catalog);
assert.equal(planned.notes, 'Session note');
assert.equal(planned.exercises[0].notes, 'Seat 4');
assert.equal(planned.exercises[0].executionMode, 'unilateral');
assert.equal(planned.exercises[0].loadType, 'pin-loaded');
assert.equal(planned.exercises[0].equipmentType, 'machine');
assert.equal(planned.exercises[0].sets[0].rpe, 7.5);
assert.deepEqual(planned.exercises[0].sets[0].tempo, { eccentric: 3, pause: 1, concentric: 1 });
assert.equal(planned.exercises[0].sets[0].comment, 'Slow');
assert.equal(planned.exercises[0].sets[0].side, 'right');
assert.equal(planned.exercises[0].sets[1].side, 'left');
assert.equal(planned.exercises[0].sets[0].plannedRestSeconds, 120);
assert.equal(planned.exercises[0].sets[0].restSeconds, undefined, 'recommended rest is never actual rest');
planned.exercises[0].sets[0].tempo.eccentric = 9;
assert.equal(metadata.exercises[0].sets[0].tempo.eccentric, 3);
for (const row of [{rpe:5.5},{rpe:8.1},{rpe:11},{rpe:null},{tempo:{eccentric:31,pause:0,concentric:1}},{tempo:{eccentric:2}},{tempo:null},{notes:1},{comment:'x'.repeat(2001)},{executionMode:'single'},{loadType:'pin'},{equipmentType:'robot'},{side:'up'}]) assert.throws(()=>parse(wrap({exerciseId:'bench-press',...row}),catalog));
const metaTable = '| name | sets | reps | rpe | tempo | notes | comment | executionMode | loadType | equipmentType | side |\n| Lat Pulldown | 2 | 12 | 8.5 | 3-1-1 | Seat 4 | Slow | unilateral | plate-loaded | machine | right |';
const metaSession = session(parse(metaTable,catalog),catalog);
assert.equal(metaSession.exercises[0].loadType,'plate-loaded');
assert.equal(metaSession.exercises[0].sets[0].rpe,8.5);
assert.equal(metaSession.exercises[0].sets[0].tempo.pause,1);
assert.equal(metaSession.exercises[0].sets[0].side,'right');
console.log('AI routine metadata preserves RPE, tempo, notes, side, execution mode, equipment, loading, and recommended rest.');

const oneArm = catalog.find(item => item.name.includes('원암'));
assert.ok(oneArm, 'real one-arm catalog exercise');
const bothByDefault = session(parse(wrap({name:oneArm.name}),catalog),catalog).exercises[0];
assert.equal(bothByDefault.exerciseId,oneArm.id);
assert.equal(bothByDefault.executionMode,'bilateral');
assert.ok(bothByDefault.sets.every(set=>set.side==='both'));
const prompt = buildAiRoutinePrompt();
assert.ok(prompt.includes('확정한 뒤에만'));
assert.ok(prompt.includes('1회 운동 루틴'));
assert.ok(prompt.includes('명시적으로 요청한 경우에만'));
assert.ok(!prompt.includes('"exerciseId":'));
const promptExample=JSON.parse(prompt.slice(prompt.indexOf('{\n')));
assert.ok(promptExample.exercises.every(item=>item.executionMode==='bilateral'));
for(const item of promptExample.exercises) if(Array.isArray(item.sets)) assert.ok(item.sets.every(set=>set.side==='both'));
console.log('External AI prompt requires dialogue, one confirmed session, no invented IDs, and combined-side defaults.');

const proposed = parse(wrap({name:'New leverage row', category:'back', nameEn:'New row', primaryMuscles:['lats','traps','lats'], secondaryMuscles:['biceps'],sets:2}),catalog);
assert.deepEqual(proposed.exercises[0].proposal,{category:'back',nameEn:'New row',primaryMuscles:['lats','traps'],secondaryMuscles:['biceps']});
assert.equal(proposed.exercises[0].exerciseId,null);
assert.equal(parse(wrap({name:'New no info'}),catalog).exercises[0].proposal,undefined);
const knownSnapshot=JSON.stringify(bench);
const knownProposal=parse(wrap({exerciseId:'bench-press',category:'back',primaryMuscles:['lats'],secondaryMuscles:['traps']}),catalog);
assert.equal(session(knownProposal,catalog).exercises[0].exerciseId,'bench-press');
assert.equal(JSON.stringify(bench),knownSnapshot);
for (const bad of [{category:'neck'},{category:null},{primaryMuscles:['imaginary']},{primaryMuscles:'lats'},{primaryMuscles:null},{primaryMuscles:['lats'],secondaryMuscles:['lats']},{secondaryMuscles:[1]},{primaryMuscles:Array(18).fill('lats')},{nameEn:''}]) assert.throws(()=>parse(wrap({name:'New movement',...bad}),catalog));
const muscleMd=parse('| 종목 | 세트 | 반복 | 부위 | 주동근 | 보조근 |\n| New row | 2 | 10 | back | lats,traps | biceps |',catalog);
assert.deepEqual(muscleMd.exercises[0].proposal.primaryMuscles,['lats','traps']);
assert.deepEqual(muscleMd.exercises[0].proposal.secondaryMuscles,['biceps']);
assert.ok(buildAiRoutinePrompt().includes('primaryMuscles'));
assert.ok(buildAiRoutinePrompt().includes('lats='));
console.log('AI proposals validate category and muscle IDs without registering or rewriting existing catalog exercises.');

import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { build } from 'esbuild';
globalThis.crypto ??= webcrypto;
const bundle = await build({ stdin: { contents: `export * from './src/utils/aiRoutineImport'; export * from './src/utils/adaptiveTraining'; export {EXERCISES_DATABASE} from './src/data/exercises';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const parse = raw => api.parseImportedWorkout(JSON.stringify(raw), api.EXERCISES_DATABASE);
const sample = () => ({ title: 'AI grouped arms', groups: [{ id: 'A', type: 'compound', rounds: 2, restSeconds: 120, targetRpe: 8 }], exercises: [
  { name: 'Dumbbell Bicep Curl', groupId: 'A', reps: 12, weight: 10, weightUnit: 'kg' },
  { name: 'Hammer Curls', groupId: 'A', reps: 12, weight: 8, weightUnit: 'kg' },
] });
let draft = parse(sample());
assert.equal(draft.groups.length, 1);
assert.deepEqual(draft.exercises.map(ex => ex.exerciseId), ['dumbbell-curl', 'hammer-curl']);
assert.deepEqual(draft.exercises.map(ex => ex.sets.length), [2, 2], 'omitted member sets inherit rounds');
assert.ok(draft.exercises.every(ex => ex.sets.every(set => set.restSeconds === 120 && set.rpe === 8)));
let session = api.sessionFromImportedWorkout(draft, api.EXERCISES_DATABASE);
let other = api.sessionFromImportedWorkout(draft, api.EXERCISES_DATABASE);
assert.equal(new Set(session.exercises.map(ex => ex.groupId)).size, 1);
assert.ok(session.exercises[0].groupId);
assert.notEqual(session.exercises[0].groupId, other.exercises[0].groupId, 'fresh sessions do not share imported group identity');
assert.ok(session.exercises.every(ex => ex.groupType === 'compound' && ex.sets.every(set => set.targetRpe === 8 && set.rpe === null && set.plannedRestSeconds === 120 && !set.completed)));
assert.deepEqual(session.exercises.map(ex => ex.sets[0].weight), [10, 8]);
assert.ok(session.exercises.every(ex => !ex.machineBrand), 'group import never invents a brand');
const untouched = JSON.stringify(draft);
let step = api.advanceGroupRound(session, session.exercises[0].groupId, new Date('2026-11-20T00:00:00Z'));
step = api.advanceGroupRound(step.session, session.exercises[0].groupId, new Date('2026-11-20T00:00:30Z'));
assert.equal(step.kind, 'advanced', 'imported group uses real grouped controller');
assert.equal(step.session.exercises[1].sets[0].restKind, 'transition');
assert.equal(step.session.exercises[1].sets[0].completed, false);
assert.equal(JSON.stringify(draft), untouched, 'session creation/progression preserves preview draft');
const overridden = sample();
overridden.exercises[0].rpe = 7.5;
overridden.exercises[0].sets = [{ reps: 10, weight: 10, rpe: 9 }, { reps: 12, weight: 10 }];
overridden.exercises[1].targetRpe = 8.5;
draft = parse(overridden);
assert.deepEqual(draft.exercises[0].sets.map(set => set.rpe), [9, 7.5], 'set RPE overrides exercise alias which overrides group target');
assert.ok(draft.exercises[1].sets.every(set => set.rpe === 8.5));
session = api.sessionFromImportedWorkout(draft, api.EXERCISES_DATABASE);
assert.deepEqual(session.exercises[0].sets.map(set => set.targetRpe), [9, 7.5]);
assert.ok(session.exercises.every(ex => ex.sets.every(set => set.rpe === null)), 'planned RPE never becomes actual RPE');
for (const type of ['superset', 'compound']) {
  const raw = sample(); raw.groups[0].type = type;
  assert.equal(parse(raw).groups[0].type, type);
}
const giant = sample(); giant.groups[0].type = 'giant'; giant.exercises.push({ name: 'Barbell Curl', groupId: 'A', weight: 20, reps: 10 });
assert.equal(parse(giant).exercises.length, 3);
const mixed = sample(); mixed.exercises.push({ name: 'Barbell Squat', sets: 3, reps: 8, weight: 30 });
assert.equal(parse(mixed).exercises[2].sets.length, 3, 'standalone settings stay independent');
const invalid = [
  raw => { raw.groups[0].type = 'drop'; },
  raw => { raw.groups.push({ ...raw.groups[0] }); },
  raw => { raw.exercises[1].groupId = 'missing'; },
  raw => { raw.exercises.pop(); },
  raw => { raw.groups[0].type = 'giant'; },
  raw => { raw.groups[0].rounds = 0; },
  raw => { raw.groups[0].rounds = 51; },
  raw => { raw.groups[0].rounds = 2.5; },
  raw => { raw.groups[0].targetRpe = 7.3; },
  raw => { raw.groups[0].targetRpe = 11; },
  raw => { raw.groups[0].restSeconds = -1; },
  raw => { raw.groups[0].restSeconds = 3601; },
  raw => { raw.exercises[0].sets = 3; },
  raw => { raw.exercises[0].sets = [{ reps: 12, weight: 10 }]; },
  raw => { raw.exercises[0].restSeconds = 90; },
  raw => { raw.exercises[0].sets = [{ restSeconds: 90 }, { restSeconds: 120 }]; },
  raw => { raw.groups = []; },
];
for (const mutate of invalid) { const raw = sample(); mutate(raw); assert.throws(() => parse(raw), mutate.toString()); }
const sameRest = sample(); sameRest.exercises[0].restSeconds = 120;
assert.equal(parse(sameRest).exercises[0].sets[0].restSeconds, 120);
const explicitGroup = sample(); explicitGroup.exercises[0].groupType = 'compound'; delete explicitGroup.groups;
assert.throws(() => parse(explicitGroup), 'inline group fields must not silently turn into standalone exercises');
const example = JSON.parse(api.AI_GROUP_ROUTINE_EXAMPLE);
assert.ok(!example.exercises.some(ex => ex.exerciseId), 'AI group example uses names, not invented IDs');
assert.ok(api.parseImportedWorkout(api.AI_GROUP_ROUTINE_EXAMPLE, api.EXERCISES_DATABASE).exercises.every(ex => ex.exerciseId));
const prompt = api.buildAiRoutinePrompt();
for (const token of ['groups', 'groupId', 'superset', 'compound', 'giant', 'rounds', 'targetRpe']) assert.ok(prompt.includes(token), token);
assert.ok(prompt.includes('실제 수행 RPE는 자동 입력하지 않습니다.'));
console.log('PASS AI group schema, shared rounds/rest/planned RPE precedence, independent weights, fresh group IDs, malformed references/counts/rest rejection, real round progression and prompt example round trip');

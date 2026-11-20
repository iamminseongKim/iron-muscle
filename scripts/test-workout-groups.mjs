import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { build } from 'esbuild';

globalThis.crypto ??= webcrypto;
const bundle = await build({ stdin: { contents: `export * from './src/utils/workoutGroups'; export * from './src/utils/adaptiveTraining';`, resolveDir: process.cwd() }, bundle: true, write: false, platform: 'node', format: 'esm' });
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const makeSet = (id, setNumber, extra = {}) => ({ id, setNumber, weight: 40, reps: 10, completed: false, rpe: null, setType: 'WORKING', plannedSetType: 'WORKING', provenance: 'recorded', ...extra });
const makeSession = () => ({ id: 'group-test', date: '2026-11-19', title: 'Groups', startTime: '2026-11-19T00:00:00Z', durationSeconds: 10, completed: false, exercises: [
  { id: 'a', exerciseId: 'bench-press', equipmentType: 'barbell', weightUnit: 'kg', groupId: 'pair', groupType: 'superset', sets: [makeSet('a1', 1), makeSet('a2', 2)] },
  { id: 'b', exerciseId: 'lat-pulldown', equipmentType: 'cable', weightUnit: 'lbs', groupId: 'pair', groupType: 'superset', sets: [makeSet('b1', 1, { weight: 100, reps: 12 }), makeSet('b2', 2, { weight: 90, reps: 15 })] },
] });
let session = makeSession();
assert.equal(api.getPostSetAction(session, 'a', 'a1').kind, 'none', 'a failed completion save cannot trigger follow-up');
session.exercises[0].sets[0] = api.completeWorkoutSet(session.exercises[0].sets[0], new Date('2026-11-19T00:01:00Z'));
assert.equal(api.getPostSetAction(session, 'a', 'a1').kind, 'next-member', 'same-round partner comes before rest');
assert.equal(api.getCurrentGroupRound(session.exercises), 1);
assert.equal(api.getSetProgress(session, 'a', 'a2').kind, 'waiting', 'cannot skip remaining partner into next round');
assert.equal(api.getSetProgress(session, 'b', 'b1').kind, 'ready');
assert.equal(api.getSetProgress(session, 'b', 'b1', true).kind, 'waiting', 'rest blocks ready set');
assert.deepEqual(api.startWorkoutSet(session, 'b', 'b1', new Date('2026-11-19T00:01:10Z'), true), session, 'blocked start does not mutate records');
session.exercises[1].sets[0] = api.completeWorkoutSet(session.exercises[1].sets[0], new Date('2026-11-19T00:01:20Z'));
assert.equal(api.getPostSetAction(session, 'b', 'b1').kind, 'rest', 'round completion starts rest');
assert.equal(api.getCurrentGroupRound(session.exercises), 2);
session = api.startWorkoutSet(session, 'a', 'a2', new Date('2026-11-19T00:03:00Z'));
assert.equal(api.getSetProgress(session, 'b', 'b2').kind, 'waiting', 'global active set blocks other member');
session.exercises[0].sets[1] = api.completeWorkoutSet(session.exercises[0].sets[1]);
session.exercises[1].sets[1] = api.completeWorkoutSet(session.exercises[1].sets[1]);
assert.equal(api.getPostSetAction(session, 'b', 'b2').kind, 'finish', 'session final set bypasses rest');
assert.equal(api.getPostSetAction(session, 'missing', 'missing').kind, 'none');
const ungrouped = makeSession();
delete ungrouped.exercises[0].groupId;
ungrouped.exercises[0].sets[0] = api.completeWorkoutSet(ungrouped.exercises[0].sets[0]);
assert.equal(api.getPostSetAction(ungrouped, 'a', 'a1').kind, 'rest', 'ungrouped nonfinal set still rests');

session = makeSession();
session.exercises[0].sets[0] = api.completeWorkoutSet({ ...session.exercises[0].sets[0], rpe: 8, rpeSource: 'recorded', comment: 'Keep actual record', timerRestSeconds: 60 });
session.exercises[1].sets[0] = { ...session.exercises[1].sets[0], startedAt: '2026-11-19T00:05:00Z', startPausedSeconds: 0, restSeconds: 20, restSource: 'measured' };
const original = structuredClone(session);
const expanded = api.applyGroupSettings(session, 'pair', { rounds: 3, restSeconds: 120 });
assert.deepEqual(session, original, 'group settings do not mutate source');
assert.deepEqual(expanded.exercises[0].sets[0], original.exercises[0].sets[0], 'completed record stays byte-for-byte intact');
assert.deepEqual(expanded.exercises[1].sets[0], original.exercises[1].sets[0], 'started record stays intact');
assert.equal(expanded.exercises[0].sets.length, 3);
assert.equal(expanded.exercises[1].sets.length, 3);
assert.equal(expanded.exercises[1].weightUnit, 'lbs');
assert.equal(expanded.exercises[1].sets[1].weight, 90);
assert.equal(expanded.exercises[1].sets[1].reps, 15);
assert.equal(expanded.exercises[0].sets[1].plannedRestSeconds, 120);
assert.equal(expanded.exercises[1].sets[1].plannedRestSeconds, 120);
const allIds = expanded.exercises.flatMap(ex => ex.sets.map(set => set.id));
assert.equal(new Set(allIds).size, allIds.length, 'new round IDs unique across members');
for (const ex of expanded.exercises) {
  const added = ex.sets[2];
  assert.equal(added.completed, false);
  for (const key of ['startedAt', 'completedAt', 'restSeconds', 'timerRestSeconds', 'revisions', 'rpeSource']) assert.equal(added[key], undefined, `new round does not inherit ${key}`);
}
const reduced = api.applyGroupSettings(expanded, 'pair', { rounds: 1, restSeconds: 30 });
assert.deepEqual(reduced.exercises[0].sets[0], original.exercises[0].sets[0]);
assert.deepEqual(reduced.exercises[1].sets[0], original.exercises[1].sets[0]);
assert.equal(reduced.exercises[0].sets.length, 1);
const laterProtected = makeSession();
laterProtected.exercises[0].sets[1] = api.completeWorkoutSet(laterProtected.exercises[0].sets[1]);
assert.ok(api.applyGroupSettings(laterProtected, 'pair', { rounds: 1, restSeconds: 45 }).exercises[0].sets.some(set => set.id === 'a2' && set.completed), 'shortening rounds never deletes later completed history');
const sourceExercise = { ...makeSession().exercises[0], sets: [makeSet('done', 1, { completed: true, weight: 10 }), makeSet('source', 2, { weight: 55, reps: 8 }), makeSet('future', 3, { weight: 30 }), makeSet('running', 4, { weight: 25, startedAt: '2026-11-19T00:00:00Z' })] };
const applied = api.applyRemainingGroupValues(sourceExercise, 'source');
assert.deepEqual(applied.sets[0], sourceExercise.sets[0]);
assert.equal(applied.sets[2].weight, 55);
assert.equal(applied.sets[2].reps, 8);
assert.deepEqual(applied.sets[3], sourceExercise.sets[3]);
assert.deepEqual(api.applyRemainingGroupValues(sourceExercise, 'missing'), sourceExercise);
console.log('PASS group completion transitions, rest/active/round gates, immutable protected records, independent units/loads, fresh round IDs and remaining-round application');

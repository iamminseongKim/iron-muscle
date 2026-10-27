import assert from 'node:assert/strict';
import { build } from 'esbuild';
const compiled = await build({ stdin: { contents: "export * from './src/utils/gymWorkout'; export * from './src/utils/calculations'; export * from './src/utils/backup';", resolveDir: process.cwd() }, bundle: true, write: false, format: 'esm', platform: 'node' });
const api = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
const memory = new Map();
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
globalThis.window = { dispatchEvent() {} };
globalThis.CustomEvent = class {};
function session(id, date, rpe, overrides = {}) {
  return { id, title: id, date, startTime: `${date}T10:00:00Z`, endTime: `${date}T11:00:00Z`, completed: true, durationSeconds: 3600, weightUnit: 'lbs',
    exercises: [{ id: `e-${id}`, exerciseId: 'machine_assisted_pull_up', equipmentType: 'machine', machineConfigId: 'gym-1:a', machineBrand: 'Recorded brand',
      sets: [{ id: `s-${id}`, setNumber: 1, weight: -30, reps: 10, completed: true, rpe, side: 'left', comment: 'keep me', tags: ['웜업'], tempo: { eccentric: 2, pause: 0, concentric: 1 } }] }], ...overrides };
}
const oldest = session('old', '2026-10-01', 6);
const newest = session('new', '2026-10-20', 9);
newest.exercises[0].sets.push({ id: 'unfinished', setNumber: 2, weight: -100, reps: 0, completed: false });
const history = [oldest, newest, session('middle', '2026-10-10', 8)];
const before = JSON.stringify(history);
for (const order of [history, [...history].reverse(), [newest, oldest, history[2]]]) {
  const previous = api.findPreviousMachineExercise(order, 'machine_assisted_pull_up', undefined, 'gym-1:a');
  assert.equal(previous.id, 'e-new', 'Latest actual date wins regardless of backup/storage order');
  assert.equal(previous.weightUnit, 'lbs', 'Session-level legacy unit is inherited');
  assert.equal(previous.sets.length, 1, 'Uncompleted plans are not previous performance');
  assert.equal(previous.sets[0].comment, 'keep me');
}
assert.equal(api.findPreviousMachineExercise(history, 'machine_assisted_pull_up', undefined, 'gym-2:a'), undefined);
assert.equal(api.findPreviousMachineExercise(history, 'machine_assisted_pull_up', 'Other brand'), undefined);
assert.equal(api.findPreviousMachineExercise([session('active', '2026-10-25', 10, { completed: false }), oldest], 'machine_assisted_pull_up', undefined, 'gym-1:a').id, 'e-old');
assert.equal(JSON.stringify(history), before, 'History remains untouched');
const earlier = session('early', '2026-10-20', 7, { startTime: '2026-10-20T08:00:00Z' });
assert.equal(api.findPreviousMachineExercise([earlier, newest], 'machine_assisted_pull_up', undefined, 'gym-1:a').id, 'e-new', 'Same-day start time breaks ties');
const unknownMachine = session('unassigned', '2026-10-02', 7);
unknownMachine.exercises[0].machineConfigId = undefined;
unknownMachine.exercises[0].machineBrand = undefined;
const legacyBrand = session('legacy-brand', '2026-10-03', 8);
legacyBrand.exercises[0].machineConfigId = undefined;
const scopedHistory = [newest, legacyBrand, unknownMachine];
assert.equal(api.findPreviousMachineExercise(scopedHistory, 'machine_assisted_pull_up').id, 'e-unassigned', 'Unassigned exercise only reuses unassigned history');
assert.equal(api.findPreviousMachineExercise(scopedHistory, 'machine_assisted_pull_up', 'Recorded brand').id, 'e-legacy-brand', 'Brand-only selection does not cross registered machine identities');
assert.equal(api.findPreviousMachineExercise([newest, legacyBrand], 'machine_assisted_pull_up'), undefined, 'No arbitrary brand or machine fallback');
assert.equal(api.findPreviousMachineExercise([newest], 'machine_assisted_pull_up', 'Recorded brand'), undefined, 'Same brand cannot stand in for a registered config');
const fatigueHistory = Array.from({ length: 12 }, (_, i) => session(`s${i}`, `2026-10-${String(i + 1).padStart(2, '0')}`, i < 4 ? 6 : 9));
for (const order of [fatigueHistory, [...fatigueHistory].reverse()]) {
  const result = api.checkDeloadRecommendation(order);
  assert.equal(result.recentAvgRpe, 9);
  assert.equal(result.shouldDeload, true);
  assert.equal(result.hasEnoughData, true);
}
assert.equal(api.checkDeloadRecommendation([session('no-rpe', '2026-10-27')]).recentAvgRpe, null);
assert.equal(api.checkDeloadRecommendation([session('only-one', '2026-10-27', 10)]).hasEnoughData, false);
const missingRecent = fatigueHistory.map((s, i) => i < 4 ? s : session(s.id, s.date));
assert.equal(api.checkDeloadRecommendation(missingRecent).hasEnoughData, false, 'Old RPE must not fill recent missing entries');
assert.equal(api.checkDeloadRecommendation(missingRecent).recentAvgRpe, null);
const backup = { format: 'iron-muscle-backup', version: 1, exportedAt: new Date().toISOString(), sessions: [newest], customExercises: [], activeSession: null };
const validated = api.parseBackup(JSON.stringify(backup));
assert.deepEqual(validated.sessions[0], newest, 'Assistance, metadata, units and original IDs survive JSON validation');
api.restoreBackup(backup);
assert.deepEqual(api.createBackup().sessions[0], newest, 'Signed assistance round trips through actual storage');
for (const invalidValue of [null, '30']) {
  const invalid = structuredClone(backup); invalid.sessions[0].exercises[0].sets[0].weight = invalidValue;
  assert.throws(() => api.parseBackup(JSON.stringify(invalid)));
}
const badReps = structuredClone(backup); badReps.sessions[0].exercises[0].sets[0].reps = -1;
assert.throws(() => api.parseBackup(JSON.stringify(badReps)), 'Other numeric fields remain nonnegative');
const gymKey = 'iron_gym_equipment_profile_v1';
localStorage.setItem(gymKey, JSON.stringify({ id: 'original', machines: {} }));
const beforeFailedRestore = new Map(memory);
const originalWrite = localStorage.setItem;
let failed = false;
localStorage.setItem = (key, value) => {
  originalWrite(key, value);
  if (key === gymKey && !failed) { failed = true; throw new Error('Interrupted gym write'); }
};
assert.throws(() => api.restoreBackup({ ...backup, sessions: [session('restore-failure', '2026-10-27', 8)], gymProfile: { id: 'incoming', machines: {} } }));
localStorage.setItem = originalWrite;
assert.deepEqual(memory, beforeFailedRestore, 'Gym settings roll back together with all workout and routine data');
console.log('PASS latest completed records independent of ordering, machine scope, legacy units, honest recent RPE, signed assistance backup and complete restore rollback');

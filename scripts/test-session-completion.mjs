import assert from 'node:assert/strict';
import { build } from 'esbuild';
const data = new Map();
const events = [];
globalThis.window = { dispatchEvent: event => { events.push(event); } };
if (typeof globalThis.CustomEvent === 'undefined') globalThis.CustomEvent = class extends Event { constructor(type, options) { super(type); this.detail = options?.detail; } };
const historyKey = 'iron_workout_sessions_v1';
const activeKey = 'iron_active_session_v1';
const baseStorage = {
  getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: key => data.delete(key),
};
globalThis.localStorage = { ...baseStorage };
const bundle = await build({ entryPoints: ['src/utils/storage.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { completeWorkoutSession } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const make = id => ({ id, title: 'Test', date: '2026-10-27', startTime: '2026-10-27T10:00:00Z', durationSeconds: 100, completed: false, exercises: [{ id: `ex-${id}`, exerciseId: 'deleted-custom', exerciseName: 'My custom', equipmentType: 'machine', machineConfigId: 'gym-2:machine', sets: [{ id: `set-${id}`, setNumber: 1, weight: -30, reps: 10, completed: true, restSeconds: 100 }] }] });
const active = make('active');
const final = { ...active, completed: true, durationSeconds: 200, endTime: '2026-10-27T10:03:20Z' };
const older = { ...make('older'), completed: true };
const reset = (history = [older], current = active) => {
  data.clear(); events.length = 0; globalThis.localStorage = { ...baseStorage };
  if (history !== null) data.set(historyKey, JSON.stringify(history));
  if (current !== null) data.set(activeKey, JSON.stringify(current));
};
const assertFailureUnchanged = (operation = () => completeWorkoutSession(final)) => {
  const before = [...data.entries()];
  assert.throws(operation, /운동을 저장하지 못했습니다/);
  assert.deepEqual([...data.entries()], before);
  assert.equal(events.length, 0);
};
reset();
const finalBefore = JSON.stringify(final);
assert.deepEqual(completeWorkoutSession(final), [older]);
assert.equal(data.has(activeKey), false);
assert.deepEqual(JSON.parse(data.get(historyKey)), [final, older]);
assert.equal(JSON.stringify(final), finalBefore);
assert.deepEqual(events.map(event => event.type), ['iron_sessions_change', 'iron_active_session_change']);
assert.equal(events[1].detail, null);

reset(null);
assert.deepEqual(completeWorkoutSession(final), []);
assert.deepEqual(JSON.parse(data.get(historyKey)), [final]);
reset([{ ...final, durationSeconds: 1 }, older, { ...final, durationSeconds: 2 }]);
completeWorkoutSession(final);
assert.deepEqual(JSON.parse(data.get(historyKey)), [final, older]);

for (const raw of ['{broken', '{}', 'null', '[null]', '[{"id":"old","exercises":{}}]']) {
  reset(); data.set(historyKey, raw); assertFailureUnchanged();
}
for (const raw of ['{broken', '{}', 'null', '[]', '{"id":"different","exercises":[]}']) {
  reset(); data.set(activeKey, raw); assertFailureUnchanged();
}
reset([older], null); assertFailureUnchanged();
reset(); assertFailureUnchanged(() => completeWorkoutSession({ ...final, id: '' }));
reset(); assertFailureUnchanged(() => completeWorkoutSession({ ...final, completed: false }));
reset(); assertFailureUnchanged(() => completeWorkoutSession({ ...final, exercises: undefined }));

reset();
localStorage.getItem = () => { throw Error('read disabled'); };
assertFailureUnchanged();
reset();
localStorage.setItem = () => { throw Error('quota'); };
assertFailureUnchanged();
reset();
localStorage.setItem = (key, value) => { if (key === historyKey) return; baseStorage.setItem(key, value); };
assertFailureUnchanged();
reset();
localStorage.removeItem = key => { if (key === activeKey) throw Error('remove denied'); baseStorage.removeItem(key); };
assertFailureUnchanged();
reset();
localStorage.removeItem = key => { if (key !== activeKey) baseStorage.removeItem(key); };
assertFailureUnchanged();
reset(null);
localStorage.removeItem = key => { if (key === activeKey) throw Error('remove denied'); baseStorage.removeItem(key); };
assertFailureUnchanged();
reset();
let removed = false;
localStorage.removeItem = key => { baseStorage.removeItem(key); if (key === activeKey) removed = true; };
localStorage.getItem = key => { if (key === historyKey && removed) throw Error('verification unavailable'); return baseStorage.getItem(key); };
assertFailureUnchanged();

console.log('PASS completion atomic snapshots, signed/unknown record preservation, dedup, malformed/read failures, quota, silent writes, failed active removal, verification rollback and post-commit events');

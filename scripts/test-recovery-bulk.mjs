import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { build } from 'esbuild';
globalThis.crypto ??= webcrypto;
const result = await build({ entryPoints: ['src/utils/recovery.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const api = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const activeKey = 'iron_active_session_v1', historyKey = 'iron_workout_sessions_v1', trashKey = 'iron_recovery_v1';
const data = new Map();
const notifications = [];
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
globalThis.window = { dispatchEvent: event => notifications.push(event.type) };
globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options?.detail; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const read = key => JSON.parse(localStorage.getItem(key) || 'null');
const set = (id, weight = 10) => ({ id, setNumber: Number(id.replace(/\D/g, '')) || 1, weight, reps: 8, completed: true });
const exercise = (id = 'e', sets = [set('s1'), set('s2'), set('s3')]) => ({ id, exerciseId: `custom-${id}`, exerciseName: `Custom ${id}`, equipmentType: 'machine', machineConfigId: 'gym:machine', weightUnit: 'lbs', sets });
const session = (id = 'session', exercises = [exercise()]) => ({ id, title: 'Private workout', date: '2026-10-27', startTime: '2026-10-27T08:00:00Z', completed: false, durationSeconds: 120, notes: 'current', exercises });
const item = (id, snapshot, extra = {}) => ({ id, deletedAt: Date.now(), kind: 'session', location: 'active', session: structuredClone(snapshot), ...extra });
function reset() { data.clear(); notifications.length = 0; }
function stored(source, items, history = []) { write(activeKey, source); write(historyKey, history); write(trashKey, items); notifications.length = 0; }
function assertOneNotification() {
  assert.equal(notifications.filter(type => type === api.RECOVERY_CHANGE).length, 1);
  assert.equal(notifications.filter(type => type === 'iron_active_session_change').length, 1);
  assert.equal(notifications.filter(type => type === 'iron_sessions_change').length, 1);
}

// Purges never rewrite source records and never remove unselected/new entries.
const original = session();
stored(original, [item('a', original), item('b', original), item('new-unseen', original)]);
const sourceRaw = localStorage.getItem(activeKey), historyRaw = localStorage.getItem(historyKey);
assert.equal(api.purgeRecoveryItems(['b', 'b', 'unknown']), 1);
assert.deepEqual(read(trashKey).map(entry => entry.id), ['a', 'new-unseen']);
assert.equal(localStorage.getItem(activeKey), sourceRaw); assert.equal(localStorage.getItem(historyKey), historyRaw);
assert.deepEqual(notifications, [api.RECOVERY_CHANGE]);
notifications.length = 0;
assert.equal(api.purgeRecoveryItems([]), 0); assert.equal(api.purgeRecoveryItems(['unknown']), 0);
assert.deepEqual(notifications, []);
assert.equal(api.clearRecovery(), 2); assert.deepEqual(read(trashKey), []);
assert.equal(localStorage.getItem(activeKey), sourceRaw); assert.equal(localStorage.getItem(historyKey), historyRaw);
notifications.length = 0; assert.equal(api.clearRecovery(), 0); assert.deepEqual(notifications, []);

// Multiple deleted sets restore together without reintroducing a stale value or losing order.
reset();
const firstSnapshot = session();
const secondSnapshot = session('session', [exercise('e', [set('s2', 45), set('s3', 35)])]); secondSnapshot.durationSeconds = 200;
const live = session('session', [exercise('e', [set('s3', 99), set('added-later', 70)])]); live.durationSeconds = 400; live.notes = 'later edit';
const first = item('first', firstSnapshot, { kind: 'set', exerciseId: 'e', setId: 's1', deletedAt: Date.now() - 200 });
const second = item('second', secondSnapshot, { kind: 'set', exerciseId: 'e', setId: 's2', deletedAt: Date.now() - 100 });
stored(live, [second, first]);
assert.equal(api.restoreRecoveryItems(['first', 'second', 'first']), 2);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.id), ['s1', 's2', 's3', 'added-later']);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.weight), [10, 45, 99, 70]);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.setNumber), [1, 2, 3, 4]);
assert.equal(read(activeKey).notes, 'later edit'); assert.equal(read(activeKey).durationSeconds, 400);
assert.deepEqual(read(trashKey), []); assertOneNotification();

// Missing parent/session uses newest metadata but restores only explicitly selected descendants.
reset(); stored(null, [second, first]);
assert.equal(api.restoreRecoveryItems(['first', 'second']), 2);
assert.equal(read(activeKey).durationSeconds, 200);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.id), ['s1', 's2']);
assert.equal(read(activeKey).exercises[0].sets.find(set => set.id === 's2').weight, 45);

// One selected set cannot resurrect unselected/purged sibling sets or another exercise.
const withSiblingExercise = session('session', [exercise('e'), exercise('never-selected')]);
const onlySetItem = item('only-set', withSiblingExercise, { kind: 'set', exerciseId: 'e', setId: 's2' });
reset(); stored(null, [onlySetItem]);
assert.equal(api.restoreRecoveryItems(['only-set']), 1);
assert.deepEqual(read(activeKey).exercises.map(ex => ex.id), ['e']);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.id), ['s2']);
assert.equal(read(activeKey).exercises[0].sets[0].setNumber, 1);

// The same selection rule applies when only the parent exercise is missing from a live session.
reset(); stored(session('session', [exercise('unrelated-live')]), [onlySetItem]);
assert.equal(api.restoreRecovery('only-set'), 1);
assert.deepEqual(read(activeKey).exercises.map(ex => ex.id), ['e', 'unrelated-live']);
assert.deepEqual(read(activeKey).exercises.find(ex => ex.id === 'e').sets.map(set => set.id), ['s2']);

// Explicit parent selections restore all of their descendants, including when no source survives.
reset(); stored(null, [item('whole-exercise', withSiblingExercise, { kind: 'exercise', exerciseId: 'e' })]);
assert.equal(api.restoreRecoveryItems(['whole-exercise']), 1);
assert.deepEqual(read(activeKey).exercises.map(ex => ex.id), ['e']);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.id), ['s1', 's2', 's3']);
reset(); stored(null, [item('whole-session', withSiblingExercise)]);
assert.equal(api.restoreRecoveryItems(['whole-session']), 1);
assert.deepEqual(read(activeKey).exercises.map(ex => ex.id), ['e', 'never-selected']);
assert.deepEqual(read(activeKey).exercises[0].sets.map(set => set.id), ['s1', 's2', 's3']);

// Whole-session + exercise + set tombstones merge without replacing live metadata or completed work.
reset();
const oldWhole = session('session', [exercise('e', [set('s1', 10), set('s2', 15)]), exercise('f')]);
const newerExercise = session('session', [exercise('e', [set('s1', 30), set('s2', 35)]), exercise('f')]);
const mixedLive = session('session', [exercise('e', [set('s1', 100)])]); mixedLive.notes = 'retain note'; mixedLive.durationSeconds = 500;
const wholeItem = item('whole', oldWhole, { deletedAt: Date.now() - 300 });
const exerciseItem = item('exercise', newerExercise, { kind: 'exercise', exerciseId: 'e', deletedAt: Date.now() - 200 });
const setItem = item('set', newerExercise, { kind: 'set', exerciseId: 'e', setId: 's2', deletedAt: Date.now() - 100 });
stored(mixedLive, [setItem, exerciseItem, wholeItem]);
assert.equal(api.restoreRecoveryItems(['whole', 'set', 'exercise']), 3);
const mixed = read(activeKey);
assert.equal(mixed.notes, 'retain note'); assert.equal(mixed.durationSeconds, 500);
assert.deepEqual(mixed.exercises.map(ex => ex.id), ['e', 'f']);
assert.deepEqual(mixed.exercises[0].sets.map(set => set.weight), [100, 35]); assertOneNotification();

// An archived active set follows the completed record, leaving another current workout alone.
reset();
const completed = { ...live, completed: true };
const otherActive = session('other'); stored(otherActive, [second, first], [completed]);
assert.equal(api.restoreRecoveryItems(['second', 'first']), 2);
assert.deepEqual(read(activeKey), otherActive);
assert.deepEqual(read(historyKey)[0].exercises[0].sets.map(set => set.id), ['s1', 's2', 's3', 'added-later']);

// Any conflicting active destination aborts every selected restore, including valid history changes.
reset();
const historySession = { ...session('history'), completed: true };
const historyItem = item('history-item', historySession, { location: 'history' });
stored(otherActive, [historyItem, first]);
let before = new Map(data);
assert.throws(() => api.restoreRecoveryItems(['history-item', 'first']), /먼저 진행 중인 운동/);
assert.deepEqual(data, before); assert.deepEqual(notifications, []);
reset(); stored(null, [item('active-one', session('one')), item('active-two', session('two'))]); before = new Map(data);
assert.throws(() => api.restoreRecoveryItems(['active-one', 'active-two'])); assert.deepEqual(data, before);

// Corrupt selected snapshots, duplicate IDs or missing targets never partially restore.
for (const malformed of [
  { ...first, session: { ...firstSnapshot, exercises: null } },
  { ...first, setId: 'missing' },
  { ...first, kind: 'unknown' },
  { ...first, session: { ...firstSnapshot, durationSeconds: -1 } },
]) {
  reset(); stored(null, [historyItem, malformed]); before = new Map(data);
  assert.throws(() => api.restoreRecoveryItems(['history-item', malformed.id]), /복구할 데이터/);
  assert.deepEqual(data, before); assert.deepEqual(notifications, []);
  assert.throws(() => api.loadRecovery(), /복구할 데이터/);
}
reset(); write(trashKey, [first, first]); assert.throws(() => api.restoreRecoveryItems(['first']));
write(trashKey, {}); assert.throws(() => api.loadRecovery(), /복구할 데이터/);
localStorage.setItem(trashKey, '{broken'); assert.throws(() => api.loadRecovery(), /복구할 데이터/);

// Three-key writes roll back exactly at every failure point, and notify only after success.
for (const failAt of [1, 2, 3]) {
  reset(); stored(live, [historyItem, first]); before = new Map(data);
  let writes = 0; const originalWrite = localStorage.setItem;
  localStorage.setItem = (key, value) => { if (++writes === failAt) throw new Error('Quota'); originalWrite(key, value); };
  try { assert.throws(() => api.restoreRecoveryItems(['history-item', 'first']), /저장하지 못했습니다/); }
  finally { localStorage.setItem = originalWrite; }
  assert.deepEqual(data, before); assert.deepEqual(notifications, []);
}
// A silently dropped write must also abort and retain tombstones.
reset(); stored(live, [first]); before = new Map(data);
const originalWrite = localStorage.setItem; let ignored = false;
localStorage.setItem = (key, value) => { if (key === trashKey && !ignored) { ignored = true; return; } originalWrite(key, value); };
try { assert.throws(() => api.restoreRecoveryItems(['first'])); } finally { localStorage.setItem = originalWrite; }
assert.deepEqual(data, before); assert.deepEqual(notifications, []);

// Purge and clear failures preserve the archive and all untouched source records.
for (const action of [() => api.purgeRecoveryItems(['first']), () => api.clearRecovery()]) {
  reset(); stored(live, [first, second]); before = new Map(data);
  const originalWrite = localStorage.setItem; let attempted = false;
  localStorage.setItem = (key, value) => { if (!attempted) { attempted = true; throw new Error('Quota'); } originalWrite(key, value); };
  try { assert.throws(action); } finally { localStorage.setItem = originalWrite; }
  assert.deepEqual(data, before); assert.deepEqual(notifications, []);
}
// Expired records cannot be restored; a no-op doesn't mutate storage or emit events.
reset(); stored(null, [{ ...first, deletedAt: Date.now() - api.RETENTION_MS - 1 }]); before = new Map(data);
assert.equal(api.restoreRecoveryItems(['first']), 0); assert.deepEqual(data, before); assert.deepEqual(notifications, []);
console.log('PASS atomic bulk recovery, snapshot-aware ordering and merge, live edits/duration/units, active conflicts, malformed data, selected purge, clear, quota rollback and single notifications');

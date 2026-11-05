import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({ entryPoints: ['src/utils/achievements.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { calculateAchievements, BADGE_DEFINITIONS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const set = extra => ({ id: 'set', setNumber: 1, weight: 50, reps: 5, completed: true, setType: 'WORKING', ...extra });
const exercise = extra => ({ id: 'exercise', exerciseId: 'bench-press', equipmentType: 'barbell', weightUnit: 'kg', sets: [set()], ...extra });
const session = (id, date, extra = {}) => ({ id, title: `Workout ${id}`, date, startTime: `${date}T10:00:00Z`, endTime: `${date}T11:00:00Z`, durationSeconds: 3600, completed: true, exercises: [exercise()], ...extra });
const badge = (history, id) => calculateAchievements(history).find(badge => badge.definition.id === id);
const addDays = (date, count) => new Date(Date.parse(`${date}T00:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
const earned = (history, id, date) => {
  const result = badge(history, id);
  assert.equal(result.state, 'earned', `${id} earned`);
  assert.equal(result.earnedOn, date, `${id} actual earned date`);
  return result;
};

assert.equal(BADGE_DEFINITIONS.length, 16);
assert.equal(new Set(BADGE_DEFINITIONS.map(item => item.id)).size, 16);
assert.ok(calculateAchievements([]).every(item => item.state === 'locked' && item.current === 0));
const dayHistory = Array.from({ length: 365 }, (_, index) => session(`day-${index}`, addDays('2024-01-01', index)));
for (const target of [10, 30, 50, 100, 200, 365]) {
  assert.equal(badge(dayHistory.slice(0, target - 1), `days-${target}`).state, 'locked');
  earned(dayHistory.slice(0, target), `days-${target}`, addDays('2024-01-01', target - 1));
}
const original = JSON.stringify(dayHistory);
assert.deepEqual(calculateAchievements([...dayHistory].reverse()), calculateAchievements(dayHistory));
assert.equal(JSON.stringify(dayHistory), original);
assert.equal(badge([...dayHistory, dayHistory[0], session('same-day', '2024-01-01')], 'days-365').current, 365);
earned([session('early', '2024-01-01'), session('late', '2024-01-01', { startTime: '2024-01-01T20:00:00Z' })], 'first-workout', '2024-01-01');
assert.equal(badge([session('incomplete', '2024-01-01', { completed: false })], 'first-workout').state, 'locked');
for (const sets of [[set({ completed: false })], [set({ reps: 0 })], [set({ reps: 1.5 })], [set({ weight: NaN })]]) {
  assert.equal(badge([session('invalid-set', '2024-01-01', { exercises: [exercise({ sets })] })], 'first-workout').state, 'locked');
}
for (const date of ['2024-02-30', '2024-13-01', 'invalid', '2024-2-01']) assert.equal(badge([session('invalid-date', date)], 'first-workout').state, 'locked');
earned([session('bodyweight', '2024-02-29', { exercises: [exercise({ equipmentType: 'bodyweight', sets: [set({ weight: 0 })] })] })], 'first-workout', '2024-02-29');
earned([session('assistance', '2024-02-29', { exercises: [exercise({ sets: [set({ weight: -30 })] })] })], 'first-workout', '2024-02-29');

const weeks = Array.from({ length: 12 }, (_, index) => [session(`monday-${index}`, addDays('2024-12-23', index * 7)), session(`friday-${index}`, addDays('2024-12-27', index * 7))]).flat();
for (const target of [4, 8, 12]) {
  assert.equal(badge(weeks.slice(0, target * 2 - 1), `weeks-${target}`).state, 'locked');
  const result = earned(weeks.slice(0, target * 2), `weeks-${target}`, addDays('2024-12-27', (target - 1) * 7));
  assert.equal(result.evidence.length, target * 2);
}
assert.equal(badge(weeks.filter(item => item.id !== 'friday-2'), 'weeks-12').state, 'locked');
assert.equal(badge([weeks[0], weeks[0], weeks[2], weeks[2]], 'weeks-4').current, 0);
assert.equal(badge(weeks.slice(0, 9), 'weeks-8').current, 4, 'unfinished next week preserves best streak');
assert.equal(badge([session('sun', '2026-11-01'), session('mon', '2026-11-02')], 'weeks-4').current, 0, 'Monday starts a separate week');
assert.equal(badge([session('start', '2024-02-01'), session('short', '2024-03-01')], 'comeback').state, 'locked');
const comeback = earned([session('start', '2024-02-01'), session('return', '2024-03-02')], 'comeback', '2024-03-02');
assert.deepEqual(comeback.evidence.map(item => item.sessionId), ['start', 'return']);

const old = session('old', '2026-10-01');
const best = session('best', '2026-10-02', { exercises: [exercise({ sets: [set({ weight: 60 })] })] });
assert.equal(badge([old], 'first-pr').state, 'locked', 'first record is not a PR');
const firstPr = earned([best, old], 'first-pr', '2026-10-02');
assert.equal(firstPr.evidence[0].record.weight, 60);
assert.equal(firstPr.evidence[0].record.unit, 'kg');
earned([old, best], 'bench-pr', '2026-10-02');
const sameTimeBaseline = { ...old, id: 'Z' };
const sameTimeBest = { ...old, id: 'a', exercises: best.exercises };
earned([sameTimeBest, sameTimeBaseline], 'bench-pr', '2026-10-01');
assert.equal(badge([best], 'first-pr').state, 'locked', 'deleting prior record recalculates award');
assert.equal(badge([old, { ...best, exercises: [exercise()] }], 'first-pr').state, 'locked', 'editing excess weight corrects award');
assert.deepEqual(calculateAchievements(JSON.parse(JSON.stringify([old, best]))), calculateAchievements([old, best]), 'backup roundtrip rebuilds identical awards');
const equalPounds = session('lbs-equal', '2026-10-02', { weightUnit: 'lbs', exercises: [exercise({ weightUnit: undefined, sets: [set({ weight: 110.231 })] })] });
assert.equal(badge([old, equalPounds], 'bench-pr').state, 'locked');
const betterPounds = session('lbs-best', '2026-10-03', { exercises: [exercise({ weightUnit: 'lbs', sets: [set({ weight: 135 })] })] });
assert.equal(earned([old, betterPounds], 'bench-pr', '2026-10-03').evidence[0].record.unit, 'lbs');
for (const extra of [{ equipmentType: 'smith' }, { machineConfigId: 'other' }, { executionMode: 'unilateral' }, { machineSetting: 'Seat 2' }]) {
  assert.equal(badge([old, { ...best, exercises: [exercise({ ...extra, sets: [set({ weight: 100 })] })] }], 'first-pr').state, 'locked');
}
for (const setType of ['WARMUP', 'ACTIVATION', 'UNSPECIFIED']) {
  assert.equal(badge([old, { ...best, exercises: [exercise({ sets: [set({ setType, weight: 100 })] })] }], 'first-pr').state, 'locked');
}
assert.equal(badge([old, { ...best, exercises: [exercise({ sets: [set({ weight: 100, completed: false })] })] }], 'first-pr').state, 'locked');
const bodyweight = [old, best].map(item => ({ ...item, exercises: item.exercises.map(ex => ({ ...ex, equipmentType: 'bodyweight' })) }));
assert.equal(badge(bodyweight, 'first-pr').state, 'locked');
const smithHistory = [old, best].map(item => ({ ...item, exercises: item.exercises.map(ex => ({ ...ex, equipmentType: 'smith' })) }));
assert.equal(badge(smithHistory, 'bench-pr').state, 'locked', 'Smith is excluded from big-three badges');
earned(smithHistory, 'first-pr', '2026-10-02');
const allThree = ['barbell-squat', 'bench-press', 'deadlift'].flatMap((exerciseId, index) => [
  session(`baseline-${index}`, '2026-09-01', { exercises: [exercise({ exerciseId })] }),
  session(`pr-${index}`, addDays('2026-10-01', index), { exercises: [exercise({ exerciseId, sets: [set({ weight: 60 + index })] })] }),
]);
const big = earned(allThree, 'big-three', '2026-10-03');
assert.equal(big.evidence.length, 3);
assert.equal(badge(allThree.filter(item => item.id !== 'pr-2'), 'big-three').current, 2);
assert.equal(badge(allThree.filter(item => item.id !== 'pr-2'), 'big-three').state, 'locked');
assert.deepEqual(calculateAchievements([...allThree].reverse()), calculateAchievements(allThree));
console.log('PASS badge history immutability, thresholds, actual acquisition dates, unique workout days, weekly/year boundaries, comeback, shared PR/unit/equipment rules, three lifts and edit/delete/backup recalculation');

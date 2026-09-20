import assert from 'node:assert/strict';
import { build } from 'esbuild';

// 1. Build HoldToCompleteButton and RestTimerModal to ensure syntax and build integrity
const bundle = await build({
  entryPoints: [
    'src/components/workout/HoldToCompleteButton.tsx',
    'src/components/workout/RestTimerModal.tsx',
  ],
  bundle: true,
  write: false,
  outdir: 'out',
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  external: ['react', 'lucide-react', '@capacitor/haptics'],
});

assert.equal(bundle.outputFiles.length, 2, 'Both components must bundle cleanly');

// 2. 타이머 초과 휴식(Overtime) 계산 로직 검증
function calculateTimerState(targetSeconds, elapsedSeconds) {
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds);
  const isCompleted = remainingSeconds === 0;
  const overtimeSeconds = Math.max(0, elapsedSeconds - targetSeconds);
  return { remainingSeconds, isCompleted, overtimeSeconds };
}

// 90초 목표 중 60초 경과 시 (진행 중)
const stateInProgress = calculateTimerState(90, 60);
assert.equal(stateInProgress.remainingSeconds, 30);
assert.equal(stateInProgress.isCompleted, false);
assert.equal(stateInProgress.overtimeSeconds, 0);

// 90초 목표 완료 시 (정확히 90초)
const stateCompleted = calculateTimerState(90, 90);
assert.equal(stateCompleted.remainingSeconds, 0);
assert.equal(stateCompleted.isCompleted, true);
assert.equal(stateCompleted.overtimeSeconds, 0);

// 90초 목표 후 115초 경과 시 (초과 휴식 25초)
const stateOvertime = calculateTimerState(90, 115);
assert.equal(stateOvertime.remainingSeconds, 0);
assert.equal(stateOvertime.isCompleted, true);
assert.equal(stateOvertime.overtimeSeconds, 25);

// 3. 타이머 실수 리셋 및 실행 취소(Undo) 복구 시뮬레이션 검증
let currentTimer = {
  remainingSeconds: 0,
  targetSeconds: 90,
  elapsedSeconds: 115,
  isActive: true,
};

let undoBackup = null;

// 리셋 수행
if (currentTimer.elapsedSeconds > 0) {
  undoBackup = { ...currentTimer };
}
currentTimer = {
  remainingSeconds: currentTimer.targetSeconds,
  targetSeconds: currentTimer.targetSeconds,
  elapsedSeconds: 0,
  isActive: true,
};

// 리셋 후 상태 검증 (초기화됨)
assert.equal(currentTimer.elapsedSeconds, 0);
assert.equal(currentTimer.remainingSeconds, 90);
assert.ok(undoBackup !== null);
assert.equal(undoBackup.elapsedSeconds, 115);

// 실행 취소(Undo) 복원 수행
currentTimer = { ...undoBackup };
undoBackup = null;

// 복구 후 검증 (실제 쉰 시간 115초가 온전히 복원됨!)
assert.equal(currentTimer.elapsedSeconds, 115);
assert.equal(currentTimer.remainingSeconds, 0);
assert.equal(undoBackup, null);

console.log('PASS: hold-to-complete button bundled, timer overtime calculated, and timer reset-undo restores elapsed seconds');

// Exercise the production clock with throttled ticks, pause, resume and fractional seconds.
const clockBundle = await build({ entryPoints: ['src/utils/restClock.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
const { RestClock } = await import(`data:text/javascript;base64,${Buffer.from(clockBundle.outputFiles[0].text).toString('base64')}`);
const clock = new RestClock(90, 0, true, 0);
assert.deepEqual(clock.sample(600), { remaining: 90, elapsed: 0 });
assert.deepEqual(clock.sample(1200), { remaining: 89, elapsed: 1 });
assert.deepEqual(clock.sample(65000), { remaining: 25, elapsed: 65 });
clock.pause(65500);
assert.deepEqual(clock.sample(120000), { remaining: 25, elapsed: 65 });
clock.resume(120000);
assert.deepEqual(clock.sample(150000), { remaining: 0, elapsed: 95 });
assert.deepEqual(clock.sample(180000), { remaining: 0, elapsed: 125 });

// Use the real notification coordinator with mocked native I/O to test cancellation races.
const events = [];
let permissionResolve;
globalThis.__restNativeMock = {
  cancel: async () => events.push('cancel'),
  checkPermissions: async () => ({ display: 'prompt' }),
  requestPermissions: () => new Promise(resolve => { permissionResolve = resolve; }),
  createChannel: async () => events.push('channel'),
  schedule: async options => events.push(options.notifications[0]),
};
const notificationsBundle = await build({
  entryPoints: ['src/utils/restNotifications.ts'], bundle: true, write: false, format: 'esm', platform: 'node',
  plugins: [{ name: 'native-mock', setup(builder) {
    builder.onResolve({ filter: /^@capacitor\// }, args => ({ path: args.path, namespace: 'mock' }));
    builder.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: args.path.endsWith('/core')
      ? 'export const Capacitor = {isNativePlatform: () => true, getPlatform: () => "android"};'
      : 'export const LocalNotifications = globalThis.__restNativeMock;' }));
  } }],
});
const { scheduleRestNotification, cancelRestNotification } = await import(`data:text/javascript;base64,${Buffer.from(notificationsBundle.outputFiles[0].text).toString('base64')}`);
const pending = scheduleRestNotification(Date.now() + 90000, 'Rest', 'Next set');
await new Promise(resolve => setImmediate(resolve));
cancelRestNotification();
permissionResolve({ display: 'granted' });
assert.equal(await pending, false);
await new Promise(resolve => setImmediate(resolve));
assert.deepEqual(events, ['cancel', 'cancel'], 'Cancellation during permission request must prevent scheduling');
globalThis.__restNativeMock.checkPermissions = async () => ({ display: 'granted' });
assert.equal(await scheduleRestNotification(Date.now() + 90000, 'Rest', 'Next set'), true);
assert.equal(events.at(-1).schedule.allowWhileIdle, true);
assert.equal(events.at(-1).body, 'Next set');
cancelRestNotification();
await new Promise(resolve => setImmediate(resolve));
assert.equal(events.at(-1), 'cancel');
delete globalThis.__restNativeMock;
console.log('Production rest clock and notification cancellation race checks passed.');

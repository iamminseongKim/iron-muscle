import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({
  entryPoints: ['src/utils/calculations.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});

const {
  calculateProgression,
  calculateSessionVolume,
  convertWeight,
  calculate1RM,
  KG_TO_LBS,
} = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

// 1. 추정 1RM 공식 검증 (Brzycki + RPE)
// 25kg x 15 reps (effective 18 reps with rpe 9/8)
const rm25kg = calculate1RM(25, 15);
assert.equal(rm25kg, 40.9); // default rpe undefined -> 25 * 36 / 22 = 40.9

// 2. 단일 단위(kg) 성장률 추적 검증
const historyKg = [
  {
    id: 's1',
    date: '2026-09-01',
    durationSeconds: 3000,
    completed: true,
    exercises: [
      {
        id: 'e1',
        exerciseId: 'leg-extension',
        equipmentType: 'machine',
        machineBrand: '신고',
        weightUnit: 'kg',
        sets: [{ id: 'set-1', setNumber: 1, weight: 20, reps: 10, completed: true }],
      },
    ],
  },
  {
    id: 's2',
    date: '2026-09-08',
    durationSeconds: 3000,
    completed: true,
    exercises: [
      {
        id: 'e2',
        exerciseId: 'leg-extension',
        equipmentType: 'machine',
        machineBrand: '신고',
        weightUnit: 'kg',
        sets: [{ id: 'set-2', setNumber: 1, weight: 30, reps: 10, completed: true }],
      },
    ],
  },
];

const progKg = calculateProgression('leg-extension', historyKg);
assert.equal(progKg.records.length, 2);
assert.equal(progKg.records[0].weightUnit, 'kg');
assert.equal(progKg.records[0].weight, 20);
assert.equal(progKg.records[1].weightUnit, 'kg');
assert.equal(progKg.records[1].weight, 30);
assert.equal(progKg.growthRate, 49.8); // (40 - 26.7) / 26.7 = 49.8%

// 3. 사용자 버그 시나리오 검증: 신고 25kg x 15회 vs 싸이벡스 40lbs x 15회
// (유저 신고: 40lbs가 40kg으로 오표기되거나 원시 숫자 비교로 59.9% 뻥튀기되던 오류)
const historyMixed = [
  {
    id: 's-shinko',
    date: '2026-09-09',
    durationSeconds: 3600,
    completed: true,
    exercises: [
      {
        id: 'ex-1',
        exerciseId: 'leg-extension',
        equipmentType: 'machine',
        machineBrand: '신고',
        weightUnit: 'kg',
        sets: [{ id: 'set-1', setNumber: 1, weight: 25, reps: 15, rpe: 7, completed: true }],
      },
    ],
  },
  {
    id: 's-cybex',
    date: '2026-09-12',
    durationSeconds: 3600,
    completed: true,
    exercises: [
      {
        id: 'ex-2',
        exerciseId: 'leg-extension',
        equipmentType: 'machine',
        machineBrand: 'Cybex',
        weightUnit: 'lbs',
        sets: [{ id: 'set-2', setNumber: 1, weight: 40, reps: 15, rpe: 7, completed: true }],
      },
    ],
  },
];

const progMixed = calculateProgression('leg-extension', historyMixed);
assert.equal(progMixed.records.length, 2);

// 첫 번째 기록 (신고)
assert.equal(progMixed.records[0].date, '2026-09-09');
assert.equal(progMixed.records[0].brand, '신고');
assert.equal(progMixed.records[0].weight, 25);
assert.equal(progMixed.records[0].weightUnit, 'kg');
assert.equal(progMixed.records[0].max1RM, 47.4);

// 두 번째 기록 (Cybex): 반드시 40lbs 및 단위 lbs 보존!
assert.equal(progMixed.records[1].date, '2026-09-12');
assert.equal(progMixed.records[1].brand, 'Cybex');
assert.equal(progMixed.records[1].weight, 40);
assert.equal(progMixed.records[1].weightUnit, 'lbs');
assert.equal(progMixed.records[1].max1RM, 75.8);

// 성장률 계산 검증: 단위를 통일하지 않은 단순 수치 비교(75.8 vs 47.4 -> +59.9%)가 아니라,
// 단위(kg) 정규화 비교(34.38kg vs 47.4kg)로 -27.5%가 되어야 함!
assert.ok(progMixed.growthRate < 0, `Expected negative growth rate, got ${progMixed.growthRate}`);
assert.equal(progMixed.growthRate, -27.5);

// 단위 변환 함수 검증: 75.8 lbs -> 34.5 kg
assert.equal(convertWeight(75.8, 'lbs', 'kg'), 34.5);

// 4. 세션 총 볼륨 단위 변환 검증
const sessionLbs = historyMixed[1];
const volKg = calculateSessionVolume(sessionLbs, 'kg');
const volLbs = calculateSessionVolume(sessionLbs, 'lbs');
assert.equal(volKg, Math.round((40 / KG_TO_LBS) * 15)); // 272 kg
assert.equal(volLbs, 40 * 15); // 600 lbs

console.log('PASS: progression preserves weight units (kg/lbs), normalizes growth rate, and converts session volume');

import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/utils/sessionMerge.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});

const { mergeDaySessions } = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);

// 1. 단일 세션 전달 시 그대로 반환
const singleSession = {
  id: 's-1',
  title: '가슴 운동',
  date: '2026-09-13',
  startTime: '2026-09-13T10:00:00Z',
  durationSeconds: 1800,
  exercises: [
    {
      id: 'ex-1',
      exerciseId: 'bench-press',
      exerciseName: '바벨 벤치프레스',
      equipmentType: 'barbell',
      sets: [
        { id: 'set-1', setNumber: 1, weight: 80, reps: 10, completed: true, restSeconds: 90 },
      ],
    },
  ],
  completed: true,
};

const resultSingle = mergeDaySessions([singleSession]);
assert.equal(resultSingle.id, 's-1');
assert.equal(resultSingle.durationSeconds, 1800);

// 2. 두 개의 세션 병합 테스트 (동일 운동 포함)
const sessionA = {
  id: 's-10',
  title: '오전 가슴',
  date: '2026-09-13',
  startTime: '2026-09-13T09:00:00Z',
  durationSeconds: 2400, // 40분
  notes: '오전에 가슴 집중',
  targetCategories: ['chest'],
  exercises: [
    {
      id: 'ex-10',
      exerciseId: 'bench-press',
      exerciseName: '바벨 벤치프레스',
      equipmentType: 'barbell',
      loadType: 'barbell',
      weightUnit: 'kg',
      sets: [
        { id: 'set-10-1', setNumber: 1, weight: 60, reps: 12, completed: true, restSeconds: 60 },
        { id: 'set-10-2', setNumber: 2, weight: 80, reps: 8, completed: true, restSeconds: 90 },
      ],
    },
    {
      id: 'ex-11',
      exerciseId: 'incline-db-press',
      exerciseName: '인클라인 덤벨 프레스',
      equipmentType: 'dumbbell',
      loadType: 'dumbbell',
      weightUnit: 'kg',
      sets: [
        { id: 'set-11-1', setNumber: 1, weight: 24, reps: 10, completed: true, restSeconds: 60 },
      ],
    },
  ],
  completed: true,
};

const sessionB = {
  id: 's-20',
  title: '오후 가슴 & 삼두',
  date: '2026-09-13',
  startTime: '2026-09-13T17:00:00Z',
  durationSeconds: 1800, // 30분
  notes: '오후에 삼두 보완',
  targetCategories: ['chest', 'arms'],
  exercises: [
    {
      id: 'ex-20',
      exerciseId: 'bench-press', // 동일 종목!
      exerciseName: '바벨 벤치프레스',
      equipmentType: 'barbell',
      loadType: 'barbell',
      weightUnit: 'kg',
      sets: [
        { id: 'set-20-1', setNumber: 1, weight: 85, reps: 5, completed: true, restSeconds: 120 },
      ],
    },
    {
      id: 'ex-21',
      exerciseId: 'triceps-pushdown',
      exerciseName: '케이블 트라이셉스 푸시다운',
      equipmentType: 'cable',
      loadType: 'cable',
      weightUnit: 'kg',
      sets: [
        { id: 'set-21-1', setNumber: 1, weight: 35, reps: 15, completed: true, restSeconds: 45 },
      ],
    },
  ],
  completed: true,
};

const merged = mergeDaySessions([sessionA, sessionB]);

// 검증 1: 소요 시간 합산 (2400 + 1800 = 4200초)
assert.equal(merged.durationSeconds, 4200, '소요 시간은 두 세션의 합산이어야 합니다.');

// 검증 2: 제목 병합
assert.equal(merged.title, '오전 가슴 + 오후 가슴 & 삼두');

// 검증 3: 메모 병합
assert.equal(merged.notes, '오전에 가슴 집중\n\n오후에 삼두 보완');

// 검증 4: 종목 병합 및 세트 번호 재정렬
// 벤치프레스는 세션A(2세트) + 세션B(1세트)가 합쳐져 총 3세트가 되어야 함
assert.equal(merged.exercises.length, 3, '총 종목 수는 3개여야 합니다 (벤치프레스, 인클라인덤벨, 푸시다운)');

const mergedBench = merged.exercises.find((e) => e.exerciseId === 'bench-press');
assert.ok(mergedBench, '벤치프레스가 존재해야 합니다.');
assert.equal(mergedBench.sets.length, 3, '벤치프레스 세트는 총 3개여야 합니다.');
assert.equal(mergedBench.sets[0].setNumber, 1);
assert.equal(mergedBench.sets[1].setNumber, 2);
assert.equal(mergedBench.sets[2].setNumber, 3);
assert.equal(mergedBench.sets[2].weight, 85);
assert.equal(mergedBench.sets[2].restSeconds, 120);

// 검증 5: 타겟 부위 통합 (chest, arms)
assert.ok(merged.targetCategories.includes('chest'));
assert.ok(merged.targetCategories.includes('arms'));

console.log('PASS: mergeDaySessions combines durations, exercises, renumbers sets, and merges notes/titles correctly.');

import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/utils/aiPromptGenerator.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});

const {
  filterSessionsForAiExport,
  extractAvailableBodyParts,
  generateAiCoachingMarkdown,
  matchesBodyPart,
} = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

const dummySessions = [
  {
    id: 's-1',
    date: '2026-09-13',
    durationSeconds: 3600,
    title: '가슴 & 이두 & 삼두',
    exercises: [
      {
        id: 'e-1',
        exerciseId: 'bench-press',
        exerciseName: '바벨 벤치프레스',
        equipmentType: 'barbell',
        sets: [{ setNumber: 1, weight: 80, reps: 10, restSeconds: 90, completed: true }],
      },
      {
        id: 'e-2',
        exerciseId: 'biceps-curl',
        exerciseName: '덤벨 이두 컬',
        equipmentType: 'dumbbell',
        sets: [{ setNumber: 1, weight: 14, reps: 12, restSeconds: 60, completed: true }],
      },
      {
        id: 'e-3',
        exerciseId: 'triceps-pushdown',
        exerciseName: '케이블 삼두 푸시다운',
        equipmentType: 'cable',
        sets: [{ setNumber: 1, weight: 30, reps: 15, restSeconds: 60, completed: true }],
      },
    ],
  },
  {
    id: 's-2',
    date: '2026-09-10',
    durationSeconds: 3000,
    title: '등 & 하체',
    exercises: [
      {
        id: 'e-4',
        exerciseId: 'lat-pulldown',
        exerciseName: '랫풀다운',
        equipmentType: 'cable',
        sets: [{ setNumber: 1, weight: 60, reps: 10, restSeconds: 90, completed: true }],
      },
      {
        id: 'e-5',
        exerciseId: 'squat',
        exerciseName: '바벨 백스쿼트',
        equipmentType: 'barbell',
        sets: [{ setNumber: 1, weight: 100, reps: 8, restSeconds: 120, completed: true }],
      },
    ],
  },
];

// 1. matchesBodyPart 판별 검증
assert.equal(matchesBodyPart(dummySessions[0].exercises[0], 'chest'), true);
assert.equal(matchesBodyPart(dummySessions[0].exercises[0], 'back'), false);
assert.equal(matchesBodyPart(dummySessions[0].exercises[1], 'biceps'), true);
assert.equal(matchesBodyPart(dummySessions[0].exercises[2], 'triceps'), true);
assert.equal(matchesBodyPart(dummySessions[0].exercises[1], 'arms'), true);
assert.equal(matchesBodyPart(dummySessions[1].exercises[0], 'back'), true);
assert.equal(matchesBodyPart(dummySessions[1].exercises[1], 'legs'), true);

// 2. 운동 부위별 필터링 검증
const chestFiltered = filterSessionsForAiExport(dummySessions, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'chest',
});
assert.equal(chestFiltered.length, 1);
assert.equal(chestFiltered[0].exercises.length, 1);
assert.equal(chestFiltered[0].exercises[0].exerciseId, 'bench-press');

const armsFiltered = filterSessionsForAiExport(dummySessions, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'arms',
});
assert.equal(armsFiltered.length, 1);
assert.equal(armsFiltered[0].exercises.length, 2); // biceps-curl + triceps-pushdown

// 3. 부위별 집계 검증 (extractAvailableBodyParts)
const bodyPartSummary = extractAvailableBodyParts(dummySessions);
const chestSummary = bodyPartSummary.find((b) => b.id === 'chest');
assert.ok(chestSummary);
assert.equal(chestSummary.totalSets, 1);
assert.equal(chestSummary.sessionCount, 1);

const markdown = generateAiCoachingMarkdown(chestFiltered, { language: 'ko', scope: 'all', selectedDate: '2026-09-13', selectedBodyPart: 'chest' });
assert.ok(markdown.includes('v3.0'));
assert.ok(markdown.includes('처방과 실제 수행'));
assert.ok(markdown.includes('본세트'));
assert.ok(markdown.includes('단일 세션만으로 오버트레이닝을 진단하지 마세요'));
assert.ok(!markdown.includes('4가지 핵심 질문'));
console.log('PASS body part matching, filtering, set counting, and adaptive evidence-based coaching prompt');

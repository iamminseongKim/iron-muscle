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

// 4. 상황별/부위별 맞춤형 AI 프롬프트 멘트 검증
// 4-1. 가슴 특화 멘트
const mdChest = generateAiCoachingMarkdown(chestFiltered, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'chest',
});
assert.ok(mdChest.includes('대흉근 상부/중부/하부 각도 밸런스'));
assert.ok(mdChest.includes('프레스 중량 및 점진적 과부하 달성도'));
assert.ok(mdChest.includes('가슴 집중 보완을 위한 4주 증량 프로그램'));

// 4-2. 등 특화 멘트
const backFiltered = filterSessionsForAiExport(dummySessions, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'back',
});
const mdBack = generateAiCoachingMarkdown(backFiltered, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'back',
});
assert.ok(mdBack.includes('등 너비(광배) vs 두께(승모/능형근) 밸런스'));
assert.ok(mdBack.includes('척추기립근 및 허리 피로도 관리'));

// 4-3. 팔/이두/삼두 특화 멘트
const mdArms = generateAiCoachingMarkdown(armsFiltered, {
  scope: 'all',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'arms',
});
assert.ok(mdArms.includes('팔 둘레 1인치 성장을 위한 4주 슈퍼세트/드롭세트'));
assert.ok(mdArms.includes('팔꿈치/손목 관절 부담 관리'));

// 4-4. 하루(당일) 전체 분석 멘트
const daySessions = filterSessionsForAiExport(dummySessions, {
  scope: 'day',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'all',
});
const mdDay = generateAiCoachingMarkdown(daySessions, {
  scope: 'day',
  selectedDate: '2026-09-13',
  selectedBodyPart: 'all',
});
assert.ok(mdDay.includes('오늘 세션 강도 및 RPE 적절성'));
assert.ok(mdDay.includes('내일/다음 세션을 위한 회복 및 식단 가이드'));

console.log('PASS: Body part matching, filtering, set counting, and specialized AI coaching prompts all verified.');

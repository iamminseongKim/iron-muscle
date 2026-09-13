import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: [
    'src/utils/bodyPartDetector.ts',
    'src/data/exercises.ts',
    'src/utils/exerciseSearch.ts'
  ],
  bundle: true,
  write: false,
  outdir: 'out',
  platform: 'node',
  format: 'esm'
});

const modules = await Promise.all(
  result.outputFiles.map(f => import(`data:text/javascript;base64,${Buffer.from(f.text).toString('base64')}`))
);

const {
  detectBodyPartsFromExercises,
  countExercisesByBodyPart,
  formatWorkoutTitleFromParts,
  mapPartIdsToCategories
} = modules[0];

const { EXERCISES_DATABASE: db } = modules[1];
const { matchesExerciseSearch } = modules[2];

// 1. 신규 종목 검색 및 데이터베이스 탑재 검증
const targetSearchQueries = [
  ['인클라인 트라이셉스', 'incline-dumbbell-triceps-extension'],
  ['인클라인 삼두', 'incline-dumbbell-triceps-extension'],
  ['인클라인 ez바', 'incline-ezbar-triceps-extension'],
  ['카타나 익스텐션', 'crossbody-cable-triceps-extension'],
  ['스미스 jm', 'smith-jm-press'],
  ['맥그립 랫풀다운', 'mag-grip-lat-pulldown'],
  ['인클라인 덤벨 컬', 'incline-dumbbell-curl'],
  ['베이즈 컬', 'bayesian-cable-curl'],
  ['케이블 크런치', 'cable-crunch']
];

for (const [q, expectedId] of targetSearchQueries) {
  const match = db.find(e => e.id === expectedId);
  assert.ok(match, `Exercise with ID ${expectedId} must exist in catalog`);
  assert.ok(matchesExerciseSearch(match, q), `Query '${q}' must match ${expectedId}`);
}
console.log('PASS: New popular exercises (incline triceps, katana, smith JM, mag-grip, etc.) successfully indexed and searchable.');

// 2. detectBodyPartsFromExercises 검증
const mockExercises = [
  {
    exerciseId: 'incline-dumbbell-triceps-extension',
    exerciseName: '인클라인 덤벨 트라이셉스 익스텐션',
    sets: [{ weight: 15, reps: 10, completed: true }]
  },
  {
    exerciseId: 'bench-press',
    exerciseName: '바벨 벤치프레스',
    sets: [{ weight: 80, reps: 8, completed: true }]
  }
];

const detected = detectBodyPartsFromExercises(mockExercises);
assert.ok(detected.includes('chest'), 'Chest should be detected from bench press');
assert.ok(detected.includes('triceps'), 'Triceps should be detected from incline dumbbell triceps extension');
console.log('PASS: detectBodyPartsFromExercises detected expected body parts.');

// 3. countExercisesByBodyPart 검증
const counts = countExercisesByBodyPart(mockExercises);
assert.equal(counts['chest'], 1);
assert.equal(counts['triceps'], 1);
assert.equal(counts['legs'], 0);
assert.equal(counts['fullbody'], 2);
console.log('PASS: countExercisesByBodyPart returned correct exercise counts.');

// 4. formatWorkoutTitleFromParts 검증
assert.equal(formatWorkoutTitleFromParts(['chest', 'triceps']), '가슴, 삼두 루틴');
assert.equal(formatWorkoutTitleFromParts(['legs']), '하체 루틴');
assert.equal(formatWorkoutTitleFromParts([]), '오늘의 운동');
console.log('PASS: formatWorkoutTitleFromParts produced clean, intuitive routine titles.');

// 5. mapPartIdsToCategories 검증
const cats = mapPartIdsToCategories(['chest', 'biceps', 'triceps']);
assert.ok(cats.includes('chest'));
assert.ok(cats.includes('arms'));
console.log('PASS: mapPartIdsToCategories correctly mapped body parts to categories.');


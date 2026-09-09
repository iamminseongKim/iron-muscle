import { Exercise, WorkoutSession } from '../types/workout';
import { EXERCISES_DATABASE } from '../data/exercises';

// 레거시 또는 오타 ID에 대한 스마트 매핑 사전
const LEGACY_ID_MAP: Record<string, string> = {
  'deadlift-sumo': 'sumo-deadlift',
  'deadlift': 'conventional-deadlift',
  'deadlift-conventional': 'conventional-deadlift',
  'deadlift-romanian': 'romanian-deadlift',
  'squat': 'barbell-squat',
  'squat-back': 'barbell-squat',
  'bench': 'bench-press',
  'bench-press-flat': 'bench-press',
  'lat-pulldown': 'lat-pulldown',
  'barbell-row': 'barbell-bent-over-row',
  'overhead-press': 'barbell-overhead-press',
  'ohp': 'barbell-overhead-press',
};

/**
 * 어떤 ID가 들어와도 항상 유효한 Exercise 객체를 안전하게 반환 (절대 undefined 없음)
 */
export function resolveExercise(exerciseId?: string | null): Exercise {
  if (!exerciseId || typeof exerciseId !== 'string') {
    return EXERCISES_DATABASE[0] || getEmergencyFallbackExercise();
  }

  // 0. 사용자 정의 커스텀 운동 우선 검사
  try {
    const rawCustom = typeof window !== 'undefined' ? localStorage.getItem('iron_custom_exercises_v1') : null;
    if (rawCustom) {
      const customList: Exercise[] = JSON.parse(rawCustom);
      const customMatch = customList.find((e) => e.id === exerciseId);
      if (customMatch) return customMatch;
    }
  } catch {}

  // 1. 정확한 ID 일치 검사
  const exact = EXERCISES_DATABASE.find((e) => e.id === exerciseId);
  if (exact) return exact;

  // 2. 레거시 별칭 매핑 검사
  const mappedId = LEGACY_ID_MAP[exerciseId];
  if (mappedId) {
    const mapped = EXERCISES_DATABASE.find((e) => e.id === mappedId);
    if (mapped) return mapped;
  }

  // 3. 부분 키워드 일치 검사 (예: 'deadlift', 'squat', 'bench', 'lat-pulldown')
  const cleanId = exerciseId.toLowerCase().replace(/[^a-z0-9]/g, '');
  const fuzzy = EXERCISES_DATABASE.find((e) => {
    const targetClean = e.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    return targetClean.includes(cleanId) || cleanId.includes(targetClean);
  });
  if (fuzzy) return fuzzy;

  // 4. 이름(한글/영문) 기반 검색
  const nameMatch = EXERCISES_DATABASE.find(
    (e) =>
      e.name.toLowerCase().includes(exerciseId.toLowerCase()) ||
      (e.nameEn && e.nameEn.toLowerCase().includes(exerciseId.toLowerCase()))
  );
  if (nameMatch) return nameMatch;

  // 5. 기본 데드리프트 또는 첫 번째 운동 반환 (절대 빈 운동 반환 안 함)
  const defaultExercise = EXERCISES_DATABASE.find((e) => e.id === 'conventional-deadlift');
  return defaultExercise || EXERCISES_DATABASE[0] || getEmergencyFallbackExercise();
}

/**
 * 세션 내 모든 운동 종목의 ID를 최신 표준 ID로 자동 보정 및 정제
 */
export function sanitizeSessionExercises(session: WorkoutSession): WorkoutSession {
  if (!session || !session.exercises) return session;

  const sanitizedExercises = session.exercises.map((ex) => {
    const resolved = resolveExercise(ex.exerciseId);
    return {
      ...ex,
      exerciseId: resolved.id, // 유효한 ID로 자동 치환
    };
  });

  return {
    ...session,
    exercises: sanitizedExercises,
  };
}

function getEmergencyFallbackExercise(): Exercise {
  return {
    id: 'conventional-deadlift',
    name: '컨벤셔널 데드리프트',
    nameEn: 'Conventional Deadlift',
    category: 'back',
    categories: ['back', 'legs'],
    equipment: 'barbell',
    loadType: 'barbell',
    movementPlane: 'hip-hinge',
    primaryMuscles: ['erectors', 'glutes', 'hamstrings'],
    secondaryMuscles: ['lats', 'traps', 'quads', 'forearms'],
    description: '후면 사슬 전체와 전신 근력을 강화하는 최고의 복합 다관절 운동입니다.',
    instructions: ['바벨 앞에 골반 너비로 서서 척추 중립을 유지하며 들어올립니다.'],
    tips: ['허리가 말리지 않도록 복압을 단단히 유지하세요.'],
    isPopular: true,
  };
}

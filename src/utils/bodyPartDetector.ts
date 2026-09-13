import { WorkoutExercise, TARGET_BODY_PARTS, Category } from '../types/workout';
import { matchesBodyPart, TargetBodyPart } from './aiPromptGenerator';

/**
 * 현재 세션에 등록된 운동 종목들을 분석하여 해당하는 운동 부위(TargetBodyPart) 목록을 감지합니다.
 */
export function detectBodyPartsFromExercises(exercises: WorkoutExercise[]): string[] {
  if (!exercises || exercises.length === 0) return [];

  const detected = new Set<string>();

  for (const ex of exercises) {
    for (const part of TARGET_BODY_PARTS) {
      if (part.id === 'fullbody') continue;
      if (matchesBodyPart(ex, part.id as TargetBodyPart)) {
        detected.add(part.id);
      }
    }
  }

  // 4개 부위 이상 다양하게 운동한 경우 fullbody(전신)도 후보로 고려 가능하나 기본적으로 실제 감지된 부위들을 반환
  return Array.from(detected);
}

/**
 * 현재 세션의 각 부위별 등록된 운동 종목 수를 집계합니다.
 */
export function countExercisesByBodyPart(exercises: WorkoutExercise[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const part of TARGET_BODY_PARTS) {
    counts[part.id] = 0;
  }
  if (!exercises || exercises.length === 0) return counts;

  for (const ex of exercises) {
    for (const part of TARGET_BODY_PARTS) {
      if (part.id === 'fullbody') continue;
      if (matchesBodyPart(ex, part.id as TargetBodyPart)) {
        counts[part.id] = (counts[part.id] || 0) + 1;
      }
    }
  }

  // fullbody는 전체 종목 수
  counts['fullbody'] = exercises.length;

  return counts;
}

/**
 * 선택된 부위 ID 목록을 사람이 읽기 좋은 루틴 제목(예: "가슴, 삼두 루틴")으로 포맷합니다.
 */
export function formatWorkoutTitleFromParts(partIds: string[]): string {
  if (!partIds || partIds.length === 0) return '오늘의 운동';

  const labels = partIds
    .map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label)
    .filter(Boolean);

  if (labels.length === 0) return '오늘의 운동';
  return `${labels.join(', ')} 루틴`;
}

/**
 * 선택된 부위 ID 목록으로부터 유효한 Workout Categories 목록을 추출합니다.
 */
export function mapPartIdsToCategories(partIds: string[]): Category[] {
  const categories = new Set<Category>();
  for (const id of partIds) {
    const opt = TARGET_BODY_PARTS.find((p) => p.id === id);
    if (opt) {
      categories.add(opt.category);
    }
  }
  return Array.from(categories);
}

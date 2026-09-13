import { WorkoutSession, WorkoutExercise, WorkoutSet } from '../types/workout';

/**
 * 같은 날짜의 여러 운동 세션을 하나의 통합 세션으로 병합합니다.
 * - 소요 시간(durationSeconds) 합산
 * - 동일한 운동 종목(동일 ID, 머신 브랜드, 로드 타입, 단위)은 세트를 순서대로 이어붙이고 번호를 재정렬
 * - 서로 다른 운동 종목은 순서대로 유지
 * - 제목과 메모를 유실 없이 보존
 */
export function mergeDaySessions(sessionsToMerge: WorkoutSession[]): WorkoutSession {
  if (!sessionsToMerge || sessionsToMerge.length === 0) {
    throw new Error('합칠 운동 세션이 없습니다.');
  }

  if (sessionsToMerge.length === 1) {
    return sessionsToMerge[0];
  }

  // 1. 시간순 정렬 (startTime 기준, 없으면 생성 순서 유지)
  const sorted = [...sessionsToMerge].sort((a, b) => {
    const timeA = a.startTime || a.date;
    const timeB = b.startTime || b.date;
    return timeA.localeCompare(timeB);
  });

  const baseSession = sorted[0];

  // 2. 총 소요 시간(초) 합산
  const totalDurationSeconds = sorted.reduce((sum, s) => sum + (s.durationSeconds || 0), 0);

  // 3. 세션 제목 병합
  const rawTitles = sorted.map((s) => s.title?.trim()).filter(Boolean);
  const uniqueTitles = Array.from(new Set(rawTitles));
  let mergedTitle = baseSession.title || '오늘의 운동';
  if (uniqueTitles.length > 1) {
    // 예: "가슴 운동 + 어깨 & 삼두"
    mergedTitle = uniqueTitles.join(' + ');
  }

  // 4. 메모 병합
  const rawNotes = sorted
    .map((s) => s.notes?.trim())
    .filter(Boolean);
  const mergedNotes = rawNotes.length > 0 ? rawNotes.join('\n\n') : undefined;

  // 5. 운동 종목 및 세트 병합
  const mergedExercises: WorkoutExercise[] = [];

  for (const session of sorted) {
    for (const ex of session.exercises || []) {
      // 완전히 일치하는 종목이 이미 mergedExercises에 있는지 탐색
      const existingMatch = mergedExercises.find(
        (m) =>
          m.exerciseId === ex.exerciseId &&
          (m.machineBrand || '') === (ex.machineBrand || '') &&
          (m.loadType || '') === (ex.loadType || '') &&
          (m.weightUnit || 'kg') === (ex.weightUnit || 'kg') &&
          (m.executionMode || 'bilateral') === (ex.executionMode || 'bilateral')
      );

      if (existingMatch) {
        // 이미 존재하는 동일 종목에 세트 이어붙이기
        const currentSetCount = existingMatch.sets.length;
        const appendedSets: WorkoutSet[] = (ex.sets || []).map((s, idx) => ({
          ...s,
          id: `set-merged-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          setNumber: currentSetCount + idx + 1,
        }));

        existingMatch.sets = [...existingMatch.sets, ...appendedSets];

        // 종목 메모가 있다면 결합
        if (ex.notes?.trim()) {
          existingMatch.notes = existingMatch.notes
            ? `${existingMatch.notes}\n${ex.notes.trim()}`
            : ex.notes.trim();
        }
      } else {
        // 새로운 종목으로 추가
        const clonedSets: WorkoutSet[] = (ex.sets || []).map((s, idx) => ({
          ...s,
          id: `set-merged-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          setNumber: idx + 1,
        }));

        mergedExercises.push({
          ...ex,
          id: `ex-merged-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          sets: clonedSets,
        });
      }
    }
  }

  // 6. 타겟 카테고리(부위) 통합
  const allCategories = sorted.flatMap((s) => s.targetCategories || []);
  const uniqueCategories = Array.from(new Set(allCategories));

  return {
    ...baseSession,
    id: `session-merged-${Date.now()}`,
    title: mergedTitle,
    durationSeconds: totalDurationSeconds,
    exercises: mergedExercises,
    notes: mergedNotes,
    targetCategories: uniqueCategories.length > 0 ? uniqueCategories : baseSession.targetCategories,
    completed: true,
  };
}

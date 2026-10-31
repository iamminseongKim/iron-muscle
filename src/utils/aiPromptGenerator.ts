import { getLanguage, Language } from '../i18n';
import { adaptiveExport } from './adaptiveExport';
import { WorkoutSession, WorkoutExercise } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { addDays } from './calendar';

export type AiExportScope = 'day' | 'week' | 'month' | 'custom' | 'all';

export type TargetBodyPart =
  | 'all'
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'arms'
  | 'core';

export interface AiExportOptions {
  language?: Language;
  scope: AiExportScope;
  selectedDate: string; // YYYY-MM-DD
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string; // YYYY-MM-DD
  selectedBodyPart?: TargetBodyPart; // 운동 부위 ('all' | 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'arms' | 'core')
}

export const BODY_PART_OPTIONS: Array<{
  id: TargetBodyPart;
  label: string;
  icon: string;
}> = [
  { id: 'all', label: '전체 부위 종합 분석', icon: '🌐' },
  { id: 'chest', label: '가슴 (Chest)', icon: '🛡️' },
  { id: 'back', label: '등 (Back)', icon: '🦅' },
  { id: 'legs', label: '하체 (Legs)', icon: '🦵' },
  { id: 'shoulders', label: '어깨 (Shoulders)', icon: '🥥' },
  { id: 'biceps', label: '이두근 (Biceps)', icon: '💪' },
  { id: 'triceps', label: '삼두근 (Triceps)', icon: '⚡' },
  { id: 'arms', label: '팔 전체 (Arms)', icon: '🦾' },
  { id: 'core', label: '복근/코어 (Core)', icon: '🧱' },
];

/**
 * 특정 운동 종목이 대상 운동 부위(TargetBodyPart)에 속하는지 판별합니다.
 */
export function matchesBodyPart(ex: WorkoutExercise, bodyPart: TargetBodyPart): boolean {
  if (bodyPart === 'all') return true;

  const base = resolveRecordedExercise(ex);
  const name = (ex.exerciseName || base.name || '').toLowerCase();
  const cat = base.category;
  const cats = base.categories || [];
  const primary = base.primaryMuscles || [];

  if (bodyPart === 'chest') {
    return (
      cat === 'chest' ||
      cats.includes('chest') ||
      primary.some((m) => m === 'chest' || m === 'chest_upper') ||
      name.includes('가슴') ||
      name.includes('체스트') ||
      name.includes('벤치') ||
      name.includes('딥스')
    );
  }

  if (bodyPart === 'back') {
    return (
      cat === 'back' ||
      cats.includes('back') ||
      primary.some((m) => ['lats', 'traps', 'erectors'].includes(m)) ||
      name.includes('등') ||
      name.includes('랫풀') ||
      name.includes('풀다운') ||
      name.includes('로우') ||
      name.includes('풀업') ||
      name.includes('친업') ||
      name.includes('데드리프트')
    );
  }

  if (bodyPart === 'legs') {
    return (
      cat === 'legs' ||
      cats.includes('legs') ||
      primary.some((m) => ['quads', 'hamstrings', 'glutes', 'calves'].includes(m)) ||
      name.includes('하체') ||
      name.includes('스쿼트') ||
      name.includes('레그') ||
      name.includes('런지') ||
      name.includes('카프')
    );
  }

  if (bodyPart === 'shoulders') {
    return (
      cat === 'shoulders' ||
      cats.includes('shoulders') ||
      primary.some((m) => m.startsWith('deltoid')) ||
      name.includes('어깨') ||
      name.includes('숄더') ||
      name.includes('사레레') ||
      name.includes('오버헤드') ||
      name.includes('밀리터리') ||
      name.includes('페이스풀')
    );
  }

  if (bodyPart === 'biceps') {
    return (
      primary.includes('biceps') ||
      name.includes('이두') ||
      name.includes('바이셉') ||
      name.includes('암 컬') ||
      name.includes('암컬') ||
      (cat === 'arms' && (name.includes('컬') || name.includes('curl')))
    );
  }

  if (bodyPart === 'triceps') {
    return (
      primary.includes('triceps') ||
      name.includes('삼두') ||
      name.includes('트라이셉') ||
      name.includes('라트익') ||
      (cat === 'arms' && (name.includes('푸시다운') || name.includes('익스텐션') || name.includes('클로즈그립')))
    );
  }

  if (bodyPart === 'arms') {
    return (
      cat === 'arms' ||
      cats.includes('arms') ||
      primary.some((m) => ['biceps', 'triceps', 'forearms'].includes(m)) ||
      name.includes('팔') ||
      name.includes('이두') ||
      name.includes('삼두') ||
      name.includes('컬') ||
      name.includes('푸시다운')
    );
  }

  if (bodyPart === 'core') {
    return (
      cat === 'core' ||
      cats.includes('core') ||
      primary.some((m) => ['abs', 'obliques'].includes(m)) ||
      name.includes('복근') ||
      name.includes('코어') ||
      name.includes('크런치') ||
      name.includes('레그레이즈') ||
      name.includes('플랭크')
    );
  }

  return false;
}

/**
 * 주어진 기간(날짜) 및 선택한 운동 부위에 해당하는 세션/운동들을 필터링합니다.
 */
export function filterSessionsForAiExport(
  sessions: WorkoutSession[],
  options: AiExportOptions
): WorkoutSession[] {
  const { scope, selectedDate, customStartDate, customEndDate, selectedBodyPart = 'all' } = options;

  let dateFiltered: WorkoutSession[] = [];

  if (scope === 'day') {
    dateFiltered = sessions.filter((s) => s.date === selectedDate);
  } else if (scope === 'week') {
    // selectedDate 기준 직전 7일
    const startStr = addDays(selectedDate, -6);
    const endStr = selectedDate;
    dateFiltered = sessions.filter((s) => s.date >= startStr && s.date <= endStr);
  } else if (scope === 'month') {
    const monthPrefix = selectedDate.slice(0, 7); // YYYY-MM
    dateFiltered = sessions.filter((s) => s.date.startsWith(monthPrefix));
  } else if (scope === 'custom') {
    const startStr = customStartDate || selectedDate;
    const endStr = customEndDate || selectedDate;
    dateFiltered = sessions.filter((s) => s.date >= startStr && s.date <= endStr);
  } else {
    // 'all'
    dateFiltered = [...sessions];
  }

  // 날짜 내림차순 정렬 (최신순)
  dateFiltered.sort((a, b) => b.date.localeCompare(a.date));

  // 특정 부위만 필터링하는 경우
  if (selectedBodyPart && selectedBodyPart !== 'all') {
    return dateFiltered
      .map((session) => {
        const matchingExercises = (session.exercises || []).filter((ex) =>
          matchesBodyPart(ex, selectedBodyPart)
        );
        if (matchingExercises.length === 0) return null;
        return {
          ...session,
          exercises: matchingExercises,
        };
      })
      .filter((s): s is WorkoutSession => s !== null);
  }

  return dateFiltered;
}

/**
 * 기간 내 각 운동 부위별 세션 수와 세트 수를 집계합니다 (드롭다운 칩용)
 */
export function extractAvailableBodyParts(sessions: WorkoutSession[]): Array<{
  id: TargetBodyPart;
  label: string;
  icon: string;
  sessionCount: number;
  totalSets: number;
}> {
  return BODY_PART_OPTIONS.map((opt) => {
    if (opt.id === 'all') {
      const totalSets = sessions.reduce(
        (sum, s) => sum + (s.exercises || []).reduce((acc, e) => acc + (e.sets?.length || 0), 0),
        0
      );
      return { ...opt, sessionCount: sessions.length, totalSets };
    }

    let sessionCount = 0;
    let totalSets = 0;

    for (const s of sessions) {
      let hasMatchingInSession = false;
      for (const ex of s.exercises || []) {
        if (matchesBodyPart(ex, opt.id)) {
          hasMatchingInSession = true;
          totalSets += ex.sets?.length || 0;
        }
      }
      if (hasMatchingInSession) sessionCount++;
    }

    return { ...opt, sessionCount, totalSets };
  });
}

export function generateAiCoachingMarkdown(targetSessions: WorkoutSession[], options: AiExportOptions, history: WorkoutSession[] = targetSessions): string {
  return adaptiveExport(targetSessions, options.language || getLanguage(), history);
}

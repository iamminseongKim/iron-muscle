import type { WorkoutSession } from '../types/workout';
import { collectPersonalBests, compareWorkoutChronology, type PersonalBestRecord } from './workoutFlow';

export type BadgeRule =
  | { kind: 'workout-days'; target: number }
  | { kind: 'consistent-weeks'; target: number; daysPerWeek: 2 }
  | { kind: 'comeback'; gapDays: 30 }
  | { kind: 'personal-best'; exerciseId: string | null }
  | { kind: 'big-three' };

export interface BadgeDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  rule: BadgeRule;
}

export interface BadgeEvidence {
  sessionId: string;
  date: string;
  title: string;
  record?: PersonalBestRecord;
}

export type BadgeProgress = {
  definition: BadgeDefinition;
  current: number;
  target: number;
} & (
  | { state: 'locked' }
  | { state: 'earned'; earnedOn: string; evidence: BadgeEvidence[] }
);

export const BADGE_DEFINITIONS: readonly BadgeDefinition[] = [
  { id: 'first-workout', nameKey: '첫 발걸음', descriptionKey: '첫 운동을 완료하세요.', rule: { kind: 'workout-days', target: 1 } },
  ...[10, 30, 50, 100, 200, 365].map(target => ({ id: `days-${target}`, nameKey: '쌓이는 힘', descriptionKey: '서로 다른 날짜에 운동을 완료하세요.', rule: { kind: 'workout-days', target } } satisfies BadgeDefinition)),
  ...[4, 8, 12].map(target => ({ id: `weeks-${target}`, nameKey: '나만의 페이스', descriptionKey: '월요일부터 일요일까지 주 2일 이상 운동을 연속으로 이어가세요.', rule: { kind: 'consistent-weeks', target, daysPerWeek: 2 } } satisfies BadgeDefinition)),
  { id: 'comeback', nameKey: '다시 시작', descriptionKey: '30일 이상 쉬고 운동을 완료하세요.', rule: { kind: 'comeback', gapDays: 30 } },
  { id: 'first-pr', nameKey: '어제보다 강하게', descriptionKey: '같은 조건의 이전 기록보다 높은 중량을 기록하세요. 첫 기록과 워밍업은 제외합니다.', rule: { kind: 'personal-best', exerciseId: null } },
  { id: 'squat-pr', nameKey: '스쿼트 돌파', descriptionKey: '바벨 스쿼트의 최고 수행 중량을 갱신하세요.', rule: { kind: 'personal-best', exerciseId: 'barbell-squat' } },
  { id: 'bench-pr', nameKey: '벤치 돌파', descriptionKey: '바벨 벤치프레스의 최고 수행 중량을 갱신하세요.', rule: { kind: 'personal-best', exerciseId: 'bench-press' } },
  { id: 'deadlift-pr', nameKey: '데드리프트 돌파', descriptionKey: '바벨 데드리프트의 최고 수행 중량을 갱신하세요.', rule: { kind: 'personal-best', exerciseId: 'deadlift' } },
  { id: 'big-three', nameKey: '세 개의 이정표', descriptionKey: '바벨 스쿼트, 벤치프레스, 데드리프트에서 각각 최고 중량을 갱신하세요. 같은 날일 필요는 없습니다.', rule: { kind: 'big-three' } },
];

const DAY_MS = 86_400_000;
const bigThree = ['barbell-squat', 'bench-press', 'deadlift'];

function dayNumber(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const value = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === date ? value / DAY_MS : null;
}

function evidenceFor(session: WorkoutSession, record?: PersonalBestRecord): BadgeEvidence {
  return { sessionId: session.id, date: session.date, title: session.title, ...(record ? { record } : {}) };
}

export function calculateAchievements(history: WorkoutSession[]): BadgeProgress[] {
  const sessions = [...new Map(history.filter(session => session.completed && dayNumber(session.date) !== null &&
    session.exercises.some(exercise => exercise.sets.some(set => set.completed && Number.isFinite(set.weight) && Number.isInteger(set.reps) && set.reps > 0)))
    .map(session => [session.id, session])).values()]
    .sort(compareWorkoutChronology);
  const firstSessionByDay = new Map<string, WorkoutSession>();
  for (const session of sessions) if (!firstSessionByDay.has(session.date)) firstSessionByDay.set(session.date, session);
  const workoutDays = [...firstSessionByDay.values()];
  const weeks = new Map<number, WorkoutSession[]>();
  for (const session of workoutDays) {
    const day = dayNumber(session.date);
    if (day === null) continue;
    const monday = day - ((new Date(day * DAY_MS).getUTCDay() + 6) % 7);
    const entries = weeks.get(monday) || [];
    entries.push(session);
    weeks.set(monday, entries);
  }
  const prEvents = collectPersonalBests(sessions).flatMap(({ session, records }) => records.map(record => evidenceFor(session, record)));
  const firstBigThree = new Map<string, BadgeEvidence>();
  for (const event of prEvents) {
    const exercise = event.record?.exercise;
    if (exercise?.equipmentType === 'barbell' && bigThree.includes(exercise.exerciseId) && !firstBigThree.has(exercise.exerciseId)) {
      firstBigThree.set(exercise.exerciseId, event);
    }
  }

  return BADGE_DEFINITIONS.map(definition => {
    const rule = definition.rule;
    let current = 0;
    let target = 1;
    let evidence: BadgeEvidence[] = [];
    switch (rule.kind) {
      case 'workout-days': {
        target = rule.target;
        current = workoutDays.length;
        const crossing = workoutDays[target - 1];
        if (crossing) evidence = [evidenceFor(crossing)];
        break;
      }
      case 'consistent-weeks': {
        target = rule.target;
        let streak: WorkoutSession[][] = [];
        let previousWeek: number | null = null;
        for (const [week, entries] of weeks) {
          if (entries.length < rule.daysPerWeek) continue;
          const qualifyingDays = entries.slice(0, rule.daysPerWeek);
          streak = previousWeek !== null && week === previousWeek + 7 ? [...streak, qualifyingDays] : [qualifyingDays];
          previousWeek = week;
          current = Math.max(current, streak.length);
          if (!evidence.length && streak.length >= target) evidence = streak.flatMap(days => days.map(session => evidenceFor(session)));
        }
        break;
      }
      case 'comeback': {
        for (let index = 1; index < workoutDays.length; index++) {
          const previous = workoutDays[index - 1];
          const next = workoutDays[index];
          const previousDay = dayNumber(previous.date);
          const nextDay = dayNumber(next.date);
          if (previousDay !== null && nextDay !== null && nextDay - previousDay >= rule.gapDays) {
            current = 1;
            evidence = [evidenceFor(previous), evidenceFor(next)];
            break;
          }
        }
        break;
      }
      case 'personal-best': {
        const matching = prEvents.filter(event => rule.exerciseId === null || (event.record?.exercise.exerciseId === rule.exerciseId && event.record.exercise.equipmentType === 'barbell'));
        current = matching.length;
        if (matching[0]) evidence = [matching[0]];
        break;
      }
      case 'big-three': {
        target = bigThree.length;
        current = firstBigThree.size;
        if (current === target) evidence = [...firstBigThree.values()];
        break;
      }
      default: {
        const exhaustive: never = rule;
        return exhaustive;
      }
    }
    const progress = { definition, current, target };
    if (evidence.length) {
      const earnedOn = evidence.reduce((date, event) => event.date > date ? event.date : date, evidence[0].date);
      return { ...progress, state: 'earned', earnedOn, evidence };
    }
    return { ...progress, state: 'locked' };
  });
}

import type { WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';
import { getGroupRoundNumber } from './workoutGroups';

type SetReference = { exerciseId: string; setId: string };
type IntervalEvidence = 'explicit' | 'timeline' | 'none';
type IntervalContext = { seconds: number | null; source?: SetReference; evidence: IntervalEvidence };
export type WorkoutInterval =
  | (IntervalContext & { kind: 'transition' })
  | (IntervalContext & { kind: 'rest'; scope: 'round' | 'between-sets'; plannedSeconds: number | null })
  | (IntervalContext & { kind: 'unknown' });

const timestamp = (value: string | undefined): number | null => {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};
const seconds = (value: number | undefined): number | null => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

function precedingSet(session: WorkoutSession, exerciseId: string, set: WorkoutSet) {
  const started = timestamp(set.startedAt);
  if (started === null) return undefined;
  const candidates = session.exercises.flatMap(exercise => exercise.sets.flatMap(candidate => {
    const completed = timestamp(candidate.completedAt);
    return candidate.completed && completed !== null && completed <= started && !(exercise.id === exerciseId && candidate.id === set.id)
      ? [{ exercise, set: candidate, completed }] : [];
  })).sort((left, right) => right.completed - left.completed);
  if (candidates[1]?.completed === candidates[0]?.completed) return undefined;
  return candidates[0];
}

export function resolveWorkoutInterval(session: WorkoutSession, exerciseId: string, setId: string): WorkoutInterval {
  const exercise = session.exercises.find(item => item.id === exerciseId);
  const set = exercise?.sets.find(item => item.id === setId);
  if (!exercise || !set) return { kind: 'unknown', seconds: null, evidence: 'none' };
  const raw = seconds(set.restSeconds);
  const trusted = set.restSource === 'reported' || set.restSource === 'measured' && timestamp(set.startedAt) !== null;
  const measured = trusted ? raw : null;
  const previous = precedingSet(session, exerciseId, set);
  const source = previous ? { exerciseId: previous.exercise.id, setId: previous.set.id } : undefined;
  const plannedSeconds = previous ? seconds(previous.set.plannedRestSeconds) : null;
  if (set.restKind === 'transition') return { kind: 'transition', seconds: measured, source, evidence: 'explicit' };
  if (set.restKind === 'round' || set.restKind === 'between-sets') return {
    kind: 'rest', scope: set.restKind === 'round' ? 'round' : 'between-sets', seconds: measured, source, plannedSeconds, evidence: 'explicit',
  };
  if (previous && set.restSource === 'measured') {
    if (exercise.groupId && previous.exercise.groupId === exercise.groupId) {
      const currentRound = getGroupRoundNumber(exercise, set.id);
      const previousRound = getGroupRoundNumber(previous.exercise, previous.set.id);
      if (currentRound !== undefined && currentRound === previousRound && previous.exercise.id !== exercise.id) {
        return { kind: 'transition', seconds: measured, source, evidence: 'timeline' };
      }
      return { kind: 'rest', scope: 'round', seconds: measured, source, plannedSeconds, evidence: 'timeline' };
    }
    return { kind: 'rest', scope: 'between-sets', seconds: measured, source, plannedSeconds, evidence: 'timeline' };
  }
  if (!exercise.groupId && trusted && raw !== null) return { kind: 'rest', scope: 'between-sets', seconds: raw, source, plannedSeconds, evidence: 'explicit' };
  return { kind: 'unknown', seconds: raw, source, evidence: 'none' };
}

function completedRound(session: WorkoutSession, exercise: WorkoutExercise, set: WorkoutSet) {
  const round = getGroupRoundNumber(exercise, set.id);
  if (!exercise.groupId || round === undefined) return undefined;
  const members = session.exercises.filter(item => item.groupId === exercise.groupId)
    .flatMap(item => { const member = item.sets[round - 1]; return member ? [{ exercise: item, set: member }] : []; });
  return members.length && members.every(member => member.set.completed) ? members : undefined;
}

export function getSessionRestAfterSets(session: WorkoutSession): ReadonlyMap<string, number> {
  const rests = new Map<string, number>();
  const assign = (exercise: WorkoutExercise, set: WorkoutSet, elapsed: number) => {
    if (!exercise.groupId) { rests.set(set.id, elapsed); return; }
    const members = completedRound(session, exercise, set);
    if (members) for (const member of members) rests.set(member.set.id, elapsed);
  };
  for (const exercise of session.exercises) for (const set of exercise.sets) {
    if (set.restSource !== 'measured') continue;
    const interval = resolveWorkoutInterval(session, exercise.id, set.id);
    if (interval.kind !== 'rest' || interval.seconds === null || !interval.source) continue;
    const sourceExercise = session.exercises.find(item => item.id === interval.source?.exerciseId);
    const sourceSet = sourceExercise?.sets.find(item => item.id === interval.source?.setId);
    if (sourceExercise && sourceSet?.completed) assign(sourceExercise, sourceSet, interval.seconds);
  }
  for (const exercise of session.exercises) for (const set of exercise.sets) {
    const elapsed = seconds(set.timerRestSeconds);
    if (!set.completed || elapsed === null) continue;
    if (exercise.groupId) {
      const members = completedRound(session, exercise, set);
      if (!members) continue;
      const completed = timestamp(set.completedAt);
      const newer = members.some(member => {
        const other = timestamp(member.set.completedAt);
        return member.set.id !== set.id && other !== null && (completed === null || other > completed);
      });
      if (newer) continue;
      if (completed === null && members[members.length - 1]?.set.id !== set.id) continue;
    }
    assign(exercise, set, elapsed);
  }
  return rests;
}

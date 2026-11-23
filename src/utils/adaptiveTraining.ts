import type { WorkoutSession, WorkoutSet } from '../types/workout';
import { getCurrentGroupRound, getGroupRoundNumber, getGroupRounds, getPostSetAction } from './workoutGroups';
import { getSessionRestAfterSets } from './workoutIntervals';

export function isWorkingSet(set: WorkoutSet): boolean {
  return set.setType !== undefined && ['WORKING', 'TOP_SET', 'BACK_OFF', 'DROP_SET'].includes(set.setType);
}

export function actualRpe(set: WorkoutSet): number | null {
  return set.completed && (set.provenance === 'recorded' || set.rpeSource === 'recorded') && typeof set.rpe === 'number' && Number.isFinite(set.rpe) ? set.rpe : null;
}

export function recordSetRevision(previous: WorkoutSet, next: WorkoutSet, now = new Date()): WorkoutSet {
  const { revisions, ...before } = previous;
  const { revisions: ignored, ...after } = next;
  const prescriptionChanged = ['plannedWeight', 'plannedReps', 'targetRpe', 'plannedRestSeconds', 'plannedTempo', 'plannedSetType', 'plannedNotes'].some(key => JSON.stringify(Reflect.get(before, key)) !== JSON.stringify(Reflect.get(after, key)));
  if ((!previous.completed && !prescriptionChanged) || JSON.stringify(before) === JSON.stringify(after)) return next;
  return { ...next, revisions: [...(revisions || []), { at: now.toISOString(), previous: before }] };
}

export function actualRest(set: WorkoutSet): number | null {
  return set.restKind !== 'transition' && set.completed && (set.restSource === 'reported' || (set.restSource === 'measured' && !!set.startedAt)) && typeof set.restSeconds === 'number' && Number.isFinite(set.restSeconds) ? set.restSeconds : null;
}

export function getRestAfterSets(session: WorkoutSession): ReadonlyMap<string, number> {
  return getSessionRestAfterSets(session);
}

export function normalizeAdaptiveSession(session: WorkoutSession): WorkoutSession {
  return {
    ...session,
    exercises: session.exercises.map(exercise => ({
      ...exercise,
      sets: exercise.sets.map(set => set.provenance ? set : { ...set, provenance: 'legacy-unknown' }),
    })),
  };
}

export function completeWorkoutSet(set: WorkoutSet, now = new Date()): WorkoutSet {
  if (set.completed) return set;
  if (set.weightNeedsConfirmation) throw new Error('새 기구의 중량을 확인하세요.');
  return {
    ...set, ...(set.setType === 'DROP_SET' && set.dropSegments?.length ? { weight: set.dropSegments[0].weight, reps: set.dropSegments[0].reps } : {}), completed: true, completedAt: now.toISOString(), provenance: set.provenance === 'legacy-unknown' ? 'legacy-unknown' : 'recorded',
    plannedWeight: set.plannedWeight,
    plannedReps: set.plannedReps,
    plannedSetType: set.plannedSetType ?? set.setType ?? 'UNSPECIFIED',
    setType: set.setType ?? set.plannedSetType ?? 'UNSPECIFIED',
    tempo: set.tempoSource === 'recorded' && set.tempo ? { ...set.tempo } : set.plannedTempo ? { ...set.plannedTempo } : set.tempo,
    tempoSource: set.tempoSource === 'recorded' && set.tempo ? 'recorded' : set.plannedTempo ? 'prescribed' : set.tempoSource,
    legacyRpe: set.provenance !== 'recorded' ? set.legacyRpe ?? set.rpe : set.legacyRpe,
    rpe: set.provenance === 'recorded' || set.rpeSource === 'recorded' ? set.rpe ?? null : null, failureType: set.failureType ?? 'UNKNOWN',
  };
}

export function undoWorkoutSet(set: WorkoutSet): WorkoutSet {
  const { completedAt, startedAt, restSeconds, timerRestSeconds, restSource, restKind, completionPausedSeconds, startPausedSeconds, ...preserved } = set;
  return { ...preserved, completed: false, rpe: null, failureType: 'UNKNOWN', painFeedback: undefined, stimulusFeedback: undefined };
}

export type SetProgress = { kind: 'ready' } | { kind: 'active' } | { kind: 'completed' } | { kind: 'waiting'; reason: 'earlier-set' | 'active-set' | 'paused' | 'unavailable' | 'rest' };

export function getSetProgress(session: WorkoutSession, exerciseItemId: string, setId: string, resting = false): SetProgress {
  const exercise = session.exercises.find(item => item.id === exerciseItemId);
  const set = exercise?.sets.find(item => item.id === setId);
  if (!exercise || !set) return { kind: 'waiting', reason: 'unavailable' };
  if (set.completed) return { kind: 'completed' };
  if (session.pausedAt) return { kind: 'waiting', reason: 'paused' };
  if (resting) return { kind: 'waiting', reason: 'rest' };
  const active = session.exercises.flatMap(item => item.sets).filter(item => item.startedAt && !item.completed)
    .sort((a, b) => Date.parse(a.startedAt!) - Date.parse(b.startedAt!))[0];
  if (active && active.id !== setId) return { kind: 'waiting', reason: 'active-set' };
  if (set.startedAt) return { kind: 'active' };
  if (exercise.sets.find(item => !item.completed)?.id !== setId) return { kind: 'waiting', reason: 'earlier-set' };
  if (exercise.groupId) {
    const members = session.exercises.filter(item => item.groupId === exercise.groupId);
    const roundNumber = getGroupRoundNumber(exercise, setId);
    if (roundNumber !== getCurrentGroupRound(members)) return { kind: 'waiting', reason: 'earlier-set' };
    const next = getGroupRounds(members).find(round => round.ordinal === roundNumber)?.members.find(member => !members.find(item => item.id === member.exerciseId)?.sets.find(item => item.id === member.setId)?.completed);
    if (next?.setId !== setId) return { kind: 'waiting', reason: 'earlier-set' };
  }
  return { kind: 'ready' };
}

export function cancelWorkoutSetStart(session: WorkoutSession, exerciseItemId: string, setId: string): WorkoutSession {
  return { ...session, exercises: session.exercises.map(exercise => exercise.id !== exerciseItemId ? exercise : {
    ...exercise, sets: exercise.sets.map(set => {
      if (set.id !== setId || set.completed) return set;
      const { startedAt, startPausedSeconds, restSeconds, restSource, restKind, ...draft } = set;
      return draft;
    }),
  }) };
}

export function startWorkoutSet(session: WorkoutSession, exerciseItemId: string, setId: string, now = new Date(), resting = false): WorkoutSession {
  if (getSetProgress(session, exerciseItemId, setId, resting).kind !== 'ready') return session;
  const exercise = session.exercises.find(item => item.id === exerciseItemId);
  const target = exercise?.sets.find(set => set.id === setId);
  if (!exercise || !target || target.completed || target.startedAt) return session;
  const timestamp = now.getTime();
  const previous = session.exercises.flatMap(item => item.sets
    .filter(set => set.id !== setId && set.completed && set.completedAt && Date.parse(set.completedAt) <= timestamp)
    .map(set => ({ exercise: item, set })))
    .sort((a, b) => Date.parse(b.set.completedAt!) - Date.parse(a.set.completedAt!))[0];
  const elapsed = previous ? Math.max(0, (timestamp - Date.parse(previous.set.completedAt!)) / 1000 - Math.max(0, (session.pausedSeconds ?? 0) - (previous.set.completionPausedSeconds ?? 0))) : undefined;
  const restKind = previous && exercise.groupId && exercise.groupId === previous.exercise.groupId
    ? previous.exercise.id === exercise.id || (getGroupRoundNumber(previous.exercise, previous.set.id) ?? 0) < (getGroupRoundNumber(exercise, setId) ?? 0) ? 'round' : 'transition'
    : 'between-sets';
  return {
    ...session,
    exercises: session.exercises.map(item => item.id !== exerciseItemId ? item : {
      ...item, sets: item.sets.map(set => set.id !== setId ? set : {
        ...set, startedAt: now.toISOString(), startPausedSeconds: session.pausedSeconds ?? 0,
        restSeconds: elapsed === undefined ? undefined : Math.round(elapsed), restSource: elapsed === undefined ? undefined : 'measured', restKind: elapsed === undefined ? undefined : restKind,
      }),
    }),
  };
}

export type GroupRoundAdvance =
  | { kind: 'blocked'; session: WorkoutSession }
  | { kind: 'started'; session: WorkoutSession }
  | { kind: 'advanced' | 'round-completed'; session: WorkoutSession; completed: { exerciseId: string; setId: string } };

export function advanceGroupRound(session: WorkoutSession, groupId: string, now = new Date(), resting = false): GroupRoundAdvance {
  const members = session.exercises.filter(exercise => exercise.groupId === groupId);
  if (members.length < 2 || resting || session.pausedAt) return { kind: 'blocked', session };
  const round = getGroupRounds(members).find(item => item.ordinal === getCurrentGroupRound(members));
  if (!round) return { kind: 'blocked', session };
  const globalActive = session.exercises.flatMap(exercise => exercise.sets.filter(set => set.startedAt && !set.completed).map(set => ({ exercise, set })))[0];
  if (globalActive && globalActive.exercise.groupId !== groupId) return { kind: 'blocked', session };
  const active = globalActive;
  if (!active) {
    const next = round.members.find(member => !members.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId)?.completed);
    if (!next || getSetProgress(session, next.exerciseId, next.setId, resting).kind !== 'ready') return { kind: 'blocked', session };
    const set = members.find(exercise => exercise.id === next.exerciseId)?.sets.find(item => item.id === next.setId);
    if (set?.weightNeedsConfirmation) return { kind: 'blocked', session };
    return { kind: 'started', session: startWorkoutSet(session, next.exerciseId, next.setId, now, resting) };
  }
  if (getSetProgress(session, active.exercise.id, active.set.id, resting).kind !== 'active' || active.set.weightNeedsConfirmation) return { kind: 'blocked', session };
  const completedSet = { ...completeWorkoutSet(active.set, now), completionPausedSeconds: session.pausedSeconds ?? 0 };
  let updated = { ...session, exercises: session.exercises.map(exercise => exercise.id !== active.exercise.id ? exercise : { ...exercise, sets: exercise.sets.map(set => set.id === active.set.id ? completedSet : set) }) };
  const action = getPostSetAction(updated, active.exercise.id, active.set.id);
  if (action.kind === 'next-member') {
    const next = updated.exercises.find(exercise => exercise.id === action.exerciseId)?.sets.find(set => set.id === action.setId);
    if (!next?.weightNeedsConfirmation) updated = startWorkoutSet(updated, action.exerciseId, action.setId, now);
  }
  return { kind: action.kind === 'next-member' ? 'advanced' : 'round-completed', session: updated, completed: { exerciseId: active.exercise.id, setId: active.set.id } };
}

export function validAdaptiveSet(value: Record<string, unknown>): boolean {
  const numeric = (field: string, min: number, max: number) => value[field] === undefined ||
    (typeof value[field] === 'number' && Number.isFinite(value[field]) && value[field] >= min && value[field] <= max);
  const text = (field: string) => value[field] === undefined || typeof value[field] === 'string';
  const types = ['WARMUP', 'ACTIVATION', 'WORKING', 'TOP_SET', 'BACK_OFF', 'DROP_SET', 'UNSPECIFIED'];
  if (!numeric('plannedWeight', -2000, 2000) || !numeric('plannedReps', 0, 1000) || !numeric('targetRpe', 6, 10) ||
      !numeric('timerRestSeconds', 0, Number.MAX_SAFE_INTEGER) ||
      !numeric('stimulusFeedback', 1, 5) || !numeric('startPausedSeconds', 0, Number.MAX_SAFE_INTEGER) ||
      !numeric('completionPausedSeconds', 0, Number.MAX_SAFE_INTEGER) || !text('plannedNotes') || !text('startedAt') || !text('completedAt')) return false;
  if (typeof value.targetRpe === 'number' && !Number.isInteger(value.targetRpe * 2)) return false;
  if (['rpeSource', 'commentSource'].some(key => value[key] !== undefined && value[key] !== 'recorded')) return false;
  if (value.tempoSource !== undefined && !['recorded', 'prescribed'].includes(String(value.tempoSource))) return false;
  if (!numeric('targetRir', 0, 10) || !numeric('assistedReps', 0, 1000)) return false;
  if (typeof value.assistedReps === 'number' && !Number.isInteger(value.assistedReps)) return false;
  if (value.weightNeedsConfirmation !== undefined && typeof value.weightNeedsConfirmation !== 'boolean') return false;
  if (value.plannedWeightUnit !== undefined && !['kg', 'lbs'].includes(String(value.plannedWeightUnit))) return false;
  if (value.plannedRepRange !== undefined) {
    const range = value.plannedRepRange;
    if (!isRecord(range) || typeof range.min !== 'number' || typeof range.max !== 'number' || !Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min < 1 || range.max > 1000 || range.min > range.max) return false;
  }
  if (value.legacyRpe !== undefined && value.legacyRpe !== null && (typeof value.legacyRpe !== 'number' || !Number.isFinite(value.legacyRpe))) return false;
  if (value.revisions !== undefined && (!Array.isArray(value.revisions) || !value.revisions.every(revision => revision && typeof revision === 'object' && typeof revision.at === 'string' && revision.previous && typeof revision.previous === 'object' && revision.previous.revisions === undefined && validAdaptiveSet(revision.previous)))) return false;
  if (value.setType !== undefined && !types.includes(String(value.setType))) return false;
  if (value.plannedSetType !== undefined && !types.includes(String(value.plannedSetType))) return false;
  if (value.failureType !== undefined && !['NONE', 'TECHNICAL', 'MUSCULAR', 'OTHER', 'UNKNOWN'].includes(String(value.failureType))) return false;
  if (value.provenance !== undefined && !['recorded', 'legacy-unknown'].includes(String(value.provenance))) return false;
  if (value.restSource !== undefined && !['measured', 'reported'].includes(String(value.restSource))) return false;
  if (value.restKind !== undefined && !['transition', 'round', 'between-sets'].includes(String(value.restKind))) return false;
  if (value.painFeedback !== undefined) {
    const pain = value.painFeedback;
    if (!pain || typeof pain !== 'object' || !('location' in pain) || typeof pain.location !== 'string' ||
      !('intensity' in pain) || typeof pain.intensity !== 'number' || !Number.isFinite(pain.intensity) || pain.intensity < 0 || pain.intensity > 10) return false;
  }
  if (value.plannedTempo !== undefined) {
    const tempo = value.plannedTempo;
    if (!tempo || typeof tempo !== 'object' || !['eccentric', 'pause', 'concentric'].every(key => {
      const part = Reflect.get(tempo, key);
      return typeof part === 'number' && Number.isFinite(part) && part >= 0 && part <= 30;
    })) return false;
  }
  if (value.dropSegments !== undefined && (!Array.isArray(value.dropSegments) || value.dropSegments.length > 50 || !value.dropSegments.every(segment =>
    segment && typeof segment === 'object' && typeof segment.weight === 'number' && Number.isFinite(segment.weight) && Math.abs(segment.weight) <= 2000 &&
    Number.isInteger(segment.reps) && segment.reps >= 0 && segment.reps <= 1000))) return false;
  return true;
}

function optionalNumbers(value: Record<string, unknown>, fields: string[], min: number, max: number): boolean {
  return fields.every(field => value[field] === undefined || (typeof value[field] === 'number' && Number.isFinite(value[field]) && value[field] >= min && value[field] <= max));
}
function optionalText(value: Record<string, unknown>, fields: string[]): boolean {
  return fields.every(field => value[field] === undefined || typeof value[field] === 'string');
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
export function validAdaptiveSessionMetadata(value: Record<string, unknown>): boolean {
  if (!optionalText(value, ['programId', 'sessionGoal', 'pausedAt']) || !optionalNumbers(value, ['programWeek'], 1, 1000) ||
    !optionalNumbers(value, ['pausedSeconds'], 0, Number.MAX_SAFE_INTEGER) ||
    (typeof value.programWeek === 'number' && !Number.isInteger(value.programWeek)) ||
    (value.trainingPhase !== undefined && !['RECOVERY', 'HYPERTROPHY', 'STRENGTH', 'DELOAD'].includes(String(value.trainingPhase)))) return false;
  if (value.sourceSessionContexts !== undefined && (!Array.isArray(value.sourceSessionContexts) || !value.sourceSessionContexts.every(context => isRecord(context) && typeof context.sessionId === 'string' && typeof context.startTime === 'string' && validAdaptiveSessionMetadata({ checkIn: context.checkIn, programId: context.programId, programWeek: context.programWeek, trainingPhase: context.trainingPhase, sessionGoal: context.sessionGoal })))) return false;
  if (value.checkIn === undefined) return true;
  const checkIn = value.checkIn;
  return isRecord(checkIn) && optionalText(checkIn, ['soreness', 'jointPain', 'notes']) &&
    optionalNumbers(checkIn, ['sleepHours'], 0, 24) && optionalNumbers(checkIn, ['hoursAwake'], 0, 168) &&
    optionalNumbers(checkIn, ['sleepQuality', 'energy', 'fatigue'], 1, 5) &&
    (checkIn.preWorkoutMeal === undefined || typeof checkIn.preWorkoutMeal === 'boolean');
}
export function validAdaptiveExerciseMetadata(value: Record<string, unknown>): boolean {
  if (!optionalNumbers(value, ['weightIncrement'], 0.01, 100)) return false;
  if (value.replacementHistory !== undefined && (!Array.isArray(value.replacementHistory) || !value.replacementHistory.every(change =>
    isRecord(change) && typeof change.fromExerciseId === 'string' && typeof change.toExerciseId === 'string' &&
    typeof change.at === 'string' && Number.isFinite(Date.parse(change.at)) &&
    optionalText(change, ['fromExerciseName', 'toExerciseName', 'reason']) &&
    ['kg', 'lbs'].includes(String(change.weightUnit)) && typeof change.weightReset === 'boolean'))) return false;
  if (value.feedback === undefined) return true;
  const feedback = value.feedback;
  return isRecord(feedback) && optionalText(feedback, ['compensation', 'painLocation', 'notes']) &&
    optionalNumbers(feedback, ['stimulus', 'fatigue'], 1, 5) && optionalNumbers(feedback, ['painIntensity'], 0, 10);
}

import type { WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';

export type PostSetAction =
  | { kind: 'none' }
  | { kind: 'finish' }
  | { kind: 'rest' }
  | { kind: 'next-member'; exerciseId: string; setId: string };

export function getCurrentGroupRound(exercises: readonly WorkoutExercise[]): number {
  const sets = exercises.flatMap(exercise => exercise.sets);
  const active = sets.find(set => set.startedAt && !set.completed);
  if (active) return active.setNumber;
  const pending = sets.filter(set => !set.completed).map(set => set.setNumber);
  return pending.length ? Math.min(...pending) : Math.max(1, ...sets.map(set => set.setNumber));
}

export function getPostSetAction(session: WorkoutSession, exerciseId: string, setId: string): PostSetAction {
  const source = session.exercises.find(exercise => exercise.id === exerciseId);
  const completed = source?.sets.find(set => set.id === setId);
  if (!source || !completed?.completed) return { kind: 'none' };
  const sets = session.exercises.flatMap(exercise => exercise.sets);
  if (sets.length && sets.every(set => set.completed)) return { kind: 'finish' };
  if (source.groupId) {
    for (const exercise of session.exercises) {
      if (exercise.groupId !== source.groupId) continue;
      const next = exercise.sets.find(set => set.setNumber === completed.setNumber && !set.completed);
      if (next) return { kind: 'next-member', exerciseId: exercise.id, setId: next.id };
    }
  }
  return { kind: 'rest' };
}

function newGroupSet(template: WorkoutSet | undefined, setNumber: number, restSeconds: number): WorkoutSet {
  return {
    id: crypto.randomUUID(), setNumber, completed: false, rpe: null, provenance: 'recorded',
    weight: template?.weight ?? 0, reps: template?.reps ?? 10,
    setType: template?.setType ?? 'UNSPECIFIED', side: template?.side,
    weightNeedsConfirmation: template?.weightNeedsConfirmation,
    plannedWeight: template?.plannedWeight, plannedWeightUnit: template?.plannedWeightUnit,
    plannedReps: template?.plannedReps, plannedSetType: template?.plannedSetType,
    plannedTempo: template?.plannedTempo ? { ...template.plannedTempo } : undefined,
    plannedRepRange: template?.plannedRepRange ? { ...template.plannedRepRange } : undefined,
    targetRpe: template?.targetRpe, targetRir: template?.targetRir,
    plannedNotes: template?.plannedNotes, plannedRestSeconds: restSeconds,
    dropSegments: template?.dropSegments?.map(segment => ({ ...segment })),
  };
}

export function applyGroupSettings(session: WorkoutSession, groupId: string, settings: { rounds: number; restSeconds: number }): WorkoutSession {
  const { rounds, restSeconds } = settings;
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 50 || !Number.isFinite(restSeconds) || restSeconds < 0 || restSeconds > 3600) return session;
  return { ...session, exercises: session.exercises.map(exercise => {
    if (exercise.groupId !== groupId) return exercise;
    const sets = exercise.sets.filter(set => set.completed || set.startedAt || set.setNumber <= rounds)
      .map(set => set.completed || set.startedAt ? set : { ...set, plannedRestSeconds: restSeconds });
    const template = exercise.sets[exercise.sets.length - 1];
    for (let round = 1; round <= rounds; round++) {
      if (!sets.some(set => set.setNumber === round)) sets.push(newGroupSet(template, round, restSeconds));
    }
    return { ...exercise, sets: sets.sort((a, b) => a.setNumber - b.setNumber) };
  }) };
}

export function applyRemainingGroupValues(exercise: WorkoutExercise, sourceSetId: string): WorkoutExercise {
  const source = exercise.sets.find(set => set.id === sourceSetId);
  if (!source) return exercise;
  return { ...exercise, sets: exercise.sets.map(set => set.completed || set.startedAt || set.setNumber <= source.setNumber
    ? set : { ...set, weight: source.weight, reps: source.reps, plannedWeight: source.plannedWeight,
      plannedWeightUnit: source.plannedWeightUnit, plannedReps: source.plannedReps,
      dropSegments: set.dropSegments?.length ? source.dropSegments?.map(segment => ({ ...segment })) ?? set.dropSegments : undefined }) };
}

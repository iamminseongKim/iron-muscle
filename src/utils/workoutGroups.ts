import type { WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';

export type PostSetAction =
  | { kind: 'none' }
  | { kind: 'finish' }
  | { kind: 'rest' }
  | { kind: 'next-member'; exerciseId: string; setId: string };

export interface GroupRound {
  ordinal: number;
  members: { exerciseId: string; setId: string; position: number }[];
}

export function getGroupRounds(exercises: readonly WorkoutExercise[]): GroupRound[] {
  const count = Math.max(0, ...exercises.map(exercise => exercise.sets.length));
  return Array.from({ length: count }, (_, index) => ({
    ordinal: index + 1,
    members: exercises.flatMap((exercise, position) => {
      const set = exercise.sets[index];
      return set ? [{ exerciseId: exercise.id, setId: set.id, position: position + 1 }] : [];
    }),
  }));
}

export function getGroupRoundNumber(exercise: WorkoutExercise, setId: string): number | undefined {
  const index = exercise.sets.findIndex(set => set.id === setId);
  return index < 0 ? undefined : index + 1;
}

export function getCurrentGroupRound(exercises: readonly WorkoutExercise[]): number {
  const rounds = getGroupRounds(exercises);
  const active = rounds.find(round => round.members.some(member => exercises.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId && set.startedAt && !set.completed)));
  const pending = rounds.find(round => round.members.some(member => !exercises.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId)?.completed));
  return active?.ordinal ?? pending?.ordinal ?? Math.max(1, rounds.length);
}

export function getPostSetAction(session: WorkoutSession, exerciseId: string, setId: string): PostSetAction {
  const source = session.exercises.find(exercise => exercise.id === exerciseId);
  const completed = source?.sets.find(set => set.id === setId);
  if (!source || !completed?.completed) return { kind: 'none' };
  const sets = session.exercises.flatMap(exercise => exercise.sets);
  if (sets.length && sets.every(set => set.completed)) return { kind: 'finish' };
  if (source.groupId) {
    const round = getGroupRoundNumber(source, setId);
    for (const exercise of session.exercises) {
      if (exercise.groupId !== source.groupId || round === undefined) continue;
      const next = exercise.sets[round - 1];
      if (next && !next.completed) return { kind: 'next-member', exerciseId: exercise.id, setId: next.id };
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
    const protectedLength = exercise.sets.reduce((length, set, index) => set.completed || set.startedAt ? index + 1 : length, 0);
    const count = Math.max(rounds, protectedLength);
    const sets = exercise.sets.slice(0, count).map(set => set.completed || set.startedAt ? set : { ...set, plannedRestSeconds: restSeconds });
    const template = exercise.sets[exercise.sets.length - 1];
    const lastNumber = Math.max(0, ...exercise.sets.map(set => set.setNumber));
    while (sets.length < count) sets.push(newGroupSet(template, lastNumber + sets.length - exercise.sets.length + 1, restSeconds));
    return { ...exercise, sets };
  }) };
}

export function applyRemainingGroupValues(exercise: WorkoutExercise, sourceSetId: string): WorkoutExercise {
  const sourceIndex = exercise.sets.findIndex(set => set.id === sourceSetId);
  const source = exercise.sets[sourceIndex];
  if (!source) return exercise;
  return { ...exercise, sets: exercise.sets.map((set, index) => set.completed || set.startedAt || index <= sourceIndex
    ? set : { ...set, weight: source.weight, reps: source.reps, plannedWeight: source.plannedWeight,
      plannedWeightUnit: source.plannedWeightUnit, plannedReps: source.plannedReps,
      dropSegments: set.dropSegments?.length ? source.dropSegments?.map(segment => ({ ...segment })) ?? set.dropSegments : undefined }) };
}

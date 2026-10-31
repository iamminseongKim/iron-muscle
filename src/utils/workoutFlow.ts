import type { EquipmentType, LoadType, WeightUnit, WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';
import { calculateSessionReps, calculateSessionVolume, isAssistedExercise, KG_TO_LBS } from './calculations';
import { resolveRecordedExercise } from './exerciseResolver';
import { getTodayString } from './calendar';

const planTags = new Set(['웜업', '탑세트', '백오프', '드롭세트']);
const usableSet = (set: WorkoutSet) => set.completed && Number.isFinite(set.weight) && Number.isInteger(set.reps) && set.reps > 0;

/** Start a fresh plan from performed work, leaving every source record untouched. */
export function repeatWorkout(source: WorkoutSession, options: { now?: Date; bodyWeight?: number } = {}): WorkoutSession {
  if (!source.completed || !source.exercises.some(ex => ex.sets.some(usableSet))) {
    throw new Error('완료한 세트가 있는 운동 기록을 선택하세요.');
  }
  const now = options.now || new Date();
  const groups = new Map<string, string>();
  const exercises: WorkoutExercise[] = source.exercises.filter(ex => ex.sets.some(usableSet)).map(ex => {
    if (ex.groupId && !groups.has(ex.groupId)) groups.set(ex.groupId, crypto.randomUUID());
    return {
      id: crypto.randomUUID(), exerciseId: ex.exerciseId, exerciseName: ex.exerciseName,
      equipmentType: ex.equipmentType, loadType: ex.loadType, executionMode: ex.executionMode,
      weightUnit: ex.weightUnit || source.weightUnit || 'kg', machineBrand: ex.machineBrand,
      machineConfigId: ex.machineConfigId, machineSetting: ex.machineSetting,
      groupId: ex.groupId ? groups.get(ex.groupId) : undefined,
      groupType: ex.groupType, groupLabel: ex.groupLabel, groupColor: ex.groupColor,
      sets: ex.sets.filter(usableSet).map((set, i) => ({
        id: crypto.randomUUID(), setNumber: i + 1, weight: set.weight, reps: set.reps,
        completed: false, provenance: 'recorded', rpe: null, plannedWeight: set.weight, plannedReps: set.reps, plannedSetType: set.setType, setType: set.setType, previousWeight: set.weight, previousReps: set.reps, side: set.side,
        plannedRestSeconds: set.plannedRestSeconds,
        plannedTempo: set.tempo ? { ...set.tempo } : undefined,
        tags: set.tags?.filter(tag => planTags.has(tag)),
      })),
    };
  });
  // A skipped partner must not leave a misleading one-exercise superset.
  const groupSizes = new Map<string, number>();
  for (const exercise of exercises) if (exercise.groupId) groupSizes.set(exercise.groupId, (groupSizes.get(exercise.groupId) || 0) + 1);
  for (const exercise of exercises) {
    if (exercise.groupId && (groupSizes.get(exercise.groupId) || 0) < 2) {
      delete exercise.groupId;
      delete exercise.groupType;
      delete exercise.groupLabel;
      delete exercise.groupColor;
    }
  }
  return {
    id: crypto.randomUUID(), title: source.title, date: options.now ? localDate(now) : getTodayString(),
    startTime: now.toISOString(), durationSeconds: 0, completed: false, exercises,
    weightUnit: source.weightUnit || 'kg', bodyWeight: options.bodyWeight,
    conditionEmoji: '💪', isDeload: false,
    targetCategories: source.targetCategories ? [...source.targetCategories] : undefined,
    targetPartIds: source.targetPartIds ? [...source.targetPartIds] : undefined,
  };
}

function localDate(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Group members are indivisible blocks, including legacy noncontiguous groups. */
function exerciseBlocks(exercises: WorkoutExercise[]): WorkoutExercise[][] {
  const blocks: WorkoutExercise[][] = [];
  const groups = new Map<string, WorkoutExercise[]>();
  for (const exercise of exercises) {
    if (exercise.groupId) {
      const group = groups.get(exercise.groupId);
      if (group) group.push(exercise);
      else { const block = [exercise]; groups.set(exercise.groupId, block); blocks.push(block); }
    } else blocks.push([exercise]);
  }
  return blocks;
}

export function getExerciseMoveAvailability(exercises: WorkoutExercise[], id: string) {
  const blocks = exerciseBlocks(exercises);
  const index = blocks.findIndex(block => block.some(ex => ex.id === id));
  return { up: index > 0, down: index >= 0 && index < blocks.length - 1 };
}

export function moveWorkoutExercise(exercises: WorkoutExercise[], id: string, direction: 'up' | 'down'): WorkoutExercise[] {
  const blocks = exerciseBlocks(exercises);
  const index = blocks.findIndex(block => block.some(ex => ex.id === id));
  const destination = index + (direction === 'up' ? -1 : 1);
  if (index < 0 || destination < 0 || destination >= blocks.length) return [...exercises];
  [blocks[index], blocks[destination]] = [blocks[destination], blocks[index]];
  return blocks.flat();
}

export function reorderWorkoutExercise(exercises: WorkoutExercise[], sourceId: string, targetId: string, placement: 'before' | 'after'): WorkoutExercise[] {
  const blocks = exerciseBlocks(exercises);
  const source = blocks.findIndex(block => block.some(ex => ex.id === sourceId));
  const target = blocks.findIndex(block => block.some(ex => ex.id === targetId));
  if (source < 0 || target < 0 || source === target) return [...exercises];
  const moving = blocks[source];
  const remaining = blocks.filter((_, index) => index !== source);
  const destination = remaining.findIndex(block => block.some(ex => ex.id === targetId));
  remaining.splice(destination + (placement === 'after' ? 1 : 0), 0, moving);
  return remaining.flat();
}

export function replaceWorkoutExercise(
  exercises: WorkoutExercise[],
  targetId: string,
  replacement: {
    exerciseId: string;
    exerciseName?: string;
    equipmentType: EquipmentType;
    loadType?: LoadType;
    machineBrand?: string;
    machineConfigId?: string;
    machineSetting?: string;
    weightUnit?: WeightUnit;
    initialSets?: WorkoutSet[];
  }
): WorkoutExercise[] {
  const index = exercises.findIndex(ex => ex.id === targetId);
  if (index === -1) return [...exercises];
  const target = exercises[index];

  const sets: WorkoutSet[] = replacement.initialSets && replacement.initialSets.length > 0
    ? replacement.initialSets.map((s, i) => ({
        id: crypto.randomUUID(),
        setNumber: i + 1,
        weight: s.weight,
        reps: s.reps,
        completed: false,
        previousWeight: s.previousWeight ?? s.weight,
        previousReps: s.previousReps ?? s.reps,
        side: s.side,
        tags: s.tags,
      }))
    : target.sets.map((s, i) => ({
        id: crypto.randomUUID(),
        setNumber: i + 1,
        weight: s.weight,
        reps: s.reps,
        completed: false,
        previousWeight: s.previousWeight ?? s.weight,
        previousReps: s.previousReps ?? s.reps,
        side: s.side,
        tags: s.tags,
      }));

  const updated: WorkoutExercise = {
    ...target,
    exerciseId: replacement.exerciseId,
    exerciseName: replacement.exerciseName || target.exerciseName,
    equipmentType: replacement.equipmentType,
    loadType: replacement.loadType,
    machineBrand: replacement.machineBrand,
    machineConfigId: replacement.machineConfigId,
    machineSetting: replacement.machineSetting,
    weightUnit: replacement.weightUnit || target.weightUnit,
    sets: sets.length > 0 ? sets : [
      { id: crypto.randomUUID(), setNumber: 1, weight: 20, reps: 10, completed: false },
      { id: crypto.randomUUID(), setNumber: 2, weight: 20, reps: 10, completed: false },
    ],
  };

  const next = [...exercises];
  next[index] = updated;
  return next;
}

// Compare recorded machine and execution conditions, regardless of exercise order.
// Units are normalized by the volume calculation; changing kg/lbs alone is comparable.
function exerciseKey(ex: WorkoutExercise): string {
  return JSON.stringify([
    ex.exerciseId, ex.equipmentType, ex.loadType || '', ex.executionMode || 'bilateral',
    ex.machineConfigId || '', ex.machineBrand || '', ex.machineSetting || '',
    [...new Set(ex.sets.filter(usableSet).map(set => set.side || 'both'))].sort(),
  ]);
}
function comparisonKey(session: WorkoutSession): string {
  return JSON.stringify(session.exercises.filter(ex => ex.sets.some(usableSet)).map(exerciseKey).sort());
}
const chronologicalKey = (session: WorkoutSession) => `${session.date}\u0000${session.startTime || ''}\u0000${session.id}`;
const countSets = (session: WorkoutSession) => session.exercises.reduce((sum, ex) => sum + ex.sets.filter(set => set.completed).length, 0);

function personalBestRecords(session: WorkoutSession, history: WorkoutSession[]) {
  const records: { exercise: WorkoutExercise; weight: number; unit: WeightUnit }[] = [];
  const previous = history.filter(candidate => candidate.completed && candidate.id !== session.id && chronologicalKey(candidate) < chronologicalKey(session));
  const visited = new Set<string>();
  const inKg = (weight: number, exercise: WorkoutExercise, owner: WorkoutSession) =>
    (exercise.weightUnit || owner.weightUnit) === 'lbs' ? weight / KG_TO_LBS : weight;
  const maxWeight = (exercise: WorkoutExercise) => Math.max(0, ...exercise.sets.filter(set => usableSet(set) && (!set.setType || ['WORKING', 'TOP_SET', 'BACK_OFF', 'DROP_SET'].includes(set.setType))).map(set => set.weight));
  for (const exercise of session.exercises) {
    const key = exerciseKey(exercise);
    if (visited.has(key) || exercise.equipmentType === 'bodyweight' || isAssistedExercise(resolveRecordedExercise(exercise))) continue;
    visited.add(key);
    const currentExercise = session.exercises.filter(ex => exerciseKey(ex) === key)
      .sort((a, b) => inKg(maxWeight(b), b, session) - inKg(maxWeight(a), a, session))[0];
    const weight = maxWeight(currentExercise);
    if (weight <= 0) continue;
    const earlierWeights = previous.flatMap(owner => owner.exercises.filter(ex => exerciseKey(ex) === key)
      .map(ex => inKg(maxWeight(ex), ex, owner))).filter(weight => weight > 0);
    if (earlierWeights.length && inKg(weight, currentExercise, session) > Math.max(...earlierWeights) + 0.01) {
      records.push({ exercise: currentExercise, weight, unit: currentExercise.weightUnit || session.weightUnit || 'kg' });
    }
  }
  return records;
}

export function workoutSummary(session: WorkoutSession, history: WorkoutSession[]) {
  const key = comparisonKey(session);
  const previous = key === '[]' ? null : history.filter(candidate => candidate.completed && candidate.id !== session.id &&
    chronologicalKey(candidate) < chronologicalKey(session) && comparisonKey(candidate) === key)
    .sort((a, b) => chronologicalKey(b).localeCompare(chronologicalKey(a)))[0] || null;
  const completedSets = countSets(session);
  const reps = calculateSessionReps(session);
  const volume = calculateSessionVolume(session);
  return {
    completedSets, reps, volume, previous, personalBests: personalBestRecords(session, history),
    setDelta: previous ? completedSets - countSets(previous) : null,
    repDelta: previous ? reps - calculateSessionReps(previous) : null,
    volumeDelta: previous ? volume - calculateSessionVolume(previous) : null,
  };
}

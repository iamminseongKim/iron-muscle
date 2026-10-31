import type { WorkoutExercise, WorkoutSession, WorkoutSet, TrainingPhase } from '../types/workout';
import { actualRpe, isWorkingSet } from './adaptiveTraining';
import { calculate1RM, KG_TO_LBS } from './calculations';
import { resolveRecordedExercise } from './exerciseResolver';

const completed = (set: WorkoutSet) => set.completed && Number.isFinite(set.weight) && Number.isInteger(set.reps) && set.reps > 0;
const kg = (weight: number, exercise: WorkoutExercise, session?: WorkoutSession) => (exercise.weightUnit || session?.weightUnit) === 'lbs' ? weight / KG_TO_LBS : weight;
const mean = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 10) / 10 : null;
const volume = (set: WorkoutSet) => set.dropSegments?.length ? set.dropSegments.reduce((sum, segment) => sum + Math.max(0, segment.weight) * segment.reps, 0) : Math.max(0, set.weight) * set.reps;

export function summarizeAdaptiveSession(session: WorkoutSession) {
  const sets = session.exercises.flatMap(exercise => exercise.sets.filter(completed));
  const working = sets.filter(isWorkingSet);
  const rpes = sets.flatMap(set => { const rpe = actualRpe(set); return rpe === null ? [] : [rpe]; });
  const issues = new Set<string>();
  const ids = new Set<string>();
  for (const exercise of session.exercises) {
    for (const set of exercise.sets) {
      if (ids.has(set.id)) issues.add('duplicate-set');
      ids.add(set.id);
      if (!set.completed) continue;
      if (set.provenance !== 'recorded') issues.add('legacy-unknown');
      if (actualRpe(set) === null) issues.add('missing-rpe');
      if (!set.setType || set.setType === 'UNSPECIFIED') issues.add('unspecified-type');
      if (!set.startedAt || set.restSeconds === undefined) issues.add('unmeasured-rest');
      if (set.restSeconds !== undefined && set.restSeconds > 1800) issues.add('long-rest');
      if (set.previousWeight && Math.abs(set.weight - set.previousWeight) > Math.abs(set.previousWeight)) issues.add('weight-change');
    }
  }
  if (session.pausedAt || session.pausedSeconds) issues.add('paused-session');
  const muscleWorkingSets: Record<string, number> = {};
  for (const exercise of session.exercises) {
    const count = exercise.sets.filter(set => completed(set) && isWorkingSet(set)).length;
    for (const muscle of resolveRecordedExercise(exercise).primaryMuscles) muscleWorkingSets[muscle] = (muscleWorkingSets[muscle] || 0) + count;
  }
  return {
    muscleWorkingSets,
    totalSets: sets.length,
    warmupSets: sets.filter(set => set.setType === 'WARMUP').length,
    activationSets: sets.filter(set => set.setType === 'ACTIVATION').length,
    workingSets: working.length,
    unspecifiedSets: sets.filter(set => !set.setType || set.setType === 'UNSPECIFIED').length,
    totalReps: sets.reduce((sum, set) => sum + (set.dropSegments?.length ? set.dropSegments.reduce((count, segment) => count + segment.reps, 0) : set.reps), 0),
    totalVolume: Math.round(session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(completed).reduce((subtotal, set) => subtotal + kg(volume(set), exercise, session), 0), 0)),
    workingVolume: Math.round(session.exercises.reduce((sum, exercise) => sum + exercise.sets.filter(set => completed(set) && isWorkingSet(set)).reduce((subtotal, set) => subtotal + kg(volume(set), exercise, session), 0), 0)),
    averageRpe: mean(rpes),
    workingAverageRpe: mean(working.flatMap(set => { const rpe = actualRpe(set); return rpe === null ? [] : [rpe]; })),
    maxRpe: rpes.length ? Math.max(...rpes) : null,
    failureSets: sets.filter(set => ['TECHNICAL', 'MUSCULAR', 'OTHER'].includes(set.failureType || '')).length,
    issues: [...issues],
  };
}

function equipmentKey(exercise: WorkoutExercise) {
  return JSON.stringify([exercise.exerciseId, exercise.equipmentType, exercise.loadType || '', exercise.executionMode || 'bilateral', exercise.machineConfigId || '', exercise.machineBrand || '', exercise.machineSetting || '', [...new Set(exercise.sets.filter(set => completed(set) && isWorkingSet(set)).map(set => set.side || 'both'))].sort()]);
}
function bestWorkingSet(exercise: WorkoutExercise, session: WorkoutSession) {
  return exercise.sets.filter(set => completed(set) && isWorkingSet(set) && set.provenance === 'recorded' && set.weight > 0)
    .sort((a, b) => kg(b.weight, exercise, session) - kg(a.weight, exercise, session) || b.reps - a.reps)[0] || null;
}
export function compareExercise(current: WorkoutExercise, session: WorkoutSession, history: WorkoutSession[]) {
  const earlier = history.filter(candidate => candidate.id !== session.id && candidate.completed && `${candidate.date} ${candidate.startTime || ''}` < `${session.date} ${session.startTime || ''}`)
    .sort((a, b) => `${b.date} ${b.startTime || ''}`.localeCompare(`${a.date} ${a.startTime || ''}`));
  const currentBest = bestWorkingSet(current, session);
  const previousOwner = earlier.find(owner => owner.exercises.some(exercise => equipmentKey(exercise) === equipmentKey(current) && bestWorkingSet(exercise, owner)));
  const previous = previousOwner?.exercises.find(exercise => equipmentKey(exercise) === equipmentKey(current) && bestWorkingSet(exercise, previousOwner));
  const equipmentChanged = earlier.some(owner => owner.exercises.some(exercise => exercise.exerciseId === current.exerciseId && equipmentKey(exercise) !== equipmentKey(current)));
  if ((['machine', 'smith', 'cable'].includes(current.equipmentType) && !current.machineConfigId) || !previousOwner || !previous || !currentBest) return { comparison: null, equipmentChanged };
  const previousBest = bestWorkingSet(previous, previousOwner)!;
  const currentRpe = actualRpe(currentBest);
  const previousRpe = actualRpe(previousBest);
  return { equipmentChanged, comparison: {
    previousDate: previousOwner.date, previousUnit: previous.weightUnit || previousOwner.weightUnit || 'kg', previousBest, currentBest,
    weightDeltaKg: kg(currentBest.weight, current, session) - kg(previousBest.weight, previous, previousOwner),
    repDelta: currentBest.reps - previousBest.reps,
    rpeDelta: currentRpe !== null && previousRpe !== null ? currentRpe - previousRpe : null,
    restDelta: currentBest.restSeconds !== undefined && previousBest.restSeconds !== undefined ? currentBest.restSeconds - previousBest.restSeconds : null,
    estimated1RmDeltaKg: calculate1RM(kg(currentBest.weight, current, session), currentBest.reps) - calculate1RM(kg(previousBest.weight, previous, previousOwner), previousBest.reps),
  } };
}

export function suggestNextSet({ exercise, completedSet, nextSet, phase, increment, pain = false }: {
  exercise: WorkoutExercise; completedSet: WorkoutSet; nextSet: WorkoutSet; phase?: TrainingPhase; increment?: number; pain?: boolean;
}) {
  const rpe = actualRpe(completedSet);
  const target = completedSet.targetRpe;
  if (pain || exercise.feedback?.painIntensity || exercise.sets.some(set => (set.painFeedback?.intensity || 0) > 0) || rpe === null || target === undefined || !isWorkingSet(completedSet) || !isWorkingSet(nextSet) || nextSet.completed || completedSet.weight <= 0) return null;
  const deltaRpe = rpe - target;
  if (Math.abs(deltaRpe) < 1) return null;
  const direction = deltaRpe > 0 ? 'decrease' : 'increase';
  if (direction === 'increase' && (phase === 'RECOVERY' || phase === 'DELOAD' || (completedSet.failureType && !['NONE', 'UNKNOWN'].includes(completedSet.failureType)))) return null;
  const step = increment ?? exercise.weightIncrement ?? ((exercise.weightUnit || 'kg') === 'lbs' ? 5 : exercise.equipmentType === 'dumbbell' ? 1 : 2.5);
  if (!Number.isFinite(step) || step <= 0) return null;
  const baseline = nextSet.weight;
  const weight = Math.max(0, Math.round((baseline + (direction === 'increase' ? step : -step)) * 100) / 100);
  if (weight === baseline) return null;
  return { weight, reps: nextSet.reps, direction, reason: deltaRpe > 0 ? 'rpe-high' : 'rpe-low', deltaRpe };
}

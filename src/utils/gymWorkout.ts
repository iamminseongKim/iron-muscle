import { WorkoutExercise, WorkoutSession, WeightUnit } from '../types/workout';
import { GymMachineConfig } from './gymStorage';
import { convertWeight, recentCompletedSessions } from './calculations';

export function findPreviousMachineExercise(sessions: WorkoutSession[], exerciseId: string, brand?: string, configId?: string) {
  for (const session of recentCompletedSessions(sessions)) {
    const match = session.exercises.find(exercise => exercise.exerciseId === exerciseId &&
      (configId ? exercise.machineConfigId === configId :
        !exercise.machineConfigId && (brand ? exercise.machineBrand === brand : !exercise.machineBrand)) &&
      exercise.sets.some(set => set.completed));
    if (match) return { ...match, weightUnit: match.weightUnit || session.weightUnit || 'kg', sets: match.sets.filter(set => set.completed) };
  }
  return undefined;
}

export function convertExerciseSets(exercise: WorkoutExercise, targetUnit: WeightUnit, fallbackUnit: WeightUnit = 'kg') {
  return exercise.sets.map(set => ({
    ...set,
    weight: convertWeight(set.weight, exercise.weightUnit || fallbackUnit, targetUnit),
    plannedWeight: set.plannedWeight === undefined ? undefined : convertWeight(set.plannedWeight, exercise.weightUnit || fallbackUnit, targetUnit),
    previousWeight: set.previousWeight === undefined ? undefined : convertWeight(set.previousWeight, exercise.weightUnit || fallbackUnit, targetUnit),
  }));
}

/** A completed set belongs to its recorded machine; start a separate exercise to switch. */
export function applyGymMachineConfig(exercise: WorkoutExercise, config: GymMachineConfig, gymId: string, fallbackUnit: WeightUnit = 'kg'): WorkoutExercise {
  if (exercise.sets.some(set => set.completed)) return exercise;
  const unit = config.weightUnit || exercise.weightUnit || fallbackUnit;
  return {
    ...exercise,
    machineConfigId: `${gymId}:${config.id}`,
    machineBrand: config.brand,
    machineSetting: config.machineSetting,
    loadType: config.loadType || exercise.loadType,
    weightUnit: unit,
    sets: convertExerciseSets(exercise, unit, fallbackUnit),
  };
}

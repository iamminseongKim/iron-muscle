import { WorkoutExercise, WorkoutSession, WeightUnit } from '../types/workout';
import { GymMachineConfig } from './gymStorage';
import { convertWeight } from './calculations';

export function findPreviousMachineExercise(sessions: WorkoutSession[], exerciseId: string, brand?: string, configId?: string) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const match = sessions[i].exercises.find(exercise => exercise.exerciseId === exerciseId &&
      (configId ? exercise.machineConfigId === configId : (!brand || exercise.machineBrand === brand)) && exercise.sets.length > 0);
    if (match) return match;
  }
  return undefined;
}

export function convertExerciseSets(exercise: WorkoutExercise, targetUnit: WeightUnit, fallbackUnit: WeightUnit = 'kg') {
  return exercise.sets.map(set => ({
    ...set,
    weight: convertWeight(set.weight, exercise.weightUnit || fallbackUnit, targetUnit),
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

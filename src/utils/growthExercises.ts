import { Exercise, WorkoutSession } from '../types/workout';
import { calculateProgression } from './calculations';

export interface GrowthExerciseOption {
  exercise: Exercise;
  recordCount: number;
  latestDate: string;
}

export function buildGrowthExerciseOptions(catalog: Exercise[], history: WorkoutSession[]): GrowthExerciseOption[] {
  const recordedIds = new Set(history.flatMap(session => session.exercises.map(ex => ex.exerciseId)));
  return catalog.map(exercise => {
    const records = recordedIds.has(exercise.id) ? calculateProgression(exercise.id, history).records : [];
    return { exercise, recordCount: records.length, latestDate: records[records.length - 1]?.date || '' };
  }).sort((a, b) => Number(b.recordCount > 0) - Number(a.recordCount > 0) ||
    b.latestDate.localeCompare(a.latestDate) || a.exercise.name.localeCompare(b.exercise.name, 'ko'));
}

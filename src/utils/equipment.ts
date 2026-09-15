import { EquipmentType, Exercise } from '../types/workout';

export const EQUIPMENT_OPTIONS: { id: EquipmentType; label: string }[] = [
  { id: 'machine', label: '머신' },
  { id: 'smith', label: '스미스' },
  { id: 'cable', label: '케이블' },
  { id: 'barbell', label: '바벨' },
  { id: 'dumbbell', label: '덤벨' },
  { id: 'bodyweight', label: '맨몸' },
  { id: 'other', label: '기타' },
];
export const EQUIPMENT_FILTERS = [{ id: 'all' as const, label: '모든 장비' }, ...EQUIPMENT_OPTIONS];
// Classify legacy Smith entries without changing stored exercise IDs or records.
export function getExerciseEquipment(exercise: Pick<Exercise, 'equipment' | 'name' | 'nameEn'>): EquipmentType {
  if (exercise.equipment === 'smith' || /스미스|\bsmith\b/i.test(exercise.name + ' ' + exercise.nameEn)) return 'smith';
  return exercise.equipment;
}
export const equipmentLabel = (equipment: EquipmentType) => EQUIPMENT_OPTIONS.find(option => option.id === equipment)?.label || '기타';

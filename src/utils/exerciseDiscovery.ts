import { Exercise, WorkoutSession } from '../types/workout';
import { CORE_EXERCISE_IDS, DISCOVERY_DUPLICATES } from '../data/exerciseDiscovery';
import { getExerciseSearchFields, matchesExerciseSearch, normalizeSearch } from './exerciseSearch';
import { t } from '../i18n';

const core = new Map<string, number>(CORE_EXERCISE_IDS.map((id, index) => [id, index]));
export const isCoreExercise = (exercise: Exercise) => core.has(exercise.id);
export interface ExerciseUsage { sessions: number; latest: number }
export function buildExerciseUsage(history: WorkoutSession[]): Map<string, ExerciseUsage> {
  const usage = new Map<string, ExerciseUsage>();
  const seenSessions = new Set<string>();
  for (const session of history) {
    if (seenSessions.has(session.id)) continue;
    seenSessions.add(session.id);
    const ids = new Set(session.exercises.filter(ex => ex.sets.some(set => set.completed)).map(ex => ex.exerciseId));
    const parsed = Date.parse(session.date);
    const latest = Number.isFinite(parsed) ? parsed : 0;
    for (const id of ids) {
      const previous = usage.get(id);
      usage.set(id, { sessions: (previous?.sessions || 0) + 1, latest: Math.max(previous?.latest || 0, latest) });
    }
  }
  return usage;
}

// Broad equipment/body-part searches remain below actual name/alias matches.
const categoryLabels: Record<string, string> = { chest: '가슴', back: '등', legs: '하체', shoulders: '어깨', arms: '팔', core: '복근/코어', fullbody: '전신' };
const equipmentLabels: Record<string, string> = { smith: '스미스', barbell: '바벨', dumbbell: '덤벨', machine: '머신', cable: '케이블', bodyweight: '맨몸', other: '기타' };
export function exerciseSearchRelevance(exercise: Exercise, query: string): number {
  const normalized = normalizeSearch(query.trim());
  if (!normalized) return 0;
  const contexts = [...exercise.categories.flatMap(category => [category, categoryLabels[category], t(categoryLabels[category])]), exercise.equipment, equipmentLabels[exercise.equipment], t(equipmentLabels[exercise.equipment])].filter(Boolean).map(normalizeSearch);
  const broadTerms = [...Object.keys(categoryLabels), ...Object.keys(equipmentLabels), ...Object.values(categoryLabels), ...Object.values(equipmentLabels)].flatMap(term => [term, t(term)]).map(normalizeSearch);
  // A body-part/equipment query is a filter, not a substring inside an obscure name.
  if (broadTerms.includes(normalized)) return contexts.includes(normalized) ? 1 : -1;
  const fields = getExerciseSearchFields(exercise).map(normalizeSearch).filter(Boolean);
  if (fields.includes(normalized)) return 4;
  if (fields.some(field => field.includes(normalized))) return 3;
  if (matchesExerciseSearch(exercise, query)) return 2;
  const tokens = query.trim().split(/\s+/).map(normalizeSearch);
  return tokens.every(token => contexts.includes(token) || fields.some(field => field.includes(token))) ? 1 : -1;
}

export function rankExercises(
  catalog: Exercise[],
  query: string,
  usage = new Map<string, ExerciseUsage>(),
  gymEquipmentIds?: Set<string>
): Exercise[] {
  return catalog.map(exercise => ({ exercise, relevance: exerciseSearchRelevance(exercise, query) }))
    .filter(item => item.relevance >= 0)
    .sort((a, b) => {
      if (a.relevance !== b.relevance) return b.relevance - a.relevance;
      if (gymEquipmentIds && gymEquipmentIds.size > 0) {
        const aInGym = gymEquipmentIds.has(a.exercise.id);
        const bInGym = gymEquipmentIds.has(b.exercise.id);
        if (aInGym !== bInGym) return Number(bInGym) - Number(aInGym);
      }
      const au = usage.get(a.exercise.id), bu = usage.get(b.exercise.id);
      // Recency first, frequency as a tie-breaker; exact query matches always beat history.
      return Number(Boolean(bu)) - Number(Boolean(au)) || (bu?.latest || 0) - (au?.latest || 0) ||
        (bu?.sessions || 0) - (au?.sessions || 0) ||
        Number(isCoreExercise(b.exercise)) - Number(isCoreExercise(a.exercise)) ||
        Number(Boolean(DISCOVERY_DUPLICATES[a.exercise.id])) - Number(Boolean(DISCOVERY_DUPLICATES[b.exercise.id])) ||
        (core.get(a.exercise.id) ?? 999) - (core.get(b.exercise.id) ?? 999) ||
        a.exercise.id.localeCompare(b.exercise.id);
    }).map(item => item.exercise);
}

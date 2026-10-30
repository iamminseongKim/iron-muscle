import { Exercise, WorkoutSession } from '../types/workout';
import { CORE_EXERCISE_IDS, DISCOVERY_DUPLICATES } from '../data/exerciseDiscovery';
import { getExerciseSearchFields, getExerciseNormalizedFields, matchesExerciseSearch, normalizeSearch } from './exerciseSearch';
import { t, getLanguage } from '../i18n';

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

let cachedBroadLanguage: string | null = null;
let cachedBroadTerms: Set<string> = new Set();

function getBroadTerms(): Set<string> {
  const lang = getLanguage();
  if (cachedBroadLanguage === lang && cachedBroadTerms.size > 0) return cachedBroadTerms;
  const broad = [...Object.keys(categoryLabels), ...Object.keys(equipmentLabels), ...Object.values(categoryLabels), ...Object.values(equipmentLabels)].flatMap(term => [term, t(term)]).map(normalizeSearch).filter(Boolean);
  cachedBroadLanguage = lang;
  cachedBroadTerms = new Set(broad);
  return cachedBroadTerms;
}

const exerciseContextMap = new WeakMap<Exercise, string[]>();
function getExerciseContexts(exercise: Exercise): string[] {
  const cached = exerciseContextMap.get(exercise);
  if (cached) return cached;
  const contexts = [...exercise.categories.flatMap(category => [category, categoryLabels[category], t(categoryLabels[category])]), exercise.equipment, equipmentLabels[exercise.equipment], t(equipmentLabels[exercise.equipment])].filter(Boolean).map(normalizeSearch);
  exerciseContextMap.set(exercise, contexts);
  return contexts;
}

export interface PreparedSearchQuery {
  trimmed: string;
  normalized: string;
  tokens: string[];
  isBroad: boolean;
}

export function prepareSearchQuery(query: string): PreparedSearchQuery {
  const trimmed = query.trim();
  const normalized = normalizeSearch(trimmed);
  const tokens = trimmed.split(/\s+/).map(normalizeSearch).filter(Boolean);
  const isBroad = normalized ? getBroadTerms().has(normalized) : false;
  return { trimmed, normalized, tokens, isBroad };
}

export function exerciseSearchRelevancePrepared(exercise: Exercise, prep: PreparedSearchQuery): number {
  if (!prep.normalized) return 0;
  const contexts = getExerciseContexts(exercise);
  if (prep.isBroad) return contexts.includes(prep.normalized) ? 1 : -1;
  const fields = getExerciseNormalizedFields(exercise);
  if (fields.includes(prep.normalized)) return 4;
  if (fields.some(field => field.includes(prep.normalized))) return 3;
  if (matchesExerciseSearch(exercise, prep.trimmed)) return 2;
  return prep.tokens.every(token => contexts.includes(token) || fields.some(field => field.includes(token))) ? 1 : -1;
}

export function exerciseSearchRelevance(exercise: Exercise, query: string): number {
  return exerciseSearchRelevancePrepared(exercise, prepareSearchQuery(query));
}

export function rankExercises(
  catalog: Exercise[],
  query: string,
  usage = new Map<string, ExerciseUsage>(),
  gymEquipmentIds?: Set<string>
): Exercise[] {
  const prep = prepareSearchQuery(query);
  return catalog.map(exercise => ({ exercise, relevance: exerciseSearchRelevancePrepared(exercise, prep) }))
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

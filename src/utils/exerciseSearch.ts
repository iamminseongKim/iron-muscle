import { Exercise } from '../types/workout';
import { getAllExerciseTranslations } from '../i18n';
import { DISCOVERY_ALIASES } from '../data/exerciseDiscovery';

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
export const normalizeSearch = (text: string): string => text.normalize('NFKC').toLowerCase().replace(/[\s\-_/()·, .]/g, '').replace(/래터럴/g, '레터럴');
const initialConsonants = (text: string): string => [...text].map(char => {
  const code = char.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? CHOSUNG[Math.floor(code / 588)] : char;
}).join('');

interface ExerciseSearchIndex {
  fields: string[];
  normalized: string[];
  chosungNormalized: string[];
}

const searchIndices = new WeakMap<Exercise, ExerciseSearchIndex>();

export function getExerciseSearchIndex(exercise: Exercise): ExerciseSearchIndex {
  const cached = searchIndices.get(exercise);
  if (cached) return cached;
  const translations = getAllExerciseTranslations(exercise);
  const fields = [exercise.name, exercise.nameEn, exercise.defaultBrand || '', ...(exercise.aliases || []), ...(DISCOVERY_ALIASES[exercise.id] || []), ...translations];
  const normalized = fields.map(normalizeSearch);
  const chosungNormalized = fields.map(field => normalizeSearch(initialConsonants(field)));
  const index: ExerciseSearchIndex = { fields, normalized, chosungNormalized };
  searchIndices.set(exercise, index);
  return index;
}

export function getExerciseSearchFields(exercise: Exercise): string[] {
  return getExerciseSearchIndex(exercise).fields;
}

export function getExerciseNormalizedFields(exercise: Exercise): string[] {
  return getExerciseSearchIndex(exercise).normalized;
}

export function matchesExerciseSearch(exercise: Exercise, query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const index = getExerciseSearchIndex(exercise);
  const normQuery = normalizeSearch(trimmed);
  if (/^[ㄱ-ㅎ\s]+$/.test(trimmed)) {
    return index.chosungNormalized.some(field => field.includes(normQuery));
  }
  // A full compact name or separate brand/name words can both match.
  if (index.normalized.some(field => field.includes(normQuery))) return true;
  const words = trimmed.split(/\s+/).map(normalizeSearch).filter(Boolean);
  if (words.length > 1) {
    return words.every(word => index.normalized.some(field => field.includes(word)));
  }
  return false;
}

import { Exercise } from '../types/workout';
import { getAllExerciseTranslations } from '../i18n';
import { DISCOVERY_ALIASES } from '../data/exerciseDiscovery';

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
export const normalizeSearch = (text: string): string => text.normalize('NFKC').toLowerCase().replace(/[\s\-_/()·, .]/g, '').replace(/래터럴/g, '레터럴');
const initialConsonants = (text: string): string => [...text].map(char => {
  const code = char.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? CHOSUNG[Math.floor(code / 588)] : char;
}).join('');

const searchFields = new WeakMap<Exercise, string[]>();
export function getExerciseSearchFields(exercise: Exercise): string[] {
  const cached = searchFields.get(exercise);
  if (cached) return cached;
  const translations = getAllExerciseTranslations(exercise);
  const fields = [exercise.name, exercise.nameEn, exercise.defaultBrand || '', ...(exercise.aliases || []), ...(DISCOVERY_ALIASES[exercise.id] || []), ...translations];
  searchFields.set(exercise, fields);
  return fields;
}

export function matchesExerciseSearch(exercise: Exercise, query: string): boolean {
  const fields = getExerciseSearchFields(exercise);
  const normalized = fields.map(normalizeSearch);
  const trimmed = query.trim();
  if (!trimmed) return true;
  if (/^[ㄱ-ㅎ\s]+$/.test(trimmed)) return fields.some(field => normalizeSearch(initialConsonants(field)).includes(normalizeSearch(trimmed)));
  // A full compact name or separate brand/name words can both match.
  return normalized.some(field => field.includes(normalizeSearch(trimmed))) ||
    trimmed.split(/\s+/).every(word => normalized.some(field => field.includes(normalizeSearch(word))));
}

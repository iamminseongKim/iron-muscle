import { Exercise } from '../types/workout';

const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
export const normalizeSearch = (text: string): string => text.toLowerCase().replace(/[\s\-_/()·, .]/g, '');
const initialConsonants = (text: string): string => [...text].map(char => {
  const code = char.charCodeAt(0) - 0xac00;
  return code >= 0 && code <= 11171 ? CHOSUNG[Math.floor(code / 588)] : char;
}).join('');

export function matchesExerciseSearch(exercise: Exercise, query: string): boolean {
  const fields = [exercise.name, exercise.nameEn, exercise.defaultBrand || '', ...(exercise.aliases || [])];
  const normalized = fields.map(normalizeSearch);
  const trimmed = query.trim();
  if (!trimmed) return true;
  if (/^[ㄱ-ㅎ\s]+$/.test(trimmed)) return fields.some(field => normalizeSearch(initialConsonants(field)).includes(normalizeSearch(trimmed)));
  // A full compact name or separate brand/name words can both match.
  return normalized.some(field => field.includes(normalizeSearch(trimmed))) ||
    trimmed.split(/\s+/).every(word => normalized.some(field => field.includes(normalizeSearch(word))));
}

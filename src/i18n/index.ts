import { useSyncExternalStore } from 'react';
import rawMessages from './messages.json';
export const languages = { ko: '한국어', en: 'English', ja: '日本語', 'zh-CN': '简体中文', 'zh-TW': '繁體中文', es: 'Español', fr: 'Français', de: 'Deutsch' } as const;
export type Language = keyof typeof languages;
export function detectLanguage(value: string): Language {
  if (/^zh-(TW|HK|MO|Hant)/i.test(value)) return 'zh-TW';
  if (/^zh/i.test(value)) return 'zh-CN';
  const base = value.split('-')[0];
  return base in languages ? base as Language : 'en';
}
const keys = Object.keys(languages) as Language[];
const messages = new Map<string, string[]>(Object.entries(rawMessages));
let language: Language = 'ko';
try { const saved = localStorage.getItem('iron_language'); language = saved && saved in languages ? saved as Language : detectLanguage(navigator.language); } catch {}
const subscribers = new Set<() => void>();
export const getLanguage = () => language;
export function setLanguage(next: Language) {
  if (!(next in languages)) return;
  language = next;
  try { localStorage.setItem('iron_language', next); } catch {}
  document.documentElement.lang = next;
  subscribers.forEach(callback => callback());
}
export const subscribeLanguage = (callback: () => void) => { subscribers.add(callback); return () => { subscribers.delete(callback); }; };
export function useLanguage() { return useSyncExternalStore(subscribeLanguage, getLanguage, () => 'ko' as Language); }
import { locales, LocalePack } from './locales';
export { locales };
export type { LocalePack };

export function t(value: string, locale: Language = language): string {
  const pack = locales[locale];
  if (pack?.ui?.[value]) return pack.ui[value];
  return messages.get(value)?.[keys.indexOf(locale)] || value;
}

import { MUSCLE_INFO_MAP } from '../data/muscleMap';
import { MuscleTarget } from '../types/workout';

export function displayExercise(exercise: { id?: string; name: string; nameEn?: string }, locale?: Language | number): string {
  const currentLang = typeof locale === 'string' ? locale : language;
  if (currentLang === 'ko') return exercise.name;
  const pack = locales[currentLang];
  if (exercise.id && pack?.exercises?.[exercise.id]) {
    return pack.exercises[exercise.id];
  }
  if (pack?.exercises?.[exercise.name]) {
    return pack.exercises[exercise.name];
  }
  return exercise.nameEn || exercise.name;
}

export function getAllExerciseTranslations(exercise: { id?: string; name: string; nameEn?: string }): string[] {
  const set = new Set<string>();
  for (const lang of keys) {
    const trans = displayExercise(exercise, lang);
    if (trans) set.add(trans);
  }
  return [...set];
}

export function displayMuscle(target: string, locale?: Language | number): string {
  const currentLang = typeof locale === 'string' ? locale : language;
  const pack = locales[currentLang];
  if (pack?.muscles?.[target]) return pack.muscles[target];
  const info = MUSCLE_INFO_MAP[target as MuscleTarget];
  if (!info) return t(target, currentLang);
  const shortKo = info.nameKo.split(' ')[0];
  if (currentLang === 'ko') return shortKo;
  if (pack?.muscles?.[shortKo]) return pack.muscles[shortKo];
  const translated = t(shortKo, currentLang);
  if (translated && translated !== shortKo) return translated;
  return info.nameEn || shortKo;
}

export function displayExerciseDescription(exercise: { description?: string; descriptionEn?: string; name?: string; nameEn?: string }): string {
  if (language === 'ko') return exercise.description || '';
  if (exercise.descriptionEn) return exercise.descriptionEn;
  if (exercise.description && /[가-힣]/.test(exercise.description)) {
    const title = exercise.nameEn || exercise.name || 'This exercise';
    return `${title} is a targeted strength training movement focused on progressive overload and muscle activation.`;
  }
  return exercise.description || '';
}

export function displayExerciseInstructions(exercise: { instructions?: string[]; instructionsEn?: string[] }): string[] {
  if (language === 'ko') return exercise.instructions || [];
  return (exercise.instructionsEn && exercise.instructionsEn.length > 0) ? exercise.instructionsEn : (exercise.instructions || []);
}

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
export function t(value: string, locale: Language = language): string { return messages.get(value)?.[keys.indexOf(locale)] || value; }
export function displayExercise(exercise: {name: string; nameEn?: string}) { return language === 'ko' ? exercise.name : exercise.nameEn || exercise.name; }

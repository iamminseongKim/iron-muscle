// Modular Language Packs
import koUi from './ko/ui.json';
import koMuscles from './ko/muscles.json';
import koExercises from './ko/exercises.json';

import enUi from './en/ui.json';
import enMuscles from './en/muscles.json';
import enExercises from './en/exercises.json';

import jaUi from './ja/ui.json';
import jaMuscles from './ja/muscles.json';
import jaExercises from './ja/exercises.json';

import zhCNUi from './zh-CN/ui.json';
import zhCNMuscles from './zh-CN/muscles.json';
import zhCNExercises from './zh-CN/exercises.json';

import zhTWUi from './zh-TW/ui.json';
import zhTWMuscles from './zh-TW/muscles.json';
import zhTWExercises from './zh-TW/exercises.json';

import esUi from './es/ui.json';
import esMuscles from './es/muscles.json';
import esExercises from './es/exercises.json';

import frUi from './fr/ui.json';
import frMuscles from './fr/muscles.json';
import frExercises from './fr/exercises.json';

import deUi from './de/ui.json';
import deMuscles from './de/muscles.json';
import deExercises from './de/exercises.json';

export type Language = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'es' | 'fr' | 'de';

export interface LocalePack {
  ui: Record<string, string>;
  muscles: Record<string, string>;
  exercises: Record<string, string>;
}

export const locales: Record<Language, LocalePack> = {
  ko: { ui: koUi, muscles: koMuscles, exercises: koExercises },
  en: { ui: enUi, muscles: enMuscles, exercises: enExercises },
  ja: { ui: jaUi, muscles: jaMuscles, exercises: jaExercises },
  'zh-CN': { ui: zhCNUi, muscles: zhCNMuscles, exercises: zhCNExercises },
  'zh-TW': { ui: zhTWUi, muscles: zhTWMuscles, exercises: zhTWExercises },
  es: { ui: esUi, muscles: esMuscles, exercises: esExercises },
  fr: { ui: frUi, muscles: frMuscles, exercises: frExercises },
  de: { ui: deUi, muscles: deMuscles, exercises: deExercises },
};

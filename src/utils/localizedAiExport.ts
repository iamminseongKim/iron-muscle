import messages from '../i18n/exportMessages.json';
import { getLanguage } from '../i18n';
import type { Language } from '../i18n';
import type { WorkoutSession } from '../types/workout';
import type { AiExportOptions } from './aiPromptGenerator';
import { adaptiveExport } from './adaptiveExport';

export const exportText = (language: Language = getLanguage()) => messages[language];
export function localizedAiExport(sessions: WorkoutSession[], _options: AiExportOptions, language: Exclude<Language, 'ko'>): string {
  return adaptiveExport(sessions, language);
}

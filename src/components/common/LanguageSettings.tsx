import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, setLanguage, Language, t } from '../../i18n';

const LANGUAGE_OPTIONS: Array<{ id: Language; label: string; flag: string }> = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'ko', label: '한국어', flag: '🇰🇷' },
  { id: 'ja', label: '日本語', flag: '🇯🇵' },
  { id: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { id: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

export function LanguageSettings() {
  const currentLang = useLanguage();

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1D1D1F] dark:text-white">
          <Globe size={15} className="text-[#0F766E] dark:text-[#2DD4BF]" />
          <span>Language · 언어 · 言語 · 语言</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium">
          {LANGUAGE_OPTIONS.find(l => l.id === currentLang)?.flag} {LANGUAGE_OPTIONS.find(l => l.id === currentLang)?.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {LANGUAGE_OPTIONS.map(({ id, label, flag }) => {
          const isSelected = currentLang === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setLanguage(id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                isSelected
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/15'
              }`}
            >
              <span className="text-sm">{flag}</span>
              <span className="truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {currentLang !== 'ko' && (
        <p className="text-[10px] text-gray-400 leading-tight">
          {t("미번역된 종목명·설명은 영어로 표시됩니다. 메모는 변경되지 않습니다.")}
        </p>
      )}
    </div>
  );
}

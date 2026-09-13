import { languages, useLanguage, setLanguage, Language, t } from '../../i18n';
export function LanguageSettings() {
  const language = useLanguage();
  return <div className="max-w-lg mx-auto w-full"><label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 px-4 py-2 max-w-lg mx-auto w-full">
    <span aria-hidden="true">文 / A</span>
    <select aria-label="Language / 언어" value={language} onChange={e => setLanguage(e.target.value as Language)} className="min-w-0 rounded-lg bg-white dark:bg-[#1C1C1E] px-2 py-1">
      {Object.entries(languages).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
    </select>
  </label>{language !== 'ko' && <p className="px-4 pb-2 text-[10px] text-gray-500">{t("미번역된 종목명·설명은 영어로 표시됩니다. 메모는 변경되지 않습니다.")}</p>}</div>;
}

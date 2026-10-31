import { useEffect, useState } from 'react';
import { t } from '../../i18n';
import { ADAPTIVE_SETTINGS_CHANGE, loadAdaptiveSettings, saveAdaptiveSettings } from '../../utils/adaptiveSettings';
import type { AdaptiveSettings as Preferences } from '../../utils/adaptiveSettings';

const options: { key: keyof Preferences; label: string }[] = [
  { key: 'feedback', label: '세트 완료 피드백 표시' },
  { key: 'detailedFeedback', label: '상세 피드백 기본 표시' },
  { key: 'suggestions', label: '다음 세트 조정 제안' },
  { key: 'sound', label: '운동 알림음' },
  { key: 'vibration', label: '운동 진동' },
  { key: 'keepAwake', label: '운동 중 화면 유지' },
];

export function AdaptiveSettings() {
  const [settings, setSettings] = useState(loadAdaptiveSettings);
  const [error, setError] = useState('');
  useEffect(() => {
    const refresh = () => setSettings(loadAdaptiveSettings());
    window.addEventListener(ADAPTIVE_SETTINGS_CHANGE, refresh);
    return () => window.removeEventListener(ADAPTIVE_SETTINGS_CHANGE, refresh);
  }, []);
  return <section className="soft-surface bg-white dark:bg-[#1E1B24] p-5 space-y-3">
    <h3 className="font-bold">{t('적응형 훈련 설정')}</h3>
    {options.map(option => <label key={option.key} className="min-h-[44px] flex items-center justify-between gap-4 text-sm">
      <span>{t(option.label)}</span>
      <input type="checkbox" className="w-5 h-5 accent-accent" checked={settings[option.key]} onChange={event => {
        try { saveAdaptiveSettings({ [option.key]: event.target.checked }); setError(''); }
        catch { setError('설정을 저장하지 못했습니다.'); }
      }} />
    </label>)}
    <p className="text-xs text-gray-500">{t('화면 유지는 지원되는 환경에서만 동작합니다.')}</p>
    {error && <p role="alert" className="text-sm text-red-500">{t(error)}</p>}
  </section>;
}

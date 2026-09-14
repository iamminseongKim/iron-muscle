import React, { useEffect, useState } from 'react';
import { Heart, User, Settings, Shield, Dumbbell, ChevronRight } from 'lucide-react';
import { t, getLanguage } from '../../i18n';
import { LanguageSettings } from '../common/LanguageSettings';
import { BackupPanel } from '../history/BackupPanel';
import { HEALTH_CHANGE, loadHealthPreferences, loadExportJobs, saveManualWeight, updateHealthPreferences } from '../../services/health/healthStore';
import { enableHealthFeature, healthPlatform, healthStatus, openHealthSettings, syncWeight, flushWorkoutExports } from '../../services/health/healthService';
import { loadGymProfile, loadGymState, switchActiveGym, GYM_EQUIPMENT_CHANGE_EVENT, GymEquipmentProfile, MultiGymState } from '../../utils/gymStorage';
import { GymEquipmentModal } from './GymEquipmentModal';
import type { WeightUnit } from '../../types/workout';
import packageJson from '../../../package.json';

export function MyPage({ isDark, onToggleTheme, weightUnit, onToggleWeightUnit }: {
  isDark: boolean; onToggleTheme: () => void; weightUnit: WeightUnit; onToggleWeightUnit: () => void;
}) {
  const [gymState, setGymState] = useState<MultiGymState>(() => loadGymState());
  const [gymProfile, setGymProfile] = useState<GymEquipmentProfile>(() => loadGymProfile());
  const [isGymModalOpen, setIsGymModalOpen] = useState(false);
  const [preferences, setPreferences] = useState(loadHealthPreferences);
  const [jobs, setJobs] = useState(loadExportJobs);
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const platform = healthPlatform();
  const provider = platform === 'ios' ? 'Apple Health' : 'Health Connect';
  const unitFactor = weightUnit === 'lbs' ? 2.2046226218 : 1;
  useEffect(() => {
    let active = true;
    const read = () => {
      setPreferences(loadHealthPreferences());
      setJobs(loadExportJobs());
      setGymState(loadGymState());
      setGymProfile(loadGymProfile());
    };
    const check = () => { if (!document.hidden) healthStatus().then(s => { if (active) setAvailable(s.available); }).catch(() => { if (active) setAvailable(false); }); };
    check();
    window.addEventListener(HEALTH_CHANGE, read);
    window.addEventListener(GYM_EQUIPMENT_CHANGE_EVENT, read);
    document.addEventListener('visibilitychange', check);
    return () => {
      active = false;
      window.removeEventListener(HEALTH_CHANGE, read);
      window.removeEventListener(GYM_EQUIPMENT_CHANGE_EVENT, read);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  const action = async (fn: () => Promise<void>) => {
    setBusy(true); setMessage('');
    try { await fn(); } catch { setMessage('처리하지 못했습니다. 저장 공간과 건강 앱 권한을 확인해 주세요.'); }
    finally { setBusy(false); }
  };
  const toggle = (feature: 'autoWeight' | 'autoExport') => action(async () => {
    if (preferences[feature]) updateHealthPreferences({ [feature]: false });
    else {
      const imported = await enableHealthFeature(feature);
      setMessage(feature === 'autoWeight' ? (imported ? '체중을 가져왔습니다.' : '최근 29일의 체중을 확인할 수 없습니다. 건강 앱의 데이터와 읽기 권한을 확인하세요.') : '앞으로 완료하는 운동을 건강 앱으로 보냅니다.');
    }
  });
  const pending = jobs.filter(j => j.state !== 'sent').length;
  const lastSent = jobs.filter(j => j.state === 'sent').sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const section = 'rounded-3xl bg-white dark:bg-[#1C1C1E] p-5 space-y-4 border border-black/5 dark:border-white/5';
  const button = 'rounded-xl px-4 py-3 bg-[#0F766E] text-white text-sm font-bold disabled:opacity-40';
  return <div className="max-w-lg mx-auto px-4 pt-4 pb-32 space-y-4">
    <div>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black">{t('마이')}</h2>
        <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF]">
          MY
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">{t('내 몸과 운동 환경을 관리하세요.')}</p>
    </div>
    <section className={section}>
      <LanguageSettings />
    </section>
    <section className={section}>
      <h3 className="font-bold flex items-center gap-2"><User size={18}/>{t('내 신체 정보')}</h3>
      <div><span className="text-3xl font-black">{preferences.weight ? (preferences.weight.kg * unitFactor).toFixed(1) : '—'}</span><span className="ml-2 text-gray-500">{weightUnit}</span></div>
      {preferences.weight && <p className="text-xs text-gray-500">{t(preferences.weight.source === 'manual' ? '직접 입력' : '건강 앱에서 가져옴')} · {new Date(preferences.weight.measuredAt).toLocaleString(getLanguage())}</p>}
      <form onSubmit={e => { e.preventDefault(); void action(async () => {
        const value = Number(weightInput) / unitFactor;
        if (!weightInput.trim() || !Number.isFinite(value) || value < 1 || value > 500) { setMessage('체중은 1~500kg 범위로 입력하세요.'); return; }
        saveManualWeight(value); setWeightInput(''); setMessage('체중을 저장했습니다. 자동 가져오기는 꺼졌습니다.');
      }); }} className="flex gap-2">
        <input aria-label={`${t('체중')} (${weightUnit})`} inputMode="decimal" type="number" min={unitFactor} max={500 * unitFactor} step="any" placeholder={`${t('체중')} (${weightUnit})`} value={weightInput} onChange={e => setWeightInput(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent p-3"/>
        <button disabled={busy} className={button}>{t('저장')}</button>
      </form>
      <p className="text-xs text-gray-500 leading-relaxed">{t('체중은 새 운동을 시작할 때 기록됩니다. 과거 기록과 기존 볼륨·1RM 계산은 바뀌지 않습니다.')}</p>
    </section>
    <section className={section}>
      <h3 className="font-bold flex items-center gap-2"><Heart size={18}/>{t('건강 앱 연결')}</h3>
      <p className="text-sm font-semibold">{platform === 'web' ? t('모바일 앱에서 연결할 수 있습니다.') : provider}</p>
      {platform !== 'web' && !available && <p className="text-xs text-gray-500">{t('이 기기에서 건강 연결을 사용할 수 없습니다. 지원 여부와 설치 상태를 확인하세요.')}</p>}
      {platform === 'android' && <p className="text-xs text-gray-500">{t('삼성 헬스에서도 Health Connect 공유 권한을 켜 주세요. 연결은 Android 9 이상에서 지원합니다.')}</p>}
      {platform === 'ios' && <p className="text-xs text-gray-500">{t('권한 변경은 Apple 건강의 앱 및 서비스에서 Iron Muscle을 선택하세요.')}</p>}
      {(['autoExport', 'autoWeight'] as const).map(feature => <label key={feature} className="flex items-center justify-between gap-4 py-2 text-sm">
        <span>{t(feature === 'autoExport' ? '완료한 운동 자동 보내기' : '최근 체중 자동 가져오기')}</span>
        <span className="relative inline-flex w-11 h-6 shrink-0">
          <input type="checkbox" role="switch" checked={preferences[feature]} disabled={busy || (!available && !preferences[feature])} onChange={() => void toggle(feature)} className="peer sr-only"/>
          <span className="absolute inset-0 rounded-full bg-gray-200 dark:bg-white/15 peer-checked:bg-[#0F766E] peer-disabled:opacity-40 peer-focus-visible:ring-2 peer-focus-visible:ring-[#0F766E] peer-focus-visible:ring-offset-2"/>
          <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 peer-disabled:opacity-60"/>
        </span>
      </label>)}
      <p className="text-xs text-gray-500">{t('운동 시간만 전송합니다. 칼로리는 추정하지 않으며, 워치의 같은 운동과 중복될 수 있습니다.')}</p>
      {preferences.lastWeightSync && <p className="text-xs text-gray-500">{t('마지막 체중 가져오기')} · {new Date(preferences.lastWeightSync).toLocaleString(getLanguage())}</p>}
      {lastSent && <p className="text-xs text-gray-500">{t('마지막 운동 전송')} · {new Date(lastSent.updatedAt).toLocaleString(getLanguage())}</p>}
      <p className="text-sm">{t('전송 대기·실패')} · {pending}</p>
      <div className="flex flex-wrap gap-2">
        <button className={button} disabled={busy || !available || !preferences.autoWeight} onClick={() => void action(async () => { setMessage(await syncWeight() ? '체중을 가져왔습니다.' : '최근 29일의 체중을 확인할 수 없습니다. 건강 앱의 데이터와 읽기 권한을 확인하세요.'); })}>{t('체중 가져오기')}</button>
        <button className={button} disabled={busy || !available || !preferences.autoExport || pending === 0} onClick={() => void action(async () => { await flushWorkoutExports(); setMessage(loadExportJobs().some(j => j.state !== 'sent') ? '전송하지 못한 운동이 남아 있습니다. 건강 앱 권한을 확인하고 다시 시도하세요.' : '운동 전송을 완료했습니다.'); })}>{t('전송 다시 시도')}</button>
        {platform !== 'web' && <button className="text-sm underline px-2 py-3" disabled={busy} onClick={() => void action(openHealthSettings)}>{t('연결 설정 열기')}</button>}
      </div>
      <p className="text-xs text-gray-500">{t('스위치를 끄면 이후 동기화가 중단됩니다. 이미 전송한 운동은 건강 앱에서 직접 삭제할 수 있습니다.')}</p>
    </section>
    {message && <p role="status" className="rounded-2xl bg-[#0F766E]/10 p-4 text-sm">{t(message)}</p>}
    <section className={section}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold flex items-center gap-2"><Dumbbell size={18}/>{t('내 헬스장 기구 관리')}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 font-bold">
            {gymState.gyms.length}/3
          </span>
        </div>
        <button
          onClick={() => setIsGymModalOpen(true)}
          className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center hover:underline"
        >
          {t('기구 편집')} <ChevronRight size={14} />
        </button>
      </div>

      {/* 등록된 헬스장 빠른 전환 칩 (2개 이상일 때) */}
      {gymState.gyms.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {gymState.gyms.map(gym => {
            const isActive = gym.id === gymState.activeGymId;
            return (
              <button
                key={gym.id}
                type="button"
                onClick={() => {
                  switchActiveGym(gym.id);
                  setGymState(loadGymState());
                  setGymProfile(loadGymProfile());
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm'
                    : 'bg-[#F2F2F7] dark:bg-[#252528] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                <span>{gym.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-black/5 dark:bg-white/10 text-gray-500'}`}>
                  {Object.keys(gym.machines || {}).length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-[#F2F2F7] dark:bg-[#252528] rounded-2xl p-3.5 space-y-1.5 cursor-pointer hover:opacity-90 transition" onClick={() => setIsGymModalOpen(true)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#1D1D1F] dark:text-white">{gymProfile.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF] font-bold">
              {t('선택됨')}
            </span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] font-bold">
            {t('머신')} {Object.keys(gymProfile.machines).length}{t('개 등록')}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {gymProfile.includeFreeWeights ? t('바벨·덤벨·맨몸 운동 포함') : t('머신 및 등록 기구만')} · {t('운동 선택 시 최상단 우선 노출')}
        </p>
      </div>
    </section>
    <section className={section}>
      <h3 className="font-bold flex items-center gap-2"><Settings size={18}/>{t('앱 설정')}</h3>
      <div className="flex justify-between items-center text-sm"><span>{t('테마')}</span><button onClick={onToggleTheme} className="p-3 rounded-xl bg-gray-100 dark:bg-white/10">{t(isDark ? '다크' : '라이트')}</button></div>
      <div className="flex justify-between items-center text-sm"><span>{t('표시 무게 단위')}</span><button onClick={() => { onToggleWeightUnit(); setWeightInput(''); }} className="p-3 rounded-xl bg-gray-100 dark:bg-white/10">{weightUnit}</button></div>
    </section>
    <BackupPanel onRestored={() => {}}/>
    <details className={section}>
      <summary className="font-bold cursor-pointer"><Shield size={18} className="inline mr-2"/>{t('건강 데이터 개인정보 안내')}</summary>
      <p className="text-sm leading-relaxed">{t('허용한 경우에만 최근 체중을 읽고 완료한 운동을 건강 앱에 저장합니다. Iron Muscle은 건강 데이터를 외부 서버로 보내거나 광고에 사용하지 않습니다. 건강 앱 자체의 동기화 설정은 별도로 적용됩니다.')}</p>
      <p className="text-sm leading-relaxed">{t('체중과 연결 설정은 이 기기에 저장됩니다. 운동 당시 체중은 운동 백업에 포함되지만, 현재 체중·연결 권한·전송 상태는 백업하거나 복원하지 않습니다.')}</p>
      <button className="text-sm underline py-2" disabled={busy} onClick={() => void action(async () => { updateHealthPreferences({ autoWeight: false, weight: undefined, lastWeightSync: undefined }); setMessage('현재 체중을 지웠습니다. 운동 당시 체중은 기존 기록에 보존됩니다.'); })}>{t('현재 체중 지우기')}</button>
    </details>
    <p className="text-center text-xs text-gray-400">Iron Muscle · v{packageJson.version}</p>
    {isGymModalOpen && (
      <GymEquipmentModal
        isOpen={isGymModalOpen}
        onClose={() => setIsGymModalOpen(false)}
        onSaved={() => setGymProfile(loadGymProfile())}
      />
    )}
  </div>;
}

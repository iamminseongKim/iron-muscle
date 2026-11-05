import { RpeSlider } from './RpeSlider';
import { TempoControl } from './TempoControl';
import { WorkoutSet, SetType, FailureType, SET_TYPES } from '../../types/workout';
import { t } from '../../i18n';

export const SET_TYPE_LABELS: Record<SetType, string> = {
  WARMUP: '워밍업', ACTIVATION: '활성화', WORKING: '본세트', TOP_SET: '탑세트',
  BACK_OFF: '백오프', DROP_SET: '드롭세트', UNSPECIFIED: '미지정',
};
const failureTypes: FailureType[] = ['NONE', 'TECHNICAL', 'MUSCULAR', 'OTHER', 'UNKNOWN'];
const failures: Record<FailureType, string> = {
  NONE: '실패 없음', TECHNICAL: '자세 유지 한계', MUSCULAR: '근육 수행 한계', OTHER: '기타', UNKNOWN: '미기록',
};

export function SetFeedbackModal({ set, unit, onUpdate, onConfirm, onClose }: {
  set: WorkoutSet; unit: string; onUpdate: (set: WorkoutSet) => void;
  onConfirm: (set: WorkoutSet) => void; onClose: () => void;
}) {
  const field = 'w-full min-h-[44px] rounded-xl p-2 bg-black/5 dark:bg-white/10';
  const type = set.setType || 'UNSPECIFIED';
  const actualRpe = (set.provenance === 'recorded' || set.rpeSource === 'recorded') ? set.rpe ?? null : null;
  const performedTempo = set.tempoSource === 'recorded' ? set.tempo : set.plannedTempo ?? set.tempo;
  const updateRpe = (rpe: number | null) => onUpdate({ ...set, legacyRpe: set.provenance !== 'recorded' ? set.legacyRpe ?? set.rpe : set.legacyRpe, rpe, rpeSource: 'recorded' });
  const submit = (draft: WorkoutSet) => onConfirm(draft.setType === 'DROP_SET' && draft.dropSegments?.length ? { ...draft, weight: draft.dropSegments[0].weight, reps: draft.dropSegments[0].reps } : draft);
  return <div className="keyboard-aware-modal fixed inset-0 z-[70] bg-black/60 flex items-end sm:items-center justify-center p-3" role="dialog" aria-modal="true" aria-label={t('세트 피드백')}>
    <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1B24] p-4 space-y-3 max-h-[90dvh] overflow-y-auto overscroll-contain">
      <div className="flex justify-between items-center"><h3 className="font-extrabold">#{set.setNumber} {t('세트 피드백')}</h3><button type="button" className="min-h-[44px] px-3" onClick={onClose} aria-label={t('닫기')}>×</button></div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs">{t('무게')} ({unit})<input aria-label={t('실제') + ' ' + t('무게')} className={field} type="number" step="0.5" value={set.weight} onChange={e => onUpdate({ ...set, weight: Number(e.target.value) })} /></label>
        <label className="text-xs">{t('횟수')}<input aria-label={t('실제') + ' ' + t('횟수')} className={field} type="number" min="0" step="1" value={set.reps} onChange={e => onUpdate({ ...set, reps: Math.max(0, Math.floor(Number(e.target.value))) })} /></label>
      </div>
      <label className="block text-xs">{t('세트 유형')}<select className={field} value={type} onChange={e => { const selected = SET_TYPES.find(key => key === e.target.value); if (selected && selected in SET_TYPE_LABELS) onUpdate({ ...set, setType: selected }); }}>
        {Object.entries(SET_TYPE_LABELS).map(([code, label]) => <option key={code} value={code}>{t(label)}</option>)}
      </select></label>
      {type === 'DROP_SET' && <div className="space-y-2">
        {(set.dropSegments || []).map((segment, index) => <div className="flex gap-2" key={index}>
          <label className="text-xs flex-1">{t('무게')} {index + 1}<input className={field} type="number" step="0.5" value={segment.weight} onChange={e => onUpdate({ ...set, dropSegments: set.dropSegments?.map((part, i) => i === index ? { ...part, weight: Number(e.target.value) } : part) })} /></label>
          <label className="text-xs flex-1">{t('횟수')} {index + 1}<input className={field} type="number" min="0" step="1" value={segment.reps} onChange={e => onUpdate({ ...set, dropSegments: set.dropSegments?.map((part, i) => i === index ? { ...part, reps: Math.max(0, Math.floor(Number(e.target.value))) } : part) })} /></label>
          <button type="button" aria-label={t('세트 삭제')} className="px-2" onClick={() => onUpdate({ ...set, dropSegments: set.dropSegments?.filter((_, i) => i !== index) })}>×</button>
        </div>)}
        <button type="button" className="min-h-[44px] text-accent text-sm" onClick={() => onUpdate({ ...set, dropSegments: [...(set.dropSegments || []), { weight: set.weight, reps: set.reps }] })}>{t('드롭세트')} +</button>
      </div>}
      {set.provenance === 'legacy-unknown' && <p className="text-xs text-gray-500">{t('이전 기록의 입력 출처를 확인할 수 없습니다.')} RPE {set.rpe ?? set.legacyRpe ?? t('미기록')}</p>}
      {(set.targetRpe !== undefined || set.plannedTempo) && <div className="flex flex-wrap gap-2" data-feedback-targets>
        {set.targetRpe !== undefined && <p className="rounded-lg px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-xs font-bold text-amber-800 dark:text-amber-200" data-target-rpe>{t('목표 RPE')} {set.targetRpe}</p>}
        {set.plannedTempo && <p className="rounded-lg px-2 py-1 bg-cyan-50 dark:bg-cyan-950/40 text-xs font-bold text-cyan-800 dark:text-cyan-200" data-target-tempo>{t('목표 템포')} {set.plannedTempo.eccentric}-{set.plannedTempo.pause}-{set.plannedTempo.concentric}{t('초')}</p>}
      </div>}
      {performedTempo && <fieldset className="space-y-2" data-feedback-tempo>
        <legend className="text-xs font-semibold">{t('수행 템포 확인')}</legend>
        <p className="text-xs text-gray-500">{t('처방 템포를 기본 적용합니다. 다르게 수행했다면 수정하세요.')}</p>
        <TempoControl value={performedTempo} target={set.plannedTempo} onChange={tempo => onUpdate({ ...set, tempo, tempoSource: 'recorded' })} onReset={() => onUpdate({ ...set, tempo: set.completed && set.plannedTempo ? { ...set.plannedTempo } : undefined, tempoSource: set.completed && set.plannedTempo ? 'prescribed' : undefined })} />
      </fieldset>}
      <section className="space-y-2" aria-label={t('실제 RPE')}><h4 className="text-sm font-bold">{t(set.targetRpe === undefined ? '체감 강도 (RPE)' : '실제 RPE')}</h4>
        <RpeSlider value={actualRpe} onCommit={updateRpe} />
      </section>
      <div className="space-y-2">
        <label className="block text-xs">{t('실패 유형')}<select className={field} value={set.failureType || 'UNKNOWN'} onChange={e => { const failureType = failureTypes.find(code => code === e.target.value); if (failureType) onUpdate({ ...set, failureType: failureType }); }}>{Object.entries(failures).map(([code, label]) => <option key={code} value={code}>{t(label)}</option>)}</select></label>
        <label className="block text-xs">{t('자극 만족도')}<select className={field} value={set.stimulusFeedback ?? ''} onChange={e => onUpdate({ ...set, stimulusFeedback: e.target.value ? Number(e.target.value) : undefined })}><option value="">{t('미기록')}</option>{[1,2,3,4,5].map(v => <option key={v}>{v}</option>)}</select></label>
        <label className="block text-xs">{t('세트 메모')}<textarea aria-label={t('세트 메모')} placeholder={t('통증, 불편감, 도움받은 반복 등을 자유롭게 적으세요.')} className={field} maxLength={2000} rows={3} value={set.comment || ''} onChange={e => onUpdate({ ...set, comment: e.target.value, commentSource: 'recorded' })} /></label>
        {(set.painFeedback || set.assistedReps !== undefined) && <div className="text-xs text-gray-500 dark:text-gray-400" data-legacy-feedback>
          {set.painFeedback && <p>{t('통증 부위')} · {set.painFeedback.location || t('미기록')} · {t('통증 강도')} {set.painFeedback.intensity}/10</p>}
          {set.assistedReps !== undefined && <p>{t('보조 반복수')} {set.assistedReps}</p>}
        </div>}
      </div>
      <div className="sticky bottom-0 pt-2 bg-white dark:bg-[#1E1B24] border-t border-black/5 dark:border-white/10">
        <button type="button" className="w-full min-h-[48px] bg-accent text-white font-bold rounded-xl" onClick={() => submit(set)}>{t(set.completed ? '저장' : '저장하고 완료')}</button>
        {!set.completed && <button type="button" className="w-full min-h-[44px] text-gray-500 text-sm" onClick={() => submit({ ...set, rpe: null })}>{t('건너뛰고 완료')}</button>}
      </div>
    </div>
  </div>;
}

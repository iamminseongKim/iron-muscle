import { t } from '../../i18n';
import type { WorkoutSession } from '../../types/workout';

type Context = Pick<WorkoutSession, 'checkIn' | 'programId' | 'programWeek' | 'trainingPhase' | 'sessionGoal'>;
type CheckIn = NonNullable<WorkoutSession['checkIn']>;
const fieldClass = 'w-full rounded-xl bg-gray-100 dark:bg-[#302B37] px-3 py-2 min-h-[44px] text-sm';
const phases: { value: NonNullable<WorkoutSession['trainingPhase']>; label: string }[] = [
  { value: 'RECOVERY', label: '회복주' }, { value: 'HYPERTROPHY', label: '근비대주' },
  { value: 'STRENGTH', label: '스트렝스주' }, { value: 'DELOAD', label: '디로딩주' },
];
const ratings: { key: 'sleepQuality' | 'energy' | 'fatigue'; label: string }[] = [
  { key: 'sleepQuality', label: '수면 만족도' }, { key: 'energy', label: '에너지 수준' }, { key: 'fatigue', label: '전신 피로도' },
];

export function AdaptiveSessionPanel({ value, onChange }: { value: Context; onChange: (patch: Partial<WorkoutSession>) => void }) {
  const checkIn = value.checkIn || {};
  const update = (patch: Partial<CheckIn>) => onChange({ checkIn: { ...checkIn, ...patch } });
  return <details className="soft-surface bg-white dark:bg-[#1E1B24] p-4 text-sm">
    <summary className="font-bold min-h-[44px] flex items-center cursor-pointer">{t('컨디션 및 프로그램 선택 기록')}</summary>
    <div className="space-y-3 pt-2">
      <p className="text-xs text-gray-500">{t('몸 상태와 오늘의 운동 방향을 선택해서 기록하세요.')}</p>
      <div className="grid grid-cols-2 gap-3">
        <label>{t('수면시간')}<input aria-label={t('수면시간')} className={fieldClass} type="number" inputMode="decimal" min="0" max="24" step="0.5" value={checkIn.sleepHours ?? ''} onChange={event => update({ sleepHours: event.target.value === '' ? undefined : Math.min(24, Math.max(0, Number(event.target.value))) })} /></label>
        <label>{t('기상 후 경과 시간')}<input aria-label={t('기상 후 경과 시간')} className={fieldClass} type="number" inputMode="decimal" min="0" max="72" step="0.5" value={checkIn.hoursAwake ?? ''} onChange={event => update({ hoursAwake: event.target.value === '' ? undefined : Math.min(72, Math.max(0, Number(event.target.value))) })} /></label>
      </div>
      {ratings.map(rating => <label key={rating.key} className="block">{t(rating.label)}
        <select aria-label={t(rating.label)} className={fieldClass} value={checkIn[rating.key] ?? ''} onChange={event => update({ [rating.key]: event.target.value === '' ? undefined : Number(event.target.value) })}>
          <option value="">{t('미기록')}</option>{[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score} / 5</option>)}
        </select>
      </label>)}
      <label className="block">{t('근육통 부위')}<input aria-label={t('근육통 부위')} className={fieldClass} maxLength={500} value={checkIn.soreness || ''} onChange={event => update({ soreness: event.target.value })} /></label>
      <label className="block">{t('관절 통증')}<input aria-label={t('관절 통증')} className={fieldClass} maxLength={500} value={checkIn.jointPain || ''} onChange={event => update({ jointPain: event.target.value })} /></label>
      <label className="block">{t('운동 전 식사')}<select aria-label={t('운동 전 식사')} className={fieldClass} value={checkIn.preWorkoutMeal === undefined ? '' : String(checkIn.preWorkoutMeal)} onChange={event => update({ preWorkoutMeal: event.target.value === '' ? undefined : event.target.value === 'true' })}>
        <option value="">{t('미기록')}</option><option value="true">{t('식사함')}</option><option value="false">{t('식사 안 함')}</option>
      </select></label>
      <label className="block">{t('운동 전 메모')}<textarea aria-label={t('운동 전 메모')} className={fieldClass} maxLength={2000} rows={2} value={checkIn.notes || ''} onChange={event => update({ notes: event.target.value })} /></label>
      <div className="grid grid-cols-2 gap-3">
        <label>{t('프로그램 ID')}<input aria-label={t('프로그램 ID')} className={fieldClass} maxLength={160} value={value.programId || ''} onChange={event => onChange({ programId: event.target.value || undefined })} /></label>
        <label>{t('프로그램 주차')}<input aria-label={t('프로그램 주차')} className={fieldClass} type="number" inputMode="numeric" min="1" max="104" value={value.programWeek ?? ''} onChange={event => onChange({ programWeek: event.target.value === '' ? undefined : Math.min(104, Math.max(1, Math.round(Number(event.target.value)))) })} /></label>
      </div>
      <label className="block">{t('훈련 단계')}<select aria-label={t('훈련 단계')} className={fieldClass} value={value.trainingPhase || ''} onChange={event => onChange({ trainingPhase: phases.find(phase => phase.value === event.target.value)?.value })}>
        <option value="">{t('미기록')}</option>{phases.map(phase => <option key={phase.value} value={phase.value}>{t(phase.label)}</option>)}
      </select></label>
      <label className="block">{t('운동 목적')}<input aria-label={t('운동 목적')} className={fieldClass} maxLength={500} value={value.sessionGoal || ''} onChange={event => onChange({ sessionGoal: event.target.value || undefined })} /></label>
    </div>
  </details>;
}

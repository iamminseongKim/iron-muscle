import { t } from '../../i18n';
import type { WorkoutExercise } from '../../types/workout';

type Feedback = NonNullable<WorkoutExercise['feedback']>;
const fieldClass = 'w-full rounded-xl bg-gray-100 dark:bg-[#302B37] px-3 py-2 min-h-[44px] text-sm';

export function ExerciseFeedbackPanel({ value = {}, onChange }: { value?: WorkoutExercise['feedback']; onChange: (value: Feedback) => void }) {
  const update = (patch: Partial<Feedback>) => onChange({ ...value, ...patch });
  return <details className="mx-3 my-2 rounded-xl border border-black/5 dark:border-white/10 p-3 text-sm">
    <summary className="font-bold min-h-[44px] flex items-center cursor-pointer">{t('종목 종료 피드백 선택 기록')}</summary>
    <div className="space-y-3 pt-2">
      {([{ key: 'stimulus', label: '자극 만족도' }, { key: 'fatigue', label: '국소 피로도' }] as const).map(rating => <label key={rating.key} className="block">{t(rating.label)}
        <select aria-label={t(rating.label)} className={fieldClass} value={value[rating.key] ?? ''} onChange={event => update({ [rating.key]: event.target.value === '' ? undefined : Number(event.target.value) })}>
          <option value="">{t('미기록')}</option>{[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score} / 5</option>)}
        </select>
      </label>)}
      <label className="block">{t('다른 근육 개입')}<input aria-label={t('다른 근육 개입')} className={fieldClass} maxLength={500} value={value.compensation || ''} onChange={event => update({ compensation: event.target.value })} /></label>
      <label className="block">{t('통증 부위')}<input aria-label={t('통증 부위')} className={fieldClass} maxLength={500} value={value.painLocation || ''} onChange={event => update({ painLocation: event.target.value })} /></label>
      <label className="block">{t('통증 강도')}<select aria-label={t('통증 강도')} className={fieldClass} value={value.painIntensity ?? ''} onChange={event => update({ painIntensity: event.target.value === '' ? undefined : Number(event.target.value) })}>
        <option value="">{t('미기록')}</option>{Array.from({ length: 11 }, (_, score) => <option key={score} value={score}>{score} / 10</option>)}
      </select></label>
      {(Boolean(value.painLocation?.trim()) || (value.painIntensity ?? 0) > 0) && <p role="status" className="text-red-500 text-xs">{t('통증이 기록되었습니다. 운동을 중단하거나 조정하세요.')}</p>}
      <label className="block">{t('종목 메모')}<textarea aria-label={t('종목 메모')} className={fieldClass} maxLength={2000} rows={2} value={value.notes || ''} onChange={event => update({ notes: event.target.value })} /></label>
    </div>
  </details>;
}

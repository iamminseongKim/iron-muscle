import { t } from '../../i18n';
import type { WorkoutExercise } from '../../types/workout';

type Feedback = NonNullable<WorkoutExercise['feedback']>;
const fieldClass = 'w-full rounded-xl bg-gray-100 dark:bg-[#302B37] px-3 py-2 min-h-[44px] text-sm';

export function ExerciseFeedbackPanel({ value = {}, onChange }: { value?: WorkoutExercise['feedback']; onChange: (value: Feedback) => void }) {
  const update = (patch: Partial<Feedback>) => onChange({ ...value, ...patch });
  return <details open className="mx-3 my-2 rounded-xl border border-black/5 dark:border-white/10 p-3 text-sm">
    <summary className="font-bold min-h-[44px] flex items-center cursor-pointer">{t('종목 종료 피드백 선택 기록')}</summary>
    <div className="space-y-3 pt-2">
      {([{ key: 'stimulus', label: '자극 만족도' }, { key: 'fatigue', label: '국소 피로도' }] as const).map(rating => <label key={rating.key} className="block">{t(rating.label)}
        <select aria-label={t(rating.label)} className={fieldClass} value={value[rating.key] ?? ''} onChange={event => update({ [rating.key]: event.target.value === '' ? undefined : Number(event.target.value) })}>
          <option value="">{t('미기록')}</option>{[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score} / 5</option>)}
        </select>
      </label>)}
      <label className="block">{t('다른 근육 개입')}<input aria-label={t('다른 근육 개입')} className={fieldClass} maxLength={500} value={value.compensation || ''} onChange={event => update({ compensation: event.target.value })} /></label>
      <label className="block">{t('종목 메모')}<textarea aria-label={t('종목 메모')} placeholder={t('통증과 불편감은 메모에 남겨 주세요.')} className={fieldClass} maxLength={2000} rows={3} value={value.notes || ''} onChange={event => update({ notes: event.target.value })} /></label>
      {(Boolean(value.painLocation?.trim()) || value.painIntensity !== undefined) && <p className="text-xs text-gray-500 dark:text-gray-400">{t('통증 부위')} · {value.painLocation || t('미기록')} · {t('통증 강도')} {value.painIntensity ?? t('미기록')}/10</p>}
    </div>
  </details>;
}

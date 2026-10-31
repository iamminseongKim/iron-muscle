import { t } from '../../i18n';
import type { WorkoutSession } from '../../types/workout';

type Context = Pick<WorkoutSession, 'checkIn'>;
type CheckIn = NonNullable<WorkoutSession['checkIn']>;

const fieldClass = 'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-[#25222E] px-3.5 py-2.5 min-h-[44px] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-[#1E1B24] focus:border-accent-strong focus:outline-none transition shadow-2xs';

const ratings: { key: 'sleepQuality' | 'energy' | 'fatigue'; label: string }[] = [
  { key: 'sleepQuality', label: '수면 만족도' },
  { key: 'energy', label: '에너지 수준' },
  { key: 'fatigue', label: '전신 피로도' },
];

export function AdaptiveSessionPanel({ value, onChange }: { value: Context; onChange: (patch: Partial<WorkoutSession>) => void }) {
  const checkIn = value.checkIn || {};
  const update = (patch: Partial<CheckIn>) => onChange({ checkIn: { ...checkIn, ...patch } });

  return (
    <details className="soft-surface bg-white dark:bg-[#1E1B24] p-4 text-sm rounded-2xl border border-black/5 dark:border-white/5">
      <summary className="font-bold min-h-[44px] flex items-center cursor-pointer select-none text-[#24212B] dark:text-white">
        {t('오늘의 컨디션 기록')}
      </summary>
      <div className="space-y-4 pt-3 border-t border-black/5 dark:border-white/5 mt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('몸 상태와 피로도를 기록하여 맞춤 가이드를 받아보세요.')}
        </p>

        {/* 수면 및 기상 */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('수면시간')}</span>
              <input
                aria-label={t('수면시간')}
                className={fieldClass}
                type="number"
                inputMode="decimal"
                min="0"
                max="24"
                step="0.5"
                placeholder={t('예: 7 (시간)')}
                value={checkIn.sleepHours ?? ''}
                onChange={event => update({ sleepHours: event.target.value === '' ? undefined : Math.min(24, Math.max(0, Number(event.target.value))) })}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('기상 후 경과 시간')}</span>
              <input
                aria-label={t('기상 후 경과 시간')}
                className={fieldClass}
                type="number"
                inputMode="decimal"
                min="0"
                max="72"
                step="0.5"
                placeholder={t('예: 3 (시간)')}
                value={checkIn.hoursAwake ?? ''}
                onChange={event => update({ hoursAwake: event.target.value === '' ? undefined : Math.min(72, Math.max(0, Number(event.target.value))) })}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('수면 만족도')}</span>
            <select
              aria-label={t('수면 만족도')}
              className={fieldClass}
              value={checkIn.sleepQuality ?? ''}
              onChange={event => update({ sleepQuality: event.target.value === '' ? undefined : Number(event.target.value) })}
            >
              <option value="">{t('미기록')}</option>
              {[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score} / 5</option>)}
            </select>
          </label>
        </div>

        {/* 에너지 & 피로도 */}
        <div className="grid grid-cols-2 gap-3">
          {ratings.filter(r => r.key !== 'sleepQuality').map(rating => (
            <label key={rating.key} className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t(rating.label)}</span>
              <select
                aria-label={t(rating.label)}
                className={fieldClass}
                value={checkIn[rating.key] ?? ''}
                onChange={event => update({ [rating.key]: event.target.value === '' ? undefined : Number(event.target.value) })}
              >
                <option value="">{t('미기록')}</option>
                {[1, 2, 3, 4, 5].map(score => <option key={score} value={score}>{score} / 5</option>)}
              </select>
            </label>
          ))}
        </div>

        {/* 통증 체크 */}
        <div className="space-y-2.5">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('근육통 부위')}</span>
            <input
              aria-label={t('근육통 부위')}
              className={fieldClass}
              maxLength={500}
              placeholder={t('예: 하체, 어깨 전면 등')}
              value={checkIn.soreness || ''}
              onChange={event => update({ soreness: event.target.value })}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('관절 통증')}</span>
            <input
              aria-label={t('관절 통증')}
              className={fieldClass}
              maxLength={500}
              placeholder={t('예: 오른쪽 손목, 왼쪽 무릎 등')}
              value={checkIn.jointPain || ''}
              onChange={event => update({ jointPain: event.target.value })}
            />
          </label>
        </div>

        {/* 운동 전 식사 & 메모 */}
        <div className="space-y-2.5">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('운동 전 식사')}</span>
            <select
              aria-label={t('운동 전 식사')}
              className={fieldClass}
              value={checkIn.preWorkoutMeal === undefined ? '' : String(checkIn.preWorkoutMeal)}
              onChange={event => update({ preWorkoutMeal: event.target.value === '' ? undefined : event.target.value === 'true' })}
            >
              <option value="">{t('미기록')}</option>
              <option value="true">{t('식사함')}</option>
              <option value="false">{t('식사 안 함')}</option>
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{t('운동 전 메모')}</span>
            <textarea
              aria-label={t('운동 전 메모')}
              className={`${fieldClass} resize-none`}
              maxLength={2000}
              rows={2}
              placeholder={t('오늘의 컨디션 특이사항, 목표 등을 적어보세요.')}
              value={checkIn.notes || ''}
              onChange={event => update({ notes: event.target.value })}
            />
          </label>
        </div>
      </div>
    </details>
  );
}

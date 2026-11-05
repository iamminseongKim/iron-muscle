import type { Tempo } from '../../types/workout';
import { t } from '../../i18n';

const phases = [['eccentric', '이완'], ['pause', '정지'], ['concentric', '수축']] as const;
const presets: Tempo[] = [
  { eccentric: 2, pause: 0, concentric: 1 },
  { eccentric: 3, pause: 1, concentric: 1 },
  { eccentric: 4, pause: 2, concentric: 1 },
];

export function TempoControl({ value, target, onChange, onReset }: {
  value: Tempo; target?: Tempo; onChange: (tempo: Tempo) => void; onReset: () => void;
}) {
  const button = 'min-h-[44px] min-w-[44px] rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent';
  return <div className="space-y-2" data-tempo-control>
    <div className="flex flex-wrap gap-2" role="group" aria-label={t('템포 프리셋')}>
      {presets.map(preset => {
        const selected = phases.every(([phase]) => preset[phase] === value[phase]);
        const label = `${preset.eccentric}-${preset.pause}-${preset.concentric}`;
        return <button key={label} type="button" aria-pressed={selected} className={`${button} px-3 text-sm font-bold tabular-nums ${selected ? 'text-cyan-800 dark:text-cyan-200 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-700' : 'text-gray-600 dark:text-gray-300'}`} onClick={() => onChange({ ...preset })}>{label}</button>;
      })}
      {target && <button type="button" className={`${button} px-3 text-xs text-cyan-800 dark:text-cyan-200`} onClick={onReset}>{t('목표 템포로 복원')}</button>}
    </div>
    <div className="space-y-1">
      {phases.map(([phase, label]) => <div key={phase} className="min-w-0 flex items-center justify-between gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-2 py-1">
        <p className="min-w-0 flex-1 text-xs text-gray-600 dark:text-gray-300">{t(label)}</p>
        <output data-tempo-phase={phase} aria-live="polite" className="min-w-[44px] text-center text-lg font-extrabold tabular-nums text-gray-900 dark:text-white">{value[phase]}<span className="ml-0.5 text-xs font-normal">{t('초')}</span></output>
        <div className="flex shrink-0 justify-center gap-1">
          <button type="button" aria-label={`${t(label)} ${t('0.5초 줄이기')}`} className={`${button} text-lg`} disabled={value[phase] <= 0} onClick={() => onChange({ ...value, [phase]: Math.max(0, Number((value[phase] - 0.5).toFixed(10))) })}>−</button>
          <button type="button" aria-label={`${t(label)} ${t('0.5초 늘리기')}`} className={`${button} text-lg`} disabled={value[phase] >= 30} onClick={() => onChange({ ...value, [phase]: Math.min(30, Number((value[phase] + 0.5).toFixed(10))) })}>+</button>
        </div>
      </div>)}
    </div>
  </div>;
}

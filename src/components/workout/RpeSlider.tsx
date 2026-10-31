import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';

const snap = (value: number) => Math.max(6, Math.min(10, Math.round(value * 2) / 2));

export function RpeSlider({ value, onCommit }: { value: number | null; onCommit: (value: number | null) => void }) {
  const [position, setPosition] = useState(value ?? 8);
  const [dragging, setDragging] = useState(false);
  const pointerActive = useRef(false);
  useEffect(() => { if (!pointerActive.current) setPosition(value ?? 8); }, [value]);
  const preview = dragging ? snap(position) : value;
  const example = preview ?? 8;
  const reserve = 10 - example;
  const reps = Number.isInteger(reserve) ? String(reserve) : `${Math.floor(reserve)}–${Math.ceil(reserve)}`;
  const explanation = reserve === 0 ? t('RPE 10 · 더 반복하기 어려운 최대 강도') : t('RPE {rpe} · 약 {reps}회 더 할 수 있는 강도').replace('{rpe}', String(example)).replace('{reps}', reps);
  const commit = (next: number) => {
    pointerActive.current = false;
    setDragging(false);
    const rounded = snap(next);
    setPosition(rounded);
    onCommit(rounded);
  };
  const cancel = () => { pointerActive.current = false; setDragging(false); setPosition(value ?? 8); };
  const progress = (position - 6) / 4 * 100;
  return <div className="space-y-1">
    <div className="flex items-center gap-3">
      <div className="relative min-w-0 flex-1 flex items-center h-11">
        <div aria-hidden="true" className={`absolute inset-x-0 h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden ${preview === null ? 'opacity-50' : ''}`}>
          <div className="h-full rounded-full bg-gradient-to-r from-accent/40 to-accent" style={{ width: `${progress}%` }} />
        </div>
        <input
          type="range"
          min="6"
          max="10"
          step="0.01"
          aria-label={t('실제 RPE')}
          aria-valuetext={preview === null ? t('미기록') : `${preview}, ${explanation}`}
          value={position}
          onPointerDown={event => { pointerActive.current = true; setDragging(true); event.currentTarget.setPointerCapture(event.pointerId); }}
          onChange={event => { const next = Number(event.target.value); setPosition(next); if (!pointerActive.current) commit(next); }}
          onPointerUp={event => commit(Number(event.currentTarget.value))}
          onPointerCancel={cancel}
          onBlur={() => { if (pointerActive.current) cancel(); }}
          onKeyDown={event => {
            const current = value ?? 8;
            const next = event.key === 'Home' ? 6 : event.key === 'End' ? 10 : ['ArrowRight', 'ArrowUp'].includes(event.key) ? current + 0.5 : ['ArrowLeft', 'ArrowDown'].includes(event.key) ? current - 0.5 : null;
            if (next !== null) { event.preventDefault(); commit(next); }
          }}
          className={`rpe-slider relative w-full h-11 ${preview === null ? 'rpe-slider-empty' : ''}`}
        />
      </div>
      <output className={`min-w-[42px] text-center text-base font-extrabold tabular-nums ${preview === null ? 'text-gray-400 text-xs' : 'text-accent'}`}>{preview ?? t('미기록')}</output>
      <button type="button" className="w-9 min-h-[44px] rounded-xl text-gray-400 hover:text-accent disabled:opacity-30" aria-label={t('미기록')} title={t('미기록')} disabled={value === null && !dragging} onClick={() => { cancel(); onCommit(null); }}>×</button>
    </div>
    <p className="min-h-[30px] text-[11px] leading-relaxed text-gray-400">{explanation}</p>
  </div>;
}

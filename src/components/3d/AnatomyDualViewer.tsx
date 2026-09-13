import { t, displayMuscle } from '../../i18n';
import { ANATOMY_REGIONS as REGIONS } from '../../data/anatomyRegions';
import React, { useState } from 'react';
import { MuscleTarget } from '../../types/workout';

interface AnatomyDualViewerProps {
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  selectedMuscle?: string | null;
  onMuscleClick?: (muscleId: MuscleTarget) => void;
  showFatigueSlider?: boolean;
  isDark?: boolean;
}

// Atlas coordinates are tied to public/anatomy/muscle-atlas.png (1122 × 1402).
// These are approximate visual muscle regions, not diagnostic segmentation.


export const AnatomyDualViewer: React.FC<AnatomyDualViewerProps> = ({primaryMuscles = [], secondaryMuscles = [], selectedMuscle, onMuscleClick}) => {
  const [view, setView] = useState<'both' | 'front' | 'back'>('both');
  const [hovered, setHovered] = useState<MuscleTarget | null>(null);
  const active = selectedMuscle || hovered;
  return (
    <section aria-label={t("전면·후면 근육 해부도")} className="overflow-hidden rounded-2xl bg-[#101014] text-white border border-white/10">
      <div className="flex items-center justify-between px-3 pt-3 gap-2">
        <div className="flex items-center gap-3 text-[11px] text-gray-300">
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-[#FF2D55]" />{t("주동근")}</span>
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-[#FF9500]" />{t("협응근")}</span>
        </div>
        <span className="text-[10px] text-gray-500">MUSCLE ATLAS</span>
      </div>
      <svg viewBox={view === 'both' ? '0 0 1122 1402' : view === 'front' ? '0 0 561 1402' : '561 0 561 1402'} role="img" aria-label={t("근육 결이 표시된 인체 전면 및 후면")} className="w-full block" style={{height: view === 'both' ? 'auto' : 420, isolation:'isolate'}}>
        <image href="/anatomy/muscle-atlas.png" width="1122" height="1402" />
        {REGIONS.flatMap((region,i) => [false,...(region.mirror ? [true] : [])].map(mirror => {
          const primary = primaryMuscles.includes(region.id);
          const secondary = secondaryMuscles.includes(region.id);
          const selected = active === region.id;
          const color = selected ? '#60a5fa' : primary ? '#ff3657' : secondary ? '#ffa64c' : 'transparent';
          return <path key={`${i}-${mirror}`} d={region.d} transform={mirror ? `translate(${region.mirror} 0) scale(-1 1)` : undefined}
            data-muscle={region.id} data-active={primary ? 'primary' : secondary ? 'secondary' : 'none'}
            fill={color} opacity={selected ? .9 : .8} style={{mixBlendMode:'multiply',cursor:onMuscleClick ? 'pointer' : 'default'}}
            role={onMuscleClick ? 'button' : undefined} tabIndex={onMuscleClick ? 0 : undefined} aria-label={displayMuscle(region.id)}
            onMouseEnter={() => setHovered(region.id)} onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(region.id)} onBlur={() => setHovered(null)}
            onClick={() => onMuscleClick?.(region.id)} onKeyDown={event => {if (onMuscleClick && (event.key === 'Enter' || event.key === ' ')) {event.preventDefault();onMuscleClick(region.id);}}}>
            <title>{displayMuscle(region.id)}</title>
          </path>;
        }))}
      </svg>
      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {(['both','front','back'] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${view === mode ? 'bg-white/15 text-white' : 'text-gray-400'}`}>{mode === 'both' ? t("전체") : mode === 'front' ? t('전면') : t('후면')}</button>)}
        </div>
        <span className="text-[11px] text-gray-400 truncate">{active ? displayMuscle(active) : t('전면 / 후면')}</span>
      </div>
    </section>
  );
};

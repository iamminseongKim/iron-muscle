import React, { useState } from 'react';
import { MuscleTarget } from '../../types/workout';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';

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
const REGIONS: {id: MuscleTarget; d: string; mirror?: number}[] = [
  {id:'chest_upper',d:'M150 272 Q212 242 280 263 L283 296 Q215 284 161 314 Z',mirror:588},
  {id:'chest',d:'M160 316 Q221 287 282 299 L283 350 Q258 389 211 374 Q172 365 160 316Z',mirror:588},
  {id:'deltoid_front',d:'M147 269 Q174 248 209 250 Q182 274 161 321 L135 340 Q121 300 147 269Z',mirror:588},
  {id:'deltoid_side',d:'M143 266 Q109 282 111 329 L122 365 L138 335 Q126 302 143 266Z',mirror:588},
  {id:'biceps',d:'M132 348 Q149 337 165 329 Q182 371 158 428 L132 458 Q118 418 132 348Z',mirror:588},
  {id:'forearms',d:'M130 447 Q146 457 128 515 L91 621 L57 628 Q75 550 91 505Z',mirror:588},
  {id:'abs',d:'M241 386 Q266 372 290 391 L287 503 L293 522 L281 607 L239 552 Q229 461 241 386Z',mirror:588},
  {id:'obliques',d:'M192 407 L222 385 L232 485 L245 552 L267 597 L193 549 Q173 489 192 407Z',mirror:588},
  {id:'quads',d:'M194 560 Q173 613 167 690 Q162 790 204 876 Q219 901 235 880 Q279 795 269 717 L261 625 L236 612 L214 734 L201 820 Q191 737 216 649Z',mirror:588},
  {id:'traps',d:'M815 174 L796 203 L709 247 Q762 254 780 294 L819 389 L825 435 L831 389 L868 294 Q888 255 941 247 L855 204 L837 174Z'},
  {id:'deltoid_rear',d:'M687 262 Q718 251 751 279 L765 324 Q741 353 702 355 L668 338 Q658 293 687 262Z',mirror:1650},
  {id:'triceps',d:'M664 344 Q692 356 710 359 Q710 413 674 468 L645 436 Q650 382 664 344Z',mirror:1650},
  {id:'lats',d:'M708 358 Q765 369 806 400 L817 452 L788 536 Q747 519 714 500 L693 425Z',mirror:1650},
  {id:'erectors',d:'M810 428 L822 424 L822 543 L785 576 L776 551 L798 482Z',mirror:1650},
  {id:'glutes',d:'M784 540 Q731 542 708 577 L702 644 Q733 697 792 698 L819 680 L819 577Z',mirror:1650},
  {id:'hamstrings',d:'M718 683 Q759 707 800 704 Q810 791 779 905 L742 927 Q699 830 707 746Z',mirror:1650},
  {id:'calves',d:'M735 922 Q710 966 709 1028 Q709 1072 735 1087 Q772 1077 779 1036 Q786 967 763 922Z',mirror:1650},
  {id:'forearms',d:'M641 447 Q670 461 660 510 L620 630 L587 635 Q600 551 610 511Z',mirror:1650},
];

export const AnatomyDualViewer: React.FC<AnatomyDualViewerProps> = ({primaryMuscles = [], secondaryMuscles = [], selectedMuscle, onMuscleClick}) => {
  const [view, setView] = useState<'both' | 'front' | 'back'>('both');
  const [hovered, setHovered] = useState<MuscleTarget | null>(null);
  const active = selectedMuscle || hovered;
  return (
    <section aria-label="전면·후면 근육 해부도" className="overflow-hidden rounded-2xl bg-[#101014] text-white border border-white/10">
      <div className="flex items-center justify-between px-3 pt-3 gap-2">
        <div className="flex items-center gap-3 text-[11px] text-gray-300">
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-[#FF2D55]" />주동근</span>
          <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-[#FF9500]" />협응근</span>
        </div>
        <span className="text-[10px] text-gray-500">MUSCLE ATLAS</span>
      </div>
      <svg viewBox={view === 'both' ? '0 0 1122 1402' : view === 'front' ? '0 0 561 1402' : '561 0 561 1402'} role="img" aria-label="근육 결이 표시된 인체 전면 및 후면" className="w-full block" style={{height: view === 'both' ? 'auto' : 420, isolation:'isolate'}}>
        <image href="/anatomy/muscle-atlas.png" width="1122" height="1402" />
        {REGIONS.flatMap((region,i) => [false,...(region.mirror ? [true] : [])].map(mirror => {
          const primary = primaryMuscles.includes(region.id);
          const secondary = secondaryMuscles.includes(region.id);
          const selected = active === region.id;
          const color = selected ? '#60a5fa' : primary ? '#ff3657' : secondary ? '#ffa64c' : 'transparent';
          return <path key={`${i}-${mirror}`} d={region.d} transform={mirror ? `translate(${region.mirror} 0) scale(-1 1)` : undefined}
            data-muscle={region.id} data-active={primary ? 'primary' : secondary ? 'secondary' : 'none'}
            fill={color} opacity={selected ? .9 : .8} style={{mixBlendMode:'multiply',cursor:onMuscleClick ? 'pointer' : 'default'}}
            role={onMuscleClick ? 'button' : undefined} tabIndex={onMuscleClick ? 0 : undefined} aria-label={MUSCLE_INFO_MAP[region.id].nameKo}
            onMouseEnter={() => setHovered(region.id)} onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(region.id)} onBlur={() => setHovered(null)}
            onClick={() => onMuscleClick?.(region.id)} onKeyDown={event => {if (onMuscleClick && (event.key === 'Enter' || event.key === ' ')) {event.preventDefault();onMuscleClick(region.id);}}}>
            <title>{MUSCLE_INFO_MAP[region.id].nameKo}</title>
          </path>;
        }))}
      </svg>
      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg bg-white/5 p-1">
          {(['both','front','back'] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`px-3 py-1.5 rounded-md text-xs font-semibold ${view === mode ? 'bg-white/15 text-white' : 'text-gray-400'}`}>{mode === 'both' ? '전체' : mode === 'front' ? '전면' : '후면'}</button>)}
        </div>
        <span className="text-[11px] text-gray-400 truncate">{active ? MUSCLE_INFO_MAP[active as MuscleTarget]?.nameKo : '전면 / 후면'}</span>
      </div>
    </section>
  );
};

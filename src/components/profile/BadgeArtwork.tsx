import { useId } from 'react';
import { t } from '../../i18n';
import type { BadgeProgress } from '../../utils/achievements';

const tiers = {
  starter: { nameKey: '스타터', rank: 1, total: 7, color: '#B9D8CB', light: '#E8F5DD', deep: '#355C50', ink: '#132920' },
  bronze: { nameKey: '브론즈', rank: 2, total: 7, color: '#E79456', light: '#FFE3BA', deep: '#8C4628', ink: '#382216' },
  silver: { nameKey: '실버', rank: 3, total: 7, color: '#C0D3E5', light: '#F6FAFF', deep: '#58728C', ink: '#1D2B39' },
  gold: { nameKey: '골드', rank: 4, total: 7, color: '#F2C749', light: '#FFF5BE', deep: '#9A691D', ink: '#382D12' },
  platinum: { nameKey: '플래티넘', rank: 5, total: 7, color: '#5FDBC9', light: '#D4FFF0', deep: '#267C86', ink: '#133A3E' },
  diamond: { nameKey: '다이아몬드', rank: 6, total: 7, color: '#AD9AFF', light: '#F2E6FF', deep: '#6550AE', ink: '#282142' },
  elite: { nameKey: '엘리트', rank: 7, total: 7, color: '#D8FA62', light: '#F4FFBD', deep: '#748D27', ink: '#1A2110' },
};

export function badgeTier(badge: BadgeProgress) {
  const rule = badge.definition.rule;
  switch (rule.kind) {
    case 'workout-days':
      return ({ 1: tiers.starter, 10: tiers.bronze, 30: tiers.silver, 50: tiers.gold, 100: tiers.platinum, 200: tiers.diamond, 365: tiers.elite }[rule.target] || tiers.starter);
    case 'consistent-weeks':
      return { ...(rule.target >= 12 ? tiers.gold : rule.target >= 8 ? tiers.silver : tiers.bronze), rank: rule.target >= 12 ? 3 : rule.target >= 8 ? 2 : 1, total: 3 };
    case 'personal-best':
      return { ...tiers.elite, nameKey: '신기록', rank: 1, total: 1 };
    case 'big-three':
      return { ...tiers.gold, nameKey: '엘리트', rank: 3, total: 3 };
    case 'comeback':
      return { ...tiers.bronze, nameKey: '다시 시작', color: '#FF997E', light: '#FFE5C7', deep: '#B34D3C', ink: '#3C2420', rank: 1, total: 1 };
    default: {
      const exhaustive: never = rule;
      return exhaustive;
    }
  }
}

function LiftMark({ exerciseId }: { exerciseId: string | null }) {
  if (exerciseId === 'bench-press') return <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M42 97h66M52 99v13m45-13v13M62 84h29l12 12M69 84V65m22 19V65M51 61h57m-49-7v14m41-14v14" />
    <circle cx="52" cy="83" r="5" fill="currentColor" stroke="none" />
  </g>;
  if (exerciseId === 'barbell-squat') return <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="80" cy="59" r="6" fill="currentColor" stroke="none" />
    <path d="M47 72h65m-57-8v16m48-16v16M79 72l-9 16 22 12-15 12M70 88l-12 15 14 9M70 76l-13-4m25 4 16-4" />
  </g>;
  if (exerciseId === 'deadlift') return <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="84" cy="58" r="6" fill="currentColor" stroke="none" />
    <path d="M79 70 64 84l7 15-10 14m5-28 19 13 8 15M80 73v26M49 101h65m-56-9v18m47-18v18" />
  </g>;
  return <g fill="currentColor"><path d="m91 50-34 42h21l-10 26 37-45H83z" /><path d="M41 82h10v17H41zm72 0h10v17h-10zM35 87h6v7h-6zm88 0h6v7h-6z" /></g>;
}

export function BadgeArtwork({ badge, size = 96 }: { badge: BadgeProgress; size?: number }) {
  const id = useId().replace(/:/g, '');
  const tier = badgeTier(badge);
  const rule = badge.definition.rule;
  const locked = badge.state === 'locked';
  const record = rule.kind === 'personal-best';
  const elite = !record && tier.rank >= 6;
  const color = locked ? '#99A3AB' : tier.color;
  const light = locked ? '#CDD4D9' : tier.light;
  const deep = locked ? '#647079' : tier.deep;
  const ink = locked ? '#39434B' : tier.ink;
  const shield = record
    ? 'M31 14h98l14 22-7 67-56 49-56-49-7-67Z'
    : elite ? 'M80 5 133 22 145 52 133 114 80 157 27 114 15 52 27 22Z'
      : 'M37 14h86l19 22-9 73-53 43-53-43-9-73Z';
  const number = rule.kind === 'workout-days' || rule.kind === 'consistent-weeks' ? rule.target : rule.kind === 'big-three' ? 3 : 0;
  return <svg data-badge-art={badge.definition.id} data-badge-tier={tier.rank} aria-hidden="true" focusable="false" viewBox="0 0 160 168" width={size} height={size * 1.05} className="shrink-0 overflow-visible" style={{ color }}>
    <defs>
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0.95" y2="1">
        <stop stopColor={light} /><stop offset=".28" stopColor={color} /><stop offset=".52" stopColor={deep} /><stop offset=".7" stopColor={light} /><stop offset="1" stopColor={deep} />
      </linearGradient>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2=".8" y2="1">
        <stop stopColor={ink} /><stop offset="1" stopColor="#10161A" />
      </linearGradient>
      <linearGradient id={`${id}-type`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor={light} /><stop offset="1" stopColor={color} />
      </linearGradient>
    </defs>
    <g opacity={locked ? .6 : 1}>
      {tier.rank >= 4 && !record && <g fill={deep} stroke={color} strokeWidth=".7">
        <path d="m23 47-15-9 5 28 10 8M22 78 8 70l7 26 11 6m111-55 15-9-5 28-10 8m1 4 14-8-7 26-11 6" />
      </g>}
      <path d={shield} transform="translate(0 4)" fill="#080D10" opacity=".26" />
      <path d={shield} fill={`url(#${id}-rim)`} stroke={light} strokeWidth=".8" />
      <path d={shield} fill={`url(#${id}-face)`} transform="translate(80 80) scale(.9) translate(-80 -80)" stroke={color} strokeWidth="1.1" />
      <path d="m38 29 84 0 9 12-8 60-43 36-43-36-8-60Z" fill="none" stroke={color} strokeWidth=".75" opacity=".45" />
      <path d="M35 43v30m90-30v30M42 106l21 17m34 0 21-17" fill="none" stroke={light} strokeWidth="1.2" opacity=".62" />
      <path d="M41 34h78M44 38h72" stroke={light} strokeWidth=".7" opacity=".25" />
      {record ? <>
        <text x="80" y="43" textAnchor="middle" fill={color} fontSize="13" fontWeight="900" letterSpacing="4" fontFamily="Arial, sans-serif">PR</text>
        <LiftMark exerciseId={rule.exerciseId} />
        <path d="M67 125h26" stroke={color} strokeWidth="2" />
      </> : rule.kind === 'comeback' ? <g fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 104h70M52 95a28 28 0 0 1 56 0M80 48v11M45 61l8 8m62-8-8 8M80 111V79m-10 10 10-10 10 10" />
        <circle cx="80" cy="40" r="2" fill={light} stroke="none" />
      </g> : <>
        <g fill={color}>
          <path d="M59 48h42v3H59zm-7-5h5v13h-5zm51 0h5v13h-5zm-57 3h4v7h-4zm64 0h4v7h-4z" />
        </g>
        <text x="80" y={number >= 100 ? 98 : 101} textAnchor="middle" fill={`url(#${id}-type)`} fontFamily="Impact, 'Arial Narrow', sans-serif" fontWeight="900" fontSize={number >= 100 ? 48 : 60} letterSpacing={number >= 100 ? -1.5 : -1}>{number}</text>
        {rule.kind === 'big-three'
          ? <g fill={color}><path d="m63 115 2-4 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3zm15 0 2-4 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3zm15 0 2-4 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3z" /></g>
          : <text x="80" y="116" textAnchor="middle" fill={light} fontFamily="Arial, sans-serif" fontSize="9" fontWeight="700" letterSpacing="1.3">{t(rule.kind === 'consistent-weeks' ? '배지 주수' : '배지 일수')}</text>}
      </>}
      {!record && rule.kind !== 'comeback' && <g fill={color}>
        {Array.from({ length: Math.min(tier.rank, 7) }, (_, index) => <rect key={index} x={80 - Math.min(tier.rank, 7) * 3.5 + index * 7} y="127" width="4" height="3" rx=".7" />)}
      </g>}
      {elite && <path d="m80 12 4 6-4 6-4-6Z" fill={light} />}
    </g>
  </svg>;
}

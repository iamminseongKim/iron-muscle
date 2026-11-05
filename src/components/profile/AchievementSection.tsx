import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, Lock, X } from 'lucide-react';
import { displayExercise, t, useLanguage } from '../../i18n';
import type { WorkoutSession } from '../../types/workout';
import { calculateAchievements, type BadgeProgress } from '../../utils/achievements';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { BadgeArtwork, badgeTier } from './BadgeArtwork';

type BadgeView = { kind: 'closed' } | { kind: 'collection' } | { kind: 'detail'; badgeId: string };

const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1E1B24]';

const badgeGroups = [
  { nameKey: '누적 운동', kinds: ['workout-days'] },
  { nameKey: '꾸준함', kinds: ['consistent-weeks'] },
  { nameKey: '개인 신기록', kinds: ['personal-best', 'big-three'] },
  { nameKey: '복귀', kinds: ['comeback'] },
];

function badgeTitle(badge: BadgeProgress) {
  const { rule } = badge.definition;
  if (rule.kind === 'workout-days') return `${t(badgeTier(badge).nameKey)} · ${rule.target} ${t('운동일 수')}`;
  if (rule.kind === 'consistent-weeks') return `${t(badgeTier(badge).nameKey)} · ${rule.target} ${t('주')}`;
  return t(badge.definition.nameKey);
}

function BadgeProgressBar({ badge }: { badge: BadgeProgress }) {
  const value = Math.min(badge.target, Math.max(0, badge.current));
  return <div className="space-y-2">
    <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-600 dark:text-gray-400">
      <span>{t('진행도')}</span><span className="font-bold tabular-nums">{value.toLocaleString()} / {badge.target.toLocaleString()}</span>
    </div>
    <progress aria-label={t('진행도')} max={badge.target} value={value} className="block h-2 w-full overflow-hidden rounded-full accent-amber-600 dark:accent-amber-400" />
  </div>;
}

function BadgeBrowser({ badges, view, onView }: { badges: BadgeProgress[]; view: Exclude<BadgeView, { kind: 'closed' }>; onView: (next: BadgeView) => void }) {
  const language = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const close = () => onView({ kind: 'closed' });
  const selected = view.kind === 'detail' ? badges.find(badge => badge.definition.id === view.badgeId) : undefined;
  const formatDate = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    node?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      node?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  useEffect(() => {
    heading.current?.focus();
    dialog.current?.scrollTo(0, 0);
  }, [view.kind, selected?.definition.id]);
  return <dialog ref={dialog} data-badge-dialog aria-labelledby={headingId} onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => { if (event.target === event.currentTarget) {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    } }}
    className="m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-black/10 bg-white p-0 text-gray-900 shadow-2xl backdrop:bg-black/50 dark:border-white/10 dark:bg-[#1E1B24] dark:text-white">
    <div className="p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {selected && <button type="button" onClick={() => onView({ kind: 'collection' })} className={`mb-2 -ml-2 flex min-h-[44px] items-center gap-1 rounded-xl px-2 text-sm text-gray-600 dark:text-gray-300 ${focusStyle}`}><ArrowLeft size={16} aria-hidden="true" />{t('배지 컬렉션')}</button>}
          <h2 ref={heading} id={headingId} tabIndex={-1} className="break-words text-xl font-extrabold outline-none">{selected ? badgeTitle(selected) : t('배지 컬렉션')}</h2>
        </div>
        <button type="button" aria-label={t('닫기')} onClick={close} className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-black/5 dark:bg-white/10 ${focusStyle}`}><X size={20} aria-hidden="true" /></button>
      </div>
      {selected ? <div data-badge-detail={selected.definition.id} className="space-y-5">
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <BadgeArtwork badge={selected} size={168} />
          <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">{t(badgeTier(selected).nameKey)}</p>
          <p className={`text-sm font-bold ${selected.state === 'earned' ? 'text-accent dark:text-accent-light' : 'text-gray-500 dark:text-gray-400'}`}>{t(selected.state === 'earned' ? '획득' : '미획득')}</p>
          {selected.state === 'earned' && <p className="break-words text-sm"><span className="mr-2 text-xs text-gray-500 dark:text-gray-400">{t('취득일')}</span><time dateTime={selected.earnedOn}>{formatDate(selected.earnedOn)}</time></p>}
        </div>
        <div className="space-y-2 rounded-2xl bg-black/5 p-4 dark:bg-white/5">
          <h3 className="text-sm font-bold">{t('달성 조건')}</h3>
          <p className="text-sm leading-relaxed">{t(selected.definition.descriptionKey)}</p>
          {(selected.definition.rule.kind === 'workout-days' || selected.definition.rule.kind === 'consistent-weeks') && <p className="text-sm font-bold">{selected.target} {t(selected.definition.rule.kind === 'workout-days' ? '운동일 수' : '주')}</p>}
          <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{selected.definition.rule.kind === 'consistent-weeks'
            ? <>{t('월요일부터 일요일까지')} · {t('주 2일 이상 운동한 연속 주를 셉니다.')}</>
            : t(selected.definition.rule.kind === 'personal-best' || selected.definition.rule.kind === 'big-three'
              ? '이전 기록이 있는 같은 종목과 수행 조건의 최고 중량을 비교합니다.'
              : '운동일은 하루에 한 번만 인정됩니다.')}</p>
        </div>
        <BadgeProgressBar badge={selected} />
        {selected.definition.rule.kind === 'consistent-weeks' && <p className="text-sm tabular-nums">{t('최장 연속 기록')} · {selected.current.toLocaleString(language)} {t('주')}</p>}
        {selected.definition.rule.kind === 'personal-best' && <p className="text-sm tabular-nums">{t('신기록 갱신 횟수')} · {selected.current.toLocaleString(language)}</p>}
        {selected.state === 'earned' && <div className="space-y-3">
          <h3 className="text-sm font-bold">{t('달성 기록')}</h3>
          <ul className="space-y-2">{selected.evidence.map((evidence, index) => <li key={`${evidence.sessionId}-${index}`} className="rounded-2xl border border-black/10 p-3 dark:border-white/10">
            <time dateTime={evidence.date} className="text-xs text-gray-500 dark:text-gray-400">{formatDate(evidence.date)}</time>
            <p className="mt-1 break-words text-sm font-semibold">{evidence.title}</p>
            {evidence.record && <div className="mt-2 space-y-1 text-sm">
              <p className="break-words">{displayExercise(resolveRecordedExercise(evidence.record.exercise))}</p>
              <p className="font-bold tabular-nums">{t('최고 중량')} · {evidence.record.weight.toLocaleString(language, { maximumFractionDigits: 2 })} {evidence.record.unit}</p>
            </div>}
          </li>)}</ul>
          {selected.evidence.some(evidence => evidence.record) && <p className="text-xs text-gray-600 dark:text-gray-400">{t('실제 수행 중량이며 1RM 인증이 아닙니다.')}</p>}
        </div>}
      </div> : <div data-badge-collection className="space-y-7">
        {badgeGroups.map(group => <section key={group.nameKey} data-badge-group={group.kinds[0]} className="space-y-3">
          <h3 className="border-b border-black/10 pb-2 text-sm font-extrabold dark:border-white/10">{t(group.nameKey)}</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-4 min-[380px]:grid-cols-3">
            {badges.filter(badge => group.kinds.includes(badge.definition.rule.kind)).map(badge => <button type="button" key={badge.definition.id} data-badge={badge.definition.id} onClick={() => onView({ kind: 'detail', badgeId: badge.definition.id })}
              className={`flex min-w-0 flex-col items-center rounded-xl px-1 py-2 text-center [&_svg]:max-w-full ${focusStyle}`}>
              <BadgeArtwork badge={badge} size={96} />
              <span className="mt-2 block break-words text-xs font-bold leading-snug">{badgeTitle(badge)}</span>
              <span className="mt-1 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">{badge.state === 'locked' && <Lock size={10} aria-hidden="true" />}{t(badge.state === 'earned' ? '획득' : '미획득')}</span>
              {badge.state === 'earned' ? <time dateTime={badge.earnedOn} className="mt-1 block break-words text-[10px] text-gray-500 dark:text-gray-400">{formatDate(badge.earnedOn)}</time>
                : <span className="mt-1 block text-[10px] tabular-nums text-gray-500 dark:text-gray-400">{Math.min(badge.current, badge.target)} / {badge.target}</span>}
            </button>)}
          </div>
        </section>)}
      </div>}
      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{t('기록을 수정하거나 삭제하면 배지도 다시 계산됩니다.')}</p>
    </div>
  </dialog>;
}

function AchievementCards({ badges, title, preview, collection = false }: { badges: BadgeProgress[]; title: string; preview: BadgeProgress[]; collection?: boolean }) {
  const [view, setView] = useState<BadgeView>({ kind: 'closed' });
  const earnedCount = badges.filter(badge => badge.state === 'earned').length;
  const levels = badges.filter(badge => badge.definition.rule.kind === 'workout-days').sort((a, b) => a.target - b.target);
  const currentLevel = [...levels].reverse().find(badge => badge.state === 'earned');
  const nextLevel = levels.find(badge => badge.state === 'locked');
  const featuredLevel = currentLevel || nextLevel;
  const totalDays = levels[0]?.current || 0;
  return <section data-achievements className="soft-surface space-y-5 bg-white p-5 dark:bg-[#1E1B24]">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-extrabold">{title}</h3>
      {collection && <span className="text-xs font-semibold tabular-nums text-gray-600 dark:text-gray-400">{earnedCount} / {badges.length}</span>}
    </div>
    {collection && featuredLevel && <div className="space-y-4">
      <button type="button" data-badge-level={featuredLevel.definition.id} onClick={() => setView({ kind: 'detail', badgeId: featuredLevel.definition.id })}
        className={`flex w-full items-center gap-4 rounded-xl py-1 text-left ${focusStyle}`}>
        <span className="shrink-0"><BadgeArtwork badge={featuredLevel} size={112} /></span>
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-[10px] font-bold tracking-wide text-gray-500 dark:text-gray-400">{t('현재 단계')} · {t('단계')} {currentLevel ? badgeTier(currentLevel).rank : 0} / {levels.length}</span>
          <span className="block break-words text-2xl font-black tracking-tight">{t(badgeTier(featuredLevel).nameKey)}</span>
          <span className="block text-sm tabular-nums"><strong className="text-2xl font-black">{totalDays.toLocaleString()}</strong> <span className="text-gray-500 dark:text-gray-400">{t('운동일 수')}</span></span>
        </span>
      </button>
      {nextLevel ? <div data-badge-next={nextLevel.definition.id} className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400">{t('다음 단계')} <strong className="ml-1 text-gray-900 dark:text-white">{t(badgeTier(nextLevel).nameKey)}</strong></span>
          <span className="font-bold tabular-nums">{totalDays.toLocaleString()} / {nextLevel.target.toLocaleString()}</span>
        </div>
        <progress aria-label={t('다음 배지까지')} max={nextLevel.target} value={Math.min(totalDays, nextLevel.target)} className="block h-1.5 w-full overflow-hidden rounded-full accent-accent" />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('남은 운동일')} <strong className="ml-1 text-gray-900 dark:text-white">{Math.max(0, nextLevel.target - totalDays).toLocaleString()}</strong></p>
      </div> : <p className="text-xs font-bold text-accent dark:text-accent-light">{t('최고 단계 달성')}</p>}
    </div>}
    {preview.length ? <div className={collection ? 'space-y-3 border-t border-black/10 pt-4 dark:border-white/10' : ''}>
      {collection && <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400">{t('최근 획득')}</h4>}
      <div className="grid grid-cols-3 gap-2">{preview.map(badge => <button type="button" key={badge.definition.id} data-badge-preview={badge.definition.id}
        onClick={() => setView({ kind: 'detail', badgeId: badge.definition.id })} className={`flex min-w-0 flex-col items-center rounded-xl py-1 text-center [&_svg]:max-w-full ${focusStyle}`}>
        <BadgeArtwork badge={badge} size={84} />
        <span className="mt-2 break-words text-[11px] font-bold leading-snug">{badgeTitle(badge)}</span>
      </button>)}</div>
    </div> : <div className="border-t border-black/10 pt-4 dark:border-white/10">
      <p className="text-sm font-semibold">{t('아직 획득한 배지가 없습니다.')}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{t('첫 운동을 완료하고 첫 배지를 받아보세요.')}</p>
    </div>}
    {collection && <button type="button" data-badge-open-collection onClick={() => setView({ kind: 'collection' })} className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-xl text-left text-sm font-bold ${focusStyle}`}>{t('전체 배지 보기')}<ChevronRight size={17} className="shrink-0" aria-hidden="true" /></button>}
    {view.kind !== 'closed' && <BadgeBrowser badges={badges} view={view} onView={setView} />}
  </section>;
}

export function AchievementSection({ history }: { history: WorkoutSession[] }) {
  useLanguage();
  const badges = useMemo(() => calculateAchievements(history), [history]);
  const preview = badges.filter(badge => badge.state === 'earned').sort((a, b) => a.state === 'earned' && b.state === 'earned' ? b.earnedOn.localeCompare(a.earnedOn) : 0).slice(0, 3);
  return <AchievementCards badges={badges} preview={preview} title={t('획득한 배지')} collection />;
}

export function NewlyEarnedAchievements({ session, history }: { session: WorkoutSession; history: WorkoutSession[] }) {
  useLanguage();
  const { badges, newlyEarned } = useMemo(() => {
    const before = history.filter(item => item.id !== session.id);
    const previous = new Set(calculateAchievements(before).filter(badge => badge.state === 'earned').map(badge => badge.definition.id));
    const badges = calculateAchievements([...before, session]);
    return { badges, newlyEarned: badges.filter(badge => badge.state === 'earned' && !previous.has(badge.definition.id)) };
  }, [session, history]);
  return newlyEarned.length ? <div data-new-achievements><AchievementCards badges={badges} preview={newlyEarned} title={t('이번에 획득한 배지')} /></div> : null;
}

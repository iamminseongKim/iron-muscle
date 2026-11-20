import React, { useEffect, useRef, useState } from 'react';
import { t, displayExercise } from '../../i18n';
import type { WorkoutExercise, WorkoutSet, WeightUnit } from '../../types/workout';
import type { SetProgress } from '../../utils/adaptiveTraining';
import { applyRemainingGroupValues, getCurrentGroupRound, getGroupRounds } from '../../utils/workoutGroups';
import { isAssistedExercise } from '../../utils/calculations';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { SetRow } from './SetRow';
import type { useExerciseDrag } from '../../hooks/useExerciseDrag';

export interface GroupAdvanceExpectation {
  exerciseId: WorkoutExercise['id'];
  setId: WorkoutSet['id'];
  startedAt: WorkoutSet['startedAt'];
}

interface GroupedExerciseCardProps {
  drag: ReturnType<typeof useExerciseDrag>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  exercises: WorkoutExercise[];
  weightUnit: WeightUnit;
  restAfterSets: ReadonlyMap<string, number>;
  getProgress: (exerciseId: string, setId: string) => SetProgress;
  onUpdate: (exercise: WorkoutExercise) => void;
  onAdvance: (expected: GroupAdvanceExpectation) => boolean;
  onCancelStart: (exerciseId: string, setId: string) => void;
  onComplete: (exercise: WorkoutExercise, setId: string, setNumber: number, last: boolean) => void;
  onOpenRpeGuide: () => void;
  onApplySettings: (settings: { rounds: number; restSeconds: number }) => void;
  renderExercise: (exercise: WorkoutExercise) => React.ReactNode;
}

export function GroupedExerciseCard({ drag, collapsed, onToggleCollapsed, exercises, weightUnit, restAfterSets, getProgress, onUpdate, onAdvance, onCancelStart, onComplete, onOpenRpeGuide, onApplySettings, renderExercise }: GroupedExerciseCardProps) {
  const rounds = getGroupRounds(exercises);
  const maxRound = Math.max(1, rounds.length);
  const round = getCurrentGroupRound(exercises);
  const [showDetails, setShowDetails] = useState(false);
  const [roundCount, setRoundCount] = useState(maxRound);
  const plannedSets = exercises.flatMap(exercise => exercise.sets);
  const defaultRest = plannedSets.find(set => !set.completed && !set.startedAt && set.plannedRestSeconds !== undefined)?.plannedRestSeconds
    ?? plannedSets.find(set => set.plannedRestSeconds !== undefined)?.plannedRestSeconds ?? 90;
  const [restSeconds, setRestSeconds] = useState(defaultRest);
  const [roundsEdited, setRoundsEdited] = useState(false);
  const [restEdited, setRestEdited] = useState(false);
  const [actionCoolingDown, setActionCoolingDown] = useState(false);
  const actionUnlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (actionUnlockTimer.current !== null) clearTimeout(actionUnlockTimer.current);
  }, []);
  const selectedRounds = roundsEdited ? roundCount : maxRound;
  const selectedRest = restEdited ? restSeconds : defaultRest;
  const currentMembers = rounds.find(item => item.ordinal === round)?.members ?? [];
  const activeMember = currentMembers.find(member => exercises.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId && set.startedAt && !set.completed));
  const target = activeMember ?? currentMembers.find(member => !exercises.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId)?.completed);
  const targetSet = target ? exercises.find(exercise => exercise.id === target.exerciseId)?.sets.find(set => set.id === target.setId) : undefined;
  const targetProgress = target ? getProgress(target.exerciseId, target.setId) : undefined;
  const canAdvance = Boolean(targetSet && !targetSet.weightNeedsConfirmation && (targetProgress?.kind === 'ready' || targetProgress?.kind === 'active'));
  const followingMember = activeMember && currentMembers.find(member => member.setId !== activeMember.setId && !exercises.find(exercise => exercise.id === member.exerciseId)?.sets.find(set => set.id === member.setId)?.completed);
  const actionLabel = !target ? '라운드 완료' : !activeMember ? '라운드 시작' : followingMember ? '다음 종목으로' : '라운드 완료';
  const first = exercises[0];
  if (!first) return null;
  const kind = first.groupType === 'superset' ? '슈퍼세트' : first.groupType === 'giant' ? '자이언트세트' : '컴파운드세트';
  const letter = first.groupLabel?.match(/ ([A-Z])-\d+$/)?.[1] ?? '';
  const mismatched = new Set(exercises.map(exercise => exercise.sets.length)).size > 1;
  const valid = Number.isInteger(selectedRounds) && selectedRounds >= 1 && selectedRounds <= 50 && Number.isFinite(selectedRest) && selectedRest >= 0 && selectedRest <= 3600;
  const dragMember = exercises.find(exercise => exercise.id === drag?.sourceId);
  const collapsedId = dragMember?.id ?? first.id;
  const dropPlacement = collapsed && drag?.targetId === collapsedId ? drag.placement : undefined;
  return <section data-workout-group={first.groupId} data-workout-exercise={collapsed ? collapsedId : undefined} data-dragging={collapsed && Boolean(dragMember) || undefined} data-drop-placement={dropPlacement}
    className={`overflow-hidden rounded-2xl border border-accent/30 bg-white dark:bg-[#1E1B24] shadow-xs ${collapsed && dragMember ? 'opacity-40' : ''} ${dropPlacement === 'before' ? 'border-t-4 border-t-accent' : dropPlacement === 'after' ? 'border-b-4 border-b-accent' : ''}`}>
    <header className="flex items-center justify-between gap-2 bg-accent-strong px-4 py-3 text-white">
      <h3 className="min-w-0 flex-1 font-extrabold text-sm"><button type="button" aria-expanded={!collapsed} onClick={onToggleCollapsed} className="min-h-[36px] w-full text-left">{collapsed ? '▸' : '▾'} {t(kind)} {letter}</button></h3>
      <span data-group-round className="text-xs font-bold tabular-nums">{round} / {maxRound} {t('라운드')}</span>
    </header>
    <div hidden={collapsed}>
    <div className="flex flex-wrap justify-between gap-2 px-3 py-2 text-xs">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3"><button type="button" data-group-details-button aria-expanded={showDetails} onClick={() => setShowDetails(value => !value)} className="min-h-[40px] font-bold text-accent">{t(showDetails ? '현재 라운드 보기' : '전체 세트·설정')}</button><span className="text-gray-500">{t('휴식')} {defaultRest}{t('초')}</span></div>
      <details data-group-settings className="min-w-0 text-right open:w-full" onToggle={event => {
        if (event.currentTarget.open) { setRoundsEdited(false); setRestEdited(false); }
      }}>
        <summary className="min-h-[40px] cursor-pointer py-3 font-bold text-accent">{t('묶음 설정')}</summary>
        <div className="space-y-3 pb-3 text-left">
          {mismatched && <p className="text-gray-500">{t('종목별 세트 수가 다릅니다. 설정을 적용하면 라운드 수를 맞춥니다.')}</p>}
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">{t('라운드 수')}<input data-group-round-count aria-label={t('라운드 수')} type="number" min={1} max={50} inputMode="numeric" className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-transparent p-2" value={Number.isNaN(selectedRounds) ? '' : selectedRounds} onChange={event => { setRoundsEdited(true); setRoundCount(event.target.value === '' ? NaN : Number(event.target.value)); }} /></label>
            <label className="space-y-1">{t('라운드 휴식 (초)')}<input data-group-rest-seconds aria-label={t('라운드 휴식 (초)')} type="number" min={0} max={3600} inputMode="numeric" className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-transparent p-2" value={Number.isNaN(selectedRest) ? '' : selectedRest} onChange={event => { setRestEdited(true); setRestSeconds(event.target.value === '' ? NaN : Number(event.target.value)); }} /></label>
          </div>
          <p className="text-gray-500">{t('완료한 세트와 진행 중인 세트는 유지합니다.')}</p>
          <button type="button" data-group-apply disabled={!valid} className="rounded-xl bg-accent px-4 py-2 font-bold text-white disabled:opacity-40" onClick={() => { onApplySettings({ rounds: selectedRounds, restSeconds: selectedRest }); setRoundsEdited(false); setRestEdited(false); }}>{t('설정 적용')}</button>
        </div>
      </details>
    </div>
    {showDetails ? <div className="space-y-3 p-2">{exercises.map(exercise => <React.Fragment key={exercise.id}>{renderExercise(exercise)}</React.Fragment>)}</div>
      : <div className="divide-y divide-black/5 dark:divide-white/10">{exercises.map(exercise => {
        const resolved = resolveRecordedExercise(exercise);
        const set = exercise.sets[round - 1];
        const index = set ? exercise.sets.findIndex(item => item.id === set.id) : -1;
        return <div key={exercise.id} id={`exercise-${exercise.id}`} data-workout-exercise={exercise.id} data-dragging={drag?.sourceId === exercise.id || undefined} data-drop-placement={drag?.targetId === exercise.id ? drag.placement : undefined}
          className={`scroll-mt-24 px-2 py-3 ${drag?.sourceId === exercise.id ? 'opacity-40' : ''} ${drag?.targetId === exercise.id ? drag.placement === 'before' ? 'border-t-4 border-accent' : 'border-b-4 border-accent' : ''}`}>
          <div className="flex items-center justify-between gap-2 px-2 pb-1"><h4 className="min-w-0 break-words text-sm font-bold">{displayExercise(resolved)}</h4><span className="shrink-0 text-xs text-gray-500">{exercise.weightUnit || weightUnit}</span></div>
          {set ? <>
            <SetRow compact progressControl="status" set={set} index={index} weightUnit={exercise.weightUnit || weightUnit} executionMode={exercise.executionMode || 'bilateral'} isAssisted={isAssistedExercise(resolved)} restAfterSeconds={restAfterSets.get(set.id)} previousSet={exercise.sets[index - 1]} progress={getProgress(exercise.id, set.id)}
              onUpdate={updated => onUpdate({ ...exercise, sets: exercise.sets.map(item => item.id === updated.id ? updated : item) })}
              onDelete={() => onUpdate({ ...exercise, sets: exercise.sets.filter(item => item.id !== set.id) })}
              onCancelStart={() => onCancelStart(exercise.id, set.id)}
              onCompleteToggle={completed => { if (completed) onComplete(exercise, set.id, set.setNumber, exercise.sets.every(item => item.id === set.id || item.completed)); }} onOpenRpeGuide={onOpenRpeGuide} />
            {exercise.sets.some((item, index) => index + 1 > round && !item.completed && !item.startedAt) && <button type="button" className="min-h-[36px] px-2 text-[11px] font-semibold text-accent" onClick={() => onUpdate(applyRemainingGroupValues(exercise, set.id))}>{t('남은 라운드에 적용')}</button>}
          </> : <p className="px-2 py-3 text-xs text-gray-500">{t('이 라운드에 세트가 없습니다.')}</p>}
        </div>;
      })}</div>}
    <div className="space-y-2 border-t border-black/5 dark:border-white/10 p-3">
      <p className="text-xs text-gray-500">{t('종목 사이에는 휴식 없이 이어갑니다.')}</p>
      {target && <p data-group-current-member role="status" className="text-xs font-bold text-accent">{t('라운드 진행')} · {displayExercise(resolveRecordedExercise(exercises.find(exercise => exercise.id === target.exerciseId) ?? first))}</p>}
      <button type="button" data-group-action disabled={!canAdvance || actionCoolingDown}
        onKeyDown={event => { if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault(); }}
        onClick={event => {
          if (event.detail > 1 || actionCoolingDown || !target || !targetSet) return;
          if (!onAdvance({ exerciseId: target.exerciseId, setId: target.setId, startedAt: targetSet.startedAt })) return;
          setActionCoolingDown(true);
          actionUnlockTimer.current = setTimeout(() => { actionUnlockTimer.current = null; setActionCoolingDown(false); }, 600);
        }} className="min-h-[48px] w-full rounded-xl bg-accent px-4 py-3 text-sm font-extrabold text-white disabled:opacity-40">{t(actionLabel)}</button>
      <p className="text-[11px] text-gray-500">{t('라운드 피드백은 선택 사항입니다. 전체 세트에서 기록을 수정할 수 있습니다.')}</p>
    </div>
    </div>
  </section>;
}

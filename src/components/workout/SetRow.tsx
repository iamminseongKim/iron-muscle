import { t } from '../../i18n';
import React, { useState, useRef, useEffect } from 'react';
import { Check, X, MoreHorizontal, MessageSquare, Clock, HelpCircle, Timer, Play } from 'lucide-react';
import { WorkoutSet, Tempo, ExecutionMode, WeightUnit } from '../../types/workout';
import { soundManager } from '../../utils/audio';
import { SetCommentModal } from './SetCommentModal';
import { TempoModal } from './TempoModal';
import { SetFeedbackModal, SET_TYPE_LABELS } from './SetFeedbackModal';
import { loadAdaptiveSettings } from '../../utils/adaptiveSettings';
import { completeWorkoutSet, undoWorkoutSet, type SetProgress } from '../../utils/adaptiveTraining';

interface SetRowProps {
  set: WorkoutSet;
  index: number;
  executionMode?: ExecutionMode;
  weightUnit?: WeightUnit;
  isAssisted?: boolean;
  onUpdate: (updated: WorkoutSet) => void;
  onDelete: () => void;
  onStart?: () => void;
  previousSet?: WorkoutSet;
  progress?: SetProgress;
  onCancelStart?: () => void;
  onCompleteToggle: (completed: boolean, setId: string, setNumber: number) => void;
  onOpenRpeGuide: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  executionMode = 'bilateral',
  weightUnit = 'kg',
  isAssisted = false,
  onUpdate,
  onDelete,
  onStart,
  previousSet,
  progress: suppliedProgress,
  onCancelStart,
  onCompleteToggle,
  onOpenRpeGuide,
}) => {
  const progress = suppliedProgress || { kind: set.completed ? 'completed' : set.startedAt ? 'active' : 'ready' };
  const waiting = progress.kind === 'waiting';
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackAt, setFeedbackAt] = useState<Date | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isTempoModalOpen, setIsTempoModalOpen] = useState(false);

  // 안드로이드 네이티브 셀렉션 툴바(복사/잘라내기/번역) 및 물방울 핀 차단용 스마트 첫 입력 덮어쓰기 상태
  const [isWeightFresh, setIsWeightFresh] = useState(false);
  const [isRepsFresh, setIsRepsFresh] = useState(false);

  // type="number"는 브라우저 selection API(setSelectionRange)를 지원하지 않아 캐럿 위치를
  // 코드에서 직접 보정할 방법이 없다. 아래 ref들로 매 값 변경마다 캐럿을 끝으로 고정해
  // 안드로이드 WebView가 물방울 핸들을 옛 위치에 그대로 남겨두는(잔존) 현상을 줄인다.
  const weightInputRef = useRef<HTMLInputElement>(null);
  const repsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = weightInputRef.current;
    if (el && document.activeElement === el) {
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {}
    }
  }, [set.weight]);

  useEffect(() => {
    const el = repsInputRef.current;
    if (el && document.activeElement === el) {
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {}
    }
  }, [set.reps]);

  const handleWeightFocus = () => {
    setIsWeightFresh(true);
    window.getSelection()?.removeAllRanges();
  };

  const handleWeightBlur = () => {
    setIsWeightFresh(false);

  };

  const handleWeightChange = (rawVal: string) => {
    if (isWeightFresh) {
      setIsWeightFresh(false);
      const prevDisplay = isAssisted && set.weight !== 0 ? String(Math.abs(set.weight)) : String(set.weight || '');
      // 백스페이스로 길이가 줄어든 경우 전체 삭제
      if (rawVal.length < prevDisplay.length) {
        onUpdate({ ...set, weight: 0 });
        return;
      }
      // 새로운 숫자 입력 시 기존 값을 덮어쓰고 새로 입력된 숫자만 채택
      let newlyTyped = rawVal;
      if (prevDisplay && rawVal.startsWith(prevDisplay)) {
        newlyTyped = rawVal.slice(prevDisplay.length);
      } else if (prevDisplay && rawVal.endsWith(prevDisplay)) {
        newlyTyped = rawVal.slice(0, rawVal.length - prevDisplay.length);
      }
      const parsedWeight = parseFloat(newlyTyped);
      let num = Number.isNaN(parsedWeight) ? (set.weight || 0) : parsedWeight;
      if (isAssisted && num > 0) num = -num;
      onUpdate({ ...set, weight: num });
      return;
    }
    const parsed = parseFloat(rawVal);
    let num = Number.isNaN(parsed) ? 0 : parsed;
    if (isAssisted && num > 0) num = -num;
    onUpdate({ ...set, weight: num });
  };

  const handleRepsFocus = () => {
    setIsRepsFresh(true);
    window.getSelection()?.removeAllRanges();
  };

  const handleRepsBlur = () => {
    setIsRepsFresh(false);

  };

  const handleRepsChange = (rawVal: string) => {
    if (isRepsFresh) {
      setIsRepsFresh(false);
      const prevStr = String(set.reps || '');
      if (rawVal.length < prevStr.length) {
        onUpdate({ ...set, reps: 0 });
        return;
      }
      let newlyTyped = rawVal;
      if (prevStr && rawVal.startsWith(prevStr)) {
        newlyTyped = rawVal.slice(prevStr.length);
      } else if (prevStr && rawVal.endsWith(prevStr)) {
        newlyTyped = rawVal.slice(0, rawVal.length - prevStr.length);
      }
      const parsedReps = parseInt(newlyTyped, 10);
      const num = Number.isNaN(parsedReps) ? (set.reps || 0) : parsedReps;
      onUpdate({ ...set, reps: num });
      return;
    }
    const num = parseInt(rawVal, 10) || 0;
    onUpdate({ ...set, reps: num });
  };

  const handleCycleSide = () => {
    const current = set.side || 'both';
    const nextSide: 'left' | 'right' | 'both' =
      current === 'both' ? 'left' : current === 'left' ? 'right' : 'both';
    onUpdate({ ...set, side: nextSide });
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? null : parseFloat(e.target.value);
    onUpdate({ ...set, legacyRpe: set.provenance !== 'recorded' ? set.legacyRpe ?? set.rpe : set.legacyRpe, rpe: val, rpeSource: 'recorded' });
  };

  const handleToggleComplete = () => {
    if (waiting) return;
    if (!set.completed && !set.startedAt && onStart) { onStart(); return; }
    // 안드로이드 커서/핸들 잔존 버그 방지: 인풋 포커스 즉시 해제 및 셀렉션 클리어
    if (document.activeElement && (document.activeElement as HTMLElement).blur) {
      (document.activeElement as HTMLElement).blur();
    }
    window.getSelection()?.removeAllRanges();

    if (set.completed) {
      onUpdate(undoWorkoutSet(set));
      onCompleteToggle(false, set.id, index + 1);
    } else if (loadAdaptiveSettings().feedback) {
      if (set.provenance !== 'recorded' && set.rpeSource !== 'recorded') onUpdate({ ...set, legacyRpe: set.legacyRpe ?? set.rpe, rpe: null });
      setFeedbackAt(new Date());
      setFeedbackOpen(true);
    } else {
      confirmCompletion(set);
    }
  };

  const confirmCompletion = (draft: WorkoutSet) => {
    const updated = completeWorkoutSet(draft, feedbackAt || new Date());
    onUpdate(updated);
    setFeedbackOpen(false);
    setFeedbackAt(null);
    soundManager.playSuccessSound();
    onCompleteToggle(true, set.id, index + 1);
  };

  const handleSaveComment = (comment: string, tags: string[]) => {
    onUpdate({ ...set, comment, tags, commentSource: 'recorded' });
  };

  const handleSaveTempo = (tempo: Tempo) => {
    onUpdate({ ...set, tempo, tempoSource: 'recorded' });
  };

  const hasActualRpe = (set.provenance === 'recorded' || set.rpeSource === 'recorded') && set.rpe != null;
  const hasCommentOrTags = Boolean((set.comment && set.comment.trim().length > 0) || (set.tags && set.tags.length > 0));
  const hasTempo = Boolean(set.tempo);
  const hasRestTime = Boolean(set.restSeconds && set.restSeconds > 0);

  return (
    <>
      <div className={`px-2 py-1 transition-colors border-b border-black/5 dark:border-white/5 ${
        set.completed
          ? 'bg-[var(--accent-soft)] dark:bg-[var(--accent-soft-dark)]'
          : 'bg-transparent'
      }`}>
        {(progress.kind === 'active' || set.setType && set.setType !== 'UNSPECIFIED' || set.targetRpe !== undefined || set.completed) && <div className="flex flex-wrap items-center justify-between gap-1 py-1 text-[11px]">
          {progress.kind === 'active' && <span className="text-accent font-bold">{t('운동 중')} · {t('마치면 세트 완료를 누르세요.')}</span>}
          <span className="text-gray-500">{[
            set.completed ? t('완료됨') : null,
            set.setType && set.setType !== 'UNSPECIFIED' ? t(SET_TYPE_LABELS[set.setType]) : null,
            set.targetRpe !== undefined ? `${t('목표 RPE')} ${set.targetRpe}` : null,
            set.completed ? `RPE ${(set.provenance === 'recorded' || set.rpeSource === 'recorded') ? set.rpe ?? t('미기록') : t('출처 불명 기록')}` : null,
          ].filter(Boolean).join(' · ')}</span>
          {set.completed && <button type="button" className="min-h-[36px] px-2 text-accent" onClick={() => { setFeedbackAt(null); setFeedbackOpen(true); }}>{t('기록 수정')}</button>}
        </div>}
        {/* Line 1: Core Inputs (Set #, Previous Record, Weight, Reps, Complete Check) */}
        <div className="flex items-center gap-1.5">
          {/* 세트 번호 및 편측(L/R) 선택 */}
          <div className="w-6 shrink-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black text-gray-500 dark:text-gray-400">#{index + 1}</span>
            {executionMode === 'unilateral' && (
              <button
                type="button"
                onClick={handleCycleSide}
                className={`mt-0.5 px-1 py-0.2 text-[9px] font-black rounded-md transition ${
                  set.side === 'left'
                    ? 'bg-accent text-white shadow-xs'
                    : set.side === 'right'
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-600 dark:text-gray-300'
                }`}
                title={t("클릭하여 좌(L) / 우(R) / 양쪽 전환")}
              >
                {set.side === 'left' ? t('좌') : set.side === 'right' ? t('우') : t('양')}
              </button>
            )}
          </div>

          {/* 지난번 기록 대조 */}
          <div className="hidden min-[380px]:block w-12 shrink-0 text-center">
            {set.previousWeight !== undefined && set.previousReps !== undefined ? (
              <span className="text-[11px] font-mono font-bold text-gray-400 whitespace-nowrap block">
                {set.previousWeight}k × {set.previousReps}
              </span>
            ) : (
              <span className="text-[11px] text-gray-300 dark:text-gray-600 block">-</span>
            )}
          </div>

          {/* 중량 (kg/lbs) 입력 */}
          <div className="flex-1 min-w-0 relative">
            {isAssisted && (
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-black text-accent pointer-events-none select-none">
                -
              </span>
            )}
            <input
              aria-label={`${index + 1}${t("세트 무게")}`}
              ref={weightInputRef}
              type="text"
              pattern="^-?[0-9]*[.]?[0-9]*"
              step={weightUnit === 'lbs' ? '1' : '0.5'}
              inputMode="decimal"
              value={isAssisted ? (set.weight !== 0 ? Math.abs(set.weight) : '') : (set.weight || '')}
              placeholder="0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onFocus={handleWeightFocus}
              onBlur={handleWeightBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => handleWeightChange(e.target.value)}
              className={`numeric-set-input w-full text-center rounded-lg h-9 py-1 px-1 ${
                isAssisted ? 'pl-4 pr-7' : 'pr-7'
              } text-sm font-extrabold transition outline-none border ${
                isWeightFresh
                  ? 'bg-accent/10 dark:bg-accent/15 text-accent border-accent ring-2 ring-accent/10'
                  : 'bg-[#F4F3F8] dark:bg-[#302B37] text-[#24212B] dark:text-white border-transparent focus:border-accent-strong focus:bg-white dark:focus:bg-[#1E1B24]'
              }`}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">
              {weightUnit}
            </span>
          </div>

          {/* 횟수 (reps) 입력 */}
          <div className="flex-1 min-w-0 relative">
            <input
              aria-label={`${index + 1}${t("세트 횟수")}`}
              ref={repsInputRef}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={set.reps || ''}
              placeholder="0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onFocus={handleRepsFocus}
              onBlur={handleRepsBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => handleRepsChange(e.target.value)}
              className={`numeric-set-input w-full text-center rounded-lg h-9 py-1 px-1 pr-5 text-sm font-extrabold transition outline-none border ${
                isRepsFresh
                  ? 'bg-accent/10 dark:bg-accent/15 text-accent border-accent ring-2 ring-accent/10'
                  : 'bg-[#F4F3F8] dark:bg-[#302B37] text-[#24212B] dark:text-white border-transparent focus:border-accent-strong focus:bg-white dark:focus:bg-[#1E1B24]'
              }`}
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">{t("회")}</span>
          </div>

          {/* 세트 완료 체크 버튼 (라운드 체크) */}
          <button
            type="button"
            aria-label={`${index + 1}${t(set.completed ? '세트 완료 취소' : waiting ? '세트 대기' : !set.startedAt && onStart ? '세트 시작' : '세트 완료')}`}
            disabled={waiting}
            title={t(set.completed ? '완료 취소' : set.startedAt || !onStart ? '세트 완료' : '세트 시작')}
            aria-pressed={set.completed}
            onClick={handleToggleComplete}
            className={`w-20 min-h-[40px] text-[11px] font-bold disabled:opacity-35 shrink-0 rounded-xl flex items-center justify-center transition-all ${
              set.completed
                ? 'bg-gray-100 dark:bg-white/10 text-gray-500 active:scale-95'
                : set.startedAt ? 'bg-accent text-white active:scale-95' : 'bg-[#F4F3F8] dark:bg-[#302B37] text-gray-500 hover:text-accent-strong active:scale-95'
            }`}
          >
            {t(set.completed ? '완료 취소' : waiting ? '대기' : !set.startedAt && onStart ? '시작' : '세트 완료')}
          </button>
          <button type="button" aria-label={`${index + 1}${t("세트 상세 옵션")}`} aria-expanded={showOptions} onClick={() => setShowOptions(!showOptions)} className={`relative w-7 h-9 shrink-0 flex items-center justify-center rounded-lg ${showOptions ? 'bg-accent/10 text-accent' : 'text-gray-400'}`}>
            <MoreHorizontal size={16} />
            {(hasActualRpe || hasTempo || hasCommentOrTags || hasRestTime) && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent" />}
          </button>
        </div>

        {showOptions && <>
        {set.startedAt && !set.completed && onCancelStart && <button type="button" className="min-h-[40px] text-xs text-gray-500" onClick={onCancelStart}>{t('시작 취소')}</button>}
        {previousSet && !set.completed && <button type="button" className="text-xs min-h-[44px] text-accent" onClick={() => onUpdate({ ...set, weight: previousSet.weight, reps: previousSet.reps })}>{t('이전 세트 값 복사')}</button>}
        {/* Line 2: Set Options & Micro-actions */}
        <div className="mt-1 pt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* RPE 드롭다운 칩 */}
            <div className="relative inline-flex items-center">
              <select
                aria-label={`${index + 1}${t("세트 RPE")}`}
                value={(set.provenance === 'recorded' || set.rpeSource === 'recorded') ? set.rpe ?? '' : ''}
                onChange={handleRpeChange}
                className={`appearance-none font-bold text-[11px] rounded-lg pl-2 pr-5 py-1 outline-none cursor-pointer transition border ${
                  hasActualRpe
                    ? 'bg-amber-500/15 text-[#FF9500] border-amber-500/30'
                    : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 border-transparent hover:border-black/10'
                }`}
              >
                <option value="" className="text-gray-400">{t("RPE 선택")}</option>
                <option value="10">{t("RPE 10 (한계)")}</option>
                <option value="9.5">RPE 9.5</option>
                <option value="9">RPE 9 (RIR 1)</option>
                <option value="8.5">RPE 8.5</option>
                <option value="8">RPE 8 (RIR 2)</option>
                <option value="7.5">RPE 7.5</option>
                <option value="7">RPE 7 (RIR 3)</option>
                <option value="6.5">RPE 6.5</option>
                <option value="6">{t("RPE 6 (웜업)")}</option>
              </select>
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[8px] text-gray-400 pointer-events-none">▼</span>
            </div>

            {/* 템포 버튼 */}
            <button
              type="button"
              onClick={() => setIsTempoModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                hasTempo
                  ? 'bg-amber-500/15 text-[#FF9500]'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
              title={t("수축/이완 템포")}
            >
              <Clock size={12} />
              <span className="whitespace-nowrap">
                {hasTempo ? `${set.tempo?.eccentric}-${set.tempo?.pause}-${set.tempo?.concentric}s` : t('템포')}
              </span>
            </button>

            {/* 메모 버튼 */}
            <button
              type="button"
              onClick={() => setIsCommentModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                hasCommentOrTags
                  ? 'bg-accent/10 text-accent'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
              title={t("세트별 메모/태그")}
            >
              <MessageSquare size={12} />
              <span className="whitespace-nowrap">
                {t("메모")}
              </span>
            </button>

            {/* 실제 휴식 시간 표시 */}
            {hasRestTime && (
              <span className="px-2 py-1 rounded-lg bg-accent-bright/10 text-accent-bright text-[11px] font-bold flex items-center gap-1 whitespace-nowrap">
                <Timer size={12} />
                {set.restSeconds}{t('초 휴식')} {!set.restSource && t('출처 불명 기록')}
              </span>
            )}
          </div>

          {/* 삭제 버튼 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition shrink-0 ml-auto"
            title={t("세트 삭제")}
          >
            <X size={15} />
          </button>
        </div>

        {/* 메모 내용이나 태그가 있을 때 추가 프리뷰 노출 */}
        {hasCommentOrTags && (
          <div className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1 text-[11px]">
            {set.tags?.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent font-semibold">
                #{t(tag)}
              </span>
            ))}
            {set.comment && (
              <span className="text-gray-500 dark:text-gray-400 italic">
                "{set.comment}"
              </span>
            )}
          </div>
        )}
        </>}
      </div>

      {feedbackOpen && <SetFeedbackModal set={set} unit={weightUnit} onUpdate={onUpdate} onConfirm={draft => { if (set.completed) { onUpdate(draft); setFeedbackOpen(false); } else confirmCompletion(draft); }} onClose={() => { setFeedbackOpen(false); setFeedbackAt(null); }} />}
      <SetCommentModal
        isOpen={isCommentModalOpen}
        setNumber={index + 1}
        initialComment={set.comment}
        initialTags={set.tags}
        onClose={() => setIsCommentModalOpen(false)}
        onSave={handleSaveComment}
      />

      <TempoModal
        isOpen={isTempoModalOpen}
        initialTempo={set.tempo}
        onClose={() => setIsTempoModalOpen(false)}
        onSave={handleSaveTempo}
      />
    </>
  );
};

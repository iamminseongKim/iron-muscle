import React, { useState } from 'react';
import { Check, X, MessageSquare, Clock, HelpCircle, Timer } from 'lucide-react';
import { WorkoutSet, Tempo, ExecutionMode, WeightUnit } from '../../types/workout';
import { soundManager } from '../../utils/audio';
import { SetCommentModal } from './SetCommentModal';
import { TempoModal } from './TempoModal';

interface SetRowProps {
  set: WorkoutSet;
  index: number;
  executionMode?: ExecutionMode;
  weightUnit?: WeightUnit;
  onUpdate: (updated: WorkoutSet) => void;
  onDelete: () => void;
  onCompleteToggle: (completed: boolean, setId: string, setNumber: number) => void;
  onOpenRpeGuide: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  executionMode = 'bilateral',
  weightUnit = 'kg',
  onUpdate,
  onDelete,
  onCompleteToggle,
  onOpenRpeGuide,
}) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isTempoModalOpen, setIsTempoModalOpen] = useState(false);

  // 안드로이드/iOS 웹뷰에서 터치/클릭 시 기존 입력값 즉시 전체 선택 (원터치 덮어쓰기 지원)
  const handleSelectAll = (e: React.FocusEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    target.select();
    // 모바일 브라우저 타이밍 이슈 오버라이드
    requestAnimationFrame(() => target.select());
    setTimeout(() => target.select(), 40);
  };

  const handleCycleSide = () => {
    const current = set.side || 'both';
    const nextSide: 'left' | 'right' | 'both' =
      current === 'both' ? 'left' : current === 'left' ? 'right' : 'both';
    onUpdate({ ...set, side: nextSide });
  };

  const handleWeightChange = (val: string) => {
    const num = parseFloat(val) || 0;
    onUpdate({ ...set, weight: num });
  };

  const handleRepsChange = (val: string) => {
    const num = parseInt(val, 10) || 0;
    onUpdate({ ...set, reps: num });
  };

  const handleRpeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
    onUpdate({ ...set, rpe: val });
  };

  const handleToggleComplete = () => {
    // 안드로이드 커서/핸들 잔존 버그 방지: 인풋 포커스 즉시 해제 및 셀렉션 클리어
    if (document.activeElement && (document.activeElement as HTMLElement).blur) {
      (document.activeElement as HTMLElement).blur();
    }
    window.getSelection()?.removeAllRanges();

    const nextCompleted = !set.completed;
    onUpdate({ ...set, completed: nextCompleted });
    if (nextCompleted) {
      soundManager.playSuccessSound();
    }
    onCompleteToggle(nextCompleted, set.id, index + 1);
  };

  const handleSaveComment = (comment: string, tags: string[]) => {
    onUpdate({ ...set, comment, tags });
  };

  const handleSaveTempo = (tempo: Tempo) => {
    onUpdate({ ...set, tempo });
  };

  const hasCommentOrTags = Boolean((set.comment && set.comment.trim().length > 0) || (set.tags && set.tags.length > 0));
  const hasTempo = Boolean(set.tempo);
  const hasRestTime = Boolean(set.restSeconds && set.restSeconds > 0);

  return (
    <>
      <div className={`p-2.5 sm:p-3 rounded-2xl transition-all border ${
        set.completed
          ? 'bg-[#34C759]/5 dark:bg-[#34C759]/10 border-[#34C759]/40 shadow-xs'
          : 'bg-white dark:bg-[#1C1C1E] border-black/5 dark:border-white/5 hover:border-black/10'
      }`}>
        {/* Line 1: Core Inputs (Set #, Previous Record, Weight, Reps, Complete Check) */}
        <div className="flex items-center gap-2">
          {/* 세트 번호 및 편측(L/R) 선택 */}
          <div className="w-8 shrink-0 flex flex-col items-center justify-center">
            <span className="text-xs font-black text-gray-500 dark:text-gray-400">#{index + 1}</span>
            {executionMode === 'unilateral' && (
              <button
                type="button"
                onClick={handleCycleSide}
                className={`mt-0.5 px-1 py-0.2 text-[9px] font-black rounded-md transition ${
                  set.side === 'left'
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : set.side === 'right'
                    ? 'bg-[#FF2D55] text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-[#3A3A3C] text-gray-600 dark:text-gray-300'
                }`}
                title="클릭하여 좌(L) / 우(R) / 양쪽 전환"
              >
                {set.side === 'left' ? '좌' : set.side === 'right' ? '우' : '양'}
              </button>
            )}
          </div>

          {/* 지난번 기록 대조 */}
          <div className="w-16 shrink-0 text-center">
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
            <input
              type="number"
              step={weightUnit === 'lbs' ? '1' : '0.5'}
              inputMode="decimal"
              value={set.weight || ''}
              placeholder="0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onFocus={handleSelectAll}
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-extrabold text-center rounded-xl py-2 px-1 pr-7 text-sm border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] transition outline-none"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">
              {weightUnit}
            </span>
          </div>

          {/* 횟수 (reps) 입력 */}
          <div className="flex-1 min-w-0 relative">
            <input
              type="number"
              inputMode="numeric"
              value={set.reps || ''}
              placeholder="0"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              onFocus={handleSelectAll}
              onClick={handleSelectAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              onChange={(e) => handleRepsChange(e.target.value)}
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-extrabold text-center rounded-xl py-2 px-1 pr-5 text-sm border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] transition outline-none"
            />
            <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold pointer-events-none">회</span>
          </div>

          {/* 세트 완료 체크 버튼 (애플 스타일 라운드 체크) */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-all ${
              set.completed
                ? 'bg-[#34C759] text-white shadow-sm scale-105 active:scale-95'
                : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 active:scale-95'
            }`}
          >
            <Check size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Line 2: Set Options & Micro-actions */}
        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* RPE 드롭다운 칩 */}
            <div className="relative inline-flex items-center">
              <select
                value={set.rpe !== undefined ? set.rpe : ''}
                onChange={handleRpeChange}
                className={`appearance-none font-bold text-[11px] rounded-lg pl-2 pr-5 py-1 outline-none cursor-pointer transition border ${
                  set.rpe !== undefined
                    ? 'bg-amber-500/15 text-[#FF9500] border-amber-500/30'
                    : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 border-transparent hover:border-black/10'
                }`}
              >
                <option value="" className="text-gray-400">RPE 선택</option>
                <option value="10">RPE 10 (한계)</option>
                <option value="9.5">RPE 9.5</option>
                <option value="9">RPE 9 (RIR 1)</option>
                <option value="8.5">RPE 8.5</option>
                <option value="8">RPE 8 (RIR 2)</option>
                <option value="7.5">RPE 7.5</option>
                <option value="7">RPE 7 (RIR 3)</option>
                <option value="6.5">RPE 6.5</option>
                <option value="6">RPE 6 (웜업)</option>
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
              title="수축/이완 템포"
            >
              <Clock size={12} />
              <span className="whitespace-nowrap">
                {hasTempo ? `${set.tempo?.eccentric}-${set.tempo?.pause}-${set.tempo?.concentric}s` : '템포'}
              </span>
            </button>

            {/* 메모 버튼 */}
            <button
              type="button"
              onClick={() => setIsCommentModalOpen(true)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                hasCommentOrTags
                  ? 'bg-blue-500/15 text-[#007AFF]'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
              title="세트별 메모/태그"
            >
              <MessageSquare size={12} />
              <span className="whitespace-nowrap">
                {hasCommentOrTags ? '메모' : '메모'}
              </span>
            </button>

            {/* 실제 휴식 시간 표시 */}
            {hasRestTime && (
              <span className="px-2 py-1 rounded-lg bg-[#34C759]/10 text-[#34C759] text-[11px] font-bold flex items-center gap-1 whitespace-nowrap">
                <Timer size={12} />
                {set.restSeconds}초 휴식
              </span>
            )}
          </div>

          {/* 삭제 버튼 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition shrink-0 ml-auto"
            title="세트 삭제"
          >
            <X size={15} />
          </button>
        </div>

        {/* 메모 내용이나 태그가 있을 때 추가 프리뷰 노출 */}
        {hasCommentOrTags && (
          <div className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1 text-[11px]">
            {set.tags?.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded-md bg-[#007AFF]/10 text-[#007AFF] font-semibold">
                #{t}
              </span>
            ))}
            {set.comment && (
              <span className="text-gray-500 dark:text-gray-400 italic">
                "{set.comment}"
              </span>
            )}
          </div>
        )}
      </div>

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

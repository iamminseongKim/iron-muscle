import React, { useState } from 'react';
import { Check, X, MessageSquare, Clock, HelpCircle, Timer } from 'lucide-react';
import { WorkoutSet, Tempo } from '../../types/workout';
import { soundManager } from '../../utils/audio';
import { SetCommentModal } from './SetCommentModal';
import { TempoModal } from './TempoModal';

interface SetRowProps {
  set: WorkoutSet;
  index: number;
  onUpdate: (updated: WorkoutSet) => void;
  onDelete: () => void;
  onCompleteToggle: (completed: boolean, setId: string, setNumber: number) => void;
  onOpenRpeGuide: () => void;
}

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  onUpdate,
  onDelete,
  onCompleteToggle,
  onOpenRpeGuide,
}) => {
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isTempoModalOpen, setIsTempoModalOpen] = useState(false);

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
      <div className={`p-3 rounded-2xl transition-all border ${
        set.completed
          ? 'bg-white dark:bg-[#1C1C1E] border-[#34C759]/40 shadow-sm'
          : 'bg-white dark:bg-[#1C1C1E] border-black/5 dark:border-white/5 hover:border-black/10'
      }`}>
        <div className="flex items-center gap-2.5">
          {/* 세트 번호 */}
          <div className="w-6 text-center">
            <span className="text-xs font-black text-gray-400">#{index + 1}</span>
          </div>

          {/* 지난번 기록 대조 */}
          <div className="w-16 text-center">
            {set.previousWeight !== undefined && set.previousReps !== undefined ? (
              <span className="text-[11px] font-semibold text-gray-400">
                {set.previousWeight}k × {set.previousReps}
              </span>
            ) : (
              <span className="text-[11px] text-gray-300 dark:text-gray-600">-</span>
            )}
          </div>

          {/* 중량 (kg) 입력 */}
          <div className="flex-1 min-w-[62px]">
            <div className="relative flex items-center">
              <input
                type="number"
                step="0.5"
                value={set.weight || ''}
                placeholder="0"
                onChange={(e) => handleWeightChange(e.target.value)}
                className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-bold text-center rounded-xl py-2 px-1 text-sm border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] transition outline-none"
              />
              <span className="absolute right-1.5 text-[10px] text-gray-400 font-semibold pointer-events-none">kg</span>
            </div>
          </div>

          {/* 횟수 (reps) 입력 */}
          <div className="flex-1 min-w-[54px]">
            <div className="relative flex items-center">
              <input
                type="number"
                value={set.reps || ''}
                placeholder="0"
                onChange={(e) => handleRepsChange(e.target.value)}
                className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-white font-bold text-center rounded-xl py-2 px-1 text-sm border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] transition outline-none"
              />
              <span className="absolute right-1.5 text-[10px] text-gray-400 font-semibold pointer-events-none">회</span>
            </div>
          </div>

          {/* RPE 선택 드롭다운 */}
          <div className="w-16">
            <select
              value={set.rpe !== undefined ? set.rpe : ''}
              onChange={handleRpeChange}
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-amber-500 dark:text-amber-400 font-bold text-center rounded-xl py-2 px-1 text-xs border border-transparent focus:border-amber-400 outline-none cursor-pointer"
            >
              <option value="" className="text-gray-400">RPE</option>
              <option value="10">10 (한계)</option>
              <option value="9.5">9.5</option>
              <option value="9">9 (RIR 1)</option>
              <option value="8.5">8.5</option>
              <option value="8">8 (RIR 2)</option>
              <option value="7.5">7.5</option>
              <option value="7">7 (RIR 3)</option>
              <option value="6.5">6.5</option>
              <option value="6">6 (웜업)</option>
            </select>
          </div>

          {/* 템포 & 메모 버튼 */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsTempoModalOpen(true)}
              className={`p-2 rounded-xl transition ${
                hasTempo
                  ? 'bg-amber-500/15 text-[#FF9500]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="수축/이완 템포(TUT)"
            >
              <Clock size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsCommentModalOpen(true)}
              className={`p-2 rounded-xl transition ${
                hasCommentOrTags
                  ? 'bg-blue-500/15 text-[#007AFF]'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              title="세트별 메모"
            >
              <MessageSquare size={16} />
            </button>
          </div>

          {/* 세트 완료 체크 버튼 (애플 스타일 라운드 체크) */}
          <button
            type="button"
            onClick={handleToggleComplete}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              set.completed
                ? 'bg-[#34C759] text-white shadow-sm scale-105'
                : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            <Check size={18} strokeWidth={2.5} />
          </button>

          {/* 삭제 */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 transition"
          >
            <X size={15} />
          </button>
        </div>

        {/* 세부 배지 (실제 휴식 시간, 템포, 태그, 코멘트) */}
        {(hasCommentOrTags || hasTempo || hasRestTime) && (
          <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-[11px]">
            {/* 사용자가 요청한 세트별 실제 쉰 시간 배지 */}
            {hasRestTime && (
              <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-[#34C759] font-bold flex items-center gap-1">
                <Timer size={11} />
                {set.restSeconds}초 휴식
              </span>
            )}
            {hasTempo && (
              <span className="px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] font-mono font-semibold">
                템포 {set.tempo?.eccentric}-{set.tempo?.pause}-{set.tempo?.concentric}s
              </span>
            )}
            {set.tags?.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[#007AFF] font-semibold">
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

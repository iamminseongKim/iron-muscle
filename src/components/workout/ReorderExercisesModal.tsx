import { t, displayExercise } from '../../i18n';
import React, { useEffect, useRef } from 'react';
import { X, ArrowUpDown, ChevronUp, ChevronDown, Check, Zap, Flame } from 'lucide-react';
import { WorkoutExercise } from '../../types/workout';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { getExerciseMoveAvailability } from '../../utils/workoutFlow';

interface ReorderExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: WorkoutExercise[];
  onMove: (id: string, direction: 'up' | 'down') => void;
}

export const ReorderExercisesModal: React.FC<ReorderExercisesModalProps> = ({
  isOpen,
  onClose,
  exercises,
  onMove,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reorder-modal-title"
      className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md animate-fade-in"
      style={{
        paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
      }}
    >
      <div className="bg-white dark:bg-[#1E1B24] rounded-3xl w-full max-w-md max-h-[85dvh] overflow-hidden flex flex-col shadow-2xl border border-black/10 dark:border-white/10">
        {/* Header */}
        <div className="shrink-0 p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <ArrowUpDown size={18} />
            </div>
            <div>
              <h3 id="reorder-modal-title" className="font-extrabold text-base text-[#1D1D1F] dark:text-white">
                {t("오늘의 운동 순서 변경")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("기구가 사용 중일 때 순서를 손쉽게 바꿀 수 있습니다.")}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t("닫기")}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Exercises list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {exercises.map((item, idx) => {
            const resolved = resolveRecordedExercise(item);
            const name = displayExercise(resolved);
            const availability = getExerciseMoveAvailability(exercises, item.id);
            const isGrouped = Boolean(item.groupId);
            const completedSets = item.sets.filter((s) => s.completed).length;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl bg-[#F8F7FA] dark:bg-[#25222C] border border-black/5 dark:border-white/5 flex items-center justify-between gap-2 transition ${
                  isGrouped ? 'border-l-4 border-l-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-black text-gray-500 dark:text-gray-300 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-sm text-[#1D1D1F] dark:text-white truncate">
                      {name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 flex-wrap">
                      <span>{completedSets}/{item.sets.length}{t("세트 완료")}</span>
                      {item.machineBrand && (
                        <span className="text-accent font-semibold truncate max-w-[120px]">
                          [{item.machineBrand}]
                        </span>
                      )}
                      {isGrouped && (
                        <span className="inline-flex items-center gap-0.5 text-accent font-bold">
                          {item.groupType === 'superset' ? <Zap size={10} /> : <Flame size={10} />}
                          {item.groupLabel || t("슈퍼세트")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Move buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onMove(item.id, 'up')}
                    disabled={!availability.up}
                    aria-label={`${t("위로 이동")} · ${name}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1B24] border border-black/5 dark:border-white/10 text-accent dark:text-accent-light disabled:opacity-20 active:scale-95 transition shadow-2xs"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(item.id, 'down')}
                    disabled={!availability.down}
                    aria-label={`${t("아래로 이동")} · ${name}`}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-white dark:bg-[#1E1B24] border border-black/5 dark:border-white/10 text-accent dark:text-accent-light disabled:opacity-20 active:scale-95 transition shadow-2xs"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black/5 dark:border-white/10 bg-[#F9F8FB] dark:bg-[#1E1B24]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-accent text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
          >
            <Check size={16} />
            <span>{t("순서 변경 완료")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

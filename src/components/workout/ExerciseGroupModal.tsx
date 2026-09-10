import React, { useState } from 'react';
import { Zap, Flame, X, Check, Link2, Unlink } from 'lucide-react';
import { WorkoutExercise, ExerciseGroupType } from '../../types/workout';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';

interface ExerciseGroupModalProps {
  isOpen: boolean;
  currentExercise: WorkoutExercise;
  allSessionExercises: WorkoutExercise[];
  onClose: () => void;
  onLinkExercises: (targetExerciseIds: string[], groupType: ExerciseGroupType) => void;
  onUnlinkExercise: (exerciseId: string) => void;
}

export const ExerciseGroupModal: React.FC<ExerciseGroupModalProps> = ({
  isOpen,
  currentExercise,
  allSessionExercises,
  onClose,
  onLinkExercises,
  onUnlinkExercise,
}) => {
  const [selectedGroupType, setSelectedGroupType] = useState<ExerciseGroupType>('superset');
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentBase = resolveRecordedExercise(currentExercise);
  const currentName = currentBase?.name || '현재 종목';

  // Other exercises that can be linked
  const otherExercises = allSessionExercises.filter((e) => e.id !== currentExercise.id);

  const isAlreadyGrouped = Boolean(currentExercise.groupId);

  const toggleSelectTarget = (targetId: string) => {
    if (selectedTargetIds.includes(targetId)) {
      setSelectedTargetIds(selectedTargetIds.filter((id) => id !== targetId));
    } else {
      setSelectedTargetIds([...selectedTargetIds, targetId]);
    }
  };

  const handleApply = () => {
    if (selectedTargetIds.length === 0) return;
    onLinkExercises([currentExercise.id, ...selectedTargetIds], selectedGroupType);
    onClose();
  };

  const handleUnlink = () => {
    onUnlinkExercise(currentExercise.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-black/5 dark:border-white/10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white">
                종목 묶기 설정
              </h3>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                {currentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {isAlreadyGrouped ? (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl">
              <span className="text-xs text-gray-400 font-medium block mb-1">현재 상태</span>
              <p className="text-sm font-bold text-[#007AFF]">
                {currentExercise.groupLabel || '묶음 진행 중'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                다른 종목과 결합되어 한 세트로 순서대로 진행됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleUnlink}
              className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-[#FF3B30] rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Unlink size={16} />
              이 종목 묶음 해제하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 묶음 방식 선택: 슈퍼세트 vs 컴파운드세트 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                묶음 방식 선택
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGroupType('superset')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedGroupType === 'superset'
                      ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : 'border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Zap size={14} className="text-[#007AFF]" />
                    ⚡ 슈퍼세트
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">
                    길항근 / 다른 부위 2개 종목을 번갈아 수행 (예: 이두+삼두, 가슴+등)
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGroupType('compound')}
                  className={`p-3 rounded-2xl border text-left transition ${
                    selectedGroupType === 'compound'
                      ? 'border-[#FF9500] bg-[#FF9500]/10 text-[#FF9500]'
                      : 'border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Flame size={14} className="text-[#FF9500]" />
                    🔥 컴파운드세트
                  </div>
                  <p className="text-[11px] text-gray-400 leading-tight">
                    같은 부위 2개 종목을 연속 수행하여 완전 탈진 유도
                  </p>
                </button>
              </div>
            </div>

            {/* 함께 묶을 대상 종목 선택 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                함께 묶을 종목 선택
              </label>
              {otherExercises.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl">
                  함께 묶을 다른 운동이 세션에 없습니다.<br />먼저 다른 운동을 추가해 주세요.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {otherExercises.map((target) => {
                    const base = resolveRecordedExercise(target);
                    const isChecked = selectedTargetIds.includes(target.id);
                    return (
                      <button
                        key={target.id}
                        type="button"
                        onClick={() => toggleSelectTarget(target.id)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                          isChecked
                            ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                            : 'border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold truncate">
                          {base?.name || '운동 종목'}
                          {target.groupLabel && (
                            <span className="ml-1.5 text-[10px] text-gray-400">
                              ({target.groupLabel})
                            </span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                          isChecked
                            ? 'bg-[#007AFF] border-[#007AFF] text-white'
                            : 'border-gray-400 dark:border-gray-600'
                        }`}>
                          {isChecked && <Check size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 적용 버튼 */}
            <button
              type="button"
              disabled={selectedTargetIds.length === 0}
              onClick={handleApply}
              className={`w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-1.5 transition ${
                selectedTargetIds.length > 0
                  ? 'bg-[#007AFF] text-white shadow-md shadow-blue-500/20 active:scale-98'
                  : 'bg-gray-200 dark:bg-[#2C2C2E] text-gray-400 cursor-not-allowed'
              }`}
            >
              <Link2 size={16} />
              선택한 종목과 {selectedGroupType === 'superset' ? '슈퍼세트' : '컴파운드세트'} 묶기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

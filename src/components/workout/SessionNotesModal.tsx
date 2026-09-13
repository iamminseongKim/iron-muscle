import { t } from '../../i18n';
import React, { useState, useMemo } from 'react';
import { X, FileText, Sparkles, Wand2, Target, Check } from 'lucide-react';
import { WorkoutExercise, TARGET_BODY_PARTS } from '../../types/workout';
import { BodyPartIcon } from '../common/BodyPartIcon';
import {
  detectBodyPartsFromExercises,
  countExercisesByBodyPart,
  formatWorkoutTitleFromParts,
} from '../../utils/bodyPartDetector';

interface SessionNotesModalProps {
  isOpen: boolean;
  initialNotes?: string;
  initialEmoji?: string;
  isDeload?: boolean;
  initialPartIds?: string[];
  currentExercises?: WorkoutExercise[];
  onClose: () => void;
  onSave: (
    notes: string,
    emoji: string,
    isDeload: boolean,
    targetPartIds: string[],
    updateTitle: boolean
  ) => void;
}

const CONDITION_EMOJIS = [
  { emoji: '🔥', label: '최상의 컨디션' },
  { emoji: '💪', label: '적절한 펌핑 & 힘' },
  { emoji: '🥱', label: '수면 부족 / 피로' },
  { emoji: '🤕', label: '관절 / 통증 주의' },
  { emoji: '🚀', label: '신기록 갱신 달성' },
];

export const SessionNotesModal: React.FC<SessionNotesModalProps> = ({
  isOpen,
  initialNotes = '',
  initialEmoji = '💪',
  isDeload: initialDeload = false,
  initialPartIds = [],
  currentExercises = [],
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState<string>(initialNotes);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(initialEmoji);
  const [isDeload, setIsDeload] = useState<boolean>(initialDeload);
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(initialPartIds);
  const [shouldUpdateTitle, setShouldUpdateTitle] = useState<boolean>(true);

  // 현재 세션의 운동 종목들을 기반으로 부위별 등록 개수 및 감지 목록 계산
  const exerciseCounts = useMemo(() => {
    return countExercisesByBodyPart(currentExercises);
  }, [currentExercises]);

  const detectedPartIds = useMemo(() => {
    return detectBodyPartsFromExercises(currentExercises);
  }, [currentExercises]);

  // 현재 선택되지 않았지만 세션에 종목이 존재하는 부위 확인
  const unselectedDetectedLabels = useMemo(() => {
    return detectedPartIds
      .filter((id) => !selectedPartIds.includes(id))
      .map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label)
      .filter(Boolean);
  }, [detectedPartIds, selectedPartIds]);

  // 자동 감지 버튼 클릭 핸들러
  const handleAutoDetect = () => {
    if (detectedPartIds.length > 0) {
      // 기존 선택 + 새로 감지된 것 합치기 (혹은 완전 교체)
      const merged = Array.from(new Set([...selectedPartIds, ...detectedPartIds]));
      setSelectedPartIds(merged);
    }
  };

  // 개별 부위 토글
  const handleTogglePart = (partId: string) => {
    if (selectedPartIds.includes(partId)) {
      setSelectedPartIds(selectedPartIds.filter((id) => id !== partId));
    } else {
      setSelectedPartIds([...selectedPartIds, partId]);
    }
  };

  // 예상 추천 타이틀
  const recommendedTitle = useMemo(() => {
    return formatWorkoutTitleFromParts(selectedPartIds);
  }, [selectedPartIds]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(notes, selectedEmoji, isDeload, selectedPartIds, shouldUpdateTitle);
    onClose();
  };

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#161618] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0F766E]/10 text-[#0F766E]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white">오늘의 운동 일지 & 코멘트</h3>
              <p className="text-xs text-gray-400">몸 상태, 운동 부위, 컨디션, 특이사항 기록</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content (스크롤 가능) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* 1. 컨디션 이모지 선택 */}
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-2">오늘의 신체 컨디션</span>
            <div className="grid grid-cols-5 gap-2">
              {CONDITION_EMOJIS.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(item.emoji)}
                    className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'bg-[#0F766E]/10 border-2 border-[#0F766E] scale-105 shadow-sm'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:border-black/20'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`text-[10px] text-center leading-tight font-medium ${
                      isSelected ? 'text-[#0F766E] font-bold' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. 타겟 운동 부위 재설정 (메인 화면과 동일한 BodyPartIcon 적용) */}
          <div className="p-3.5 bg-[#F9F9FB] dark:bg-[#252528] rounded-2xl border border-black/5 dark:border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Target size={14} className="text-[#0F766E]" />
                운동 부위 재설정
                <span className="text-[11px] font-normal text-gray-400">({selectedPartIds.length}개 선택)</span>
              </span>

              {/* 현재 종목 기반 자동 감지 버튼 */}
              {currentExercises.length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoDetect}
                  className="px-2 py-1 bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 hover:border-[#0F766E] text-[#0F766E] dark:text-[#2DD4BF] rounded-lg text-[11px] font-bold flex items-center gap-1 transition active:scale-95 shadow-xs"
                  title="현재 등록된 운동 종목들로부터 운동 부위를 자동 감지하여 선택합니다"
                >
                  <Wand2 size={12} />
                  <span>종목 기반 자동 감지</span>
                </button>
              )}
            </div>

            {/* 미반영 종목 감지 스마트 알림 배너 */}
            {unselectedDetectedLabels.length > 0 && (
              <div
                onClick={handleAutoDetect}
                className="cursor-pointer p-2 bg-[#0F766E]/10 dark:bg-[#0F766E]/20 border border-[#0F766E]/20 rounded-xl text-[11px] text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-between gap-1.5 transition hover:bg-[#0F766E]/15"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Sparkles size={13} className="shrink-0" />
                  <span className="truncate">
                    세션에 <strong>[{unselectedDetectedLabels.join(', ')}]</strong> 종목이 있습니다.
                  </span>
                </div>
                <span className="underline font-bold text-[10px] shrink-0">추가 반영</span>
              </div>
            )}

            {/* 4열 그리드 (메인 화면과 동일한 BodyPartIcon 디자인) */}
            <div className="grid grid-cols-4 gap-2">
              {TARGET_BODY_PARTS.map((part) => {
                const isSelected = selectedPartIds.includes(part.id);
                const count = exerciseCounts[part.id] || 0;
                return (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => handleTogglePart(part.id)}
                    className={`p-2 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all duration-150 relative ${
                      isSelected
                        ? 'bg-gradient-to-b from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-gray-100 text-white dark:text-black shadow-md scale-102 ring-2 ring-[#0F766E]/40'
                        : 'bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] border border-black/5 dark:border-white/5'
                    }`}
                  >
                    {/* 세션 내 운동 수 뱃지 */}
                    {count > 0 && part.id !== 'fullbody' && (
                      <span
                        className={`absolute top-1 right-1 text-[9px] px-1 py-0.2 rounded-full font-black ${
                          isSelected
                            ? 'bg-[#0F766E] text-white'
                            : 'bg-black/10 dark:bg-white/15 text-[#0F766E] dark:text-[#2DD4BF]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                    <BodyPartIcon part={part.id} />
                    <span className="text-[11px] font-black tracking-tight">{t(part.label)}</span>
                  </button>
                );
              })}
            </div>

            {/* 루틴 제목 자동 동기화 체크박스 */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={shouldUpdateTitle}
                onChange={(e) => setShouldUpdateTitle(e.target.checked)}
                className="rounded text-[#0F766E] focus:ring-[#0F766E]"
              />
              <span className="text-[11px]">
                루틴 제목도 함께 갱신: <strong className="text-[#0F766E] dark:text-[#2DD4BF] font-semibold">{recommendedTitle}</strong>
              </span>
            </label>
          </div>

          {/* 3. 디로딩 세션 토글 */}
          <div className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-500 dark:text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-[#1D1D1F] dark:text-white block">디로딩 세션 (Deload)</span>
                <span className="text-[11px] text-gray-400">신경계 회복을 위해 가볍게 진행한 운동</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDeload(!isDeload)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isDeload ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 shadow-sm ${
                  isDeload ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 자유 텍스트 일지 */}
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">운동 총평 메모</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 오늘은 하체 스트렝스 훈련. 스모 데드리프트 140kg 성공해서 뿌듯함. 다음엔 무릎 보호대 챙겨올 것."
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-2xl p-3 text-xs text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-black/5 dark:border-white/10 bg-[#F9F9FB] dark:bg-[#161618] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-[#2C2C2E] hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >{t("취소")}</button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:opacity-95 transition shadow-sm"
          >
            기록 저장
          </button>
        </div>
      </div>
    </div>
  );
};

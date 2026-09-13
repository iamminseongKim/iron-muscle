import { t } from '../../i18n';
import React, { useState } from 'react';
import { X, MessageSquare, Tag, Check } from 'lucide-react';

interface SetCommentModalProps {
  isOpen: boolean;
  setNumber: number;
  initialComment?: string;
  initialTags?: string[];
  onClose: () => void;
  onSave: (comment: string, tags: string[]) => void;
}

const AVAILABLE_TAGS = [
  '웜업', '탑세트', '백오프', '드롭세트', '실패지점', '스트랩 착용', '벨트 착용', '자세 불안', '치팅 1회', '자극 최고'
];

export const SetCommentModal: React.FC<SetCommentModalProps> = ({
  isOpen,
  setNumber,
  initialComment = '',
  initialTags = [],
  onClose,
  onSave,
}) => {
  const [comment, setComment] = useState<string>(initialComment);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    onSave(comment, selectedTags);
    onClose();
  };

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#0F766E]/15 text-[#0F766E]">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white">{setNumber}{t("세트 세부 코멘트")}</h3>
              <p className="text-xs text-gray-400">{t("세트별 특이사항 및 태그 달기")}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label={t("닫기")}
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* 빠른 태그 선택 */}
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
              <Tag size={13} className="text-[#0F766E]" />
              {t("빠른 세트 태그")}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {t(tag)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 메모 텍스트 입력창 */}
          <div>
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block mb-1.5">{t("세트 메모 (선택사항)")}</span>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("예: 3회차 때 허리 긴장 풀림, 다음엔 스트랩 챙길 것")}
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 rounded-2xl p-3 text-xs text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#0F766E] focus:bg-white dark:focus:bg-[#1C1C1E] transition resize-none font-medium"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-black/5 dark:border-white/10 bg-[#F9F9FB] dark:bg-[#161618] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition shadow-xs"
          >{t("취소")}</button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-xs font-black text-white bg-[#0F766E] hover:bg-blue-600 transition shadow-md shadow-teal-900/20 active:scale-98"
          >{t("저장")}</button>
        </div>
      </div>
    </div>
  );
};

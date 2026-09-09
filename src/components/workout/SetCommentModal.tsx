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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141721] border border-gray-700/80 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-[#141721]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{setNumber}세트 세부 코멘트</h3>
              <p className="text-xs text-gray-400">세트별 특이사항 및 태그 달기</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* 빠른 태그 선택 */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-2 flex items-center gap-1.5">
              <Tag size={13} />
              빠른 세트 태그
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-[#1E2333] text-gray-400 hover:text-gray-200 border border-gray-800'
                    }`}
                  >
                    {isSelected && <Check size={11} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 메모 텍스트 입력창 */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1.5">세트 메모 (선택사항)</span>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="예: 3회차 때 허리 긴장 풀림, 다음엔 스트랩 챙길 것"
              className="w-full bg-[#1A1E2C] border border-gray-800 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-800 bg-[#10131B] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-800 hover:text-white transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-lg shadow-blue-900/30"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

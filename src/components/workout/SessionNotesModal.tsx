import React, { useState } from 'react';
import { X, FileText, Sparkles } from 'lucide-react';

interface SessionNotesModalProps {
  isOpen: boolean;
  initialNotes?: string;
  initialEmoji?: string;
  isDeload?: boolean;
  onClose: () => void;
  onSave: (notes: string, emoji: string, isDeload: boolean) => void;
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
  onClose,
  onSave,
}) => {
  const [notes, setNotes] = useState<string>(initialNotes);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(initialEmoji);
  const [isDeload, setIsDeload] = useState<boolean>(initialDeload);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(notes, selectedEmoji, isDeload);
    onClose();
  };

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-[#F9F9FB] dark:bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF2D55]/10 text-[#FF2D55]">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white">오늘의 운동 일지 & 코멘트</h3>
              <p className="text-xs text-gray-400">몸 상태, 컨디션, 특이사항 기록</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-[#1D1D1F] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 컨디션 이모지 선택 */}
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
                        ? 'bg-[#FF2D55]/10 border-2 border-[#FF2D55] scale-105 shadow-sm'
                        : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:border-black/20'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`text-[10px] text-center leading-tight font-medium ${
                      isSelected ? 'text-[#FF2D55] font-bold' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 디로딩 세션 토글 */}
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
              className="w-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-black/5 dark:border-white/10 rounded-2xl p-3 text-xs text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-black/5 dark:border-white/10 bg-[#F9F9FB] dark:bg-[#161618] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-[#2C2C2E] hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2D55] to-[#FF375F] hover:opacity-95 transition shadow-sm"
          >
            기록 저장
          </button>
        </div>
      </div>
    </div>
  );
};

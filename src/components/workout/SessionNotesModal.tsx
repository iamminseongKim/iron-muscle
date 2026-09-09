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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141721] border border-gray-700/80 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-[#141721]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">오늘의 운동 일지 & 코멘트</h3>
              <p className="text-xs text-gray-400">몸 상태, 컨디션, 특이사항 기록</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 컨디션 이모지 선택 */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-2">오늘의 신체 컨디션</span>
            <div className="grid grid-cols-5 gap-2">
              {CONDITION_EMOJIS.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => setSelectedEmoji(item.emoji)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'bg-red-500/20 border-2 border-red-500 scale-105 shadow-md'
                        : 'bg-[#1A1E2C] border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 디로딩 세션 토글 */}
          <div className="p-3 bg-[#1A1E2C] rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">디로딩 세션 (Deload)</span>
                <span className="text-[11px] text-gray-400">신경계 회복을 위해 가볍게 진행한 운동</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDeload(!isDeload)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isDeload ? 'bg-indigo-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  isDeload ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 자유 텍스트 일지 */}
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1.5">운동 총평 메모</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 오늘은 하체 스트렝스 훈련. 스모 데드리프트 140kg 성공해서 뿌듯함. 다음엔 무릎 보호대 챙겨올 것."
              className="w-full bg-[#1A1E2C] border border-gray-800 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-500 transition resize-none leading-relaxed"
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
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF334B] to-[#FF5C6F] hover:opacity-95 transition shadow-lg shadow-red-900/30"
          >
            기록 저장
          </button>
        </div>
      </div>
    </div>
  );
};

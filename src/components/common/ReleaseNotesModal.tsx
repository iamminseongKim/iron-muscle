import React from 'react';
import { X, Star, Zap, Globe } from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose, version }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">🚀 릴리즈 최신 업데이트 핵심 요약</h3>
          <button onClick={onClose} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">100% 한국어화 완벽 지원</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                876개의 모든 운동 종목 설명 및 팁을 다국어(한국어)로 전면 번역 적용했습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <Star size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">브랜드 종속성 제거 (동작 중심)</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                사용자 기록 보존을 위해 기존 운동 ID는 유지하면서 특정 브랜드명에 종속되지 않은 직관적인 동작 중심 이름으로 일괄 개편했습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">3D 근육 해부도 연동</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                선택한 운동의 타겟 근육(주동근/협응근)을 3D 인체 모델에 시각적으로 매핑하여 보여주는 기능을 도입했습니다.
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-white/5 text-center">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            현재 버전: v{version}
          </span>
        </div>
      </div>
    </div>
  );
};

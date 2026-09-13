import React, { useEffect, useState } from 'react';
import { Sparkles, X, Tv } from 'lucide-react';
import { AdSimulationEventDetail, adService } from '../../services/adService';

export const AdSimulationModal: React.FC = () => {
  const [activeRequest, setActiveRequest] = useState<AdSimulationEventDetail | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(2);

  useEffect(() => {
    const handleShowAd = (e: CustomEvent<AdSimulationEventDetail>) => {
      setActiveRequest(e.detail);
      setSecondsRemaining(2);
    };

    window.addEventListener('iron_show_ad_simulation', handleShowAd as EventListener);
    return () => {
      window.removeEventListener('iron_show_ad_simulation', handleShowAd as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!activeRequest) return;

    if (secondsRemaining <= 0) {
      const current = activeRequest;
      setActiveRequest(null);
      current.resolve(true);
      return;
    }

    const timer = setTimeout(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeRequest, secondsRemaining]);

  if (!activeRequest) return null;

  const handleClose = () => {
    const current = activeRequest;
    setActiveRequest(null);
    current.resolve(true);
  };

  const handleEnableAdFree = () => {
    adService.setAdFree(true);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        {/* 상단 닫기/스킵 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition"
          aria-label="광고 닫기"
        >
          <X size={20} />
        </button>

        {/* 광고 아이콘 및 뱃지 */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F766E]/10 dark:bg-[#0F766E]/20 text-[#0F766E] flex items-center justify-center mb-4">
          <Tv size={28} />
        </div>

        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 mb-2">
          광고 시뮬레이터 (Ad Preview)
        </span>

        <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">
          {activeRequest.title}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
          {activeRequest.description}
        </p>

        {/* 진행 상황 카운트다운 */}
        <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl p-3 mb-4 text-xs font-bold text-gray-600 dark:text-gray-300">
          {secondsRemaining > 0 ? (
            <span>⏱️ <strong>{secondsRemaining}초</strong> 후 자동으로 닫힙니다</span>
          ) : (
            <span>완료되었습니다. 본 작업을 진행합니다.</span>
          )}
        </div>

        {/* 버튼들 */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0d635c] text-white font-bold text-xs transition"
          >
            스킵하고 계속하기
          </button>

          <button
            type="button"
            onClick={handleEnableAdFree}
            className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles size={14} />
            <span>테스트용: 지금 광고 제거(Ad-Free) 켜기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

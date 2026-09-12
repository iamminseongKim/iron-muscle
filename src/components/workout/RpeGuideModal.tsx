import React from 'react';
import { X, HelpCircle, Flame, ShieldAlert, Award, Zap } from 'lucide-react';

interface RpeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RpeGuideModal: React.FC<RpeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const rpeLevels = [
    {
      rpe: '10',
      rir: '0회',
      title: '한계 지점 (Max Effort)',
      desc: '모든 힘을 다 쏟아부어 더 이상 1회도 수행 불가능한 극한 상태.',
      badge: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
      icon: ShieldAlert
    },
    {
      rpe: '9.5',
      rir: '0~1회',
      title: '거의 실패 (Near Failure)',
      desc: '1회 더는 불가능하지만, 무게를 아주 살짝만 더 올릴 수는 있는 상태.',
      badge: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
      icon: Flame
    },
    {
      rpe: '9.0',
      rir: '1회 여유 (RIR 1)',
      title: '고강도 본세트 (Very Hard)',
      desc: '온 힘을 다하면 딱 1회 정도 더 들 수 있었던 상태.',
      badge: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icon: Zap
    },
    {
      rpe: '8.0 ~ 8.5',
      rir: '2회 여유 (RIR 2)',
      title: '최적의 근비대 존 (Sweet Spot)',
      desc: '2회 정도 더 가능한 강도로, 부상 없이 근비대와 근신경 발달을 극대화.',
      badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icon: Award
    },
    {
      rpe: '7.0 ~ 7.5',
      rir: '3회 여유 (RIR 3)',
      title: '적당한 부하 (Moderate)',
      desc: '자세가 흐트러지지 않고 경쾌한 속도로 힘차게 밀어낼 수 있는 상태.',
      badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icon: Zap
    },
    {
      rpe: '6.0 이하',
      rir: '4회 이상',
      title: '가벼움 / 웜업 (Warm-up)',
      desc: '관절을 데우고 신경계를 깨우는 가벼운 준비 운동.',
      badge: 'bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30',
      icon: HelpCircle
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-red-500/15 text-[#0F766E]">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white">RPE & RIR 가이드</h3>
              <p className="text-xs text-gray-400">운동 자각도 및 여유 반복수 완벽 이해하기</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-sm">
          <div className="bg-red-500/10 dark:bg-red-950/30 p-3.5 rounded-2xl border border-red-500/20 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-red-600 dark:text-red-400 font-bold block mb-1">💡 RPE란 무엇인가요?</strong>
            <strong>RPE (Rating of Perceived Exertion)</strong>는 '세트를 마쳤을 때 얼마나 힘들었는지'를 6~10점 척도로 매기는 운동 자각도입니다.
            <span className="block mt-1 text-amber-700 dark:text-amber-300">
              <strong>RIR(Reps in Reserve)</strong>은 '실패 지점까지 앞으로 몇 번을 더 들 수 있었는가'를 의미합니다. (예: RPE 8 = RIR 2, 즉 2개 더 가능)
            </span>
          </div>

          <div className="space-y-2.5">
            {rpeLevels.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/5 dark:border-white/5 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${item.badge}`}>
                      RPE {item.rpe}
                    </span>
                    <span className="text-xs font-bold text-[#1D1D1F] dark:text-white">{item.title}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1C1C1E] px-2 py-0.5 rounded-lg border border-black/5 dark:border-white/5">
                    {item.rir}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-black/5 dark:border-white/10 bg-[#F9F9FB] dark:bg-[#161618] text-center">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#0F766E] text-white font-black rounded-2xl text-xs shadow-md shadow-teal-900/20 hover:opacity-95 active:scale-98 transition"
          >
            이해했습니다
          </button>
        </div>
      </div>
    </div>
  );
};

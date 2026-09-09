import React, { useState } from 'react';
import { X, Clock, Zap, Info } from 'lucide-react';
import { Tempo } from '../../types/workout';

interface TempoModalProps {
  isOpen: boolean;
  initialTempo?: Tempo;
  onClose: () => void;
  onSave: (tempo: Tempo) => void;
}

export const TempoModal: React.FC<TempoModalProps> = ({
  isOpen,
  initialTempo = { eccentric: 2, pause: 0, concentric: 1 },
  onClose,
  onSave,
}) => {
  const [eccentric, setEccentric] = useState<number>(initialTempo.eccentric || 2);
  const [pause, setPause] = useState<number>(initialTempo.pause || 0);
  const [concentric, setConcentric] = useState<number>(initialTempo.concentric || 1);

  if (!isOpen) return null;

  const presets: { label: string; sub: string; tempo: Tempo }[] = [
    { label: '표준 보디빌딩 (2-0-1)', sub: '2초 이완, 0초 정지, 1초 수축', tempo: { eccentric: 2, pause: 0, concentric: 1 } },
    { label: '네거티브 과부하 (3-1-1)', sub: '3초 천천히 이완, 1초 정지', tempo: { eccentric: 3, pause: 1, concentric: 1 } },
    { label: '극대 장력 TUT (4-2-1)', sub: '4초 극한 신장, 2초 정지', tempo: { eccentric: 4, pause: 2, concentric: 1 } },
    { label: '파워 / 스피드 (1-0-1)', sub: '폭발적인 추진력 중심', tempo: { eccentric: 1, pause: 0, concentric: 1 } },
  ];

  const applyPreset = (t: Tempo) => {
    setEccentric(t.eccentric);
    setPause(t.pause);
    setConcentric(t.concentric);
  };

  const handleSave = () => {
    onSave({ eccentric, pause, concentric });
    onClose();
  };

  const totalSecPerRep = eccentric + pause + concentric;

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#FF9500]/15 text-[#FF9500]">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white">수축·이완 템포 (TUT)</h3>
              <p className="text-xs text-gray-400">근육 긴장 지속시간을 통한 점진적 과부하</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 템포 입력 박스 3개 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1.5 whitespace-nowrap">이완 (내릴때)</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setEccentric(Math.max(1, eccentric - 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  -
                </button>
                <span className="text-sm font-black text-[#FF9500] font-mono whitespace-nowrap shrink-0 min-w-[28px] text-center">
                  {eccentric}초
                </span>
                <button
                  type="button"
                  onClick={() => setEccentric(Math.min(8, eccentric + 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1.5 whitespace-nowrap">정지 (바닥)</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setPause(Math.max(0, pause - 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  -
                </button>
                <span className="text-sm font-black text-[#007AFF] font-mono whitespace-nowrap shrink-0 min-w-[28px] text-center">
                  {pause}초
                </span>
                <button
                  type="button"
                  onClick={() => setPause(Math.min(5, pause + 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl border border-black/5 dark:border-white/5">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-bold block mb-1.5 whitespace-nowrap">수축 (밀때)</span>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setConcentric(Math.max(1, concentric - 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  -
                </button>
                <span className="text-sm font-black text-[#FF2D55] font-mono whitespace-nowrap shrink-0 min-w-[28px] text-center">
                  {concentric}초
                </span>
                <button
                  type="button"
                  onClick={() => setConcentric(Math.min(5, concentric + 1))}
                  className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white font-black text-xs shadow-xs hover:opacity-80 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-2xl text-xs font-semibold">
            <span className="text-gray-500 dark:text-gray-400">1회 반복당 긴장 시간:</span>
            <span className="font-extrabold text-[#1D1D1F] dark:text-white text-sm">
              총 <span className="text-[#FF9500] font-black">{totalSecPerRep}초</span> (10회 시 {totalSecPerRep * 10}초 지속)
            </span>
          </div>

          {/* 프리셋 리스트 */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-gray-400 block mb-1">추천 템포 프리셋</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p.tempo)}
                className="w-full text-left p-2.5 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3A3A3C] rounded-2xl border border-black/5 dark:border-white/5 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-[#1D1D1F] dark:text-white block">{p.label}</span>
                  <span className="text-[11px] text-gray-400">{p.sub}</span>
                </div>
                <Zap size={14} className="text-[#FF9500] shrink-0" />
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-blue-500/10 dark:bg-blue-950/30 rounded-2xl border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>무게가 늘지 않더라도, 이완(네거티브) 속도를 1초 늘리면 근육에 실질적인 과부하가 발생합니다!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-black/5 dark:border-white/10 bg-[#F9F9FB] dark:bg-[#161618] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-[#3A3A3C] transition shadow-xs"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-xs font-black text-white bg-[#FF9500] hover:bg-amber-600 transition shadow-md shadow-amber-500/20 active:scale-98"
          >
            템포 적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

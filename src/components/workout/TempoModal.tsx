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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141721] border border-gray-700/80 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-[#141721]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">수축·이완 템포 (TUT)</h3>
              <p className="text-xs text-gray-400">근육 긴장 지속시간을 통한 점진적 과부하</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* 템포 입력 박스 3개 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-[#1A1E2C] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 font-semibold block mb-1">이완 (내릴때)</span>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEccentric(Math.max(1, eccentric - 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  -
                </button>
                <span className="text-lg font-black text-amber-400">{eccentric}초</span>
                <button
                  type="button"
                  onClick={() => setEccentric(Math.min(8, eccentric + 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#1A1E2C] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 font-semibold block mb-1">정지 (바닥에서)</span>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPause(Math.max(0, pause - 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  -
                </button>
                <span className="text-lg font-black text-blue-400">{pause}초</span>
                <button
                  type="button"
                  onClick={() => setPause(Math.min(5, pause + 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#1A1E2C] rounded-xl border border-gray-800">
              <span className="text-[11px] text-gray-400 font-semibold block mb-1">수축 (밀때)</span>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConcentric(Math.max(1, concentric - 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  -
                </button>
                <span className="text-lg font-black text-red-400">{concentric}초</span>
                <button
                  type="button"
                  onClick={() => setConcentric(Math.min(5, concentric + 1))}
                  className="w-6 h-6 rounded bg-gray-800 text-gray-300 font-bold hover:bg-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 bg-gray-900/60 rounded-xl border border-gray-800 text-xs">
            <span className="text-gray-400 font-medium">1회 반복당 긴장 시간:</span>
            <span className="font-extrabold text-white text-sm">
              총 <span className="text-amber-400">{totalSecPerRep}초</span> (10회 시 {totalSecPerRep * 10}초 지속)
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
                className="w-full text-left p-2.5 bg-[#1A1E2C] hover:bg-gray-800 rounded-xl border border-gray-800/80 transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-gray-200 block">{p.label}</span>
                  <span className="text-[11px] text-gray-500">{p.sub}</span>
                </div>
                <Zap size={14} className="text-amber-400 opacity-60" />
              </button>
            ))}
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-blue-950/30 rounded-xl border border-blue-900/40 text-[11px] text-blue-300 leading-relaxed">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>무게가 늘지 않더라도, 이완(네거티브) 속도를 1초 늘리면 근육에 실질적인 과부하가 발생합니다!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800 bg-[#10131B] flex gap-2">
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
            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition shadow-lg shadow-amber-900/30"
          >
            템포 적용하기
          </button>
        </div>
      </div>
    </div>
  );
};

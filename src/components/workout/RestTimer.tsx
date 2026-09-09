import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, X, Bell } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface RestTimerProps {
  initialSeconds?: number;
  isRunning: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds = 90,
  isRunning: initialRunning,
  onClose,
  onComplete,
}) => {
  const [targetSeconds, setTargetSeconds] = useState<number>(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(initialRunning);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setIsFlashing(true);
            soundManager.playTimerComplete();
            if (onComplete) onComplete();
            setTimeout(() => setIsFlashing(false), 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, remainingSeconds, onComplete]);

  const togglePlay = () => setIsActive(!isActive);

  const resetTimer = () => {
    setRemainingSeconds(targetSeconds);
    setIsActive(true);
    setIsFlashing(false);
  };

  const adjustTime = (delta: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev + delta));
    setTargetSeconds((prev) => Math.max(10, prev + delta));
  };

  const progressPercent = targetSeconds > 0 ? Math.min(100, ((targetSeconds - remainingSeconds) / targetSeconds) * 100) : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-40 transition-all transform ${
      isFlashing ? 'animate-bounce shadow-[0_0_25px_#FF334B]' : ''
    }`}>
      <div className="bg-[#141721]/95 backdrop-blur-md border border-gray-700/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
        {/* 프로그레스 바 */}
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#FF334B] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 타이머 바 본체 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              remainingSeconds === 0 ? 'bg-red-500/30 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Bell size={18} className={isFlashing ? 'animate-spin' : ''} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block">휴식 시간</span>
              <span className={`text-xl font-black font-mono tracking-tight ${
                remainingSeconds === 0 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}>
                {remainingSeconds === 0 ? '휴식 완료!' : formatTime(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* 조작 버튼들 */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustTime(-10)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition"
              title="-10초"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => adjustTime(10)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-lg transition"
              title="+10초"
            >
              +10
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`p-2 rounded-xl font-bold transition ${
                isActive ? 'bg-gray-700 text-amber-300' : 'bg-amber-500 text-white shadow-md'
              }`}
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition"
              title="리셋"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg transition"
              title="닫기"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

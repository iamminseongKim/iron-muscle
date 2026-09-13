import { t } from '../../i18n';
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
  const [undoBackup, setUndoBackup] = useState<{
    remainingSeconds: number;
    targetSeconds: number;
  } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isActive && remainingSeconds > 0) {
      // 백그라운드 전환으로 setInterval이 지연/일시정지돼도 실제 경과 시간만큼 정확히 차감
      let lastTick = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSec = Math.max(1, Math.round((now - lastTick) / 1000));
        lastTick = now;
        setRemainingSeconds((prev) => {
          if (prev - deltaSec <= 0) {
            clearInterval(interval);
            setIsActive(false);
            setIsFlashing(true);
            soundManager.playTimerComplete();
            if (onComplete) onComplete();
            setTimeout(() => setIsFlashing(false), 3000);
            return 0;
          }
          return prev - deltaSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, remainingSeconds, onComplete]);

  const togglePlay = () => setIsActive(!isActive);

  const resetTimer = () => {
    setUndoBackup({ remainingSeconds, targetSeconds });
    setRemainingSeconds(targetSeconds);
    setIsActive(true);
    setIsFlashing(false);
  };

  const handleUndoReset = () => {
    if (!undoBackup) return;
    setRemainingSeconds(undoBackup.remainingSeconds);
    setTargetSeconds(undoBackup.targetSeconds);
    setUndoBackup(null);
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
      <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
        {/* 프로그레스 바 */}
        <div className="w-full bg-gray-200 dark:bg-[#2C2C2E] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-[#0F766E] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 타이머 바 본체 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              remainingSeconds === 0 ? 'bg-red-500/20 text-red-500' : 'bg-[#FF9500]/15 text-[#FF9500]'
            }`}>
              <Bell size={18} className={isFlashing ? 'animate-spin' : ''} />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block">{t("휴식 시간")}</span>
              <span className={`text-xl font-black font-mono tracking-tight ${
                remainingSeconds === 0 ? 'text-red-500 animate-pulse' : 'text-[#1D1D1F] dark:text-white'
              }`}>
                {remainingSeconds === 0 ? t('휴식 완료!') : formatTime(remainingSeconds)}
              </span>
            </div>
          </div>

          {/* 조작 버튼들 */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => adjustTime(-10)}
              className="px-2 py-1 bg-gray-100 dark:bg-[#2C2C2E] hover:opacity-80 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition"
              title="-10s"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => adjustTime(10)}
              className="px-2 py-1 bg-gray-100 dark:bg-[#2C2C2E] hover:opacity-80 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition"
              title="+10s"
            >
              +10
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className={`p-2 rounded-xl font-bold transition ${
                isActive ? 'bg-gray-200 dark:bg-[#2C2C2E] text-amber-500' : 'bg-[#FF9500] text-white shadow-md'
              }`}
            >
              {isActive ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="p-2 bg-gray-100 dark:bg-[#2C2C2E] hover:opacity-80 text-gray-500 dark:text-gray-400 rounded-xl transition"
              title={t("초기화")}
            >
              <RotateCcw size={16} />
            </button>
            {undoBackup && (
              <button
                type="button"
                onClick={handleUndoReset}
                className="px-2 py-1 bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-indigo-500/25 transition animate-fade-in"
                title={t("복구")}
              >
                <RotateCcw size={12} className="rotate-180" />
                {t("복구")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition"
              title={t("닫기")}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Check, Bell, Minimize2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface RestTimerModalProps {
  isOpen: boolean;
  initialSeconds?: number;
  exerciseName?: string;
  setNumber?: number;
  onClose: (actualElapsedSeconds: number) => void;
  onFinishAndSave: (actualElapsedSeconds: number) => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  initialSeconds = 90,
  exerciseName = '운동',
  setNumber = 1,
  onClose,
  onFinishAndSave,
}) => {
  const [targetSeconds, setTargetSeconds] = useState<number>(initialSeconds);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialSeconds);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // 안드로이드/iOS 웹뷰 커서 및 물방울 핸들 잔존 버그 방지: 모달 오픈 시 활성 인풋 강제 blur & 셀렉션 클리어
      if (document.activeElement && (document.activeElement as HTMLElement).blur) {
        (document.activeElement as HTMLElement).blur();
      }
      window.getSelection()?.removeAllRanges();

      setTargetSeconds(initialSeconds);
      setRemainingSeconds(initialSeconds);
      setElapsedSeconds(0);
      setIsActive(true);
      setIsMinimized(false);
    }
  }, [isOpen, initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isActive) {
      // 백그라운드 전환으로 setInterval이 지연/일시정지돼도 실제 경과 시간만큼 정확히 반영
      let lastTick = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSec = Math.max(1, Math.round((now - lastTick) / 1000));
        lastTick = now;
        setElapsedSeconds((prev) => prev + deltaSec);
        setRemainingSeconds((prev) => {
          if (prev - deltaSec <= 0) {
            soundManager.playTimerComplete();
            return 0;
          }
          return prev - deltaSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isActive]);

  if (!isOpen) return null;

  const togglePlay = () => setIsActive(!isActive);

  const resetTimer = () => {
    setRemainingSeconds(targetSeconds);
    setElapsedSeconds(0);
    setIsActive(true);
  };

  const adjustRemaining = (delta: number) => {
    setRemainingSeconds((prev) => Math.max(0, prev + delta));
    setTargetSeconds((prev) => Math.max(10, prev + delta));
  };

  const handleFinish = () => {
    soundManager.playSuccessSound();
    onFinishAndSave(elapsedSeconds);
  };

  const handleDismiss = () => {
    onClose(elapsedSeconds);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // 원형 프로그레스 링 계산 (반지름 95px, 둘레 2 * PI * 95 ~= 597)
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const progress = targetSeconds > 0 ? Math.min(1, (targetSeconds - remainingSeconds) / targetSeconds) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  // 최소화된 플로팅 바 모드
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
        <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-3 shadow-2xl flex items-center justify-between">
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 text-left flex-1"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF9500]/15 flex items-center justify-center text-[#FF9500] font-bold">
              <Bell size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-400 block">
                {exerciseName} #{setNumber}세트 휴식 중
              </span>
              <span className="text-xl font-black font-mono text-[#1D1D1F] dark:text-white">
                {formatTime(remainingSeconds)} <span className="text-xs font-normal text-gray-400">({elapsedSeconds}초 경과)</span>
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFinish}
              className="px-3 py-1.5 bg-[#34C759] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              휴식 종료
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 대형 원형 타이머 모달 모드
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center">
        {/* 상단 컨트롤 & 라벨 */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="화면 아래로 최소화"
          >
            <Minimize2 size={18} />
          </button>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">휴식 시간</span>
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">{exerciseName} #{setNumber}세트 후</h3>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title="닫기"
          >
            <X size={18} />
          </button>
        </div>

        {/* 대형 원형 프로그레스 링 & 타이머 디스플레이 */}
        <div className="relative my-4 flex items-center justify-center">
          <svg width="240" height="240" className="transform -rotate-90">
            {/* 배경 원 */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-100 dark:text-[#2C2C2E]"
            />
            {/* 게이지 원 */}
            <circle
              cx="120"
              cy="120"
              r={radius}
              stroke="#FF9500"
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </svg>

          {/* 중앙 거대한 숫자 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black font-mono tracking-tighter text-[#1D1D1F] dark:text-white">
              {formatTime(remainingSeconds)}
            </span>
            <span className="text-xs font-semibold text-gray-400 mt-1">
              실제 쉰 시간: <strong className="text-[#FF9500] font-bold">{elapsedSeconds}초</strong>
            </span>
          </div>
        </div>

        {/* 퀵 시간 조절 버튼 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={() => adjustRemaining(-15)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 transition"
          >
            -15초
          </button>
          <button
            type="button"
            onClick={() => adjustRemaining(15)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 transition"
          >
            +15초
          </button>
          <button
            type="button"
            onClick={() => adjustRemaining(30)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 transition"
          >
            +30초
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white transition"
            title="리셋"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* 메인 동작 버튼 (일시정지/재개 & 세트에 휴식시간 기록 완료) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className={`p-3.5 rounded-2xl font-bold flex items-center justify-center transition ${
              isActive
                ? 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'
                : 'bg-[#FF9500] text-white shadow-md'
            }`}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="flex-1 py-3.5 bg-[#34C759] hover:opacity-90 active:scale-98 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition"
          >
            <Check size={18} strokeWidth={2.5} />
            휴식 종료 & {elapsedSeconds}초 세트에 기록
          </button>
        </div>
      </div>
    </div>
  );
};

import { t } from '../../i18n';
import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, X, Check, Bell, Minimize2, GripHorizontal } from 'lucide-react';
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
  const [undoBackup, setUndoBackup] = useState<{
    remainingSeconds: number;
    targetSeconds: number;
    elapsedSeconds: number;
    isActive: boolean;
  } | null>(null);

  // 1. 최소화 상태 플로팅 캡슐의 드래그 위치 (화면 우측 하단 기본)
  const [floatingPos, setFloatingPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartTouchRef = useRef({ x: 0, y: 0 });
  const elementStartPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  // 2. 대형 모달 아래로 쓸어내리기(Swipe Down) 제스처 추적
  const swipeStartYRef = useRef<number | null>(null);
  const [dragOffsetVisualY, setDragOffsetVisualY] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      // 안드로이드/iOS 웹뷰 커서 및 물방울 핸들 잔존 방지
      if (document.activeElement && (document.activeElement as HTMLElement).blur) {
        (document.activeElement as HTMLElement).blur();
      }
      window.getSelection()?.removeAllRanges();

      setTargetSeconds(initialSeconds);
      setRemainingSeconds(initialSeconds);
      setElapsedSeconds(0);
      setIsActive(true);
      setIsMinimized(false);
      setDragOffsetVisualY(0);
      setUndoBackup(null);
    }
  }, [isOpen, initialSeconds]);

  // 기본 플로팅 위치 초기화 (화면 크기 기준 우측 하단)
  useEffect(() => {
    if (typeof window !== 'undefined' && !floatingPos) {
      const defaultY = Math.max(120, window.innerHeight - 150);
      const defaultX = Math.max(16, window.innerWidth - 260);
      setFloatingPos({ x: defaultX, y: defaultY });
    }
  }, [floatingPos]);

  useEffect(() => {
    let interval: any = null;
    if (isOpen && isActive) {
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
    // 쉰 시간(elapsedSeconds)이 있는 경우 실수 리셋 복구를 위해 직전 상태 백업
    if (elapsedSeconds > 0) {
      setUndoBackup({
        remainingSeconds,
        targetSeconds,
        elapsedSeconds,
        isActive,
      });
    }
    setRemainingSeconds(targetSeconds);
    setElapsedSeconds(0);
    setIsActive(true);
  };

  const handleUndoReset = () => {
    if (!undoBackup) return;
    setRemainingSeconds(undoBackup.remainingSeconds);
    setTargetSeconds(undoBackup.targetSeconds);
    setElapsedSeconds(undoBackup.elapsedSeconds);
    setIsActive(undoBackup.isActive);
    setUndoBackup(null);
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

  // 원형 프로그레스 링 계산
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const progress = targetSeconds > 0 ? Math.min(1, (targetSeconds - remainingSeconds) / targetSeconds) : 0;
  const strokeDashoffset = circumference - progress * circumference;
  const isCompleted = remainingSeconds === 0;
  const overtimeSeconds = elapsedSeconds > targetSeconds ? elapsedSeconds - targetSeconds : 0;

  // ----------------------------------------------------
  // 👉 1) 대형 모달 아래로 쓸어내리기 (Swipe Down) 핸들러
  // ----------------------------------------------------
  const handleModalTouchStart = (e: React.TouchEvent) => {
    swipeStartYRef.current = e.touches[0].clientY;
  };

  const handleModalTouchMove = (e: React.TouchEvent) => {
    if (swipeStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - swipeStartYRef.current;
    if (diff > 0) {
      // 아래로 끌 때만 시각적 피드백
      setDragOffsetVisualY(Math.min(180, diff));
    }
  };

  const handleModalTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartYRef.current !== null) {
      const endY = e.changedTouches[0].clientY;
      const diff = endY - swipeStartYRef.current;
      if (diff > 70) {
        // 70px 이상 아래로 쓸어내리면 최소화!
        setIsMinimized(true);
      }
    }
    swipeStartYRef.current = null;
    setDragOffsetVisualY(0);
  };

  // ----------------------------------------------------
  // 👉 2) 최소화 플로팅 캡슐 터치 드래그 앤 드롭 핸들러
  // ----------------------------------------------------
  const handleFloatingTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    const touch = e.touches[0];
    dragStartTouchRef.current = { x: touch.clientX, y: touch.clientY };
    if (floatingPos) {
      elementStartPosRef.current = { ...floatingPos };
    }
  };

  const handleFloatingTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartTouchRef.current.x;
    const dy = touch.clientY - dragStartTouchRef.current.y;

    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
      hasMovedRef.current = true;
    }

    const newX = elementStartPosRef.current.x + dx;
    const newY = elementStartPosRef.current.y + dy;

    // 화면 밖 이탈 방지 경계 클램핑 (너비 약 240px, 높이 56px)
    const maxX = window.innerWidth - 240;
    const maxY = window.innerHeight - 70;
    const clampedX = Math.max(10, Math.min(maxX, newX));
    const clampedY = Math.max(60, Math.min(maxY, newY));

    setFloatingPos({ x: clampedX, y: clampedY });
  };

  const handleFloatingTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleCapsuleClick = (e: React.MouseEvent) => {
    // 손가락으로 드래그 이동한 것이 아니라 단순 탭한 경우만 대형 모달 복원
    if (!hasMovedRef.current) {
      setIsMinimized(false);
    }
  };

  // ----------------------------------------------------
  // 모드 A: 최소화된 드래그 가능 컴팩트 플로팅 캡슐 모드
  // ----------------------------------------------------
  if (isMinimized) {
    const posStyle = floatingPos
      ? { left: `${floatingPos.x}px`, top: `${floatingPos.y}px` }
      : { right: '16px', bottom: '90px' };

    return (
      <div
        style={posStyle}
        onTouchStart={handleFloatingTouchStart}
        onTouchMove={handleFloatingTouchMove}
        onTouchEnd={handleFloatingTouchEnd}
        className="fixed z-50 touch-none select-none cursor-move animate-fade-in"
      >
        <div className="bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-black/15 dark:border-white/15 rounded-full pl-3 pr-2 py-1.5 shadow-2xl flex items-center gap-2.5 max-w-[260px] ring-1 ring-black/5 dark:ring-white/10">
          {/* 드래그 핸들 아이콘 */}
          <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0">
            <GripHorizontal size={14} />
          </div>

          {/* 타이머 텍스트 (탭 시 복원) */}
          <button
            type="button"
            onClick={handleCapsuleClick}
            className="flex items-center gap-2 text-left shrink-0 outline-none"
            title="탭하여 크게 보기"
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isCompleted ? 'bg-[#34C759]/20 text-[#34C759]' : 'bg-[#FF9500]/15 text-[#FF9500]'
            }`}>
              <Bell size={13} className={isCompleted ? 'animate-bounce' : ''} />
            </div>
            <div className="leading-tight">
              <span className={`text-[13px] font-black font-mono block ${
                isCompleted ? 'text-[#34C759]' : 'text-[#1D1D1F] dark:text-white'
              }`}>
                {isCompleted ? `완료! ${elapsedSeconds}s` : formatTime(remainingSeconds)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 block -mt-0.5 truncate max-w-[80px]">
                {isCompleted ? '휴식 완료' : `${exerciseName} #${setNumber}`}
              </span>
            </div>
          </button>

          {/* 원터치 종료 & 닫기 버튼 */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleFinish}
              className="px-2 py-1 bg-[#34C759] text-white rounded-full text-[11px] font-extrabold shadow-sm active:scale-95 transition"
              title="휴식 종료 & 세트에 기록"
            >
              종료
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-black dark:hover:text-white rounded-full transition"
              title="타이머 닫기"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 모드 B: 대형 원형 타이머 모달 모드 (스와이프 다운 제스처 지원)
  // ----------------------------------------------------
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div
        onTouchStart={handleModalTouchStart}
        onTouchMove={handleModalTouchMove}
        onTouchEnd={handleModalTouchEnd}
        style={{
          transform: dragOffsetVisualY > 0 ? `translateY(${dragOffsetVisualY}px)` : undefined,
          transition: dragOffsetVisualY === 0 ? 'transform 0.2s ease-out' : 'none',
        }}
        className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6 text-center select-none"
      >
        {/* iOS 감성 풀다운 손잡이 바 (아래로 쓸어내리면 최소화) */}
        <div
          onClick={() => setIsMinimized(true)}
          className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 rounded-full mx-auto mb-3 cursor-pointer transition"
          title="아래로 쓸어내려 최소화"
        />

        {/* 상단 컨트롤 & 라벨 */}
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center gap-1 text-xs"
            title="화면 아래로 최소화"
          >
            <Minimize2 size={16} />
            <span className="text-[11px] font-bold">최소화</span>
          </button>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">휴식 시간</span>
            <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white truncate max-w-[160px]">
              {exerciseName} #{setNumber}세트 후
            </h3>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition"
            title={t("닫기")}
          >
            <X size={18} />
          </button>
        </div>

        {/* 스와이프 다운 힌트 */}
        <p className="text-[10px] text-gray-400 -mt-1 mb-2">
          💡 창을 아래로 쓸어내리면 작은 플로팅 타이머로 변경됩니다
        </p>

        {/* 리셋 실수 방지용 직전 시간 복구 (Undo) 배너 */}
        {undoBackup && (
          <div className="mb-2 animate-fade-in">
            <button
              type="button"
              onClick={handleUndoReset}
              className="w-full py-2 px-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-indigo-500/15 transition active:scale-98 shadow-xs"
            >
              <RotateCcw size={13} className="rotate-180 text-indigo-500 shrink-0" />
              <span>실수로 리셋하셨나요? <strong>방금 전 {undoBackup.elapsedSeconds}초 복구</strong></span>
            </button>
          </div>
        )}

        {/* 대형 원형 프로그레스 링 & 타이머 디스플레이 */}
        <div className="relative my-2 flex items-center justify-center">
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
              stroke={isCompleted ? '#34C759' : '#FF9500'}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: isCompleted ? 0 : strokeDashoffset,
                transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease',
              }}
            />
          </svg>

          {/* 중앙 거대한 숫자 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="flex flex-col items-center justify-center animate-fade-in">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759] mb-1 animate-pulse">
                  🎉 목표 휴식 완료
                </span>
                <span className="text-4xl font-black font-mono tracking-tighter text-[#34C759]">
                  {formatTime(targetSeconds)}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  총 쉰 시간: <strong className="text-[#0F766E] dark:text-[#2DD4BF] font-bold">{elapsedSeconds}초</strong>
                  {overtimeSeconds > 0 && (
                    <span className="text-[#FF9500] font-bold ml-1">(+{overtimeSeconds}초)</span>
                  )}
                </span>
              </div>
            ) : (
              <>
                <span className="text-5xl font-black font-mono tracking-tighter text-[#1D1D1F] dark:text-white">
                  {formatTime(remainingSeconds)}
                </span>
                <span className="text-xs font-semibold text-gray-400 mt-1">
                  실제 쉰 시간: <strong className="text-[#FF9500] font-bold">{elapsedSeconds}초</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 퀵 시간 조절 버튼 */}
        <div className="flex items-center justify-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => adjustRemaining(-15)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 active:scale-95 transition"
          >
            -15초
          </button>
          <button
            type="button"
            onClick={() => adjustRemaining(15)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 active:scale-95 transition"
          >
            +15초
          </button>
          <button
            type="button"
            onClick={() => adjustRemaining(30)}
            className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-xs font-bold text-gray-700 dark:text-gray-300 hover:opacity-80 active:scale-95 transition"
          >
            +30초
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="p-1.5 rounded-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 hover:text-[#1D1D1F] dark:hover:text-white active:scale-95 transition"
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
            className={`flex-1 py-3.5 bg-[#34C759] hover:opacity-90 active:scale-98 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
              isCompleted ? 'shadow-green-500/30 ring-2 ring-[#34C759]/40' : 'shadow-green-500/20'
            }`}
          >
            <Check size={18} strokeWidth={2.5} />
            휴식 종료 & {elapsedSeconds}초 세트에 기록
          </button>
        </div>
      </div>
    </div>
  );
};


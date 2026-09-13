import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

interface HoldToCompleteButtonProps {
  onComplete: () => void;
  holdDurationMs?: number; // 기본값 1500ms (1.5초)
  className?: string;
  disabled?: boolean;
}

export const HoldToCompleteButton: React.FC<HoldToCompleteButtonProps> = ({
  onComplete,
  holdDurationMs = 1500,
  className = '',
  disabled = false,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const startTimeRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const completedRef = useRef<boolean>(false);
  const holdStartTimerRef = useRef<number | null>(null);

  const cleanupRaf = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || completedRef.current) return;
    // 우클릭 등 방지
    if ('button' in e && e.button !== 0) return;

    cleanupRaf();
    startTimeRef.current = performance.now();
    completedRef.current = false;
    setIsHolding(true);
    setShowHint(false);

    // 가벼운 시작 햅틱
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

    let lastQuarterTick = 0;

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const currentProgress = Math.min(1, elapsed / holdDurationMs);
      setProgress(currentProgress);

      // 50% 지점 중간 햅틱 피드백
      if (currentProgress >= 0.5 && lastQuarterTick < 0.5) {
        lastQuarterTick = 0.5;
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      }

      if (currentProgress >= 1) {
        completedRef.current = true;
        cleanupRaf();
        setIsHolding(false);
        setProgress(1);

        // 성공 햅틱 진동
        Haptics.notification({ type: NotificationType.Success }).catch(() => {});

        // 약간의 여운 후 완료 실행
        setTimeout(() => {
          onComplete();
          // 완료 후 게이지 리셋
          setProgress(0);
          completedRef.current = false;
        }, 150);
        return;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  };

  const handleEnd = () => {
    if (completedRef.current) return;

    if (startTimeRef.current) {
      const elapsed = performance.now() - startTimeRef.current;
      // 너무 짧게 탭한 경우 (0.4초 미만 탭) 오터치 힌트 표시
      if (elapsed < 450) {
        setIsShaking(true);
        setShowHint(true);
        setTimeout(() => setIsShaking(false), 500);
        setTimeout(() => setShowHint(false), 3000);
      }
    }

    cleanupRaf();
    startTimeRef.current = null;
    setIsHolding(false);

    // 부드럽게 0으로 감김
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      cleanupRaf();
      if (holdStartTimerRef.current) clearTimeout(holdStartTimerRef.current);
    };
  }, [cleanupRaf]);

  return (
    <div className={`relative select-none ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-label="꾹 눌러서 운동 완료 (1.5초)"
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        onTouchCancel={handleEnd}
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        className={`relative w-full overflow-hidden rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 active:scale-[0.98] ${
          isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
        } ${
          isHolding
            ? 'bg-[#0F766E]/20 dark:bg-[#0F766E]/30 ring-2 ring-[#0F766E]'
            : 'bg-[#0F766E] shadow-md shadow-teal-900/20 hover:opacity-95'
        }`}
      >
        {/* 누르는 동안 차오르는 프로그레스 배경 게이지 */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#0F766E] to-[#34C759] transition-all"
          style={{
            width: `${progress * 100}%`,
            transition: isHolding ? 'none' : 'width 0.25s ease-out',
          }}
        />

        {/* 버튼 텍스트 & 아이콘 레이어 */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-white font-black text-sm tracking-tight drop-shadow-sm">
          <CheckCircle2
            size={19}
            className={`transition-transform duration-150 ${isHolding ? 'scale-110' : ''}`}
          />
          {isHolding ? (
            <span>운동 완료 중... {Math.round(progress * 100)}% (손을 떼면 취소)</span>
          ) : (
            <span>오늘 운동 완료 & 기록 저장 (1.5초간 꾹 누르기)</span>
          )}
        </div>
      </div>

      {/* 오터치 경고 및 사용법 힌트 배너 */}
      {showHint && (
        <div className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-fade-in text-center">
          <AlertCircle size={14} className="shrink-0" />
          <span>오터치 방지를 위해 <strong>1.5초간 꾹 누르고</strong> 있어야 완료됩니다.</span>
        </div>
      )}
    </div>
  );
};

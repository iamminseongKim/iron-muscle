import React from 'react';
import { Flame, Sun, Moon } from 'lucide-react';

import { WeightUnit } from '../../types/workout';

interface HeaderProps {
  activeTab: 'workout' | 'history' | 'analytics';
  isDark: boolean;
  onToggleTheme: () => void;
  weightUnit?: WeightUnit;
  onToggleWeightUnit?: () => void;
  totalWorkoutSeconds?: number;
  isWorkoutTimerRunning?: boolean;
  onToggleWorkoutTimer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  weightUnit = 'kg',
  onToggleWeightUnit,
  totalWorkoutSeconds,
  isWorkoutTimerRunning = true,
  onToggleWorkoutTimer,
}) => {
  const formatDuration = (secs: number = 0) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-2.5">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 shrink-0 rounded-xl bg-gradient-to-tr from-[#FF2D55] to-[#FF9500] flex items-center justify-center shadow-xs">
            <Flame size={15} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-1 whitespace-nowrap">
              IRON <span className="text-[#FF2D55]">MUSCLE</span>
            </h1>
          </div>
        </div>

        {/* 타이머 1: 총 운동 시간 상시 표시 위젯 (어느 탭에서도 유지) */}
        {totalWorkoutSeconds !== undefined && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={onToggleWorkoutTimer}
              className="text-gray-500 hover:text-black dark:hover:text-white transition"
              title={isWorkoutTimerRunning ? '운동 시간 일시정지' : '운동 시간 재개'}
            >
              {isWorkoutTimerRunning ? (
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse inline-block" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#FF9500] inline-block" />
              )}
            </button>
            <span className="text-[11px] font-semibold text-gray-400">총 운동</span>
            <span className="font-mono font-extrabold text-xs text-[#1D1D1F] dark:text-white tracking-tight">
              {formatDuration(totalWorkoutSeconds)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 무게 단위 (kg / lbs) 원터치 토글 세그먼트 */}
          {onToggleWeightUnit && (
            <button
              type="button"
              onClick={onToggleWeightUnit}
              className="flex items-center p-0.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-xs font-bold transition hover:opacity-90"
              title={`현재 중량 단위: ${weightUnit.toUpperCase()} (클릭하여 kg / lbs 전환)`}
            >
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-all ${
                  weightUnit === 'kg'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                kg
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black transition-all ${
                  weightUnit === 'lbs'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#007AFF] shadow-xs'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                lb
              </span>
            </button>
          )}

          {/* 라이트 / 다크 모드 토글 스위처 */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:opacity-80 transition"
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-amber-400" />
                <span className="text-[11px]">라이트</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-indigo-500" />
                <span className="text-[11px]">다크</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

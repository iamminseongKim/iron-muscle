import { t } from '../../i18n';
import React from 'react';
import { Flame, Sun, Moon, Play, Pause } from 'lucide-react';

interface HeaderProps {
  activeTab: 'workout' | 'history' | 'analytics' | 'explore';
  isDark: boolean;
  onToggleTheme: () => void;
  totalWorkoutSeconds?: number;
  isWorkoutTimerRunning?: boolean;
  onToggleWorkoutTimer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
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
          <img src="/brand-mark.svg" alt="" className="w-8 h-8 shrink-0"/>
          <div>
            <h1 className="font-bold text-sm tracking-[0.02em] text-[#1D1D1F] dark:text-white flex items-center gap-1 whitespace-nowrap">
              IRON <span className="text-[#0F766E]">MUSCLE</span>
            </h1>
          </div>
        </div>

        {/* 타이머 1: 총 운동 시간 상시 표시 위젯 (어느 탭에서도 유지, 터치 시 즉시 일시정지/재개) */}
        {totalWorkoutSeconds !== undefined && (
          <button
            type="button"
            onClick={onToggleWorkoutTimer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              isWorkoutTimerRunning
                ? 'bg-white dark:bg-[#1C1C1E] border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white hover:border-[#34C759]/50'
                : 'bg-[#FF9500]/15 dark:bg-[#FF9500]/25 border-[#FF9500]/50 text-[#FF9500] ring-2 ring-[#FF9500]/20'
            }`}
            title={isWorkoutTimerRunning ? '터치하여 운동 시간 일시정지 (전화/화장실 등)' : '터치하여 운동 시간 재개'}
          >
            {isWorkoutTimerRunning ? (
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse inline-block" />
                <Pause size={10} className="text-gray-400 dark:text-gray-500" />
              </span>
            ) : (
              <span className="flex items-center gap-1 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#FF9500] inline-block" />
                <Play size={10} className="fill-[#FF9500] text-[#FF9500]" />
              </span>
            )}
            <span className={`text-[11px] font-bold ${isWorkoutTimerRunning ? 'text-gray-400' : 'text-[#FF9500]'}`}>
              {isWorkoutTimerRunning ? t("총운동") : t("일시정지")}
            </span>
            <span className={`font-mono font-extrabold text-xs tracking-tight ${isWorkoutTimerRunning ? 'text-[#1D1D1F] dark:text-white' : 'text-[#FF9500]'}`}>
              {formatDuration(totalWorkoutSeconds)}
            </span>
            {!isWorkoutTimerRunning && (
              <span className="text-[10px] font-black px-1.5 py-0.2 bg-[#FF9500] text-white rounded-md animate-pulse">{t("재개")}</span>
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 라이트 / 다크 모드 토글 스위처 */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:opacity-80 transition"
          >
            {isDark ? (
              <>
                <Sun size={13} className="text-amber-400" />
                <span className="text-[11px]">{t("라이트")}</span>
              </>
            ) : (
              <>
                <Moon size={13} className="text-indigo-500" />
                <span className="text-[11px]">{t("다크")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

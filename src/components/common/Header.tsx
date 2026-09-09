import React from 'react';
import { Flame, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: 'workout' | 'explore' | 'history';
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl border-b border-black/5 dark:border-white/10 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF2D55] to-[#FF9500] flex items-center justify-center shadow-sm">
            <Flame size={17} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight text-[#1D1D1F] dark:text-white flex items-center gap-1">
              IRON <span className="text-[#FF2D55]">MUSCLE</span>
            </h1>
          </div>
        </div>

        {/* 라이트 / 다크 모드 토글 스위처 (사용자 요구사항) */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow-xs hover:opacity-80 transition"
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-amber-400" />
              <span>라이트</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-indigo-500" />
              <span>다크</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

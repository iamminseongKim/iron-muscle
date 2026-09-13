import { t } from '../../i18n';
import React from 'react';
import { Dumbbell, Calendar, BarChart2, Search } from 'lucide-react';
import packageJson from '../../../package.json';

interface TabNavigationProps {
  activeTab: 'workout' | 'history' | 'analytics' | 'explore';
  onTabChange: (tab: 'workout' | 'history' | 'analytics' | 'explore') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: '운동 기록', icon: Dumbbell },
    { id: 'explore', label: '운동 탐색', icon: Search },
    { id: 'history', label: '기록 조회', icon: Calendar },
    { id: 'analytics', label: '통계 & 성장', icon: BarChart2 },
  ] as const;

  return (
    <nav
      data-bottom-navigation
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white/85 dark:bg-[#1C1C1E]/85 backdrop-blur-2xl rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-black/10 dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full flex flex-col items-center gap-0.5 transition-all duration-200 ${
                isActive
                  ? 'bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] font-black shadow-xs scale-105'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] sm:text-[11px] font-bold tracking-tight ${
                isActive ? 'text-[#0F766E] dark:text-[#2DD4BF]' : 'text-gray-400 dark:text-gray-400'
              }`}>
                {t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-center pt-1 text-[8px] text-gray-400/50 dark:text-gray-600 font-medium">
        v{packageJson.version}
      </div>
    </nav>
  );
};

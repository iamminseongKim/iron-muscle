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
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none w-[calc(100%-40px)] max-w-sm sm:max-w-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center px-1.5 py-1.5 bg-white/70 dark:bg-[#1C1C1E]/75 backdrop-blur-3xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)] border border-white/60 dark:border-white/8 ring-1 ring-black/6 dark:ring-white/6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-2 px-1 rounded-[20px] flex flex-col items-center gap-0.5 transition-all duration-200 ${
                isActive
                  ? 'bg-[#0F766E]/12 text-[#0F766E] dark:text-[#2DD4BF] font-black'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-bold tracking-tight leading-tight text-center ${
                isActive ? 'text-[#0F766E] dark:text-[#2DD4BF]' : 'text-gray-400 dark:text-gray-500'
              }`}>
                {t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="text-center pt-0.5 text-[8px] text-gray-400/40 dark:text-gray-600/50 font-medium">
        v{packageJson.version}
      </div>
    </nav>
  );
};

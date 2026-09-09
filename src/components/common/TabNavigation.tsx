import React from 'react';
import { Dumbbell, Calendar, BarChart2 } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'workout' | 'history' | 'analytics';
  onTabChange: (tab: 'workout' | 'history' | 'analytics') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: '운동 기록', icon: Dumbbell },
    { id: 'history', label: '기록 조회', icon: Calendar },
    { id: 'analytics', label: '통계 & 성장', icon: BarChart2 },
  ] as const;

  return (
    <nav data-bottom-navigation className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1.5 flex flex-col items-center gap-1 transition-all ${
                isActive
                  ? 'text-[#FF2D55] scale-105'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition ${
                isActive ? 'bg-[#FF2D55]/10' : ''
              }`}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[11px] font-bold tracking-tight ${
                isActive ? 'text-[#1D1D1F] dark:text-white' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

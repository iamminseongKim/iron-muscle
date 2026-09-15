import { t } from '../../i18n';
import React from 'react';
import { Dumbbell, Calendar, BarChart2, Search, User } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'workout' | 'history' | 'analytics' | 'explore' | 'my';
  onTabChange: (tab: 'workout' | 'history' | 'analytics' | 'explore' | 'my') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'workout', label: '운동 기록', icon: Dumbbell },
    { id: 'explore', label: '운동 탐색', icon: Search },
    { id: 'history', label: '기록 조회', icon: Calendar },
    { id: 'analytics', label: '통계 & 성장', icon: BarChart2 },
    { id: 'my', label: 'MY', icon: User },
  ] as const;

  return (
    <nav
      data-bottom-navigation
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto select-none w-[calc(100%-24px)] max-w-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="glass-dock" style={{ '--dock-active-index': tabs.findIndex(tab => tab.id === activeTab) } as React.CSSProperties}>
        <span className="glass-dock-selection" aria-hidden="true" />
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className="glass-dock-tab"
            >
              <Icon size={23} strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
              <span className="text-[10px] font-semibold tracking-tight leading-tight text-center">
                {tab.id === 'my' ? 'MY' : t(tab.label)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

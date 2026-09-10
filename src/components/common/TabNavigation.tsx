import React, { useState } from 'react';
import { Dumbbell, Calendar, BarChart2, Search } from 'lucide-react';
import packageJson from '../../../package.json';
import { ReleaseNotesModal } from './ReleaseNotesModal';

interface TabNavigationProps {
  activeTab: 'workout' | 'history' | 'analytics' | 'explore';
  onTabChange: (tab: 'workout' | 'history' | 'analytics' | 'explore') => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const tabs = [
    { id: 'workout', label: '운동 기록', icon: Dumbbell },
    { id: 'explore', label: '운동 탐색', icon: Search },
    { id: 'history', label: '기록 조회', icon: Calendar },
    { id: 'analytics', label: '통계 & 성장', icon: BarChart2 },
  ] as const;

  return (
    <>
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
        <div className="text-center pb-1 text-[9px] text-gray-400/60 dark:text-gray-600 font-medium flex items-center justify-center gap-2">
          <span>v{packageJson.version} - minseongkimim@gmail.com</span>
          <button 
            onClick={() => setIsReleaseNotesOpen(true)}
            className="text-[#FF2D55] hover:underline"
          >
            🚀 릴리즈 최신 업데이트 핵심 요약
          </button>
        </div>
      </nav>
      <ReleaseNotesModal 
        isOpen={isReleaseNotesOpen} 
        onClose={() => setIsReleaseNotesOpen(false)} 
        version={packageJson.version}
      />
    </>
  );
};

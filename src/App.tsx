import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
import { WorkoutLogger } from './components/workout/WorkoutLogger';
import { WorkoutHistoryView } from './components/history/WorkoutHistoryView';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { loadActiveSession, saveActiveSession } from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'analytics'>('workout');

  // 전역 타이머 1: 총 운동 시간 타이머 (세션 지속시간 영구 추적)
  const [totalWorkoutSeconds, setTotalWorkoutSeconds] = useState<number>(() => {
    const saved = loadActiveSession();
    return saved ? saved.durationSeconds : 0;
  });
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: any = null;
    if (isWorkoutTimerRunning) {
      interval = setInterval(() => {
        setTotalWorkoutSeconds((prev) => {
          const next = prev + 1;
          const active = loadActiveSession();
          if (active && !active.completed) {
            active.durationSeconds = next;
            saveActiveSession(active);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutTimerRunning]);

  const toggleWorkoutTimer = () => {
    setIsWorkoutTimerRunning((prev) => !prev);
  };

  // 기본 테마: 화이트 라이트 모드 (사용자 명시 요구: 테마는 하얀색이 기본이고 다크모드는 설정에서 전환)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('iron_theme_dark');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('iron_theme_dark', JSON.stringify(isDark));
    } catch {}
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors duration-200">
      {/* 상단 애플 스타일 헤더 & 듀얼 타이머(총 운동 시간) & 테마 스위처 */}
      <Header
        activeTab={activeTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        totalWorkoutSeconds={totalWorkoutSeconds}
        isWorkoutTimerRunning={isWorkoutTimerRunning}
        onToggleWorkoutTimer={toggleWorkoutTimer}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full pt-2">
        {activeTab === 'workout' && (
          <WorkoutLogger onWorkoutCompleted={() => setActiveTab('history')} isDark={isDark} />
        )}
        {activeTab === 'history' && (
          <WorkoutHistoryView />
        )}
        {activeTab === 'analytics' && (
          <HistoryDashboard />
        )}
      </main>

      {/* 하단 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

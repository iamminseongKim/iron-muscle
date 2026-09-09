import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
import { WorkoutLogger } from './components/workout/WorkoutLogger';
import { WorkoutHistoryView } from './components/history/WorkoutHistoryView';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { loadActiveSession, saveActiveSession } from './utils/storage';
import { WeightUnit } from './types/workout';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'analytics'>('workout');

  // 무게 단위 상태 (기본값 kg, 영구 저장)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(() => {
    try {
      const saved = localStorage.getItem('iron_weight_unit');
      return (saved === 'lbs' || saved === 'kg') ? saved : 'kg';
    } catch {
      return 'kg';
    }
  });

  const toggleWeightUnit = () => {
    setWeightUnit((prev) => {
      const next: WeightUnit = prev === 'kg' ? 'lbs' : 'kg';
      try {
        localStorage.setItem('iron_weight_unit', next);
      } catch {}
      return next;
    });
  };

  // 1. 안드로이드 WebView 커서/물방울 핸들 잔존 버그 방지 전역 터치 리스너
  useEffect(() => {
    const handleGlobalTouch = (e: TouchEvent | MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // 터치 대상이 입력창이 아닐 경우 activeElement 포커스를 blur하고 selection 해제
      if (
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA' &&
        target.tagName !== 'SELECT' &&
        !target.isContentEditable
      ) {
        if (document.activeElement && (document.activeElement as HTMLElement).blur) {
          (document.activeElement as HTMLElement).blur();
        }
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('touchstart', handleGlobalTouch, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleGlobalTouch);
    };
  }, []);

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
      {/* 상단 애플 스타일 헤더 & 듀얼 타이머(총 운동 시간) & kg/lb 토글 & 테마 스위처 */}
      <Header
        activeTab={activeTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        weightUnit={weightUnit}
        onToggleWeightUnit={toggleWeightUnit}
        totalWorkoutSeconds={totalWorkoutSeconds}
        isWorkoutTimerRunning={isWorkoutTimerRunning}
        onToggleWorkoutTimer={toggleWorkoutTimer}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full pt-2">
        {activeTab === 'workout' && (
          <WorkoutLogger
            onWorkoutCompleted={() => setActiveTab('history')}
            isDark={isDark}
            weightUnit={weightUnit}
            onToggleWeightUnit={toggleWeightUnit}
          />
        )}
        {activeTab === 'history' && (
          <WorkoutHistoryView weightUnit={weightUnit} />
        )}
        {activeTab === 'analytics' && (
          <HistoryDashboard weightUnit={weightUnit} />
        )}
      </main>

      {/* 하단 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

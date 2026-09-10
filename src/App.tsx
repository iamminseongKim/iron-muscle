import React, { useState, useEffect } from 'react';
import { useKeyboardViewport } from './hooks/useKeyboardViewport';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
import { ExerciseExplorer } from './components/explore/ExerciseExplorer';
import { WorkoutLogger } from './components/workout/WorkoutLogger';
import { WorkoutHistoryView } from './components/history/WorkoutHistoryView';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { loadActiveSession, saveActiveSession } from './utils/storage';
import { WeightUnit } from './types/workout';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'analytics' | 'explore'>('workout');

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

  useKeyboardViewport();

  // 전역 세션 및 단일 총 운동 시간 타이머
  const [activeSession, setActiveSession] = useState(() => loadActiveSession());
  const [totalWorkoutSeconds, setTotalWorkoutSeconds] = useState<number>(() => {
    const saved = loadActiveSession();
    return saved ? saved.durationSeconds : 0;
  });
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState<boolean>(true);

  // 세션 시작/취소/완료 이벤트 동기화
  useEffect(() => {
    const handleSessionChange = (e: any) => {
      const current = e.detail;
      setActiveSession(current);
      if (current) {
        // 💡 세션 갱신 이벤트 발생 시에도 이미 진행 중인 초수가 0이나 이전 값으로 떨어지지 않도록 보존
        setTotalWorkoutSeconds((prev) => Math.max(prev, current.durationSeconds || 0));
        if (!activeSession || activeSession.id !== current.id) setIsWorkoutTimerRunning(true);
      } else {
        setTotalWorkoutSeconds(0);
      }
    };
    window.addEventListener('iron_active_session_change', handleSessionChange);
    return () => window.removeEventListener('iron_active_session_change', handleSessionChange);
  }, [activeSession?.id]);

  // 활성 운동 진행 중일 때만 1초마다 타이머 증가 및 저장
  useEffect(() => {
    let interval: any = null;
    if (activeSession && !activeSession.completed && isWorkoutTimerRunning) {
      // 안드로이드/iOS 백그라운드 전환 시 setInterval이 지연/일시정지되는 문제 보정:
      // 틱 횟수가 아니라 실제 경과 시간(Date.now() 차이)만큼 더한다.
      let lastTick = Date.now();
      interval = setInterval(() => {
        const now = Date.now();
        const deltaSec = Math.max(1, Math.round((now - lastTick) / 1000));
        lastTick = now;
        setTotalWorkoutSeconds((prev) => {
          const next = prev + deltaSec;
          const active = loadActiveSession();
          if (active && !active.completed) {
            active.durationSeconds = next;
            try {
              localStorage.setItem('iron_active_session_v1', JSON.stringify(active));
            } catch {}
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSession, isWorkoutTimerRunning]);

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
      {/* 상단 애플 스타일 헤더 & 단일화된 총 운동 시간 시계 & 테마 스위처 */}
      <Header
        activeTab={activeTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        totalWorkoutSeconds={activeSession ? totalWorkoutSeconds : undefined}
        isWorkoutTimerRunning={isWorkoutTimerRunning}
        onToggleWorkoutTimer={toggleWorkoutTimer}
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full pt-2">
        {activeTab === 'workout' && (
          <WorkoutLogger
            onWorkoutCompleted={() => setActiveTab('history')}
            isDark={isDark}
          />
        )}
        {activeTab === 'explore' && <ExerciseExplorer isDark={isDark} />}
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

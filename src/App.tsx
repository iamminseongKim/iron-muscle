import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
import { WorkoutLogger } from './components/workout/WorkoutLogger';
import { ExerciseExplorer } from './components/explore/ExerciseExplorer';
import { HistoryDashboard } from './components/history/HistoryDashboard';
import { Exercise, WorkoutExercise } from './types/workout';
import { loadActiveSession, saveActiveSession } from './utils/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'explore' | 'history'>('workout');

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

  const handleSelectExerciseFromExplore = (exercise: Exercise) => {
    let session = loadActiveSession();
    if (!session) {
      const todayStr = new Date().toISOString().split('T')[0];
      session = {
        id: 'session-' + Date.now(),
        title: '오늘의 운동',
        date: todayStr,
        startTime: new Date().toISOString(),
        durationSeconds: 0,
        exercises: [],
        completed: false,
        conditionEmoji: '💪',
        isDeload: false,
      };
    }

    const newExItem: WorkoutExercise = {
      id: 'ex-item-' + Date.now(),
      exerciseId: exercise.id,
      equipmentType: exercise.equipment,
      machineBrand: exercise.defaultBrand,
      sets: [
        { id: 'set-' + Date.now() + '-1', setNumber: 1, weight: 20, reps: 10, completed: false },
        { id: 'set-' + Date.now() + '-2', setNumber: 2, weight: 20, reps: 10, completed: false },
      ],
    };

    session.exercises.push(newExItem);
    saveActiveSession(session);
    setActiveTab('workout');
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex flex-col transition-colors duration-200">
      {/* 상단 애플 스타일 헤더 & 테마 스위처 */}
      <Header activeTab={activeTab} isDark={isDark} onToggleTheme={toggleTheme} />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full pt-2">
        {activeTab === 'workout' && (
          <WorkoutLogger onWorkoutCompleted={() => setActiveTab('history')} isDark={isDark} />
        )}
        {activeTab === 'explore' && (
          <ExerciseExplorer onSelectForWorkout={handleSelectExerciseFromExplore} isDark={isDark} />
        )}
        {activeTab === 'history' && (
          <HistoryDashboard />
        )}
      </main>

      {/* 하단 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;

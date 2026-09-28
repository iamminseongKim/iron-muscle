import { useLanguage, getLanguage, t } from './i18n';
import { MyPage } from './components/profile/MyPage';
import { refreshHealth } from './services/health/healthService';
import React, { useState, useEffect, lazy, Suspense, memo, useCallback, useRef } from 'react';
import { useKeyboardViewport } from './hooks/useKeyboardViewport';
import { Lock } from 'lucide-react';
import { HoldToCompleteButton } from './components/workout/HoldToCompleteButton';
import { OfflineStatus } from './components/common/OfflineStatus';
import { RecoveryUndo } from './components/library/RecoveryPanel';
import { Header } from './components/common/Header';
import { TabNavigation } from './components/common/TabNavigation';
const ExerciseExplorer = lazy(() => import('./components/explore/ExerciseExplorer').then(module => ({default: module.ExerciseExplorer})));
import { WorkoutLogger as WorkoutLoggerComponent } from './components/workout/WorkoutLogger';
const WorkoutLogger = memo(WorkoutLoggerComponent);
const WorkoutHistoryView = lazy(() => import('./components/history/WorkoutHistoryView').then(module => ({default: module.WorkoutHistoryView})));
const HistoryDashboard = lazy(() => import('./components/history/HistoryDashboard').then(module => ({default: module.HistoryDashboard})));
import { loadActiveSession, saveActiveSession } from './utils/storage';
import { WeightUnit } from './types/workout';

export const App: React.FC = () => {
  const language = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t('아이언 머슬 | 쇠와 땀, 묵묵한 성장의 여정');
  }, [language]);
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'analytics' | 'explore' | 'my'>(() => location.hash.startsWith('#routine=') ? 'my' : 'workout');

  useEffect(() => {
    void refreshHealth();
    const refresh = () => { if (!document.hidden) void refreshHealth(); };
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);

  useEffect(() => {
    const open = () => setActiveTab('workout');
    const library = () => { setActiveTab('my'); requestAnimationFrame(() => document.getElementById('routine-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
    window.addEventListener('iron_open_library', library);
    const shared = () => { if (location.hash.startsWith('#routine=')) setActiveTab('my'); };
    window.addEventListener('iron_open_workout', open);
    window.addEventListener('hashchange', shared);
    return () => { window.removeEventListener('iron_open_library', library); window.removeEventListener('iron_open_workout', open); window.removeEventListener('hashchange', shared); };
  }, []);

  const onWorkoutCompleted = useCallback(() => setActiveTab('history'), []);

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

  const isTouchLocked = Boolean(activeSession && !activeSession.completed && !isWorkoutTimerRunning);
  const contentRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isTouchLocked) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    contentRef.current?.setAttribute('inert', '');
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lockRef.current?.querySelector<HTMLElement>('[role="button"]')?.focus();
    return () => {
      contentRef.current?.removeAttribute('inert');
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, [isTouchLocked]);

  // 세션 시작/취소/완료 이벤트 동기화
  useEffect(() => {
    const handleSessionChange = (e: any) => {
      const current = e.detail;
      setActiveSession(current);
      if (current) {
        // 💡 세션 갱신 이벤트 발생 시에도 이미 진행 중인 초수가 0이나 이전 값으로 떨어지지 않도록 보존
        setTotalWorkoutSeconds((prev) => activeSession?.id === current.id ? Math.max(prev, current.durationSeconds || 0) : current.durationSeconds || 0);
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
    <div className="iron-app-shell min-h-screen bg-white dark:bg-[#101715] text-[#202824] dark:text-[#F5F7F5] flex flex-col transition-colors duration-200">
      <div ref={contentRef} className="isolate flex min-h-screen flex-col">
      {/* 상단 헤더 & 단일화된 총 운동 시간 시계 & 테마 스위처 */}
      <Header
        activeTab={activeTab}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        totalWorkoutSeconds={activeSession ? totalWorkoutSeconds : undefined}
        isWorkoutTimerRunning={isWorkoutTimerRunning}
        onToggleWorkoutTimer={toggleWorkoutTimer}
      />


      <OfflineStatus />
      <RecoveryUndo />
      {/* 메인 컨텐츠 */}
      <main className="flex-1 w-full pt-2"><Suspense fallback={<div role="status" className="p-8 text-center">…</div>}>
        {(activeTab === 'workout' || activeSession) && (<div hidden={activeTab !== 'workout'}>
          <WorkoutLogger
            onWorkoutCompleted={onWorkoutCompleted}
            isDark={isDark}
          />
        </div>)}
        {activeTab === 'my' && <MyPage isDark={isDark} onToggleTheme={toggleTheme} weightUnit={weightUnit} onToggleWeightUnit={toggleWeightUnit} />}
        {activeTab === 'explore' && <ExerciseExplorer isDark={isDark} />}
        {activeTab === 'history' && (
          <WorkoutHistoryView weightUnit={weightUnit} />
        )}
        {activeTab === 'analytics' && (
          <HistoryDashboard weightUnit={weightUnit} />
        )}
      </Suspense></main>

      {/* 하단 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      {isTouchLocked && (
        <div ref={lockRef} role="dialog" aria-modal="true" aria-labelledby="touch-lock-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-6 touch-none">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1C1C1E] p-6 text-center shadow-2xl">
            <Lock className="mx-auto mb-4 text-orange-500" size={40} />
            <h2 id="touch-lock-title" className="font-bold text-lg">{t('운동 시간이 일시정지되었습니다')}</h2>
            <p className="my-5 text-sm">{t('총운동')} <strong>{Math.floor(totalWorkoutSeconds / 60)}:{String(totalWorkoutSeconds % 60).padStart(2, '0')}</strong>
              {' · '}{t('세트 완료')} <strong>{activeSession?.exercises.reduce((count, ex) => count + ex.sets.filter(set => set.completed).length, 0)}</strong></p>
            <HoldToCompleteButton onComplete={() => setIsWorkoutTimerRunning(true)} holdDurationMs={1500}
              label={t('1.5초 길게 눌러 잠금 해제 & 운동 재개')} holdingLabel={t('잠금 해제 중...')} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

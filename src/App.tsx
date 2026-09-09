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

  // 1. 안드로이드 WebView 커서/물방울 핸들/시스템 복사 툴바 원천 차단 리스너
  useEffect(() => {
    // 롱프레스 시 안드로이드 돋보기/복사/검색 팝업 차단.
    // 단, 메모/노트 등 자유 텍스트 입력(textarea, type!=number인 input, select, contentEditable)은
    // 붙여넣기가 가능해야 하므로 예외 처리한다.
    const handleContextMenu = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const isFreeTextField =
        (target?.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'number') ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        Boolean(target?.isContentEditable);
      if (isFreeTextField) {
        return;
      }
      e.preventDefault();
      return false;
    };

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

    // 스크롤하면 내용은 이동하는데 안드로이드 물방울 선택 핸들 오버레이는 스크롤을 안 따라가고
    // 화면상 예전 좌표에 그대로 남는 경우가 있음(크로미움 컴포지터가 오버레이 레이어를
    // 다시 그리지 않는 것으로 보임). blur/removeAllRanges만으로는 이미 화면에 그려진
    // 핸들 비트맵 자체가 안 지워지므로, 스크롤이 멎으면 숫자 입력들을 한 프레임 동안
    // disabled로 만들었다 되돌려서 강제로 다시 그리게 한다.
    let scrollSettleTimer: any = null;
    const forceNumericInputsRepaint = () => {
      const numericInputs = document.querySelectorAll<HTMLInputElement>(
        'input[type="number"], .numeric-set-input'
      );
      numericInputs.forEach((el) => {
        el.disabled = true;
      });
      requestAnimationFrame(() => {
        numericInputs.forEach((el) => {
          el.disabled = false;
        });
      });
    };

    const handleScroll = () => {
      if (document.activeElement && (document.activeElement as HTMLElement).blur) {
        (document.activeElement as HTMLElement).blur();
      }
      window.getSelection()?.removeAllRanges();

      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(forceNumericInputsRepaint, 150);
    };

    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('touchstart', handleGlobalTouch, { passive: true, capture: true });
    document.addEventListener('touchend', handleGlobalTouch, { passive: true, capture: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(scrollSettleTimer);
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('touchstart', handleGlobalTouch, { capture: true });
      document.removeEventListener('touchend', handleGlobalTouch, { capture: true });
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        setTotalWorkoutSeconds(current.durationSeconds || 0);
        setIsWorkoutTimerRunning(true);
      } else {
        setTotalWorkoutSeconds(0);
      }
    };
    window.addEventListener('iron_active_session_change', handleSessionChange);
    return () => window.removeEventListener('iron_active_session_change', handleSessionChange);
  }, []);

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

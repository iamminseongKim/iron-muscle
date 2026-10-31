import { useExerciseDrag } from '../../hooks/useExerciseDrag';
import { removeSession, saveWithRecovery } from '../../utils/recovery';
import { loadHealthPreferences, enqueueWorkout } from '../../services/health/healthStore';
import { flushWorkoutExports } from '../../services/health/healthService';
import { displayExercise, t } from '../../i18n';
import { getLanguage, useLanguage } from '../../i18n';
import { BodyPartIcon } from '../common/BodyPartIcon';
import { ConditionIcon } from '../common/ConditionIcon';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Plus, CheckCircle2, Clock, Dumbbell, Sparkles, X, Flame,
  Target, ArrowRight, Calendar, ArrowUpDown
} from 'lucide-react';
import { 
  WorkoutSession, WorkoutExercise, Exercise, EquipmentType, ExerciseGroupType, Category,
  TARGET_BODY_PARTS, WeightUnit, LoadType
} from '../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from './AddExerciseModal';
import { SessionNotesModal } from './SessionNotesModal';
import { RpeGuideModal } from './RpeGuideModal';
import { RestTimerModal } from './RestTimerModal';
import { AdaptiveSessionPanel } from './AdaptiveSessionPanel';
import { startWorkoutSet, recordSetRevision, getSetProgress, cancelWorkoutSetStart } from '../../utils/adaptiveTraining';
import { suggestNextSet } from '../../utils/adaptiveAnalysis';
import { loadAdaptiveSettings, ADAPTIVE_SETTINGS_CHANGE } from '../../utils/adaptiveSettings';
import { ExerciseGroupModal } from './ExerciseGroupModal';
import { HoldToCompleteButton } from './HoldToCompleteButton';
import { RepeatWorkoutPanel } from './RepeatWorkoutPanel';
import { AiRoutineImportPanel } from './AiRoutineImportPanel';
import { WorkoutCompleteSummary } from './WorkoutCompleteSummary';
import { ReorderExercisesModal } from './ReorderExercisesModal';
import { repeatWorkout, moveWorkoutExercise, reorderWorkoutExercise, getExerciseMoveAvailability, replaceWorkoutExercise } from '../../utils/workoutFlow';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE, convertWeight } from '../../utils/calculations';
import { saveActiveSession, loadActiveSession, completeWorkoutSession, loadSavedSessions, loadSampleDataForDemo } from '../../utils/storage';
import { findPreviousMachineExercise, convertExerciseSets } from '../../utils/gymWorkout';
import { soundManager } from '../../utils/audio';
import { resolveRecordedExercise, sanitizeSessionExercises } from '../../utils/exerciseResolver';
import { mapPartIdsToCategories, formatWorkoutTitleFromParts } from '../../utils/bodyPartDetector';
import { getTodayString } from '../../utils/calendar';

interface WorkoutLoggerProps {
  onWorkoutCompleted?: () => void;
  isDark?: boolean;
}

const CONDITION_OPTIONS = [
  { emoji: '🔥', label: '최상 (100%)' },
  { emoji: '💪', label: '좋음 (80%)' },
  { emoji: '⚡', label: '보통 (60%)' },
  { emoji: '🥱', label: '피곤 (40%)' },
  { emoji: '🩹', label: '가볍게 회복' },
];

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  onWorkoutCompleted,
  isDark = false,
}) => {
  useLanguage();
  // 현재 진행 중인 세션 (없으면 null -> 대기 화면 표시)
  const [idleAdaptive, setIdleAdaptive] = useState<Partial<WorkoutSession>>({});
  const [suggestion, setSuggestion] = useState<{ exerciseId: string; setId: string; weight: number; reps: number; reason: string } | null>(null);
  const [showSessionStats, setShowSessionStats] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<WorkoutSession | null>(() => loadActiveSession());
  const [completion, setCompletion] = useState<{ session: WorkoutSession; history: WorkoutSession[]; healthMessage: string } | null>(null);
  const drag = useExerciseDrag(session?.id, (sourceId, targetId, placement) => {
    const current = loadActiveSession();
    if (!current) return;
    try { saveWithRecovery({ ...current, exercises: reorderWorkoutExercise(current.exercises, sourceId, targetId, placement) }, 'active'); }
    catch (error) { alert(t((error as Error).message)); }
  });
  const [isReordering, setIsReordering] = useState(false);
  const [flowMessage, setFlowMessage] = useState('');

  useEffect(() => {
    const refresh = () => setSession(loadActiveSession());
    window.addEventListener('iron_active_session_change', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('iron_active_session_change', refresh); window.removeEventListener('storage', refresh); };
  }, []);

  // 대기(Idle) 화면 상태
  const [selectedPartIds, setSelectedPartIds] = useState<string[]>(['chest']);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [idleCondition, setIdleCondition] = useState<string>('💪');
  const [idleDeload, setIdleDeload] = useState<boolean>(false);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [isRpeGuideOpen, setIsRpeGuideOpen] = useState<boolean>(false);
  const [groupModalTarget, setGroupModalTarget] = useState<WorkoutExercise | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);
  const [replacingExerciseItem, setReplacingExerciseItem] = useState<WorkoutExercise | null>(null);

  // 대형 원형 휴식 타이머 상태
  const [restTimerState, setRestTimerState] = useState<{
    isOpen: boolean;
    exerciseName: string;
    setId: string;
    setNumber: number;
    exerciseId: string;
    isLastSetOfExercise: boolean;
    runId: number;
    initialSeconds: number;
    initialElapsedSeconds: number;
  }>({
    isOpen: false,
    exerciseName: '',
    setId: '',
    setNumber: 1,
    exerciseId: "",
    isLastSetOfExercise: false,
    runId: 0,
    initialSeconds: 90,
    initialElapsedSeconds: 0,
  });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('iron_adaptive_rest_ui') || 'null');
      const active = loadActiveSession();
      if (saved?.sessionId === active?.id && saved?.isOpen && active?.exercises.some(ex => ex.id === saved.exerciseId && ex.sets.some(set => set.id === saved.setId && set.completed))) setRestTimerState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try { if (session) localStorage.setItem('iron_adaptive_rest_ui', JSON.stringify({ ...restTimerState, sessionId: session.id })); } catch {}
  }, [restTimerState]);

  useEffect(() => {
    let released = false;
    let release: (() => void) | undefined;
    const acquire = async () => {
      release?.();
      if (!session || !loadAdaptiveSettings().keepAwake || document.hidden) return;
      if ('wakeLock' in navigator) {
        const nav = navigator as Navigator & { wakeLock: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
        try { const lock = await nav.wakeLock.request('screen'); if (released) await lock.release(); else release = () => { void lock.release(); }; } catch {}
      }
    };
    void acquire();
    document.addEventListener('visibilitychange', acquire);
    window.addEventListener(ADAPTIVE_SETTINGS_CHANGE, acquire);
    return () => { released = true; release?.(); document.removeEventListener('visibilitychange', acquire); window.removeEventListener(ADAPTIVE_SETTINGS_CHANGE, acquire); };
  }, [session?.id]);

  // 구버전 로컬스토리지 데이터 자동 치유
  useEffect(() => {
    if (!session) return;
    const sanitized = sanitizeSessionExercises(session);
    let needsUpdate = false;
    for (let i = 0; i < session.exercises.length; i++) {
      if (session.exercises[i].exerciseId !== sanitized.exercises[i]?.exerciseId) {
        needsUpdate = true;
        break;
      }
    }
    if (needsUpdate) {
      setSession(sanitized);
      saveActiveSession(sanitized);
    }
  }, [session?.id]);

  // 전역 세션 변경 이벤트 수신 (헤더나 다른 곳에서 세션이 업데이트된 경우 동기화)
  useEffect(() => {
    const handleSessionChange = (e: any) => {
      const updated = e.detail;
      if (!updated && session) {
        setSession(null);
      }
    };
    window.addEventListener('iron_active_session_change', handleSessionChange);
    return () => window.removeEventListener('iron_active_session_change', handleSessionChange);
  }, [session]);

  // 선택 부위 기반 세션 타이틀 자동 추천
  const recommendedTitle = useMemo(() => {
    if (customTitle.trim()) return customTitle;
    if (selectedPartIds.length === 0) return t('자유 루틴');
    const labels = selectedPartIds
      .map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label)
      .filter(Boolean).map(label => t(label!));
    if (labels.length === 1) return `${labels[0]} ${t('루틴')}`;
    if (labels.length === 2) return `${labels.join(' & ')} ${t('루틴')}`;
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} ${t('루틴')}`;
  }, [selectedPartIds, customTitle, getLanguage()]);

  // 부위 토글 핸들러
  const handleTogglePart = (partId: string) => {
    setSelectedPartIds((prev) => {
      if (prev.includes(partId)) {
        if (prev.length === 1) return prev; // 최소 1개 유지
        return prev.filter((id) => id !== partId);
      } else {
        return [...prev, partId];
      }
    });
  };

  // 인풋 포커스 및 셀렉션 강제 해제 헬퍼 (안드로이드 물방울 커서 잔존 방지)
  const clearFocusAndSelection = () => {
    if (document.activeElement && (document.activeElement as HTMLElement).blur) {
      (document.activeElement as HTMLElement).blur();
    }
    window.getSelection()?.removeAllRanges();
  };

  // [운동 시작하기] 버튼 클릭 시 세션 생성 및 첫 종목 모달 오픈
  const handleStartWorkout = () => {
    if (loadActiveSession()) {
      setFlowMessage('먼저 진행 중인 운동을 완료하거나 취소하세요.');
      setSession(loadActiveSession());
      return;
    }
    clearFocusAndSelection();
    const selectedOptions = TARGET_BODY_PARTS.filter((p) => selectedPartIds.includes(p.id));
    const targetCategories = Array.from(new Set(selectedOptions.map((p) => p.category))) as Category[];

    const todayStr = getTodayString();
    const newSession: WorkoutSession = {
      id: 'session-' + Date.now(),
      title: recommendedTitle,
      date: todayStr,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: [],
      completed: false,
      weightUnit: 'kg',
      bodyWeight: loadHealthPreferences().weight?.kg,
      conditionEmoji: idleCondition,
      isDeload: idleDeload,
      notes: '',
      targetCategories,
      targetPartIds: selectedPartIds,
      ...idleAdaptive,
    };

    saveActiveSession(newSession);
    if (loadActiveSession()?.id !== newSession.id) {
      setFlowMessage('운동을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도하세요.');
      return;
    }
    setSession(newSession);
    setFlowMessage('');
    // 운동 시작과 동시에 첫 종목 모달 자동 활성화
    setIsAddModalOpen(true);
  };

  const handleImportedWorkout = (next: WorkoutSession) => {
    let existing: string | null;
    try { existing = localStorage.getItem('iron_active_session_v1'); }
    catch { throw new Error('운동을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도하세요.'); }
    if (existing !== null) throw new Error('먼저 진행 중인 운동을 완료하거나 취소하세요.');
    const prepared = { ...next, ...idleAdaptive, title: next.title === 'AI 루틴' ? t('AI 루틴') : next.title, conditionEmoji: idleCondition, isDeload: idleDeload, bodyWeight: loadHealthPreferences().weight?.kg };
    saveActiveSession(prepared);
    if (loadActiveSession()?.id !== prepared.id) throw new Error('운동을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도하세요.');
    setSession(prepared);
    setFlowMessage('');
  };

  const handleRepeatWorkout = (source: WorkoutSession) => {
    try {
      if (loadActiveSession()) {
        setSession(loadActiveSession());
        throw new Error('먼저 진행 중인 운동을 완료하거나 취소하세요.');
      }
      const next = { ...repeatWorkout(source, { bodyWeight: loadHealthPreferences().weight?.kg }), ...idleAdaptive };
      saveActiveSession(next);
      if (loadActiveSession()?.id !== next.id) throw new Error('운동을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도하세요.');
      setCompletion(null);
      setCollapsedExerciseIds(new Set());
      setIsReordering(false);
      setSession(next);
      setFlowMessage('');
    } catch (error) { setFlowMessage((error as Error).message); }
  };

  const handleMoveExercise = (id: string, direction: 'up' | 'down') => {
    const current = loadActiveSession();
    if (!current || current.id !== session?.id) return;
    const exercises = moveWorkoutExercise(current.exercises, id, direction);
    try {
      saveWithRecovery({ ...current, exercises }, 'active');
      setFlowMessage('정렬 순서가 저장되었습니다.');
    } catch (error) { setFlowMessage((error as Error).message); }
  };

  // 운동 취소 (확인 팝업 후 초기화)
  const handleCancelWorkout = () => {
    if (window.confirm(t('운동을 취소하시겠습니까? 기록은 복구함에서 30일간 복원할 수 있습니다.'))) {
      try { if (session) removeSession(session.id, 'active'); }
      catch (error) { alert(t((error as Error).message)); }
    }
  };

  // 총 운동 시간 보존 헬퍼 (세트 수정 시 1분대에서 리셋되는 치명적 버그 방지)
  const getLatestDuration = (): number => {
    const fromStorage = loadActiveSession()?.durationSeconds;
    // The global timer accounts for background time and pauses; wall time would add paused time back.
    return Math.max(session?.durationSeconds || 0, fromStorage || 0);
  };

  // 종목 추가 핸들러
  const handleAddExercise = (
    exercise: Exercise,
    equipmentType: EquipmentType,
    brand?: string,
    setting?: string,
    loadType?: LoadType,
    weightUnit?: WeightUnit,
    machineConfigId?: string
  ) => {
    if (!session) return;
    const previous = findPreviousMachineExercise(loadSavedSessions(), exercise.id, brand, machineConfigId);
    const targetUnit = weightUnit || previous?.weightUnit || 'kg';
    const previousSets = previous ? convertExerciseSets(previous, targetUnit) : undefined;

    const initialSets = previousSets && previousSets.length > 0
      ? previousSets.map((ps, idx) => ({
          id: 'set-' + Date.now() + '-' + idx,
          setNumber: idx + 1,
          weight: ps.weight,
          reps: ps.reps,
          completed: false,
          previousWeight: ps.weight,
          previousReps: ps.reps,
        }))
      : [
          { id: 'set-' + Date.now() + '-1', setNumber: 1, weight: 20, reps: 10, completed: false },
          { id: 'set-' + Date.now() + '-2', setNumber: 2, weight: 20, reps: 10, completed: false },
        ];

    if (replacingExerciseItem) {
      const current = loadActiveSession();
      if (!current) return;
      const exercises = replaceWorkoutExercise(current.exercises, replacingExerciseItem.id, {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        equipmentType,
        loadType: loadType || exercise.loadType,
        machineBrand: brand,
        machineConfigId,
        machineSetting: setting,
        weightUnit: targetUnit,
        initialSets,
      });
      const updated = {
        ...current,
        durationSeconds: getLatestDuration(),
        exercises,
      };
      setSession(updated);
      saveActiveSession(updated);
      setReplacingExerciseItem(null);
      setIsAddModalOpen(false);
      setFlowMessage('운동 종목이 교체되었습니다.');
      return;
    }

    const newExerciseItem: WorkoutExercise = {
      id: 'ex-item-' + Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      equipmentType,
      loadType: loadType || exercise.loadType,
      machineBrand: brand,
      machineConfigId,
      machineSetting: setting,
      sets: initialSets.map(set => ({ ...set, setType: 'UNSPECIFIED', provenance: 'recorded', rpe: null })),
      weightUnit: targetUnit,
    };

    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: [...session.exercises, newExerciseItem],
    };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleUpdateExercise = (index: number, updatedItem: WorkoutExercise) => {
    if (!session) return;
    const latest = loadActiveSession() || session;
    const prevItem = latest.exercises.find(ex => ex.id === updatedItem.id);
    const newExercises = latest.exercises.map(ex => ex.id === updatedItem.id ? {
      ...updatedItem,
      sets: updatedItem.sets.map(set => {
        const prior = prevItem?.sets.find(old => old.id === set.id);
        if (set.completed && !prior?.completed) return { ...set, completionPausedSeconds: latest.pausedSeconds || 0 };
        return prior ? recordSetRevision(prior, set) : set;
      }),
    } : ex);
    const justCompleted = updatedItem.sets.find(set => set.completed && !prevItem?.sets.find(old => old.id === set.id)?.completed);
    if (justCompleted && loadAdaptiveSettings().suggestions) {
      const nextSet = updatedItem.sets.slice(updatedItem.sets.findIndex(set => set.id === justCompleted.id) + 1).find(set => !set.completed);
      const recommendation = nextSet ? suggestNextSet({ exercise: updatedItem, completedSet: justCompleted, nextSet, phase: latest.trainingPhase, pain: !!latest.checkIn?.jointPain }) : null;
      setSuggestion(recommendation && nextSet ? { exerciseId: updatedItem.id, setId: nextSet.id, weight: recommendation.weight, reps: recommendation.reps, reason: recommendation.reason } : null);
    } else setSuggestion(null);

    const updated = {
      ...latest,
      durationSeconds: getLatestDuration(),
      exercises: newExercises,
    };
    try { saveWithRecovery(updated, 'active'); }
    catch (error) { alert(t((error as Error).message)); }
  };

  const handleDeleteExercise = (index: number) => {
    if (!session) return;
    const newExercises = session.exercises.filter((_, i) => i !== index);
    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: newExercises,
    };
    try { saveWithRecovery(updated, 'active'); }
    catch (error) { alert(t((error as Error).message)); }
  };

  // 종목 묶기 (슈퍼세트/컴파운드세트)
  const handleLinkExercises = (exerciseIds: string[], groupType: ExerciseGroupType) => {
    if (!session) return;
    const groupId = 'group-' + Date.now();
    const groupName = groupType === 'superset' ? t('슈퍼세트') : groupType === 'compound' ? t('컴파운드세트') : t('자이언트세트');
    const groupColor = groupType === 'superset' ? 'rgb(var(--accent-rgb))' : '#FF9500';

    const existingGroupIds = new Set(session.exercises.map((e) => e.groupId).filter(Boolean));
    const groupLetter = String.fromCharCode(65 + existingGroupIds.size);

    const updatedExercises = session.exercises.map((ex) => {
      const matchIdx = exerciseIds.indexOf(ex.id);
      if (matchIdx !== -1) {
        return {
          ...ex,
          groupId,
          groupType,
          groupLabel: `${groupName} ${groupLetter}-${matchIdx + 1}`,
          groupColor,
        };
      }
      return ex;
    });

    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: updatedExercises,
    };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleUnlinkExercise = (exerciseId: string) => {
    if (!session) return;
    const target = session.exercises.find((e) => e.id === exerciseId);
    if (!target || !target.groupId) return;
    const gId = target.groupId;

    const remaining = session.exercises.filter((e) => e.groupId === gId && e.id !== exerciseId);

    const updatedExercises = session.exercises.map((ex) => {
      if (ex.id === exerciseId || remaining.length <= 1) {
        const { groupId, groupType, groupLabel, groupColor, ...rest } = ex;
        return rest;
      }
      return ex;
    });

    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: updatedExercises,
    };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleTriggerRestTimer = (exerciseName: string, setId: string, setNumber: number, isLastSetOfExercise: boolean, exerciseId: string) => {
    setRestTimerState({
      isOpen: true,
      exerciseName,
      setId,
      setNumber,
      isLastSetOfExercise,
      exerciseId,
      runId: restTimerState.runId + 1,
      initialElapsedSeconds: Math.max(0, (Date.now() - Date.parse(loadActiveSession()?.exercises.find(e => e.id === exerciseId)?.sets.find(s => s.id === setId)?.completedAt || new Date().toISOString())) / 1000),
      initialSeconds: loadActiveSession()?.exercises.find(e => e.id === exerciseId)?.sets.find(s => s.id === setId)?.plannedRestSeconds ?? 90,
    });
  };

  const handleSaveRestTimeToSet = (_timerElapsedSeconds: number) => {
    setRestTimerState(prev => ({ ...prev, isOpen: false }));
  };

  const handleStartSet = (exerciseId: string, setId: string) => {
    const latest = loadActiveSession();
    if (!latest) return;
    const updated = startWorkoutSet(latest, exerciseId, setId);
    try { saveWithRecovery(updated, 'active'); } catch (error) { alert(t((error as Error).message)); return; }
    setRestTimerState(prev => ({ ...prev, isOpen: false }));
  };

  const applySuggestion = () => {
    const latest = loadActiveSession();
    if (!latest || !suggestion) return;
    const exercise = latest.exercises.find(ex => ex.id === suggestion.exerciseId);
    const nextSet = exercise?.sets.find(set => set.id === suggestion.setId);
    const lastCompleted = exercise?.sets.filter(set => set.completed).slice(-1)[0];
    if (!exercise || !nextSet || !lastCompleted || nextSet.completed) { setSuggestion(null); return; }
    const current = suggestNextSet({ exercise, completedSet: lastCompleted, nextSet, phase: latest.trainingPhase, pain: !!latest.checkIn?.jointPain });
    if (current && current.weight === suggestion.weight && current.reps === suggestion.reps) {
      saveWithRecovery({ ...latest, exercises: latest.exercises.map(ex => ex.id === exercise.id ? { ...ex, sets: ex.sets.map(set => set.id === nextSet.id ? { ...set, weight: current.weight, reps: current.reps } : set) } : ex) }, 'active');
    }
    setSuggestion(null);
  };

  const handleCompleteWorkout = () => {
    if (!session) return;
    if (session.exercises.length === 0) {
      if (!window.confirm(t('등록된 운동 종목이 없습니다. 그래도 운동을 완료하시겠습니까?'))) {
        return;
      }
    }

    const finalDuration = getLatestDuration();

    const finalSession: WorkoutSession = {
      ...session,
      durationSeconds: finalDuration,
      completed: true,
      endTime: new Date().toISOString(),
      overallRpe: calculateAverageRPE(session) || undefined,
    };

    let history: WorkoutSession[];
    try {
      history = completeWorkoutSession(finalSession);
    } catch (error) {
      setFlowMessage((error as Error).message);
      return;
    }
    soundManager.playSuccessSound();
    let healthMessage = '';
    try {
      if (enqueueWorkout(finalSession)) {
        healthMessage = '\n' + t('건강 앱 전송을 예약했습니다. 마이에서 결과를 확인하세요.');
        void flushWorkoutExports().catch(() => {});
      }
    } catch { healthMessage = '\n' + t('운동은 저장했지만 건강 앱 전송을 예약하지 못했습니다.'); }
    setSession(null);

    setRestTimerState(previous => ({ ...previous, isOpen: false }));
    setIsReordering(false);
    setFlowMessage('');
    setCompletion({ session: finalSession, history, healthMessage });
  };

  const savedCount = useMemo(() => loadSavedSessions().length, [session]);

  if (completion && !session) return <WorkoutCompleteSummary {...completion}
    onHistory={() => { setCompletion(null); onWorkoutCompleted?.(); }}
    onDismiss={() => setCompletion(null)} />;

  // ==========================================
  // 1. 대기 화면 (Session === null)
  // ==========================================
  if (!session) {
    const todayDateFormatted = new Date().toLocaleDateString(getLanguage(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return (
      <div data-workout-idle className="pb-32 max-w-lg md:max-w-6xl lg:max-w-7xl mx-auto px-4 space-y-4 animate-fade-in">
        {/* 상단 날짜 및 상태 카드 */}
        <div data-workout-intro className="pt-5 pb-1 text-left space-y-1.5">
          <div data-workout-date className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-strong dark:text-accent-light">
            <Calendar size={13} className="text-accent" />
            {todayDateFormatted}
          </div>
          <h2 className="text-2xl font-extrabold leading-tight text-[#24212B] dark:text-white">{t("오늘의 운동 시작하기")}</h2>
          <p data-workout-subtitle className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t("오늘 운동할 부위를 선택하면 첫 운동 추가 시 해당 부위가 자동 추천됩니다.")}</p>
        </div>

        {flowMessage && <p role="status" className="text-sm text-accent dark:text-accent-light">{t(flowMessage)}</p>}

        <AdaptiveSessionPanel value={idleAdaptive} onChange={patch => setIdleAdaptive(prev => ({ ...prev, ...patch }))} />
        <AiRoutineImportPanel onStart={handleImportedWorkout} />

        <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
          {/* 좌측 패널 (목표 부위 선택 & 안내) */}
          <div className="space-y-4 md:col-span-6 lg:col-span-6 md:sticky md:top-16">
            {/* 1. 운동 부위 다중 선택 카드 */}
        <div data-workout-target-card className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#403A49] dark:text-gray-200 flex items-center gap-1.5">
              <Target size={14} className="text-accent" />{t("오늘의 목표 부위 (다중 선택)")}</span>
            <span className="text-[11px] font-bold text-accent">
              {selectedPartIds.length}{t("개 선택됨")}</span>
          </div>

          <div data-workout-target-grid className="grid grid-cols-4 gap-2">
            {TARGET_BODY_PARTS.map((part) => {
              const isSelected = selectedPartIds.includes(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleTogglePart(part.id)}
                  className={`min-w-0 p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-colors duration-150 ${
                    isSelected
                      ? 'bg-accent-strong text-white shadow-[0_5px_12px_rgba(0,0,0,0.14)]'
                      : 'bg-[#F4F3F8] dark:bg-[#302B37] text-[#403A49] dark:text-gray-200 hover:bg-[var(--accent-soft)] dark:hover:bg-[#403A49]'
                  }`}
                >
                  <BodyPartIcon part={part.id} />
                  <span className="w-full text-xs font-bold leading-tight break-words">{t(part.label)}</span>
                </button>
              );
            })}
          </div>

          {/* 선택 부위 설명 배지 */}
          <div className="pt-3 border-t border-[#E9E7EF] dark:border-white/10 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles size={14} className="text-[#FF9500] shrink-0" />
            <span>
              <strong className="text-[#1D1D1F] dark:text-white">
                {selectedPartIds.map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label || '').map(label => t(label)).join(', ')}
              </strong>
              {" "}{selectedPartIds.length > 0 ? t("부위가 첫 운동 라이브러리 탭에 최우선 노출됩니다.") : t("부위를 선택해 주세요.")}
            </span>
          </div>
        </div>
            {/* 엄지로 누르기 쉬운 중간-하단 영역에 시작 동작을 배치 */}
        <div data-workout-start-section className="pt-1">
          <button
            type="button"
            onClick={handleStartWorkout}
            className="w-full min-h-[58px] px-3 py-3 bg-accent-strong hover:bg-accent-hover text-white rounded-2xl text-base font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.14)] transition active:scale-98"
          >
            <Dumbbell size={22} />
            <span data-workout-start>{t("새 운동 시작하기")} ({recommendedTitle})</span>
            <ArrowRight size={20} />
          </button>
        </div>
            {/* 안내 카드 & 샘플 데이터 옵션 */}
        <div className="py-3 border-t border-[#E9E7EF] dark:border-white/10 text-center text-xs text-gray-500 space-y-1">
          <p>
            {t("저장된 운동 일지")}: <strong className="text-gray-700 dark:text-gray-300">{savedCount}</strong> · {t("기록 조회")} / {t("AI 분석 추출")}
          </p>
          {savedCount === 0 && (
            <button
              type="button"
              onClick={() => {
                loadSampleDataForDemo();
                alert(t('체험용 샘플 운동 일지가 불러와졌습니다. [기록 조회] 탭에서 확인해 보세요!'));
                window.location.reload();
              }}
              className="text-accent hover:underline font-bold mt-1 inline-block"
            >{t("체험용 샘플 기록 불러오기")}</button>
          )}
        </div>
          </div>

          {/* 우측 패널 (루틴 이름, 컨디션, 디로딩 & 시작 버튼) */}
          <div className="space-y-4 md:col-span-6 lg:col-span-6 mt-4 md:mt-0">
        <RepeatWorkoutPanel onRepeat={handleRepeatWorkout} />
            {/* 2. 세션 설정 카드 (제목, 컨디션, 디로딩) */}
        <div className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3.5">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-1.5">{t("루틴 이름 (자동 생성 또는 직접 입력)")}</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={recommendedTitle}
              className="w-full bg-[#F4F3F8] dark:bg-[#302B37] text-sm font-semibold text-[#24212B] dark:text-white px-3.5 py-2.5 rounded-xl border border-transparent focus:border-accent-strong focus:bg-white dark:focus:bg-[#1E1B24] outline-none transition"
            />
          </div>

          {/* 컨디션 이모지 선택 */}
          <div>
            <label className="block text-xs font-black text-gray-400 mb-1.5">{t("오늘의 컨디션")}</label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setIdleCondition(opt.emoji)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    idleCondition === opt.emoji
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-[#F2F2F7] dark:bg-[#252528] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333336]'
                  }`}
                >
                  <ConditionIcon condition={opt.emoji} size={16} />
                  <span>{t(opt.label)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 디로딩 토글 */}
          <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
            <div>
              <span className="text-xs font-bold text-[#1D1D1F] dark:text-white block">{t("디로딩 주간 (저강도 회복 훈련)")}</span>
              <span className="text-[11px] text-gray-400">
                {t("피로 누적 방지 및 근신경계 회복을 위한 감량 세션")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIdleDeload(!idleDeload)}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                idleDeload ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  idleDeload ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================// ==========================================
  // 2. 활성 운동 화면 (Session !== null)
  // ==========================================
  const totalVolume = calculateSessionVolume(session);
  const totalReps = calculateSessionReps(session);
  const avgRpe = calculateAverageRPE(session);
  const sessionSets = session.exercises.flatMap(exercise => exercise.sets);
  const restExerciseIndex = session.exercises.findIndex(item => item.id === restTimerState.exerciseId);
  const nextRestExercise = restExerciseIndex >= 0 ? session.exercises[restExerciseIndex + 1] : undefined;
  const completedSetCount = sessionSets.filter(set => set.completed).length;

  return (
    <div className="pb-32 max-w-lg md:max-w-6xl lg:max-w-7xl mx-auto px-4 space-y-4 animate-fade-in">
      {session.exercises.length > 1 && <p id="workout-drag-help" className="text-[11px] text-gray-400">{t('카드를 길게 누른 채 위아래로 옮겨 순서를 바꾸세요.')}</p>}
      {drag && <div role="status" className="fixed z-[80] pointer-events-none rounded-2xl px-4 py-3 bg-accent text-white shadow-2xl text-sm font-bold max-w-[80vw]" style={{ left: Math.max(12, Math.min(innerWidth - 220, drag.x - 100)), top: Math.max(12, drag.y - 64) }}>{displayExercise(resolveRecordedExercise(session.exercises.find(ex => ex.id === drag.sourceId)!))}<span className="block text-[11px] font-normal opacity-80">{t('순서를 변경하는 중입니다.')} {drag.targetId && t('여기에 놓기')}</span></div>}
      <div className="md:grid md:grid-cols-12 md:gap-8 items-start">
        {/* 좌측 패널: 세션 정보, 요약 통계, 고정 완료 버튼 */}
        <div className="space-y-4 md:col-span-5 lg:col-span-5 md:sticky md:top-16">
          <AdaptiveSessionPanel value={session} onChange={patch => { const latest = loadActiveSession(); if (latest) saveWithRecovery({ ...latest, ...patch }, 'active'); }} />
          {suggestion && <div role="status" className="rounded-2xl p-4 bg-accent/10 space-y-2">
            <h4 className="font-bold">{t('다음 세트 제안')}</h4>
            <p className="text-sm">{t(suggestion.reason === 'rpe-high' ? '목표보다 RPE가 높습니다.' : '목표보다 RPE가 낮습니다.')} {suggestion.weight} {session.exercises.find(ex => ex.id === suggestion.exerciseId)?.weightUnit || session.weightUnit || 'kg'} × {suggestion.reps}</p>
            <div className="flex gap-2"><button type="button" onClick={applySuggestion} className="min-h-[44px] px-4 rounded-xl bg-accent text-white font-bold">{t('제안 적용')}</button><button type="button" onClick={() => setSuggestion(null)} className="min-h-[44px] px-3">{t('제안 닫기')}</button></div>
          </div>}
          {/* 상단 액션 바: 세션 정보 & 일지 & 취소 (타이머는 최상단 글로벌 헤더 시계로 일원화) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h3 className="text-xl font-extrabold leading-tight text-[#24212B] dark:text-white">
            {session.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-gray-400">
              {session.date} · {t("진행 중")}
            </span>
            <button
              type="button"
              onClick={() => {
                clearFocusAndSelection();
                setIsNotesModalOpen(true);
              }}
              className="flex items-center gap-1 hover:opacity-80 transition cursor-pointer"
              title={t("운동 부위 및 일지 수정")}
            >
              {session.targetPartIds && session.targetPartIds.length > 0 ? (
                session.targetPartIds.map((id) => {
                  const opt = TARGET_BODY_PARTS.find((p) => p.id === id);
                  if (!opt) return null;
                  return (
                    <span
                      key={id}
                      className="px-1.5 py-0.2 rounded bg-accent/15 text-accent dark:text-accent-light text-[9px] font-bold"
                    >
                      {t(opt.label)}
                    </span>
                  );
                })
              ) : (
                <span className="px-1.5 py-0.2 rounded bg-gray-500/10 text-gray-500 text-[9px] font-bold">
                  + {t("부위 설정")}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 일지, 디로딩, 운동 취소 버튼 */}
        <div className="flex items-center gap-1.5">
          {session.isDeload && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
              <Sparkles size={12} />
              {t("디로딩")}
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              clearFocusAndSelection();
              setIsNotesModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 transition shadow-xs active:scale-95"
          >
            <ConditionIcon condition={session.conditionEmoji} size={16} />
            <span>{session.notes ? t('일지 작성됨') : t('일지')}</span>
          </button>

          <button
            type="button"
            onClick={handleCancelWorkout}
            className="p-1.5 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-full text-xs font-bold text-gray-400 hover:text-red-500 transition shadow-xs active:scale-95"
            title={t("운동 취소")}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 한 줄 진행 요약. 세부 통계는 필요한 때만 펼친다. */}
      <div className="soft-surface bg-white dark:bg-[#1E1B24] overflow-hidden">
        <button type="button" aria-label={t("운동 통계 상세")} aria-expanded={showSessionStats} onClick={() => setShowSessionStats(!showSessionStats)} className="w-full px-3 min-h-[40px] flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span><strong className="text-[#1D1D1F] dark:text-white">{session.exercises.length}</strong> {t("종목")}</span>
          <span><strong className="text-accent">{completedSetCount}/{sessionSets.length}</strong> {t("세트 완료")}</span>
          <span className="flex items-center gap-1"><strong className="text-[#1D1D1F] dark:text-white">{totalVolume.toLocaleString()}</strong> kg <span aria-hidden="true">{showSessionStats ? '⌃' : '⌄'}</span></span>
        </button>
        {showSessionStats && <div className="px-3 py-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><span>{t("총 횟수")} <strong>{totalReps}{t("회")}</strong></span><span>{t("평균 RPE")} <strong>{avgRpe || '-'}</strong></span></div>}
        <div role="progressbar" aria-label={t("세트 완료율")} aria-valuemin={0} aria-valuemax={sessionSets.length || 1} aria-valuenow={completedSetCount} className="h-0.5 bg-black/5 dark:bg-white/5">
          <div className="h-full bg-accent-bright transition-[width] duration-300" style={{width: `${sessionSets.length ? completedSetCount / sessionSets.length * 100 : 0}%`}} />
        </div>
      </div>

          {/* 데스크톱/폴드 전용 상단 고정 운동 완료 버튼 */}
          <div className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-2 hidden md:block">
            <span className="text-xs font-black text-gray-400 block">{t("운동 마무리")}</span>
            <HoldToCompleteButton
              onComplete={handleCompleteWorkout}
              holdDurationMs={1500}
            />
          </div>
        </div>

        {/* 우측 패널: 운동 종목 리스트 & 종목 추가 버튼 */}
        <div className="space-y-4 md:col-span-7 lg:col-span-7 mt-4 md:mt-0">
          {/* 운동 종목 리스트 */}
      {session.exercises.length > 0 && (
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-bold text-gray-500">{t("운동")} {session.exercises.length}{t("종목")}</span>
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-semibold flex-wrap">
            <button
              type="button"
              onClick={() => setIsReorderModalOpen(true)}
              className="min-h-[32px] px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent dark:text-accent-light text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowUpDown size={13} />
              <span>{t("종목 순서 변경")}</span>
            </button>
            <button type="button" aria-pressed={isReordering} className="min-h-[32px]" onClick={() => setIsReordering(previous => !previous)}>{t(isReordering ? '순서 변경 완료' : '순서 변경')}</button>
            <button type="button" className="min-h-[32px]" onClick={() => setCollapsedExerciseIds(new Set(session.exercises.map(item => item.id)))}>{t("모두 접기")}</button>
            <button type="button" className="min-h-[32px]" onClick={() => setCollapsedExerciseIds(new Set())}>{t("모두 펼치기")}</button>
          </div>
        </div>
      )}
      {flowMessage && <p role="status" className="text-sm text-accent dark:text-accent-light">{t(flowMessage)}</p>}
      {isReordering && <p className="text-xs text-gray-500">{t('묶인 종목은 함께 이동합니다.')}</p>}
      <div className="space-y-2">
        {session.exercises.length === 0 ? (
          <div className="soft-surface py-14 text-center bg-white dark:bg-[#1E1B24] p-6 space-y-3">
            <Dumbbell size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {t("아직 등록된 운동 종목이 없습니다.")}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("아래 버튼을 눌러 첫 종목을 라이브러리에서 추가해 보세요.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearFocusAndSelection();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={15} />
              {t("첫 운동 종목 추가하기")}
            </button>
          </div>
        ) : (
          session.exercises.map((item, idx) => (
            <div key={item.id} data-workout-exercise={item.id} data-dragging={drag?.sourceId === item.id || undefined} data-drop-placement={drag?.targetId === item.id ? drag.placement : undefined}
              className={`${drag?.sourceId === item.id ? 'opacity-40' : ''} ${drag?.targetId === item.id ? drag.placement === 'before' ? 'border-t-4 border-accent' : 'border-b-4 border-accent' : ''}`}>
            {isReordering && (!item.groupId || session.exercises.findIndex(exercise => exercise.groupId === item.groupId) === idx) && (
              <div className="flex items-center justify-end gap-2 pb-2">
                {(['up', 'down'] as const).map(direction => <button type="button" key={direction}
                  aria-label={`${t(direction === 'up' ? '위로 이동' : '아래로 이동')} · ${displayExercise(resolveRecordedExercise(item))}`}
                  disabled={!getExerciseMoveAvailability(session.exercises, item.id)[direction]}
                  onClick={() => handleMoveExercise(item.id, direction)}
                  className="min-h-[44px] rounded-xl bg-accent/10 px-3 py-2 text-xs font-bold text-accent dark:text-accent-light disabled:opacity-30">
                  {t(direction === 'up' ? '위로 이동' : '아래로 이동')}
                </button>)}
              </div>
            )}
            <ExerciseCard
              exerciseItem={item}
              collapsed={Boolean(drag) || collapsedExerciseIds.has(item.id)}
              onToggleCollapsed={() => setCollapsedExerciseIds(previous => {
                const next = new Set(previous);
                if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                return next;
              })}
              weightUnit={item.weightUnit || 'kg'}
              onUpdate={(updated) => handleUpdateExercise(idx, updated)}
              onDelete={() => handleDeleteExercise(idx)}
              onStartSet={setId => handleStartSet(item.id, setId)}
              getSetProgress={setId => getSetProgress(session, item.id, setId)}
              onCancelSetStart={setId => { const latest = loadActiveSession(); if (latest) saveWithRecovery(cancelWorkoutSetStart(latest, item.id, setId), 'active'); }}
              onTriggerRestTimer={(exName, setId, setNum, last) => handleTriggerRestTimer(exName, setId, setNum, last, item.id)}
              onOpenRpeGuide={() => setIsRpeGuideOpen(true)}
              onOpenGroupModal={() => setGroupModalTarget(item)}
              onUnlinkGroup={() => handleUnlinkExercise(item.id)}
              onMove={(direction) => handleMoveExercise(item.id, direction)}
              canMoveUp={getExerciseMoveAvailability(session.exercises, item.id).up}
              canMoveDown={getExerciseMoveAvailability(session.exercises, item.id).down}
              onReplace={() => {
                setReplacingExerciseItem(item);
                setIsAddModalOpen(true);
              }}
              isDark={isDark}
            />
            </div>
          ))
        )}
      </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full min-h-[48px] text-sm font-bold text-accent dark:text-accent-light bg-[var(--accent-soft)] dark:bg-[var(--accent-soft-dark)] hover:bg-[var(--accent-soft)] rounded-2xl flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Plus size={18} />
              {t("운동 종목 추가하기")}
            </button>

            {/* 모바일 화면 전용 완료 버튼 */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 md:hidden">
              <HoldToCompleteButton
                onComplete={handleCompleteWorkout}
                holdDurationMs={1500}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 대형 원형 스마트 휴식 타이머 모달 */}
      <RestTimerModal
        storageKey={`iron_adaptive_clock_${session.id}_${restTimerState.runId}`}
        key={restTimerState.runId}
        isLastSetOfExercise={restTimerState.isLastSetOfExercise}
        nextExerciseName={nextRestExercise ? displayExercise(resolveRecordedExercise(nextRestExercise)) : undefined}
        onNextExercise={() => {
          if (!nextRestExercise) { setIsAddModalOpen(true); return; }
          setCollapsedExerciseIds(previous => {
            const next = new Set(previous); next.delete(nextRestExercise.id); return next;
          });
          requestAnimationFrame(() => document.getElementById(`exercise-${nextRestExercise.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        }}
        isOpen={restTimerState.isOpen}
        initialSeconds={restTimerState.initialSeconds}
        initialElapsedSeconds={restTimerState.initialElapsedSeconds || 0}
        exerciseName={restTimerState.exerciseName}
        setNumber={restTimerState.setNumber}
        onClose={handleSaveRestTimeToSet}
        onFinishAndSave={handleSaveRestTimeToSet}
      />

      {/* 운동 추가 및 종목 교체 모달 */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setReplacingExerciseItem(null);
        }}
        onSelect={handleAddExercise}
        initialCategory={replacingExerciseItem ? resolveRecordedExercise(replacingExerciseItem).category : undefined}
        targetCategories={replacingExerciseItem ? [resolveRecordedExercise(replacingExerciseItem).category] : session.targetCategories}
        targetPartIds={replacingExerciseItem ? resolveRecordedExercise(replacingExerciseItem).primaryMuscles : session.targetPartIds}
        replacementTitle={replacingExerciseItem ? displayExercise(resolveRecordedExercise(replacingExerciseItem)) : undefined}
      />

      {/* 종목 순서 변경 모달 */}
      <ReorderExercisesModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        exercises={session.exercises}
        onMove={handleMoveExercise}
      />

      {/* 세션 메모 및 부위 재설정 모달 */}
      <SessionNotesModal
        isOpen={isNotesModalOpen}
        initialNotes={session.notes}
        initialEmoji={session.conditionEmoji}
        isDeload={session.isDeload}
        initialPartIds={session.targetPartIds}
        currentExercises={session.exercises}
        onClose={() => setIsNotesModalOpen(false)}
        onSave={(notes, emoji, isDeload, updatedPartIds, shouldUpdateTitle) => {
          const updatedCategories = mapPartIdsToCategories(updatedPartIds);
          const newTitle =
            shouldUpdateTitle && updatedPartIds.length > 0
              ? formatWorkoutTitleFromParts(updatedPartIds)
              : session.title;

          const updated: WorkoutSession = {
            ...session,
            notes,
            conditionEmoji: emoji,
            isDeload,
            targetPartIds: updatedPartIds,
            targetCategories: updatedCategories,
            title: newTitle,
          };
          setSession(updated);
          saveActiveSession(updated);
        }}
      />

      {/* RPE 가이드 모달 */}
      <RpeGuideModal
        isOpen={isRpeGuideOpen}
        onClose={() => setIsRpeGuideOpen(false)}
      />

      {/* 슈퍼세트 / 컴파운드세트 모달 */}
      {groupModalTarget && (
        <ExerciseGroupModal
          isOpen={Boolean(groupModalTarget)}
          currentExercise={groupModalTarget}
          allSessionExercises={session.exercises}
          onClose={() => setGroupModalTarget(null)}
          onLinkExercises={handleLinkExercises}
          onUnlinkExercise={handleUnlinkExercise}
        />
      )}
    </div>
  );
};

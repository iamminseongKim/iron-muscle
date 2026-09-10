import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Pause, Plus, CheckCircle2, Clock, Dumbbell, Sparkles, X, Flame,
  Target, ArrowRight, Calendar
} from 'lucide-react';
import { 
  WorkoutSession, WorkoutExercise, Exercise, EquipmentType, ExerciseGroupType, Category,
  TARGET_BODY_PARTS, WeightUnit
} from '../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from './AddExerciseModal';
import { SessionNotesModal } from './SessionNotesModal';
import { RpeGuideModal } from './RpeGuideModal';
import { RestTimerModal } from './RestTimerModal';
import { ExerciseGroupModal } from './ExerciseGroupModal';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE, convertWeight } from '../../utils/calculations';
import { saveActiveSession, loadActiveSession, saveSessions, loadSavedSessions, loadSampleDataForDemo } from '../../utils/storage';
import { soundManager } from '../../utils/audio';
import { sanitizeSessionExercises } from '../../utils/exerciseResolver';

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
  // 현재 진행 중인 세션 (없으면 null -> 대기 화면 표시)
  const [showSessionStats, setShowSessionStats] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<Set<string>>(new Set());
  const [session, setSession] = useState<WorkoutSession | null>(() => loadActiveSession());

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

  // 대형 원형 휴식 타이머 상태
  const [restTimerState, setRestTimerState] = useState<{
    isOpen: boolean;
    exerciseName: string;
    setId: string;
    setNumber: number;
  }>({
    isOpen: false,
    exerciseName: '',
    setId: '',
    setNumber: 1,
  });

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
    if (selectedPartIds.length === 0) return '자유 루틴';
    const labels = selectedPartIds
      .map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label)
      .filter(Boolean);
    if (labels.length === 1) return `${labels[0]} 루틴`;
    if (labels.length === 2) return `${labels.join(' & ')} 루틴`;
    return `${labels.slice(0, 2).join(', ')} 외 ${labels.length - 2}곳 루틴`;
  }, [selectedPartIds, customTitle]);

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
    clearFocusAndSelection();
    const selectedOptions = TARGET_BODY_PARTS.filter((p) => selectedPartIds.includes(p.id));
    const targetCategories = Array.from(new Set(selectedOptions.map((p) => p.category))) as Category[];

    const todayStr = new Date().toISOString().split('T')[0];
    const newSession: WorkoutSession = {
      id: 'session-' + Date.now(),
      title: recommendedTitle,
      date: todayStr,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: [],
      completed: false,
      weightUnit: 'kg',
      conditionEmoji: idleCondition,
      isDeload: idleDeload,
      notes: '',
      targetCategories,
      targetPartIds: selectedPartIds,
    };

    setSession(newSession);
    saveActiveSession(newSession);
    // 운동 시작과 동시에 첫 종목 모달 자동 활성화
    setIsAddModalOpen(true);
  };

  // 운동 취소 (확인 팝업 후 초기화)
  const handleCancelWorkout = () => {
    if (window.confirm('현재 진행 중인 운동을 취소하시겠습니까?\n작성 중인 운동 내용은 저장되지 않고 초기 화면으로 돌아갑니다.')) {
      saveActiveSession(null);
      setSession(null);
    }
  };

  // 총 운동 시간 보존 헬퍼 (세트 수정 시 1분대에서 리셋되는 치명적 버그 방지)
  const getLatestDuration = (): number => {
    const fromStorage = loadActiveSession()?.durationSeconds;
    const fromStart = session?.startTime
      ? Math.max(0, Math.round((Date.now() - new Date(session.startTime).getTime()) / 1000))
      : 0;
    return Math.max(session?.durationSeconds || 0, fromStorage || 0, fromStart);
  };

  // 과거 세트 기록 조회 (이전 중량/횟수 자동 복사)
  const findPreviousSets = (exerciseId: string, machineBrand?: string) => {
    const allHistory = loadSavedSessions();
    for (let i = allHistory.length - 1; i >= 0; i--) {
      const pastSession = allHistory[i];
      const match = pastSession.exercises.find(
        (e) => e.exerciseId === exerciseId && (!machineBrand || e.machineBrand === machineBrand)
      );
      if (match && match.sets.length > 0) {
        return match.sets;
      }
    }
    return null;
  };

  // 종목 추가 핸들러
  const handleAddExercise = (exercise: Exercise, equipmentType: EquipmentType, brand?: string) => {
    if (!session) return;
    const previousSets = findPreviousSets(exercise.id, brand);

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

    const newExerciseItem: WorkoutExercise = {
      id: 'ex-item-' + Date.now(),
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      equipmentType,
      loadType: exercise.loadType,
      machineBrand: brand,
      sets: initialSets,
      weightUnit: 'kg',
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
    const prevItem = session.exercises[index];
    let newExercises = [...session.exercises];
    newExercises[index] = updatedItem;

    // 슈퍼세트/컴파운드세트/자이언트세트로 묶인 종목: 세트 완료 상태를 그룹 내 모든 종목에 동기화
    if (
      updatedItem.groupId &&
      prevItem &&
      prevItem.sets.length === updatedItem.sets.length
    ) {
      const changedSetIdx = updatedItem.sets.findIndex(
        (s, i) => prevItem.sets[i] && prevItem.sets[i].completed !== s.completed
      );

      if (changedSetIdx !== -1) {
        const newCompleted = updatedItem.sets[changedSetIdx].completed;
        newExercises = newExercises.map((ex) => {
          if (ex.id === updatedItem.id || ex.groupId !== updatedItem.groupId) return ex;
          const targetSet = ex.sets[changedSetIdx];
          if (!targetSet || targetSet.completed === newCompleted) return ex;
          const newSets = [...ex.sets];
          newSets[changedSetIdx] = { ...targetSet, completed: newCompleted };
          return { ...ex, sets: newSets };
        });
      }
    }

    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: newExercises,
    };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleDeleteExercise = (index: number) => {
    if (!session) return;
    const newExercises = session.exercises.filter((_, i) => i !== index);
    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: newExercises,
    };
    setSession(updated);
    saveActiveSession(updated);
  };

  // 종목 묶기 (슈퍼세트/컴파운드세트)
  const handleLinkExercises = (exerciseIds: string[], groupType: ExerciseGroupType) => {
    if (!session) return;
    const groupId = 'group-' + Date.now();
    const groupName = groupType === 'superset' ? '슈퍼세트' : groupType === 'compound' ? '컴파운드세트' : '자이언트세트';
    const groupColor = groupType === 'superset' ? '#007AFF' : '#FF9500';

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

  const handleTriggerRestTimer = (exerciseName: string, setId: string, setNumber: number) => {
    setRestTimerState({
      isOpen: true,
      exerciseName,
      setId,
      setNumber,
    });
  };

  const handleSaveRestTimeToSet = (actualElapsedSeconds: number) => {
    if (!session) {
      setRestTimerState((prev) => ({ ...prev, isOpen: false }));
      return;
    }
    const targetSetId = restTimerState.setId;
    if (!targetSetId || actualElapsedSeconds <= 0) {
      setRestTimerState((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const updatedExercises = session.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => {
        if (s.id === targetSetId) {
          return { ...s, restSeconds: actualElapsedSeconds };
        }
        return s;
      }),
    }));

    const updated = {
      ...session,
      durationSeconds: getLatestDuration(),
      exercises: updatedExercises,
    };
    setSession(updated);
    saveActiveSession(updated);

    setRestTimerState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCompleteWorkout = () => {
    if (!session) return;
    if (session.exercises.length === 0) {
      if (!window.confirm('등록된 운동 종목이 없습니다. 그래도 운동을 완료하시겠습니까?')) {
        return;
      }
    }

    soundManager.playSuccessSound();
    const finalDuration = getLatestDuration();

    const finalSession: WorkoutSession = {
      ...session,
      durationSeconds: finalDuration,
      completed: true,
      endTime: new Date().toISOString(),
      overallRpe: calculateAverageRPE(session) || undefined,
    };

    const history = loadSavedSessions();
    saveSessions([finalSession, ...history]);
    saveActiveSession(null);
    setSession(null);

    const mins = Math.floor(finalDuration / 60);
    const secs = finalDuration % 60;
    const timeStr = `${mins > 0 ? `${mins}분 ` : ''}${secs}초`;

    alert(`🎉 오늘 운동 완료!\n⏱️ 총 운동 시간: ${timeStr}\n총 볼륨: ${calculateSessionVolume(finalSession).toLocaleString()}kg\n총 횟수: ${calculateSessionReps(finalSession)}회\n기록이 성공적으로 저장되었습니다.`);

    if (onWorkoutCompleted) {
      onWorkoutCompleted();
    }
  };

  const savedCount = useMemo(() => loadSavedSessions().length, [session]);

  // ==========================================
  // 1. 대기 화면 (Session === null)
  // ==========================================
  if (!session) {
    const todayDateFormatted = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });

    return (
      <div className="pb-32 max-w-lg mx-auto px-4 space-y-4 animate-fade-in">
        {/* 상단 날짜 및 상태 카드 */}
        <div className="pt-2 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-full text-xs font-semibold text-gray-500 shadow-xs">
            <Calendar size={13} className="text-[#FF2D55]" />
            {todayDateFormatted}
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#1D1D1F] dark:text-white">
            오늘의 운동 시작하기
          </h2>
          <p className="text-xs text-gray-400">
            오늘 운동할 부위를 선택하면 첫 운동 추가 시 해당 부위가 자동 추천됩니다.
          </p>
        </div>

        {/* 1. 운동 부위 다중 선택 카드 */}
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
              <Target size={14} className="text-[#FF2D55]" />
              오늘의 목표 부위 (다중 선택)
            </span>
            <span className="text-[11px] font-bold text-[#007AFF]">
              {selectedPartIds.length}개 선택됨
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {TARGET_BODY_PARTS.map((part) => {
              const isSelected = selectedPartIds.includes(part.id);
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => handleTogglePart(part.id)}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all duration-150 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1D1D1F] to-[#2C2C2E] dark:from-white dark:to-gray-100 text-white dark:text-black shadow-md scale-102 ring-2 ring-[#FF2D55]/30'
                      : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C] border border-transparent'
                  }`}
                >
                  <span className="text-xl leading-none">{part.icon}</span>
                  <span className="text-xs font-black tracking-tight">{part.label}</span>
                </button>
              );
            })}
          </div>

          {/* 선택 부위 설명 배지 */}
          <div className="p-2.5 bg-[#F2F2F7] dark:bg-[#252528] rounded-xl text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Sparkles size={14} className="text-[#FF9500] shrink-0" />
            <span>
              <strong className="text-[#1D1D1F] dark:text-white">
                {selectedPartIds.map((id) => TARGET_BODY_PARTS.find((p) => p.id === id)?.label).join(', ')}
              </strong>
              {selectedPartIds.length > 0 ? ' 부위가 첫 운동 라이브러리 탭에 최우선 노출됩니다.' : '부위를 선택해 주세요.'}
            </span>
          </div>
        </div>

        {/* 2. 세션 설정 카드 (제목, 컨디션, 디로딩) */}
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3.5">
          <div>
            <label className="block text-xs font-black text-gray-400 mb-1.5">
              루틴 이름 (자동 생성 또는 직접 입력)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={recommendedTitle}
              className="w-full bg-[#F2F2F7] dark:bg-[#252528] text-sm font-bold text-[#1D1D1F] dark:text-white px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] outline-none transition"
            />
          </div>

          {/* 컨디션 이모지 선택 */}
          <div>
            <label className="block text-xs font-black text-gray-400 mb-1.5">
              오늘의 컨디션
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => setIdleCondition(opt.emoji)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    idleCondition === opt.emoji
                      ? 'bg-[#FF2D55] text-white shadow-xs'
                      : 'bg-[#F2F2F7] dark:bg-[#252528] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333336]'
                  }`}
                >
                  <span className="text-base leading-none">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 디로딩 토글 */}
          <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5">
            <div>
              <span className="text-xs font-bold text-[#1D1D1F] dark:text-white block">
                디로딩 주간 (저강도 회복 훈련)
              </span>
              <span className="text-[11px] text-gray-400">
                피로 누적 방지 및 근신경계 회복을 위한 감량 세션
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIdleDeload(!idleDeload)}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                idleDeload ? 'bg-[#007AFF]' : 'bg-gray-300 dark:bg-gray-700'
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

        {/* 3. 대형 운동 시작 CTA 버튼 */}
        <div className="pt-2 pb-1">
          <button
            type="button"
            onClick={handleStartWorkout}
            className="w-full py-5 bg-gradient-to-r from-[#FF2D55] to-[#FF375F] hover:opacity-95 text-white rounded-2xl text-[17px] font-black flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/30 transition active:scale-98"
          >
            <Flame size={22} className="fill-white" />
            <span>새 운동 시작하기 ({recommendedTitle})</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* 안내 카드 & 샘플 데이터 옵션 */}
        <div className="p-3.5 bg-white/60 dark:bg-[#1C1C1E]/60 rounded-2xl border border-black/5 dark:border-white/5 text-center text-xs text-gray-400 space-y-1">
          <p>
            저장된 운동 일지: <strong className="text-gray-700 dark:text-gray-300">{savedCount}개</strong> · 하단 [기록 조회] 탭에서 이전 기록을 수정/삭제하거나 AI 마크다운으로 내보낼 수 있습니다.
          </p>
          {savedCount === 0 && (
            <button
              type="button"
              onClick={() => {
                loadSampleDataForDemo();
                alert('체험용 샘플 운동 일지가 불러와졌습니다. [기록 조회] 탭에서 확인해 보세요!');
                window.location.reload();
              }}
              className="text-[#007AFF] hover:underline font-bold mt-1 inline-block"
            >
              체험용 샘플 기록 불러오기
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. 활성 운동 화면 (Session !== null)
  // ==========================================
  const totalVolume = calculateSessionVolume(session);
  const totalReps = calculateSessionReps(session);
  const avgRpe = calculateAverageRPE(session);
  const sessionSets = session.exercises.flatMap(exercise => exercise.sets);
  const completedSetCount = sessionSets.filter(set => set.completed).length;

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4 animate-fade-in">
      {/* 상단 액션 바: 세션 정보 & 일지 & 취소 (타이머는 최상단 글로벌 헤더 시계로 일원화) */}
      <div className="flex items-center justify-between pt-1 px-1">
        <div>
          <h3 className="text-base font-black text-[#1D1D1F] dark:text-white">
            {session.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-gray-400">
              {session.date} 진행 중
            </span>
            {session.targetPartIds && session.targetPartIds.length > 0 && (
              <div className="flex items-center gap-1">
                {session.targetPartIds.map((id) => {
                  const opt = TARGET_BODY_PARTS.find((p) => p.id === id);
                  if (!opt) return null;
                  return (
                    <span
                      key={id}
                      className="px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-bold"
                    >
                      {opt.label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 일지, 디로딩, 운동 취소 버튼 */}
        <div className="flex items-center gap-1.5">
          {session.isDeload && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
              <Sparkles size={12} />
              디로딩
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
            <span className="text-base leading-none">{session.conditionEmoji || '💪'}</span>
            <span>{session.notes ? '일지 작성됨' : '일지'}</span>
          </button>

          <button
            type="button"
            onClick={handleCancelWorkout}
            className="p-1.5 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-full text-xs font-bold text-gray-400 hover:text-red-500 transition shadow-xs active:scale-95"
            title="운동 취소"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 한 줄 진행 요약. 세부 통계는 필요한 때만 펼친다. */}
      <div className="rounded-xl bg-white dark:bg-[#1C1C1E] overflow-hidden">
        <button type="button" aria-label="운동 통계 상세" aria-expanded={showSessionStats} onClick={() => setShowSessionStats(!showSessionStats)} className="w-full px-3 min-h-[40px] flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span><strong className="text-[#1D1D1F] dark:text-white">{session.exercises.length}</strong> 종목</span>
          <span><strong className="text-[#FF2D55]">{completedSetCount}/{sessionSets.length}</strong> 세트 완료</span>
          <span className="flex items-center gap-1"><strong className="text-[#1D1D1F] dark:text-white">{totalVolume.toLocaleString()}</strong> kg <span aria-hidden="true">{showSessionStats ? '⌃' : '⌄'}</span></span>
        </button>
        {showSessionStats && <div className="px-3 py-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><span>총 횟수 <strong>{totalReps}회</strong></span><span>평균 RPE <strong>{avgRpe || '-'}</strong></span></div>}
        <div role="progressbar" aria-label="세트 완료율" aria-valuemin={0} aria-valuemax={sessionSets.length || 1} aria-valuenow={completedSetCount} className="h-0.5 bg-black/5 dark:bg-white/5">
          <div className="h-full bg-[#34C759] transition-[width] duration-300" style={{width: `${sessionSets.length ? completedSetCount / sessionSets.length * 100 : 0}%`}} />
        </div>
      </div>

      {/* 운동 종목 리스트 */}
      {session.exercises.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-500">운동 {session.exercises.length}종목</span>
          <div className="flex gap-3 text-gray-500 dark:text-gray-400 font-semibold">
            <button type="button" className="min-h-[32px]" onClick={() => setCollapsedExerciseIds(new Set(session.exercises.map(item => item.id)))}>모두 접기</button>
            <button type="button" className="min-h-[32px]" onClick={() => setCollapsedExerciseIds(new Set())}>모두 펼치기</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {session.exercises.length === 0 ? (
          <div className="py-14 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-6 space-y-3">
            <Dumbbell size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                아직 등록된 운동 종목이 없습니다.
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                아래 버튼을 눌러 첫 종목을 라이브러리에서 추가해 보세요.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearFocusAndSelection();
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={15} />
              첫 운동 종목 추가하기
            </button>
          </div>
        ) : (
          session.exercises.map((item, idx) => (
            <ExerciseCard
              key={item.id}
              exerciseItem={item}
              collapsed={collapsedExerciseIds.has(item.id)}
              onToggleCollapsed={() => setCollapsedExerciseIds(previous => {
                const next = new Set(previous);
                if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                return next;
              })}
              weightUnit={item.weightUnit || 'kg'}
              onUpdate={(updated) => handleUpdateExercise(idx, updated)}
              onDelete={() => handleDeleteExercise(idx)}
              onTriggerRestTimer={(exName, setId, setNum) => handleTriggerRestTimer(exName, setId, setNum)}
              onOpenRpeGuide={() => setIsRpeGuideOpen(true)}
              onOpenGroupModal={() => setGroupModalTarget(item)}
              onUnlinkGroup={() => handleUnlinkExercise(item.id)}
              isDark={isDark}
            />
          ))
        )}
      </div>

      {/* 액션 버튼들 */}
      <div className="pt-2 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full min-h-[44px] text-sm font-bold text-[#FF2D55] hover:bg-[#FF2D55]/5 rounded-xl flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Plus size={18} />
          운동 종목 추가하기
        </button>

        <button
          type="button"
          onClick={handleCompleteWorkout}
          className="w-full mt-3 py-3 bg-[#FF2D55] hover:opacity-95 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition active:scale-98"
        >
          <CheckCircle2 size={18} />
          오늘 운동 완료 & 기록 저장
        </button>
      </div>

      {/* 대형 원형 스마트 휴식 타이머 모달 */}
      <RestTimerModal
        isOpen={restTimerState.isOpen}
        initialSeconds={90}
        exerciseName={restTimerState.exerciseName}
        setNumber={restTimerState.setNumber}
        onClose={handleSaveRestTimeToSet}
        onFinishAndSave={handleSaveRestTimeToSet}
      />

      {/* 운동 추가 모달 (오늘 선택한 부위 자동 우선 추천 연동) */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddExercise}
        targetCategories={session.targetCategories}
        targetPartIds={session.targetPartIds}
      />

      {/* 세션 메모 및 이모지 모달 */}
      <SessionNotesModal
        isOpen={isNotesModalOpen}
        initialNotes={session.notes}
        initialEmoji={session.conditionEmoji}
        isDeload={session.isDeload}
        onClose={() => setIsNotesModalOpen(false)}
        onSave={(notes, emoji, isDeload) => {
          const updated = { ...session, notes, conditionEmoji: emoji, isDeload };
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

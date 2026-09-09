import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Plus, CheckCircle2, Clock, FileText, Dumbbell, Sparkles 
} from 'lucide-react';
import { WorkoutSession, WorkoutExercise, Exercise, EquipmentType } from '../../types/workout';
import { ExerciseCard } from './ExerciseCard';
import { AddExerciseModal } from './AddExerciseModal';
import { SessionNotesModal } from './SessionNotesModal';
import { RpeGuideModal } from './RpeGuideModal';
import { RestTimerModal } from './RestTimerModal';
import { calculateSessionVolume, calculateSessionReps, calculateAverageRPE } from '../../utils/calculations';
import { saveActiveSession, loadActiveSession, saveSessions, loadSavedSessions } from '../../utils/storage';
import { soundManager } from '../../utils/audio';

interface WorkoutLoggerProps {
  onWorkoutCompleted?: () => void;
  isDark?: boolean;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({ onWorkoutCompleted, isDark = false }) => {
  const [session, setSession] = useState<WorkoutSession>(() => {
    const saved = loadActiveSession();
    if (saved) return saved;

    const todayStr = new Date().toISOString().split('T')[0];
    return {
      id: 'session-' + Date.now(),
      title: '오늘의 운동',
      date: todayStr,
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      exercises: [
        {
          id: 'item-1',
          exerciseId: 'deadlift-sumo',
          equipmentType: 'barbell',
          sets: [
            { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.0, previousWeight: 60, previousReps: 10, restSeconds: 60 },
            { id: 's2', setNumber: 2, weight: 100, reps: 6, completed: true, rpe: 8.5, previousWeight: 100, previousReps: 6, restSeconds: 90 },
            { id: 's3', setNumber: 3, weight: 140, reps: 3, completed: false, rpe: 9.0, previousWeight: 140, previousReps: 3 }
          ]
        }
      ],
      completed: false,
      conditionEmoji: '💪',
      isDeload: false,
      notes: ''
    };
  });

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState<boolean>(false);
  const [isRpeGuideOpen, setIsRpeGuideOpen] = useState<boolean>(false);

  // 대형 원형 타이머 상태
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

  // 운동 시간 타이머
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !session.completed) {
      interval = setInterval(() => {
        setSession((prev) => {
          const updated = { ...prev, durationSeconds: prev.durationSeconds + 1 };
          saveActiveSession(updated);
          return updated;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, session.completed]);

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

  const handleAddExercise = (exercise: Exercise, equipmentType: EquipmentType, brand?: string) => {
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
      equipmentType,
      machineBrand: brand,
      sets: initialSets,
    };

    const updated = { ...session, exercises: [...session.exercises, newExerciseItem] };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleUpdateExercise = (index: number, updatedItem: WorkoutExercise) => {
    const newExercises = [...session.exercises];
    newExercises[index] = updatedItem;
    const updated = { ...session, exercises: newExercises };
    setSession(updated);
    saveActiveSession(updated);
  };

  const handleDeleteExercise = (index: number) => {
    const newExercises = session.exercises.filter((_, i) => i !== index);
    const updated = { ...session, exercises: newExercises };
    setSession(updated);
    saveActiveSession(updated);
  };

  // 세트 완료 시 타이머 열기
  const handleTriggerRestTimer = (exerciseName: string, setId: string, setNumber: number) => {
    setRestTimerState({
      isOpen: true,
      exerciseName,
      setId,
      setNumber,
    });
  };

  // 타이머 종료 또는 닫았을 때: 실제로 쉰 시간을 해당 세트에 기록 (사용자 핵심 요구)
  const handleSaveRestTimeToSet = (actualElapsedSeconds: number) => {
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

    const updated = { ...session, exercises: updatedExercises };
    setSession(updated);
    saveActiveSession(updated);

    setRestTimerState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCompleteWorkout = () => {
    soundManager.playSuccessSound();
    const finalSession: WorkoutSession = {
      ...session,
      completed: true,
      endTime: new Date().toISOString(),
      overallRpe: calculateAverageRPE(session) || undefined,
    };

    const history = loadSavedSessions();
    saveSessions([finalSession, ...history]);
    saveActiveSession(null);

    alert(`🎉 오늘 운동 완료!\n총 볼륨: ${calculateSessionVolume(finalSession).toLocaleString()}kg\n총 횟수: ${calculateSessionReps(finalSession)}회\n기록이 성공적으로 저장되었습니다.`);

    if (onWorkoutCompleted) {
      onWorkoutCompleted();
    }
  };

  const totalVolume = calculateSessionVolume(session);
  const totalReps = calculateSessionReps(session);
  const avgRpe = calculateAverageRPE(session);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 상단 애플 스타일 상태 바 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1E] px-3.5 py-1.5 rounded-full border border-black/5 dark:border-white/10 shadow-xs">
            <Clock size={15} className="text-[#FF2D55]" />
            <span className="text-sm font-black font-mono tracking-tight text-[#1D1D1F] dark:text-white">
              {formatTimer(session.durationSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-2 bg-white dark:bg-[#1C1C1E] rounded-full border border-black/5 dark:border-white/10 text-gray-500 hover:text-black dark:hover:text-white transition shadow-xs"
            title={isTimerRunning ? '일시 정지' : '계속 진행'}
          >
            {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {session.isDeload && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center gap-1">
              <Sparkles size={12} />
              디로딩
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsNotesModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 rounded-full text-xs font-bold text-gray-700 dark:text-gray-200 transition shadow-xs"
          >
            <span className="text-base leading-none">{session.conditionEmoji || '💪'}</span>
            <span>{session.notes ? '일지 작성됨' : '운동 일지'}</span>
          </button>
        </div>
      </div>

      {/* 세션 통계 카드 (애플 미니멀 룩) */}
      <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] text-gray-400 font-semibold block mb-0.5">총 볼륨</span>
            <span className="text-xl font-black tracking-tight text-[#1D1D1F] dark:text-white">
              {totalVolume.toLocaleString()} <span className="text-xs font-normal text-gray-400">kg</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-semibold block mb-0.5">총 횟수</span>
            <span className="text-xl font-black tracking-tight text-[#1D1D1F] dark:text-white">
              {totalReps} <span className="text-xs font-normal text-gray-400">회</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-semibold block mb-0.5">평균 RPE</span>
            <span className="text-xl font-black tracking-tight text-[#FF9500]">
              {avgRpe ? `${avgRpe}` : '-'} <span className="text-xs font-normal text-gray-400">점</span>
            </span>
          </div>
        </div>
      </div>

      {/* 운동 리스트 */}
      <div className="space-y-4">
        {session.exercises.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-[#1C1C1E] rounded-3xl border border-dashed border-black/10 dark:border-white/10 p-6">
            <Dumbbell size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">등록된 운동이 없습니다.</p>
            <p className="text-xs text-gray-400 mt-1">아래 버튼을 눌러 운동을 추가해 보세요.</p>
          </div>
        ) : (
          session.exercises.map((item, idx) => (
            <ExerciseCard
              key={item.id}
              exerciseItem={item}
              onUpdate={(updated) => handleUpdateExercise(idx, updated)}
              onDelete={() => handleDeleteExercise(idx)}
              onTriggerRestTimer={(exName, setId, setNum) => handleTriggerRestTimer(exName, setId, setNum)}
              onOpenRpeGuide={() => setIsRpeGuideOpen(true)}
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
          className="w-full py-4 bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-[#252528] border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold text-[#007AFF] flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
        >
          <Plus size={18} />
          운동 종목 추가하기 (80+ 라이브러리)
        </button>

        <button
          type="button"
          onClick={handleCompleteWorkout}
          className="w-full py-4 bg-[#FF2D55] hover:opacity-95 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-red-500/20 transition active:scale-98"
        >
          <CheckCircle2 size={18} />
          오늘 운동 완료 & 기록 저장
        </button>
      </div>

      {/* 사용자가 요청한 대형 원형 스마트 타이머 모달 */}
      <RestTimerModal
        isOpen={restTimerState.isOpen}
        initialSeconds={90}
        exerciseName={restTimerState.exerciseName}
        setNumber={restTimerState.setNumber}
        onClose={handleSaveRestTimeToSet}
        onFinishAndSave={handleSaveRestTimeToSet}
      />

      <AddExerciseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelect={handleAddExercise}
      />

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

      <RpeGuideModal
        isOpen={isRpeGuideOpen}
        onClose={() => setIsRpeGuideOpen(false)}
      />
    </div>
  );
};

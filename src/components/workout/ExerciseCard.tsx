import React, { useState } from 'react';
import { 
  Trash2, Plus, Dumbbell, Shield, HelpCircle, 
  Settings2, Trophy, Eye, Sparkles 
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet, Exercise, POPULAR_MACHINE_BRANDS, EquipmentType } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { SetRow } from './SetRow';
import { getExerciseRecords } from '../../utils/calculations';
import { HumanMuscle3DViewer } from '../3d/HumanMuscle3DViewer';

interface ExerciseCardProps {
  exerciseItem: WorkoutExercise;
  onUpdate: (updated: WorkoutExercise) => void;
  onDelete: () => void;
  onTriggerRestTimer: (exerciseName: string, setId: string, setNumber: number) => void;
  onOpenRpeGuide: () => void;
  isDark?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseItem,
  onUpdate,
  onDelete,
  onTriggerRestTimer,
  onOpenRpeGuide,
  isDark = false,
}) => {
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [showMachineSetting, setShowMachineSetting] = useState(false);

  const baseExercise: Exercise | undefined = EXERCISES_DATABASE.find(
    (e) => e.id === exerciseItem.exerciseId
  );

  const exerciseName = baseExercise?.name || '운동 종목';
  const exerciseNameEn = baseExercise?.nameEn || '';

  const records = getExerciseRecords(exerciseItem.sets);

  const handleAddSet = () => {
    const lastSet = exerciseItem.sets[exerciseItem.sets.length - 1];
    const newSet: WorkoutSet = {
      id: 'set-' + Date.now(),
      setNumber: exerciseItem.sets.length + 1,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
      rpe: lastSet?.rpe,
      tempo: lastSet?.tempo,
      previousWeight: lastSet?.weight,
      previousReps: lastSet?.reps
    };
    onUpdate({
      ...exerciseItem,
      sets: [...exerciseItem.sets, newSet],
    });
  };

  const handleUpdateSet = (index: number, updatedSet: WorkoutSet) => {
    const newSets = [...exerciseItem.sets];
    newSets[index] = updatedSet;
    onUpdate({
      ...exerciseItem,
      sets: newSets,
    });
  };

  const handleDeleteSet = (index: number) => {
    const newSets = exerciseItem.sets.filter((_, i) => i !== index).map((s, i) => ({
      ...s,
      setNumber: i + 1,
    }));
    onUpdate({
      ...exerciseItem,
      sets: newSets,
    });
  };

  const handleEquipmentChange = (eq: EquipmentType) => {
    onUpdate({
      ...exerciseItem,
      equipmentType: eq,
      machineBrand: eq === 'machine' ? (exerciseItem.machineBrand || baseExercise?.defaultBrand || 'Hammer Strength (해머 스트렝스)') : undefined
    });
  };

  const handleBrandSelect = (val: string) => {
    if (val === '기타 (직접 입력)') {
      setIsCustomBrand(true);
      onUpdate({ ...exerciseItem, machineBrand: '' });
    } else {
      setIsCustomBrand(false);
      onUpdate({ ...exerciseItem, machineBrand: val });
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{exerciseName}</h3>
            {/* 세련된 애플 세그먼트 컨트롤 */}
            <div className="flex items-center bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-xl p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => handleEquipmentChange('barbell')}
                className={`px-2.5 py-0.5 rounded-lg transition-all ${
                  exerciseItem.equipmentType !== 'machine' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-sm' : 'text-gray-400'
                }`}
              >
                프리
              </button>
              <button
                type="button"
                onClick={() => handleEquipmentChange('machine')}
                className={`px-2.5 py-0.5 rounded-lg transition-all ${
                  exerciseItem.equipmentType === 'machine' ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-sm' : 'text-gray-400'
                }`}
              >
                머신
              </button>
            </div>
          </div>
          <span className="text-xs text-gray-400">{exerciseNameEn}</span>
        </div>

        {/* 3D 근육 뷰어 토글 & 삭제 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShow3DViewer(!show3DViewer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              show3DViewer
                ? 'bg-[#FF2D55]/15 text-[#FF2D55]'
                : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-black/10'
            }`}
          >
            <Eye size={14} className={show3DViewer ? 'text-[#FF2D55]' : 'text-gray-400'} />
            3D 해부도
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 rounded-xl transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* 머신 선택 시 브랜드 & 세팅 바 */}
      {exerciseItem.equipmentType === 'machine' && (
        <div className="px-4 py-2.5 bg-[#F9F9FB] dark:bg-[#18181A] border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold">
            <Settings2 size={14} className="text-[#FF9500]" />
            <span>머신 브랜드:</span>
          </div>

          {!isCustomBrand ? (
            <select
              value={exerciseItem.machineBrand || ''}
              onChange={(e) => handleBrandSelect(e.target.value)}
              className="bg-white dark:bg-[#2C2C2E] text-[#FF9500] font-bold rounded-xl px-2.5 py-1 text-xs border border-black/10 dark:border-white/10 outline-none cursor-pointer"
            >
              {POPULAR_MACHINE_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={exerciseItem.machineBrand || ''}
                placeholder="머신 브랜드 직접 입력"
                onChange={(e) => onUpdate({ ...exerciseItem, machineBrand: e.target.value })}
                className="bg-white dark:bg-[#2C2C2E] text-[#FF9500] font-bold rounded-xl px-2.5 py-1 text-xs border border-black/10 dark:border-white/10 w-40 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsCustomBrand(false)}
                className="text-[11px] text-gray-400 hover:underline"
              >
                목록 선택
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowMachineSetting(!showMachineSetting)}
            className="text-[11px] text-gray-400 hover:text-[#007AFF] underline ml-auto"
          >
            {exerciseItem.machineSetting ? `세팅: ${exerciseItem.machineSetting}` : '+ 세팅(의자높이 등)'}
          </button>

          {showMachineSetting && (
            <div className="w-full mt-1">
              <input
                type="text"
                value={exerciseItem.machineSetting || ''}
                placeholder="예: 의자 4단, 발판 중간, 등받이 각도 2단계"
                onChange={(e) => onUpdate({ ...exerciseItem, machineSetting: e.target.value })}
                className="w-full bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-200 rounded-xl px-3 py-1.5 text-xs border border-black/10 dark:border-white/10 outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* 3D 해부학 모델 인라인 펼침 */}
      {show3DViewer && (
        <div className="p-3 bg-[#F2F2F7] dark:bg-[#151516] border-b border-black/5 dark:border-white/5">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#FF2D55]" />
              해부학적 타겟 근육
            </span>
            <span className="text-[11px] text-gray-400">드래그하여 360° 회전</span>
          </div>
          <HumanMuscle3DViewer
            primaryMuscles={baseExercise?.primaryMuscles || []}
            secondaryMuscles={baseExercise?.secondaryMuscles || []}
            height="260px"
            isDark={isDark}
          />
        </div>
      )}

      {/* 세트 테이블 헤더 */}
      <div className="p-3.5">
        <div className="flex items-center gap-2.5 px-2 py-1 text-[11px] font-bold text-gray-400">
          <span className="w-6 text-center">세트</span>
          <span className="w-16 text-center">지난기록</span>
          <span className="flex-1 text-center">무게</span>
          <span className="flex-1 text-center">랩</span>
          <span className="w-16 text-center flex items-center justify-center gap-0.5">
            RPE
            <button type="button" onClick={onOpenRpeGuide} className="text-amber-500 hover:opacity-80">
              <HelpCircle size={11} />
            </button>
          </span>
          <span className="w-14 text-center">옵션</span>
          <span className="w-9 text-center">완료</span>
          <span className="w-4"></span>
        </div>

        {/* 세트 목록 */}
        <div className="space-y-2 mt-1">
          {exerciseItem.sets.map((set, idx) => (
            <SetRow
              key={set.id}
              set={set}
              index={idx}
              onUpdate={(updated) => handleUpdateSet(idx, updated)}
              onDelete={() => handleDeleteSet(idx)}
              onCompleteToggle={(completed, setId, setNum) => {
                if (completed) onTriggerRestTimer(exerciseName, setId, setNum);
              }}
              onOpenRpeGuide={onOpenRpeGuide}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddSet}
          className="w-full mt-3 py-2.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-1.5"
        >
          <Plus size={15} />
          세트 추가
        </button>
      </div>

      {/* 최고 기록 하단 카드 (미니멀 애플 스타일) */}
      <div className="px-4 py-3 bg-[#FAFAFC] dark:bg-[#18181A] border-t border-black/5 dark:border-white/5">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-white dark:bg-[#222224] shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold block">추정 1RM</span>
            <span className="text-sm font-black text-[#FF2D55]">{records.max1RM} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
          </div>

          <div className="p-2 rounded-2xl bg-white dark:bg-[#222224] shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold block">1세트 최고볼륨</span>
            <span className="text-sm font-black text-[#FF9500]">{records.maxSetVolume} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
          </div>

          <div className="p-2 rounded-2xl bg-white dark:bg-[#222224] shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold block">최대 중량</span>
            <span className="text-sm font-black text-[#1D1D1F] dark:text-white">{records.maxWeight} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
          </div>

          <div className="p-2 rounded-2xl bg-white dark:bg-[#222224] shadow-xs">
            <span className="text-[10px] text-gray-400 font-bold block">총 볼륨</span>
            <span className="text-sm font-black text-[#34C759]">{records.totalVolume} <span className="text-[10px] font-normal text-gray-400">kg</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

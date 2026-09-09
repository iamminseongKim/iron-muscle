import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Dumbbell, Shield, HelpCircle, 
  Settings2, Trophy, Eye, Sparkles, Link2, Unlink, Zap, Flame 
} from 'lucide-react';
import { WorkoutExercise, WorkoutSet, Exercise, POPULAR_MACHINE_BRANDS, EquipmentType, WeightUnit } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { SetRow } from './SetRow';
import { getExerciseRecords } from '../../utils/calculations';
import { AnatomyDualViewer } from '../3d/AnatomyDualViewer';
import { HumanMuscle3DViewer } from '../3d/HumanMuscle3DViewer';
import { resolveExercise } from '../../utils/exerciseResolver';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';

interface ExerciseCardProps {
  exerciseItem: WorkoutExercise;
  weightUnit?: WeightUnit;
  onToggleWeightUnit?: () => void;
  onUpdate: (updated: WorkoutExercise) => void;
  onDelete: () => void;
  onTriggerRestTimer: (exerciseName: string, setId: string, setNumber: number) => void;
  onOpenRpeGuide: () => void;
  onOpenGroupModal?: () => void;
  onUnlinkGroup?: () => void;
  isDark?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exerciseItem,
  weightUnit = 'kg',
  onToggleWeightUnit,
  onUpdate,
  onDelete,
  onTriggerRestTimer,
  onOpenRpeGuide,
  onOpenGroupModal,
  onUnlinkGroup,
  isDark = false,
}) => {
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [viewerMode, setViewerMode] = useState<'dual' | '3d' | 'photos'>('dual');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [showMachineSetting, setShowMachineSetting] = useState(false);

  // 안전한 종목 해석 (구버전 ID 및 오타 자동 복구)
  const baseExercise: Exercise = resolveExercise(exerciseItem.exerciseId);
  const exerciseName = baseExercise.name;
  const exerciseNameEn = baseExercise.nameEn || '';

  // ID가 보정된 경우 부모 상태 자동 동기화
  useEffect(() => {
    if (exerciseItem.exerciseId !== baseExercise.id) {
      onUpdate({ ...exerciseItem, exerciseId: baseExercise.id });
    }
  }, [exerciseItem.exerciseId, baseExercise.id]);

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
      previousReps: lastSet?.reps,
      side: lastSet?.side || (exerciseItem.executionMode === 'unilateral' ? 'left' : 'both'),
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
      machineBrand: eq === 'machine' ? (exerciseItem.machineBrand || baseExercise?.defaultBrand || 'Hammer Strength (해머 스트렝스)') : undefined,
      loadType: eq === 'machine' ? (exerciseItem.loadType || 'plate-loaded') : undefined,
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

  const isGrouped = Boolean(exerciseItem.groupId);

  return (
    <div className={`bg-white dark:bg-[#1C1C1E] rounded-3xl border shadow-sm overflow-hidden transition-all ${
      isGrouped
        ? exerciseItem.groupType === 'superset'
          ? 'border-l-4 border-l-[#007AFF] border-black/5 dark:border-white/5'
          : 'border-l-4 border-l-[#FF9500] border-black/5 dark:border-white/5'
        : 'border-black/5 dark:border-white/5'
    }`}>
      {/* 묶음(슈퍼세트/컴파운드세트) 상단 배너 */}
      {isGrouped && (
        <div className={`px-4 py-1.5 flex items-center justify-between text-xs font-black text-white ${
          exerciseItem.groupType === 'superset'
            ? 'bg-gradient-to-r from-[#007AFF] to-[#5856D6]'
            : 'bg-gradient-to-r from-[#FF9500] to-[#FF2D55]'
        }`}>
          <span className="flex items-center gap-1.5 tracking-tight">
            {exerciseItem.groupType === 'superset' ? <Zap size={13} /> : <Flame size={13} />}
            {exerciseItem.groupLabel || (exerciseItem.groupType === 'superset' ? '슈퍼세트' : '컴파운드세트')}
          </span>
          <button
            type="button"
            onClick={onUnlinkGroup}
            className="px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/40 text-[10px] transition flex items-center gap-1"
          >
            <Unlink size={10} />
            묶음 해제
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="p-4 border-b border-black/5 dark:border-white/5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-extrabold text-[#1D1D1F] dark:text-white tracking-tight">{exerciseName}</h3>
            {/* 세련된 애플 세그먼트 컨트롤 (프리 vs 머신) */}
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
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span className="text-xs text-gray-400">{exerciseNameEn}</span>
            {(exerciseItem.equipmentType === 'dumbbell' || baseExercise.equipment === 'dumbbell' || exerciseName.includes('덤벨') || exerciseNameEn.toLowerCase().includes('dumbbell')) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] dark:bg-[#FF9500]/20 text-[10px] font-bold tracking-tight">
                💡 덤벨: 한쪽(편측) 무게 기준
              </span>
            )}
            {((exerciseItem.equipmentType === 'machine' || baseExercise.equipment === 'machine') && (exerciseName.includes('스미스') || exerciseNameEn.toLowerCase().includes('smith'))) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#007AFF]/10 text-[#007AFF] dark:bg-[#007AFF]/20 text-[10px] font-bold tracking-tight">
                💡 스미스머신: 봉 무게 제외 (원판 무게만 기록)
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼: 묶기, 3D 해부도, 삭제 */}
        <div className="flex items-center gap-1.5">
          {onOpenGroupModal && !isGrouped && (
            <button
              type="button"
              onClick={onOpenGroupModal}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-black/10"
              title="다른 종목과 슈퍼세트/컴파운드세트로 묶기"
            >
              <Link2 size={13} className="text-[#007AFF]" />
              <span>묶기</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShow3DViewer(!show3DViewer)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              show3DViewer
                ? 'bg-[#FF2D55]/15 text-[#FF2D55] ring-1 ring-[#FF2D55]/30'
                : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300 hover:bg-black/10'
            }`}
            title="타겟 근육 정밀 해부도 및 3D 회전 모델 보기"
          >
            <Eye size={13} className={show3DViewer ? 'text-[#FF2D55]' : 'text-gray-400'} />
            <span>해부도 & 3D</span>
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

      {/* 🚀 퀵 듀얼 토글 바: [편측성: 투암 ⇋ 원암] & [부하방식: 플레이트 ⇋ 핀로드] */}
      <div className="px-4 py-2 bg-[#F9F9FB] dark:bg-[#18181A] border-b border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* 편측성 토글: 투암 vs 원암 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 font-bold">수행방식:</span>
          <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              onClick={() => onUpdate({ ...exerciseItem, executionMode: 'bilateral' })}
              className={`px-2 py-0.5 rounded-lg transition ${
                (exerciseItem.executionMode || 'bilateral') === 'bilateral'
                  ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              투암 (양측)
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ ...exerciseItem, executionMode: 'unilateral' })}
              className={`px-2 py-0.5 rounded-lg transition ${
                exerciseItem.executionMode === 'unilateral'
                  ? 'bg-[#007AFF] text-white shadow-xs'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              원암 (편측 L/R)
            </button>
          </div>
        </div>

        {/* 부하 방식 토글 (머신일 경우): 플레이트 vs 핀로드 */}
        {exerciseItem.equipmentType === 'machine' && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400 font-bold">부하방식:</span>
            <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-xl text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onUpdate({ ...exerciseItem, loadType: 'plate-loaded' })}
                className={`px-2 py-0.5 rounded-lg transition ${
                  (exerciseItem.loadType || 'plate-loaded') === 'plate-loaded'
                    ? 'bg-[#FF9500] text-white shadow-xs'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                플레이트(원판)
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ ...exerciseItem, loadType: 'pin-loaded' })}
                className={`px-2 py-0.5 rounded-lg transition ${
                  exerciseItem.loadType === 'pin-loaded'
                    ? 'bg-[#34C759] text-white shadow-xs'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                핀머신
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 머신 선택 시 브랜드 & 세팅 바 */}
      {exerciseItem.equipmentType === 'machine' && (
        <div className="px-4 py-2 bg-[#F9F9FB] dark:bg-[#18181A] border-b border-black/5 dark:border-white/5 flex flex-wrap items-center gap-2 text-xs">
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

      {/* 해부학 & 3D 모델 인라인 펼침 */}
      {show3DViewer && (
        <div className="p-3 bg-[#F2F2F7] dark:bg-[#151516] border-b border-black/5 dark:border-white/5 space-y-3">
          {/* 상단 뷰어 스위처: [🩻 정밀 해부도] ⇋ [🔬 3D 회전 모델] */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-[#FF2D55]" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {exerciseName} 자극 부위
              </span>
            </div>
            
            <div className="flex bg-[#E5E5EA] dark:bg-[#2C2C2E] p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewerMode('dual')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  viewerMode === 'dual'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                🩻 정밀 해부도
              </button>
              <button
                type="button"
                onClick={() => setViewerMode('3d')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  viewerMode === '3d'
                    ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                🔬 3D 모델
              </button>
              {baseExercise.images && baseExercise.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => setViewerMode('photos')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    viewerMode === 'photos'
                      ? 'bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xs'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  📸 실물 사진
                </button>
              )}
            </div>
          </div>

          {/* 뷰어 컴포넌트 렌더링 */}
          {viewerMode === 'dual' ? (
            <AnatomyDualViewer
              primaryMuscles={baseExercise.primaryMuscles || []}
              secondaryMuscles={baseExercise.secondaryMuscles || []}
              showFatigueSlider={false}
              isDark={isDark}
            />
          ) : viewerMode === '3d' ? (
            <div className="rounded-3xl overflow-hidden shadow-lg border border-black/5 dark:border-white/10">
              <HumanMuscle3DViewer
                primaryMuscles={baseExercise.primaryMuscles || []}
                secondaryMuscles={baseExercise.secondaryMuscles || []}
                height="320px"
                showControls={true}
                isDark={isDark}
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {baseExercise.images?.slice(0, 2).map((imgUrl, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-[#2C2C2E] border border-black/5 dark:border-white/5 aspect-square flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={`${exerciseName} 동작 ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {i === 0 ? '1. 시작 자세' : '2. 정점 수축'}
                    </span>
                  </div>
                ))}
              </div>
              {baseExercise.instructions && baseExercise.instructions.length > 0 && (
                <div className="p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/5 text-xs space-y-1.5">
                  <span className="font-bold text-gray-700 dark:text-gray-300 block">📋 올바른 운동 순서</span>
                  {baseExercise.instructions.slice(0, 4).map((step, idx) => (
                    <p key={idx} className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-red-500/15 text-[#FF2D55] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 타겟 근육 한국어 안내 */}
          <div className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md rounded-2xl p-2.5 border border-black/5 dark:border-white/5 text-xs space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#FF2D55] shadow-xs shrink-0" />
              <span className="font-bold text-gray-700 dark:text-gray-300">주동근:</span>
              <span className="text-[#FF2D55] font-semibold">
                {baseExercise.primaryMuscles?.map((m) => MUSCLE_INFO_MAP[m]?.nameKo || m).join(', ') || '전신 협응'}
              </span>
            </div>
            {baseExercise.secondaryMuscles && baseExercise.secondaryMuscles.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-[#FF9F0A] shadow-xs shrink-0" />
                <span className="font-bold text-gray-700 dark:text-gray-300">협응근:</span>
                <span className="text-[#FF9F0A] font-semibold">
                  {baseExercise.secondaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo || m).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Set Header */}
      <div className="px-[18px] sm:px-5 pt-3 pb-1.5 flex items-center gap-2 text-[11px] font-bold text-gray-400 border-b border-black/5 dark:border-white/5">
        <span className="w-8 shrink-0 text-center">세트</span>
        <span className="w-16 shrink-0 text-center">이전 기록</span>
        {onToggleWeightUnit ? (
          <button
            type="button"
            onClick={onToggleWeightUnit}
            className="flex-1 text-center font-bold text-[#007AFF] hover:opacity-80 transition flex items-center justify-center gap-1"
            title="클릭하여 kg / lbs 단위 즉시 전환"
          >
            <span>무게 ({weightUnit})</span>
            <span className="text-[9px] font-black px-1 rounded bg-[#007AFF]/10 text-[#007AFF]">전환</span>
          </button>
        ) : (
          <span className="flex-1 text-center font-bold">무게 ({weightUnit})</span>
        )}
        <span className="flex-1 text-center font-bold">횟수</span>
        <span className="w-9 shrink-0 text-center">완료</span>
      </div>

      {/* Sets List */}
      <div className="p-2 space-y-1.5 bg-[#F9F9FB]/50 dark:bg-[#161618]">
        {exerciseItem.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            set={set}
            index={idx}
            executionMode={exerciseItem.executionMode || 'bilateral'}
            weightUnit={weightUnit}
            onUpdate={(updated) => handleUpdateSet(idx, updated)}
            onDelete={() => handleDeleteSet(idx)}
            onCompleteToggle={(_comp, setId, setNum) =>
              onTriggerRestTimer(exerciseName, setId, setNum)
            }
            onOpenRpeGuide={onOpenRpeGuide}
          />
        ))}

        {/* Add Set Button */}
        <button
          type="button"
          onClick={handleAddSet}
          className="w-full py-2.5 mt-1 bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-[#252528] text-xs font-bold text-[#007AFF] rounded-xl flex items-center justify-center gap-1 transition border border-dashed border-black/10 dark:border-white/10 active:scale-98"
        >
          <Plus size={14} />
          <span>세트 추가</span>
        </button>
      </div>

      {/* Card Footer: Records / 1RM Summary */}
      {records.maxWeight > 0 && (
        <div className="px-4 py-2 bg-[#F2F2F7]/50 dark:bg-[#1F1F21] border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5 font-bold">
            <Trophy size={13} className="text-[#FF9500]" />
            <span>최고 중량: {records.maxWeight}{weightUnit}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-[11px]">
            <span>추정 1RM:</span>
            <span className="font-extrabold text-[#007AFF]">{records.max1RM}{weightUnit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

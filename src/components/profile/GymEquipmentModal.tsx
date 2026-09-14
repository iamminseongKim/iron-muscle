import React, { useState, useMemo } from 'react';
import { X, Search, Check, Plus, Sliders, Dumbbell, Trash2, Building2 } from 'lucide-react';
import { t } from '../../i18n';
import { matchesExerciseSearch } from '../../utils/exerciseSearch';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { DISCOVERY_ADDITIONS } from '../../data/discoveryAdditions';
import { ADDITIONAL_MACHINES } from '../../data/additionalMachines';
import { loadCustomExercises } from '../../utils/storage';
import {
  loadGymState,
  saveGymState,
  addGym,
  removeGym,
  MAX_GYMS_COUNT,
  MultiGymState,
  GymEquipmentProfile,
  GymMachineConfig,
  getExerciseConfigs,
} from '../../utils/gymStorage';
import { Category, Exercise, POPULAR_MACHINE_BRANDS, WeightUnit } from '../../types/workout';
import { CreateCustomExerciseModal } from '../workout/CreateCustomExerciseModal';

interface GymEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const CATEGORY_TABS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'chest', label: '가슴' },
  { id: 'back', label: '등' },
  { id: 'legs', label: '하체' },
  { id: 'shoulders', label: '어깨' },
  { id: 'arms', label: '팔' },
  { id: 'core', label: '복근' },
];

export const GymEquipmentModal: React.FC<GymEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [gymState, setGymState] = useState<MultiGymState>(() => loadGymState());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedConfigId, setExpandedConfigId] = useState<string | null>(null);
  const [isAddingNewGym, setIsAddingNewGym] = useState(false);
  const [newGymNameInput, setNewGymNameInput] = useState('');

  // 현재 활성 헬스장 프로필
  const activeGym = useMemo(() => {
    return gymState.gyms.find(g => g.id === gymState.activeGymId) || gymState.gyms[0];
  }, [gymState]);

  // 전체 머신/케이블 운동 목록
  const allMachineExercises = useMemo(() => {
    const custom = loadCustomExercises();
    const all = [...custom, ...DISCOVERY_ADDITIONS, ...ADDITIONAL_MACHINES, ...EXERCISES_DATABASE];
    const map = new Map<string, Exercise>();
    for (const ex of all) {
      if (!map.has(ex.id) && (ex.equipment === 'machine' || ex.equipment === 'cable')) {
        map.set(ex.id, ex);
      }
    }
    return Array.from(map.values());
  }, [isCreateModalOpen]);

  if (!isOpen) return null;

  // 검색 및 카테고리 필터링
  const filteredExercises = allMachineExercises.filter(ex => {
    const matchCat = selectedCategory === 'all' || ex.category === selectedCategory || ex.categories?.includes(selectedCategory);
    if (!matchCat) return false;
    if (!searchQuery.trim()) return true;
    return matchesExerciseSearch(ex, searchQuery);
  });

  const selectedCount = Object.keys(activeGym.machines).length;

  const handleSwitchGym = (gymId: string) => {
    const nextState = { ...gymState, activeGymId: gymId };
    setGymState(nextState);
    saveGymState(nextState);
  };

  const handleAddNewGym = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGymNameInput.trim()) return;
    const created = addGym(newGymNameInput.trim());
    if (created) {
      setGymState(loadGymState());
      setNewGymNameInput('');
      setIsAddingNewGym(false);
    }
  };

  const handleRemoveGym = (gymId: string, gymName: string) => {
    if (gymState.gyms.length <= 1) return;
    if (window.confirm(`'${gymName}' ${t('헬스장을 삭제하시겠습니까?')}`)) {
      removeGym(gymId);
      setGymState(loadGymState());
    }
  };

  const handleUpdateActiveGym = (updates: Partial<GymEquipmentProfile>) => {
    setGymState(prev => {
      const nextGyms = prev.gyms.map(g => (g.id === activeGym.id ? { ...g, ...updates } : g));
      const nextState = { ...prev, gyms: nextGyms };
      saveGymState(nextState);
      return nextState;
    });
  };

  const handleToggleExercise = (exercise: Exercise) => {
    const nextMachines = { ...activeGym.machines };
    if (nextMachines[exercise.id]) {
      delete nextMachines[exercise.id];
      if (expandedConfigId === exercise.id) setExpandedConfigId(null);
    } else {
      nextMachines[exercise.id] = [{
        id: `config-${Date.now()}-1`,
        exerciseId: exercise.id,
        loadType: exercise.loadType === 'plate-loaded' ? 'plate-loaded' : 'pin-loaded',
        weightUnit: 'kg',
      }];
      setExpandedConfigId(exercise.id);
    }
    handleUpdateActiveGym({ machines: nextMachines });
  };

  const handleAddMachineToExercise = (exerciseId: string) => {
    const configs = getExerciseConfigs(activeGym, exerciseId);
    if (configs.length >= 3) return;
    const newConfig: GymMachineConfig = {
      id: `config-${Date.now()}-${configs.length + 1}`,
      exerciseId,
      loadType: 'pin-loaded',
      weightUnit: 'kg',
    };
    const nextConfigs = [...configs, newConfig];
    handleUpdateActiveGym({
      machines: {
        ...activeGym.machines,
        [exerciseId]: nextConfigs,
      },
    });
  };

  const handleRemoveMachineFromExercise = (exerciseId: string, configId: string) => {
    const configs = getExerciseConfigs(activeGym, exerciseId);
    if (configs.length <= 1) return;
    const nextConfigs = configs.filter(c => c.id !== configId);
    handleUpdateActiveGym({
      machines: {
        ...activeGym.machines,
        [exerciseId]: nextConfigs,
      },
    });
  };

  const handleUpdateSingleConfig = (
    exerciseId: string,
    configId: string,
    updates: Partial<GymMachineConfig>
  ) => {
    const configs = getExerciseConfigs(activeGym, exerciseId);
    const nextConfigs = configs.map(c => (c.id === configId ? { ...c, ...updates } : c));
    handleUpdateActiveGym({
      machines: {
        ...activeGym.machines,
        [exerciseId]: nextConfigs,
      },
    });
  };

  const handleSave = () => {
    saveGymState(gymState);
    if (onSaved) onSaved();
    onClose();
  };

  const handleCustomCreated = (newExercise: Exercise) => {
    setIsCreateModalOpen(false);
    handleUpdateActiveGym({
      machines: {
        ...activeGym.machines,
        [newExercise.id]: {
          exerciseId: newExercise.id,
          loadType: newExercise.loadType === 'plate-loaded' ? 'plate-loaded' : 'pin-loaded',
        },
      },
    });
    setExpandedConfigId(newExercise.id);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fade-in"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
        }}
      >
        <div role="dialog" aria-modal="true" className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="shrink-0 p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
                <Dumbbell size={18} className="text-[#0F766E]" />
                {t('내 헬스장 기구 관리')}
              </h3>
              <p className="text-xs text-gray-400">
                {activeGym.name} · {t('등록된 머신')} <span className="font-bold text-[#0F766E] dark:text-[#2DD4BF]">{selectedCount}</span>{t('개')}
              </p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              {t('완료')}
            </button>
          </div>

          {/* 헬스장 탭 (최대 3개 지원) */}
          <div className="shrink-0 px-3 pt-2.5 pb-2 bg-[#F2F2F7] dark:bg-[#252528] border-b border-black/5 dark:border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {gymState.gyms.map((g, idx) => {
                const isActive = g.id === activeGym.id;
                return (
                  <div
                    key={g.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      isActive
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-white dark:bg-[#1C1C1E] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSwitchGym(g.id)}
                      className="flex items-center gap-1"
                    >
                      <Building2 size={13} />
                      <span>{g.name}</span>
                    </button>
                    {gymState.gyms.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveGym(g.id, g.name);
                        }}
                        className={`p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition ${
                          isActive ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'
                        }`}
                        title={t('헬스장 삭제')}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}

              {gymState.gyms.length < MAX_GYMS_COUNT && !isAddingNewGym && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewGym(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1C1C1E] text-[#0F766E] dark:text-[#2DD4BF] border border-dashed border-[#0F766E]/40 hover:bg-[#0F766E]/10 shrink-0 transition"
                >
                  <Plus size={13} strokeWidth={3} />
                  <span>{t('헬스장 추가')} ({gymState.gyms.length}/{MAX_GYMS_COUNT})</span>
                </button>
              )}
            </div>

            {/* 새 헬스장 이름 입력창 */}
            {isAddingNewGym && (
              <form onSubmit={handleAddNewGym} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  autoFocus
                  value={newGymNameInput}
                  onChange={e => setNewGymNameInput(e.target.value)}
                  placeholder={t('새 헬스장 이름 (예: 회사 헬스장, 홈짐)')}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                />
                <button type="submit" className="px-3 py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl shrink-0">
                  {t('추가')}
                </button>
                <button type="button" onClick={() => setIsAddingNewGym(false)} className="px-2.5 py-1.5 bg-gray-200 dark:bg-white/10 text-xs rounded-xl shrink-0">
                  {t('취소')}
                </button>
              </form>
            )}

            {/* 현재 헬스장 세부 설정 (이름 편집 & 프리웨이트 포함 여부) */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={activeGym.name}
                onChange={e => handleUpdateActiveGym({ name: e.target.value })}
                placeholder={t('헬스장 이름')}
                className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-black rounded-xl transition shrink-0"
              >
                <Plus size={13} strokeWidth={3} />
                <span>{t('기구 직접 등록')}</span>
              </button>
            </div>

            <label className="flex items-center justify-between px-1 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
              <span>{t('바벨·덤벨·맨몸 운동 기본 포함')}</span>
              <span className="relative inline-flex w-9 h-5 shrink-0">
                <input
                  type="checkbox"
                  role="switch"
                  checked={activeGym.includeFreeWeights}
                  onChange={e => handleUpdateActiveGym({ includeFreeWeights: e.target.checked })}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-gray-300 dark:bg-white/20 peer-checked:bg-[#0F766E] transition-colors" />
                <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
              </span>
            </label>
          </div>

          {/* 검색 및 부위 필터 탭 */}
          <div className="shrink-0 p-3 border-b border-black/5 dark:border-white/10 space-y-2">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('머신 이름 검색 (예: 풀다운, 체스트 프레스)')}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-[#F2F2F7] dark:bg-[#252528] border border-black/5 dark:border-white/5 text-[#1D1D1F] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORY_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition ${
                    selectedCategory === tab.id
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {t(tab.label)}
                </button>
              ))}
            </div>
          </div>

          {/* 머신 목록 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400">
                {t('검색된 머신이 없습니다.')}
              </div>
            ) : (
              filteredExercises.map(ex => {
                const configs = getExerciseConfigs(activeGym, ex.id);
                const isSelected = configs.length > 0;
                const isExpanded = expandedConfigId === ex.id;

                let settingLabel = t('세팅');
                if (configs.length === 1) {
                  settingLabel = configs[0].brand || t('세팅');
                } else if (configs.length > 1) {
                  settingLabel = `${configs.length}${t('대 등록됨')}`;
                }

                return (
                  <div
                    key={ex.id}
                    className={`rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-[#0F766E]/5 dark:bg-[#0F766E]/10 border-[#0F766E]/30'
                        : 'bg-white dark:bg-[#242426] border-black/5 dark:border-white/5'
                    }`}
                  >
                    <div
                      onClick={() => handleToggleExercise(ex)}
                      className="p-3 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition ${
                            isSelected
                              ? 'bg-[#0F766E] border-[#0F766E] text-white'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E]'
                          }`}
                        >
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1D1D1F] dark:text-white truncate">
                            {t(ex.name)}
                          </p>
                          <p className="text-[10px] text-gray-400 truncate">{ex.nameEn}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setExpandedConfigId(isExpanded ? null : ex.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF] hover:bg-[#0F766E]/20 transition"
                          >
                            <Sliders size={12} />
                            <span>{settingLabel}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 세부 머신 세팅 (최대 3대 지원) */}
                    {isSelected && isExpanded && (
                      <div className="p-3 pt-0 border-t border-[#0F766E]/15 mt-1 space-y-3">
                        {configs.map((cfg, cfgIdx) => (
                          <div
                            key={cfg.id || cfgIdx}
                            className="pt-2.5 space-y-2 border-b border-black/5 dark:border-white/5 pb-2.5 last:border-b-0 last:pb-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-[#0F766E] dark:text-[#2DD4BF]">
                                {t('머신')} {cfgIdx + 1}{cfg.brand ? ` (${cfg.brand})` : ''}
                              </span>
                              {configs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMachineFromExercise(ex.id, cfg.id!)}
                                  className="text-gray-400 hover:text-red-500 p-0.5 rounded transition"
                                  title={t('이 머신 삭제')}
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                                  {t('브랜드')}
                                </label>
                                <select
                                  value={cfg.brand || ''}
                                  onChange={e => handleUpdateSingleConfig(ex.id, cfg.id!, { brand: e.target.value })}
                                  className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                                >
                                  <option value="">{t('브랜드 미지정')}</option>
                                  {POPULAR_MACHINE_BRANDS.map(brand => (
                                    <option key={brand} value={brand}>
                                      {brand}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 block mb-1">
                                  {t('부하 방식')}
                                </label>
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSingleConfig(ex.id, cfg.id!, { loadType: 'pin-loaded' })}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                                      cfg.loadType === 'pin-loaded'
                                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500'
                                    }`}
                                  >
                                    {t('📌 핀 머신')}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateSingleConfig(ex.id, cfg.id!, { loadType: 'plate-loaded' })}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition ${
                                      cfg.loadType === 'plate-loaded'
                                        ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                        : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500'
                                    }`}
                                  >
                                    {t('💿 원판')}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* 핀머신/원판 기본 무게 단위 (kg vs lbs) */}
                            <div className="flex items-center justify-between gap-2 pt-0.5">
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {t('기본 무게 단위')}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSingleConfig(ex.id, cfg.id!, { weightUnit: 'kg' })}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition ${
                                    cfg.weightUnit !== 'lbs'
                                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                      : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500'
                                  }`}
                                >
                                  kg
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateSingleConfig(ex.id, cfg.id!, { weightUnit: 'lbs' })}
                                  className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition ${
                                    cfg.weightUnit === 'lbs'
                                      ? 'bg-[#0F766E] text-white border-[#0F766E]'
                                      : 'bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-white/10 text-gray-500'
                                  }`}
                                >
                                  lbs
                                </button>
                              </div>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={cfg.machineSetting || ''}
                                onChange={e => handleUpdateSingleConfig(ex.id, cfg.id!, { machineSetting: e.target.value })}
                                placeholder={t('의자 높이/각도 메모 (예: 의자 4단, 등받이 2단)')}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white"
                              />
                            </div>
                          </div>
                        ))}

                        {/* 다른 머신 추가 버튼 (최대 3대) */}
                        {configs.length < 3 && (
                          <button
                            type="button"
                            onClick={() => handleAddMachineToExercise(ex.id)}
                            className="w-full py-1.5 bg-white dark:bg-[#1C1C1E] border border-dashed border-[#0F766E]/40 hover:bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF] text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition"
                          >
                            <Plus size={13} strokeWidth={2.5} />
                            <span>{t('다른 머신 추가')} ({configs.length}/3)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 p-3 border-t border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#252528] flex justify-between items-center text-xs">
            <span className="text-gray-500">
              {t('선택된 기구는 운동 추가 시 최상단에 노출됩니다.')}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold rounded-xl transition"
            >
              {t('저장하기')}
            </button>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateCustomExerciseModal
          isOpen={isCreateModalOpen}
          initialCategory={selectedCategory === 'all' ? 'chest' : selectedCategory}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={handleCustomCreated}
        />
      )}
    </>
  );
};

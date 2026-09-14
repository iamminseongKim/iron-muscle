import { displayExercise, displayMuscle, getLanguage as exerciseLanguage } from '../../i18n';
import { t } from '../../i18n';
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Dumbbell, ChevronRight, Plus } from 'lucide-react';
import { Exercise, Category, EquipmentType, LoadType, WeightUnit } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { DISCOVERY_ADDITIONS } from '../../data/discoveryAdditions';
import { ADDITIONAL_MACHINES } from '../../data/additionalMachines';
import { buildExerciseUsage, isCoreExercise, rankExercises } from '../../utils/exerciseDiscovery';
import { loadCustomExercises, loadSavedSessions } from '../../utils/storage';
import { loadGymProfile, GYM_EQUIPMENT_CHANGE_EVENT, GymEquipmentProfile, GymMachineConfig, getExerciseConfigs } from '../../utils/gymStorage';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    exercise: Exercise,
    equipmentType: EquipmentType,
    brand?: string,
    setting?: string,
    loadType?: LoadType,
    weightUnit?: WeightUnit,
    machineConfigId?: string
  ) => void;
  initialCategory?: Category;
  targetCategories?: Category[];
  targetPartIds?: string[];
}

const BASE_CATEGORIES: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'chest', label: '가슴' },
  { id: 'back', label: '등' },
  { id: 'legs', label: '하체' },
  { id: 'shoulders', label: '어깨' },
  { id: 'arms', label: '팔' },
  { id: 'core', label: '복근/코어' },
  { id: 'fullbody', label: '전신' },
];

const EQUIPMENTS: { id: EquipmentType | 'all'; label: string }[] = [
  { id: 'all', label: '모든 장비' },
  { id: 'barbell', label: '바벨' },
  { id: 'dumbbell', label: '덤벨' },
  { id: 'machine', label: '머신' },
  { id: 'cable', label: '케이블' },
  { id: 'bodyweight', label: '맨몸' },
  { id: 'other', label: '기타' },
];

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelect,
  initialCategory,
  targetCategories,
  targetPartIds,
}) => {
  const hasTargets = Boolean(targetCategories && targetCategories.length > 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || (hasTargets ? 'targets' : 'all')
  );
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => loadCustomExercises());
  const [gymProfile, setGymProfile] = useState<GymEquipmentProfile>(() => loadGymProfile());
  const [onlyGymFilter, setOnlyGymFilter] = useState(false);
  const [selectedMultiConfigTarget, setSelectedMultiConfigTarget] = useState<{
    exercise: Exercise;
    configs: GymMachineConfig[];
  } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  useEffect(() => { if (!isOpen) setSelectedMultiConfigTarget(null); }, [isOpen]);
  useEffect(() => { setVisibleCount(50); }, [searchQuery, selectedCategory, selectedEquipment, isOpen, onlyGymFilter]);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [usage, setUsage] = useState(() => buildExerciseUsage(loadSavedSessions()));
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCustomExercises(loadCustomExercises());
      setGymProfile(loadGymProfile());
      setUsage(buildExerciseUsage(loadSavedSessions()));
      setShowAll(false);
      if (initialCategory) {
        setSelectedCategory(initialCategory);
      } else if (hasTargets) {
        setSelectedCategory('targets');
      } else {
        setSelectedCategory('all');
      }
      setFiltersOpen(true);
      setSearchQuery('');
      setSelectedEquipment('all');
    }
  }, [isOpen, initialCategory, hasTargets]);

  // 커스텀 운동 및 헬스장 프로필 변경 이벤트 리스너
  React.useEffect(() => {
    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setCustomExercises(e.detail);
      } else {
        setCustomExercises(loadCustomExercises());
      }
    };
    const handleGymChange = () => setGymProfile(loadGymProfile());
    window.addEventListener('iron_custom_exercises_change', handleCustomChange);
    window.addEventListener(GYM_EQUIPMENT_CHANGE_EVENT, handleGymChange);
    return () => {
      window.removeEventListener('iron_custom_exercises_change', handleCustomChange);
      window.removeEventListener(GYM_EQUIPMENT_CHANGE_EVENT, handleGymChange);
    };
  }, []);

  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!isOpen || isCreateModalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const machineDialog = document.getElementById('machine-picker-title')?.closest('[role="dialog"]');
    if (selectedMultiConfigTarget) machineDialog?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    else closeButtonRef.current?.focus({ preventScroll: true });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); if (selectedMultiConfigTarget) setSelectedMultiConfigTarget(null); else onCloseRef.current(); }
      if (event.key !== 'Tab') return;
      const dialog = document.getElementById(selectedMultiConfigTarget ? 'machine-picker-title' : 'exercise-picker-title')?.closest('[role="dialog"]');
      const nodes = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previousFocus?.focus({ preventScroll: true }); };
  }, [isOpen, isCreateModalOpen, selectedMultiConfigTarget]);


  const getTargetLabels = () => {
    if (!targetCategories) return '';
    return targetCategories
      .map((c) => t(BASE_CATEGORIES.find((b) => b.id === c)?.label || c))
      .filter(Boolean)
      .join(', ');
  };

  const cleanQuery = searchQuery.trim();

  // 커스텀 운동 + 추가 머신 + 디스커버리 추가분 + 기본 DB를 중복 없이 결합
  const allExercises = useMemo(() => {
    const map = new Map<string, Exercise>();
    customExercises.forEach(ex => map.set(ex.id, ex));
    DISCOVERY_ADDITIONS.forEach(ex => { if (!map.has(ex.id)) map.set(ex.id, ex); });
    ADDITIONAL_MACHINES.forEach(ex => { if (!map.has(ex.id)) map.set(ex.id, ex); });
    EXERCISES_DATABASE.forEach(ex => { if (!map.has(ex.id)) map.set(ex.id, ex); });
    return Array.from(map.values());
  }, [customExercises]);

  const gymEquipmentIds = useMemo(() => {
    const ids = new Set<string>();
    Object.keys(gymProfile.machines).forEach(id => {
      if (getExerciseConfigs(gymProfile, id).length > 0) {
        ids.add(id);
      }
    });
    if (gymProfile.includeFreeWeights) {
      allExercises.forEach(ex => {
        if (ex.equipment === 'barbell' || ex.equipment === 'dumbbell' || ex.equipment === 'bodyweight') {
          ids.add(ex.id);
        }
      });
    }
    return ids;
  }, [gymProfile, allExercises]);

  const rankedExercises = useMemo(() => rankExercises(allExercises, cleanQuery, usage, gymEquipmentIds), [allExercises, cleanQuery, usage, gymEquipmentIds]);

  if (!isOpen) return null;
  const filteredByCategory = rankedExercises.filter((ex) => {

    // 2. 카테고리 필터링 (다중 부위 완벽 매핑 및 오늘 목표 부위 필터링)
    let matchCat = false;
    // 검색어가 입력된 경우, 오늘 목표 탭('targets')에 있더라도 전역 검색이 가능하도록 유연하게 매칭
    if (cleanQuery !== '' && selectedCategory === 'targets') {
      matchCat = true;
    } else if (selectedCategory === 'all') {
      matchCat = true;
    } else if (selectedCategory === 'targets') {
      if (targetCategories && targetCategories.length > 0) {
        matchCat = targetCategories.some(
          (tc) => (ex.categories && ex.categories.includes(tc)) || ex.category === tc
        );
        // 세부 부위 (이두 vs 삼두) 세분화 필터
        if (matchCat && targetPartIds && targetPartIds.length > 0 && (ex.category === 'arms' || ex.categories?.includes('arms'))) {
          const wantsBiceps = targetPartIds.includes('biceps');
          const wantsTriceps = targetPartIds.includes('triceps');
          if (wantsBiceps && !wantsTriceps) {
            matchCat = ex.primaryMuscles.includes('biceps') || ex.secondaryMuscles.includes('biceps');
          } else if (wantsTriceps && !wantsBiceps) {
            matchCat = ex.primaryMuscles.includes('triceps') || ex.secondaryMuscles.includes('triceps');
          }
        }
      } else {
        matchCat = true;
      }
    } else {
      matchCat =
        (ex.categories && ex.categories.includes(selectedCategory as Category)) ||
        ex.category === (selectedCategory as Category);
    }

    // 3. 장비 필터링
    const matchEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    // 4. 내 헬스장 전용 필터
    const matchGym = !onlyGymFilter || gymEquipmentIds.has(ex.id);

    return matchCat && matchEquip && matchGym;
  });

  const filteredExercises = filteredByCategory.filter(ex => cleanQuery || showAll || isCoreExercise(ex) || usage.has(ex.id) || ex.id.startsWith('custom_'));

  return (
    <div
      className="exercise-picker keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md animate-fade-in"
      style={{
        paddingTop: 'max(20px, env(safe-area-inset-top, 20px))',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="exercise-picker-title" className="exercise-picker-dialog bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="exercise-picker-header shrink-0 p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 id="exercise-picker-title" className="font-extrabold text-base text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Dumbbell size={18} className="text-[#0F766E]" />
              {t("운동 종목 선택")}
            </h3>
            <p className="exercise-picker-description text-xs text-gray-500 dark:text-gray-300">{t("총")} {allExercises.length}{t("종의 전문 운동 라이브러리")}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] text-xs font-black rounded-xl transition"
            >
              <Plus size={14} strokeWidth={3} />
              <span>{t("직접 등록")}</span>
            </button>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label={t("운동 선택 닫기")}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="shrink-0 p-3 border-b border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#252528] space-y-2.5">
          <form className="relative" onSubmit={(event) => { event.preventDefault(); searchInputRef.current?.blur(); }}>
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              onFocus={() => { if (window.matchMedia("(max-width: 640px)").matches) setFiltersOpen(false); }}
              aria-label={t("운동 검색")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("운동명·브랜드·초성 검색")}
              className="w-full bg-white dark:bg-[#1C1C1E] text-base text-[#1D1D1F] dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl pl-10 pr-16 py-3 border border-black/5 dark:border-white/10 focus:outline-none focus:border-[#0F766E] shadow-xs transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black dark:hover:text-white"
              >
                {t("지우기")}
              </button>
            )}
          </form>

          <button type="button" aria-expanded={filtersOpen} aria-controls="exercise-picker-filters" onClick={() => setFiltersOpen(open => !open)} className="min-h-[36px] text-xs font-semibold text-[#0F766E] dark:text-teal-300">
            {t(filtersOpen ? "필터 접기" : "필터 펼치기")}
            {selectedEquipment !== "all" && ` · ${t(EQUIPMENTS.find(eq => eq.id === selectedEquipment)!.label)}`}
          </button>
          <div id="exercise-picker-filters" hidden={!filtersOpen} className="space-y-2">
          {/* 카테고리 칩 (오늘 목표 부위 우선 노출 및 다중 부위 완벽 매핑) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setOnlyGymFilter(prev => !prev)}
              className={`px-3 py-1.5 rounded-full font-black whitespace-nowrap transition flex items-center gap-1 shrink-0 ${
                onlyGymFilter
                  ? 'bg-[#0F766E] text-white shadow-sm'
                  : 'bg-[#0F766E]/10 text-[#0F766E] dark:text-[#2DD4BF] hover:bg-[#0F766E]/20 border border-[#0F766E]/20'
              }`}
            >
              <span>🏷️ {gymProfile.name || t('내 헬스장')}</span>
              <span className="text-[10px] opacity-90">({Object.keys(gymProfile.machines).length})</span>
            </button>
            {hasTargets && (
              <button
                type="button"
                onClick={() => setSelectedCategory('targets')}
                className={`px-3 py-1.5 rounded-full font-black whitespace-nowrap transition flex items-center gap-1 ${
                  selectedCategory === 'targets'
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20'
                }`}
              >
                <span>{t("🔥 오늘 목표")}</span>
                <span className="text-[10px] opacity-90">({getTargetLabels()})</span>
              </button>
            )}
            {BASE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-black shadow-xs'
                    : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
                }`}
              >
                {t(c.label)}
              </button>
            ))}
          </div>

          {/* 장비 필터 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                type="button"
                aria-pressed={selectedEquipment === eq.id}
                onClick={() => setSelectedEquipment(eq.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition border ${
                  selectedEquipment === eq.id
                    ? 'bg-[#0F766E] text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 border-black/5 dark:border-white/5'
                }`}
              >
                {t(eq.label)}
              </button>
            ))}
          </div>
          </div>
        </div>

        <div className="shrink-0 px-4 py-1 flex items-center justify-between text-xs border-b border-black/5 dark:border-white/10">
          <span role="status" className="text-gray-600 dark:text-gray-300">{cleanQuery ? t(selectedCategory === 'all' || selectedCategory === 'targets' ? '전체 부위 검색' : '검색 결과') : t(showAll ? '전체 종목' : '내 운동·대표 종목')} {filteredExercises.length}{t("개")}</span>
          <button type="button" className="min-h-[36px] text-[#0F766E] font-semibold" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedEquipment('all'); }}>{t("필터 초기화")}</button>
        </div>
        {/* 운동 목록 */}
        <div className="exercise-picker-results min-h-0 p-3 overflow-y-auto overscroll-contain flex-1 space-y-2">
          {!cleanQuery && <button type="button" onClick={() => { setShowAll(value => !value); setVisibleCount(50); }} className="w-full min-h-[40px] rounded-xl text-xs font-semibold text-[#0F766E] dark:text-teal-300 bg-teal-500/10">{t(showAll ? '대표 종목만 보기' : '전체 종목 보기')} ({showAll ? filteredByCategory.filter(ex => isCoreExercise(ex) || usage.has(ex.id) || ex.id.startsWith('custom_')).length : filteredByCategory.length})</button>}
          {cleanQuery && selectedCategory !== 'all' && selectedCategory !== 'targets' && <button type="button" onClick={() => setSelectedCategory('all')} className="w-full min-h-[40px] text-xs text-[#0F766E] dark:text-teal-300">{t('전체 부위에서 찾기')}</button>}
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <p className="text-xs">'{cleanQuery || t('선택한 조건')}'{t("에 맞는 운동을 찾지 못했습니다.")}</p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-black rounded-2xl shadow-md hover:opacity-90 active:scale-98 transition"
              >
                <Plus size={16} strokeWidth={3} />
                <span>'{cleanQuery || t('새 종목')}' {t("직접 등록하기")}</span>
              </button>
            </div>
          ) : (
            filteredExercises.slice(0, visibleCount).map((ex) => {
              const configs = getExerciseConfigs(gymProfile, ex.id);
              return (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  if (configs.length > 1) {
                    setSelectedMultiConfigTarget({ exercise: ex, configs });
                    return;
                  }
                  const gymConfig = configs[0];
                  const targetBrand = gymConfig?.brand;
                  const targetSetting = gymConfig?.machineSetting;
                  const targetLoadType = gymConfig?.loadType || ex.loadType;
                  const targetWeightUnit = gymConfig?.weightUnit;
                  onSelect(ex, ex.equipment, targetBrand, targetSetting, targetLoadType, targetWeightUnit, gymConfig ? `${gymProfile.id}:${gymConfig.id}` : undefined);
                  onClose();
                }}
                className="w-full text-left px-2.5 py-2 rounded-xl bg-[#F9F9FB] dark:bg-[#252528] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:border-[#0F766E]/40 transition flex items-center gap-3 group"
              >
                {/* 실물 운동 사진 썸네일 (CDN 지연 로딩) */}
                {ex.images && ex.images.length > 0 ? (
                  <img
                    src={ex.images[0]}
                    alt={displayExercise(ex)}
                    loading="lazy"
                    className="w-10 h-10 rounded-xl object-cover bg-white dark:bg-[#1C1C1E] border border-black/5 dark:border-white/10 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1C1C1E] flex items-center justify-center text-gray-400 shrink-0 border border-black/5 dark:border-white/10">
                    <Dumbbell size={18} />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-extrabold text-sm text-[#1D1D1F] dark:text-white group-hover:text-[#0F766E] transition break-words leading-snug w-full">
                      {displayExercise(ex)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#1C1C1E] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {ex.equipment === 'machine' ? t("머신") : ex.equipment === 'barbell' ? t("바벨") : ex.equipment === 'dumbbell' ? t("덤벨") : ex.equipment === 'cable' ? t("케이블") : t('맨몸/소도구')}
                    </span>
                    {configs.length > 0 ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#0F766E]/15 text-[#0F766E] dark:text-[#2DD4BF] text-[10px] font-bold flex items-center gap-0.5">
                        🏷️ {configs.length > 1 ? t('머신 {count}대').replace('{count}', String(configs.length)) : (configs[0].brand || t('내 헬스장'))}
                      </span>
                    ) : ex.id.startsWith('custom_') ? (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                        {t("★커스텀")}
                      </span>
                    ) : usage.has(ex.id) ? (
                      <span className="text-[10px] text-[#0F766E] dark:text-teal-300">{t('내 기록')}</span>
                    ) : isCoreExercise(ex) && (
                      <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-[#0F766E] text-[10px] font-bold">
                        {t("대표 종목")}
                      </span>
                    )}
                  </div>

                  {/* 영문 원본 명칭 */}
                  <p className="exercise-picker-english text-xs text-gray-500 dark:text-gray-300 break-words mb-1">
                    {exerciseLanguage() !== "en" && ex.nameEn !== displayExercise(ex) ? ex.nameEn : null}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-[#0F766E] dark:text-teal-300 font-semibold text-xs">
                      {ex.primaryMuscles.map(displayMuscle).join(', ')}
                    </span>

                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] group-hover:bg-[#0F766E]/10 text-gray-400 group-hover:text-[#0F766E] transition shadow-2xs shrink-0">
                  <ChevronRight size={16} />
                </div>
              </button>
              );
            })
          )}
          {filteredExercises.length > visibleCount && (
            <button type="button" onClick={() => setVisibleCount(count => count + 50)} className="w-full p-3 rounded-xl bg-blue-500/10 text-[#0F766E] text-sm font-bold">
              {t("더 보기")} ({Math.min(visibleCount, filteredExercises.length)} / {filteredExercises.length})
            </button>
          )}
        </div>
      </div>

      {/* 복수 머신 등록 종목 선택 시 원터치 칩 모달 */}
      {selectedMultiConfigTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4"
          onClick={() => setSelectedMultiConfigTarget(null)}
        >
          <div
            role="dialog" aria-modal="true" aria-labelledby="machine-picker-title"
            className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-5 w-full max-w-sm max-h-[85dvh] overflow-y-auto space-y-4 border border-black/10 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 id="machine-picker-title" className="font-extrabold text-base text-[#1D1D1F] dark:text-white">
                  {displayExercise(selectedMultiConfigTarget.exercise)}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('오늘 사용할 머신을 선택하세요')}
                </p>
              </div>
              <button
                type="button"
                aria-label={t("닫기")}
                onClick={() => setSelectedMultiConfigTarget(null)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {selectedMultiConfigTarget.configs.map((cfg, idx) => {
                const brand = cfg.brand || t('브랜드 미지정');
                const load = cfg.loadType === 'plate-loaded' ? t('원판') : t('핀머신');
                const unit = cfg.weightUnit || 'kg';
                const setting = cfg.machineSetting;
                return (
                  <button
                    key={cfg.id || idx}
                    type="button"
                    onClick={() => {
                      onSelect(
                        selectedMultiConfigTarget.exercise,
                        selectedMultiConfigTarget.exercise.equipment,
                        cfg.brand,
                        cfg.machineSetting,
                        cfg.loadType || selectedMultiConfigTarget.exercise.loadType,
                        cfg.weightUnit,
                        `${gymProfile.id}:${cfg.id}`
                      );
                      setSelectedMultiConfigTarget(null);
                      onClose();
                    }}
                    className="w-full p-3.5 rounded-2xl bg-[#F2F2F7] dark:bg-[#252528] hover:bg-[#0F766E]/10 border border-black/5 dark:border-white/5 hover:border-[#0F766E] transition text-left flex items-center justify-between group active:scale-98"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#0F766E] text-white">
                          {idx + 1}{t('호기')}
                        </span>
                        <span className="font-bold text-sm text-[#1D1D1F] dark:text-white group-hover:text-[#0F766E] transition truncate">
                          {brand}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 truncate">
                        <span>{load}</span>
                        <span>·</span>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{unit}</span>
                        {setting && (
                          <>
                            <span>·</span>
                            <span className="text-gray-500 truncate">{setting}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-[#0F766E] shrink-0 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 새 운동 직접 등록 모달 */}
      <CreateCustomExerciseModal
        isOpen={isCreateModalOpen}
        initialName={cleanQuery}
        initialCategory={selectedCategory !== 'all' && selectedCategory !== 'targets' ? (selectedCategory as Category) : (targetCategories?.[0] || 'legs')}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newEx) => {
          onSelect(newEx, newEx.equipment, newEx.defaultBrand);
          onClose();
        }}
      />
    </div>
  );
};

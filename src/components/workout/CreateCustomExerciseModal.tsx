import { EQUIPMENT_OPTIONS } from '../../utils/equipment';
import { t, displayMuscle } from '../../i18n';
import React, { useState, useMemo } from 'react';
import { X, Plus, Dumbbell, Sparkles, Check } from 'lucide-react';
import { Exercise, Category, EquipmentType, MuscleTarget, MovementPlane, LoadType } from '../../types/workout';
import { saveCustomExercise, loadCustomExercises } from '../../utils/storage';
import type { ImportedExerciseProposal } from '../../utils/aiRoutineImport';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { normalizeSearch, getExerciseSearchFields } from '../../utils/exerciseSearch';

interface CreateCustomExerciseModalProps {
  isOpen: boolean;
  initialName?: string;
  initialCategory?: Category;
  importReview?: { kind: 'ai-import'; proposal?: ImportedExerciseProposal; equipmentType?: EquipmentType; loadType?: LoadType };
  onClose: () => void;
  onCreated: (newExercise: Exercise) => void;
}

const CATEGORY_OPTIONS: { id: Category; label: string }[] = [
  { id: 'chest', label: '가슴' },
  { id: 'back', label: '등' },
  { id: 'legs', label: '하체' },
  { id: 'shoulders', label: '어깨' },
  { id: 'arms', label: '팔' },
  { id: 'core', label: '복근/코어' },
  { id: 'fullbody', label: '전신' },
];



// 카테고리별 추천 주동근 목록
const CATEGORY_PRIMARY_MUSCLES: Record<Category, MuscleTarget[]> = {
  chest: ['chest', 'chest_upper'],
  back: ['lats', 'traps', 'erectors'],
  legs: ['quads', 'glutes', 'hamstrings', 'calves'],
  shoulders: ['deltoid_front', 'deltoid_side', 'deltoid_rear'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abs', 'obliques'],
  fullbody: ['quads', 'erectors', 'chest'],
};

// 카테고리별 추천 보조근(협응근) 목록
const CATEGORY_SECONDARY_RECOMMENDATIONS: Record<Category, MuscleTarget[]> = {
  chest: ['triceps', 'deltoid_front'],
  back: ['biceps', 'deltoid_rear', 'traps', 'erectors'],
  legs: ['glutes', 'hamstrings', 'erectors', 'calves'],
  shoulders: ['triceps', 'traps', 'deltoid_rear', 'chest_upper'],
  arms: ['forearms', 'deltoid_side'],
  core: ['obliques', 'erectors'],
  fullbody: ['glutes', 'hamstrings', 'lats', 'deltoid_front'],
};

// 전체 17개 해부학 근육 타겟 목록
const ALL_MUSCLE_TARGETS: MuscleTarget[] = [
  'chest',
  'chest_upper',
  'lats',
  'traps',
  'erectors',
  'deltoid_front',
  'deltoid_side',
  'deltoid_rear',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
];

export const CreateCustomExerciseModal: React.FC<CreateCustomExerciseModalProps> = ({
  isOpen,
  initialName = '',
  initialCategory = 'legs',
  importReview,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState(initialName);
  const [nameEn, setNameEn] = useState(importReview?.proposal?.nameEn || '');
  const [category, setCategory] = useState<Category | undefined>(importReview ? importReview.proposal?.category : initialCategory);
  const [equipment, setEquipment] = useState<EquipmentType>(importReview?.equipmentType || 'machine');
  const [loadType, setLoadType] = useState<LoadType>(importReview?.loadType === 'pin-loaded' ? 'pin-loaded' : 'plate-loaded');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleTarget[]>(importReview ? importReview.proposal?.primaryMuscles || [] : [CATEGORY_PRIMARY_MUSCLES[initialCategory][0]]);
  const [message, setMessage] = useState('');
  const [selectedSecondaryMuscles, setSelectedSecondaryMuscles] = useState<MuscleTarget[]>(importReview?.proposal?.secondaryMuscles || []);
  const [showAllMuscles, setShowAllMuscles] = useState(Boolean(importReview));

  React.useEffect(() => {
    if (!isOpen) return;
    setName(initialName);
    setNameEn(importReview?.proposal?.nameEn || '');
    setCategory(importReview ? importReview.proposal?.category : initialCategory);
    setSelectedMuscles(importReview ? importReview.proposal?.primaryMuscles || [] : [CATEGORY_PRIMARY_MUSCLES[initialCategory][0]]);
    setSelectedSecondaryMuscles(importReview?.proposal?.secondaryMuscles || []);
    setEquipment(importReview?.equipmentType || 'machine');
    setLoadType(importReview?.loadType === 'pin-loaded' ? 'pin-loaded' : 'plate-loaded');
    setShowAllMuscles(Boolean(importReview));
    setMessage('');
  }, [isOpen, initialName, initialCategory, importReview]);

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    if (!importReview) {
      const main = CATEGORY_PRIMARY_MUSCLES[newCat][0];
      setSelectedMuscles([main]);
      setSelectedSecondaryMuscles(prev => prev.filter(m => m !== main));
    }
  };
  const handleSelectPrimaryMuscle = (muscle: MuscleTarget) => {
    setSelectedMuscles(prev => importReview ? prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle] : [muscle]);
    setSelectedSecondaryMuscles(prev => prev.filter(m => m !== muscle));
  };
  const handleToggleSecondaryMuscle = (muscle: MuscleTarget) => {
    if (selectedMuscles.includes(muscle)) return;
    setSelectedSecondaryMuscles(prev => prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]);
  };

  const displayCandidateMuscles = useMemo(() => {
    const baseList = showAllMuscles
      ? ALL_MUSCLE_TARGETS
      : Array.from(
          new Set([
            ...(category ? CATEGORY_SECONDARY_RECOMMENDATIONS[category] : []),
            ...selectedSecondaryMuscles,
          ])
        );
    return baseList.filter(m => !selectedMuscles.includes(m));
  }, [showAllMuscles, category, selectedSecondaryMuscles, selectedMuscles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      alert(t('운동 종목 이름을 입력해 주세요.'));
      return;
    }

    if (!category || !selectedMuscles.length) {
      setMessage('운동 부위와 주동근을 선택하세요.');
      return;
    }
    const proposedNames = [cleanName, nameEn.trim()].filter(Boolean).map(normalizeSearch);
    if (importReview && [...loadCustomExercises(), ...EXERCISES_DATABASE].some(exercise => getExerciseSearchFields(exercise).some(field => field.trim() && proposedNames.includes(normalizeSearch(field))))) {
      setMessage('같은 이름의 종목이 있습니다. 취소한 뒤 기존 종목을 선택하세요.');
      return;
    }
    const customId = importReview ? `custom_${crypto.randomUUID()}` : `custom_${Date.now()}_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ex'}`;
    const defaultPlane: Record<Category, MovementPlane> = {
      legs: 'squat-pattern',
      chest: 'flat-press',
      back: 'horizontal-row',
      shoulders: 'overhead-press',
      arms: 'arm-isolation',
      core: 'core',
      fullbody: 'squat-pattern',
    };

    const newEx: Exercise = {
      id: customId,
      name: cleanName,
      nameEn: nameEn.trim() || cleanName,
      category,
      categories: [category],
      equipment,
      loadType: equipment === 'smith' ? 'plate-loaded' : equipment === 'machine' ? loadType : equipment,
      movementPlane: defaultPlane[category] || 'squat-pattern',
      primaryMuscles: [...selectedMuscles],
      secondaryMuscles: selectedSecondaryMuscles,
      description: `${t('사용자 정의 커스텀 운동:')} ${cleanName}`,
      instructions: [t('바른 자세와 통제된 템포로 안전하게 운동을 수행하세요.')],
      tips: [t('목표 근육에 긴장을 유지하며 점진적 과부하를 적용하세요.')],
      isPopular: true,
      aliases: [cleanName.replace(/\s+/g, '')],
    };

    if (!saveCustomExercise(newEx) || !loadCustomExercises().some(item => item.id === newEx.id)) {
      if (importReview) setMessage('종목을 저장하지 못했습니다. 저장 공간이나 브라우저 저장 권한을 확인한 뒤 다시 시도해 주세요.');
      else alert(t('종목을 저장하지 못했습니다. 저장 공간이나 브라우저 저장 권한을 확인한 뒤 다시 시도해 주세요.'));
      return;
    }
    onCreated(newEx);
    onClose();
  };

  return (
    <div data-custom-exercise-modal role="dialog" aria-modal="true" aria-label={t("새 운동 직접 등록")} className="keyboard-aware-modal fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">{t("새 운동 직접 등록")}</h3>
              <p className="text-[11px] text-gray-400">{t("라이브러리에 나만의 커스텀 운동 추가")}</p>
            </div>
          </div>
          <button
            type="button"
            data-custom-cancel
            onClick={onClose}
            aria-label={t("닫기")}
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {importReview && <p data-ai-muscle-review className="text-xs text-orange-600 dark:text-orange-400">{t('AI의 부위와 근육 정보는 제안입니다. 동작을 확인하고 수정한 뒤 등록하세요. 모르면 추측해 저장하지 마세요.')}</p>}
          {/* 운동 종목명 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t("운동 종목명")} <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              aria-label={t("운동 종목명")}
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("예: V-스쿼트, 바이킹 프레스, 펜들레이 로우")}
              className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#1D1D1F] dark:text-white outline-none focus:border-accent transition"
            />
          </div>

          {/* 영문명 (선택) */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t("영문 명칭 (선택)")}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              aria-label={t('영문 명칭 (선택)')}
              placeholder={t("예: V-Squat Machine, Viking Press")}
              className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] dark:text-white outline-none"
            />
          </div>

          {/* 타겟 부위 / 카테고리 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t("운동 부위")} <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  data-custom-category={c.id}
                  aria-pressed={category === c.id}
                  onClick={() => handleCategoryChange(c.id)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition ${
                    category === c.id
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]'
                  }`}
                >
                  {t(c.label)}
                </button>
              ))}
            </div>
          </div>

          {/* 운동 장비 유형 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t("장비 유형")} <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  data-custom-equipment={eq.id}
                  onClick={() => setEquipment(eq.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    equipment === eq.id
                      ? 'bg-accent text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]'
                  }`}
                >
                  {t(eq.label)}
                </button>
              ))}
            </div>
          </div>

          {/* 머신 선택 시 부하 방식 */}
          {equipment === 'machine' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                {t("머신 부하 방식")}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  data-custom-load="plate-loaded"
                  onClick={() => setLoadType('plate-loaded')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    loadType === 'plate-loaded'
                      ? 'bg-[#FF9500] text-white'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t("플레이트 (원판 로드)")}
                </button>
                <button
                  type="button"
                  data-custom-load="pin-loaded"
                  onClick={() => setLoadType('pin-loaded')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    loadType === 'pin-loaded'
                      ? 'bg-accent-bright text-white'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {t("핀머신 (웨이트 스택)")}
                </button>
              </div>
            </div>
          )}

          {/* 주동근 선택 */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              {t("주 타겟 근육 (주동근)")} <span className="text-accent">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(importReview ? ALL_MUSCLE_TARGETS : category ? CATEGORY_PRIMARY_MUSCLES[category] : []).map((m) => (
                <button
                  key={m}
                  type="button"
                  data-custom-primary={m}
                  aria-pressed={selectedMuscles.includes(m)}
                  onClick={() => handleSelectPrimaryMuscle(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedMuscles.includes(m)
                      ? 'bg-[#5856D6] text-white shadow-xs font-bold'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]'
                  }`}
                >
                  {displayMuscle(m)}
                </button>
              ))}
            </div>
          </div>

          {/* 보조근 (협응근) 선택 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <span>{t("보조 근육 (협응근, 선택)")}</span>
                {selectedSecondaryMuscles.length > 0 && (
                  <span className="text-[10px] font-black text-accent bg-accent-50 dark:bg-accent-950/40 px-2 py-0.5 rounded-full border border-accent-200 dark:border-accent-800/50">
                    {selectedSecondaryMuscles.length}
                  </span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowAllMuscles(!showAllMuscles)}
                className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
              >
                {showAllMuscles ? t("추천 근육만 보기") : t("모든 근육 부위 보기")}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mb-2">
              {t("운동 시 함께 개입되는 보조 근육을 선택하세요 (다중 선택 가능).")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {displayCandidateMuscles.map((m) => {
                const isSelected = selectedSecondaryMuscles.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    data-custom-secondary={m}
                    aria-pressed={isSelected}
                    onClick={() => handleToggleSecondaryMuscle(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-white shadow-xs font-bold'
                        : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#3A3A3C]'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{displayMuscle(m)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {message && <p role="status" className="text-xs text-orange-600 dark:text-orange-400">{t(message)}</p>}
          {/* 등록 버튼 */}
          <div className="pt-2">
            <button
              data-custom-submit
              disabled={Boolean(importReview) && (!category || !selectedMuscles.length)}
              type="submit"
              className="disabled:opacity-40 w-full py-3.5 bg-accent hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-accent-900/20 active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Plus size={18} strokeWidth={3} />
              {t("라이브러리에 등록하고 선택하기")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

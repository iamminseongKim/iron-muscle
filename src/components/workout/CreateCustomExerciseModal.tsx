import { t, displayMuscle } from '../../i18n';
import React, { useState } from 'react';
import { X, Plus, Dumbbell, Sparkles } from 'lucide-react';
import { Exercise, Category, EquipmentType, MuscleTarget, MovementPlane } from '../../types/workout';
import { saveCustomExercise } from '../../utils/storage';

interface CreateCustomExerciseModalProps {
  isOpen: boolean;
  initialName?: string;
  initialCategory?: Category;
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

const EQUIPMENT_OPTIONS: { id: EquipmentType; label: string }[] = [
  { id: 'machine', label: '머신' },
  { id: 'barbell', label: '바벨' },
  { id: 'dumbbell', label: '덤벨' },
  { id: 'cable', label: '케이블' },
  { id: 'bodyweight', label: '맨몸/소도구' },
  { id: 'other', label: '기타' },
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

export const CreateCustomExerciseModal: React.FC<CreateCustomExerciseModalProps> = ({
  isOpen,
  initialName = '',
  initialCategory = 'legs',
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState(initialName);
  const [nameEn, setNameEn] = useState('');
  const [category, setCategory] = useState<Category>(initialCategory);
  const [equipment, setEquipment] = useState<EquipmentType>('machine');
  const [loadType, setLoadType] = useState<'plate-loaded' | 'pin-loaded' | 'barbell' | 'dumbbell' | 'bodyweight'>('plate-loaded');
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleTarget>(CATEGORY_PRIMARY_MUSCLES[initialCategory]?.[0] || 'quads');

  React.useEffect(() => {
    if (isOpen) {
      setName(initialName);
      if (initialCategory) {
        setCategory(initialCategory);
        setSelectedMuscle(CATEGORY_PRIMARY_MUSCLES[initialCategory]?.[0] || 'quads');
      }
    }
  }, [isOpen, initialName, initialCategory]);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: Category) => {
    setCategory(newCat);
    const defaultMuscle = CATEGORY_PRIMARY_MUSCLES[newCat]?.[0] || 'quads';
    setSelectedMuscle(defaultMuscle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      alert(t('운동 종목 이름을 입력해 주세요.'));
      return;
    }

    const customId = `custom_${Date.now()}_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'ex'}`;
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
      loadType: equipment === 'machine' ? loadType : (equipment as any),
      movementPlane: defaultPlane[category] || 'squat-pattern',
      primaryMuscles: [selectedMuscle],
      secondaryMuscles: [],
      description: `${t('사용자 정의 커스텀 운동:')} ${cleanName}`,
      instructions: [t('바른 자세와 통제된 템포로 안전하게 운동을 수행하세요.')],
      tips: [t('목표 근육에 긴장을 유지하며 점진적 과부하를 적용하세요.')],
      isPopular: true,
      aliases: [cleanName.replace(/\s+/g, '')],
    };

    if (!saveCustomExercise(newEx)) {
      alert(t('종목을 저장하지 못했습니다. 저장 공간이나 브라우저 저장 권한을 확인한 뒤 다시 시도해 주세요.'));
      return;
    }
    onCreated(newEx);
    onClose();
  };

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/15 text-[#0F766E] flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#1D1D1F] dark:text-white">{t("새 운동 직접 등록")}</h3>
              <p className="text-[11px] text-gray-400">{t("라이브러리에 나만의 커스텀 운동 추가")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("닫기")}
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* 운동 종목명 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t("운동 종목명")} <span className="text-[#0F766E]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("예: V-스쿼트, 바이킹 프레스, 펜들레이 로우")}
              className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-[#1D1D1F] dark:text-white outline-none focus:border-[#0F766E] transition"
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
              placeholder={t("예: V-Squat Machine, Viking Press")}
              className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] dark:text-white outline-none"
            />
          </div>

          {/* 타겟 부위 / 카테고리 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t("운동 부위")} <span className="text-[#0F766E]">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryChange(c.id)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition ${
                    category === c.id
                      ? 'bg-[#0F766E] text-white shadow-sm'
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
              {t("장비 유형")} <span className="text-[#0F766E]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => setEquipment(eq.id)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    equipment === eq.id
                      ? 'bg-[#0F766E] text-white shadow-sm'
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
                  onClick={() => setLoadType('pin-loaded')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    loadType === 'pin-loaded'
                      ? 'bg-[#34C759] text-white'
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
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
              {t("주요 타겟 근육")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(CATEGORY_PRIMARY_MUSCLES[category] || []).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMuscle(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedMuscle === m
                      ? 'bg-[#5856D6] text-white shadow-xs'
                      : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {displayMuscle(m)}
                </button>
              ))}
            </div>
          </div>

          {/* 등록 버튼 */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0F766E] hover:opacity-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-teal-900/20 active:scale-98 transition flex items-center justify-center gap-2"
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

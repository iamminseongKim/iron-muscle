import React, { useState } from 'react';
import { X, Search, Dumbbell, ChevronRight } from 'lucide-react';
import { Exercise, Category, EquipmentType } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise, equipmentType: EquipmentType, brand?: string) => void;
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
];

const EQUIPMENTS: { id: EquipmentType | 'all'; label: string }[] = [
  { id: 'all', label: '모든 장비' },
  { id: 'barbell', label: '바벨' },
  { id: 'dumbbell', label: '덤벨' },
  { id: 'machine', label: '머신' },
  { id: 'cable', label: '케이블' },
  { id: 'bodyweight', label: '맨몸' },
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

  React.useEffect(() => {
    if (isOpen) {
      if (initialCategory) {
        setSelectedCategory(initialCategory);
      } else if (hasTargets) {
        setSelectedCategory('targets');
      } else {
        setSelectedCategory('all');
      }
      setSearchQuery('');
    }
  }, [isOpen, initialCategory, hasTargets]);

  if (!isOpen) return null;

  const getTargetLabels = () => {
    if (!targetCategories) return '';
    return targetCategories
      .map((c) => BASE_CATEGORIES.find((b) => b.id === c)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    // 검색어 필터링
    const matchQuery =
      searchQuery.trim() === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    // 카테고리 필터링 (다중 부위 완벽 매핑 및 오늘 목표 부위 필터링)
    let matchCat = false;
    if (selectedCategory === 'all') {
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

    // 장비 필터링
    const matchEquip = selectedEquipment === 'all' || ex.equipment === selectedEquipment;

    return matchQuery && matchCat && matchEquip;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Dumbbell size={18} className="text-[#FF2D55]" />
              운동 종목 선택
            </h3>
            <p className="text-xs text-gray-400">총 {EXERCISES_DATABASE.length}종의 전문 운동 라이브러리</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="p-3 border-b border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#252528] space-y-2.5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="운동명 검색 (예: 데드리프트, 벤치, 하이로우...)"
              className="w-full bg-white dark:bg-[#1C1C1E] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 rounded-2xl pl-10 pr-4 py-2 border border-black/5 dark:border-white/10 focus:outline-none focus:border-[#007AFF] shadow-xs transition"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-black dark:hover:text-white"
              >
                지우기
              </button>
            )}
          </div>

          {/* 카테고리 칩 (오늘 목표 부위 우선 노출 및 다중 부위 완벽 매핑) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
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
                <span>🔥 오늘 목표</span>
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
                {c.label}
              </button>
            ))}
          </div>

          {/* 장비 필터 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
            {EQUIPMENTS.map((eq) => (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedEquipment(eq.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition border ${
                  selectedEquipment === eq.id
                    ? 'bg-[#007AFF] text-white border-transparent shadow-xs'
                    : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 border-black/5 dark:border-white/5'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>

        {/* 운동 목록 */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              검색 결과가 없습니다. 다른 검색어나 필터를 선택해 보세요.
            </div>
          ) : (
            filteredExercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  onSelect(ex, ex.equipment, ex.defaultBrand);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-[#F9F9FB] dark:bg-[#252528] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] border border-black/5 dark:border-white/5 hover:border-[#FF2D55]/50 transition flex items-center justify-between group"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-extrabold text-sm text-[#1D1D1F] dark:text-white group-hover:text-[#FF2D55] transition">
                      {ex.name}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1C1C1E] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {ex.equipment === 'machine' ? '머신' : ex.equipment === 'barbell' ? '바벨' : ex.equipment === 'dumbbell' ? '덤벨' : '맨몸/케이블'}
                    </span>
                    {ex.defaultBrand && (
                      <span className="px-1.5 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] text-[10px] font-semibold">
                        {ex.defaultBrand.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-400">
                    <span className="text-[#FF2D55] font-semibold">
                      주동: {ex.primaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0] || m).join(', ')}
                    </span>
                    {ex.secondaryMuscles.length > 0 && (
                      <span className="text-gray-400">
                        | 협응: {ex.secondaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0] || m).join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] group-hover:bg-[#FF2D55]/10 text-gray-400 group-hover:text-[#FF2D55] transition shadow-2xs">
                  <ChevronRight size={16} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import { displayExercise, getLanguage as exerciseLanguage } from '../../i18n';
import { t } from '../../i18n';
import React, { useState, useEffect } from 'react';
import { X, Search, Dumbbell, ChevronRight, Plus, Sparkles } from 'lucide-react';
import { Exercise, Category, EquipmentType } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { matchesExerciseSearch, normalizeSearch } from '../../utils/exerciseSearch';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';
import { loadCustomExercises } from '../../utils/storage';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(50);
  useEffect(() => { setVisibleCount(50); }, [searchQuery, selectedCategory, selectedEquipment, isOpen]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setCustomExercises(loadCustomExercises());
      if (initialCategory) {
        setSelectedCategory(initialCategory);
      } else if (hasTargets) {
        setSelectedCategory('targets');
      } else {
        setSelectedCategory('all');
      }
      setSearchQuery('');
      setSelectedEquipment('all');
    }
  }, [isOpen, initialCategory, hasTargets]);

  // 커스텀 운동 변경 이벤트 리스너
  React.useEffect(() => {
    const handleCustomChange = (e: any) => {
      if (e.detail) {
        setCustomExercises(e.detail);
      } else {
        setCustomExercises(loadCustomExercises());
      }
    };
    window.addEventListener('iron_custom_exercises_change', handleCustomChange);
    return () => window.removeEventListener('iron_custom_exercises_change', handleCustomChange);
  }, []);

  // iOS WKWebView는 모달 오픈 애니메이션/렌더 커밋과 동시에 autoFocus를 걸면
  // 캐럿만 보이고 소프트 키보드는 안 뜨는 경우가 있어, 약간의 지연 후 포커스
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!isOpen || isCreateModalOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseRef.current(); }
      if (event.key !== 'Tab') return;
      const dialog = document.getElementById('exercise-picker-title')?.closest('[role="dialog"]');
      const nodes = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previousFocus?.focus({ preventScroll: true }); };
  }, [isOpen, isCreateModalOpen]);

  if (!isOpen) return null;

  const getTargetLabels = () => {
    if (!targetCategories) return '';
    return targetCategories
      .map((c) => BASE_CATEGORIES.find((b) => b.id === c)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const cleanQuery = searchQuery.trim();
  const normQuery = normalizeSearch(cleanQuery);

  // 커스텀 운동을 상단에 결합
  const allExercises = [...customExercises, ...EXERCISES_DATABASE];

  const filteredExercises = allExercises.filter((ex) => {
    const matchQuery = matchesExerciseSearch(ex, cleanQuery);

    // 2. 카테고리 필터링 (다중 부위 완벽 매핑 및 오늘 목표 부위 필터링)
    let matchCat = false;
    // 검색어가 입력된 경우, 오늘 목표 탭('targets')에 있더라도 전역 검색이 가능하도록 유연하게 매칭
    if (cleanQuery !== '') {
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

    return matchQuery && matchCat && matchEquip;
  });

  // 검색 시 연관도 높은 종목(정확한 별칭 일치, 인기 종목 등) 우선 정렬
  if (cleanQuery !== '') {
    filteredExercises.sort((a, b) => {
      const aAliases = a.aliases || [];
      const bAliases = b.aliases || [];

      // A. 별칭이나 이름에 정확히 일치하는 단어가 있는 경우 1순위 (예: '불스스' -> '덤벨 스플릿 스쿼트')
      const aExact = aAliases.some(al => normalizeSearch(al) === normQuery) || normalizeSearch(a.name) === normQuery;
      const bExact = bAliases.some(al => normalizeSearch(al) === normQuery) || normalizeSearch(b.name) === normQuery;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // B. 이름 시작 일치
      const aStart = normalizeSearch(a.name).startsWith(normQuery);
      const bStart = normalizeSearch(b.name).startsWith(normQuery);
      if (aStart && !bStart) return -1;
      if (!aStart && bStart) return 1;

      // C. 인기 종목 우선
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;

      return 0;
    });
  }

  return (
    <div className="keyboard-aware-modal fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-md animate-fade-in">
      <div role="dialog" aria-modal="true" aria-labelledby="exercise-picker-title" className="bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 id="exercise-picker-title" className="font-extrabold text-base text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Dumbbell size={18} className="text-[#0F766E]" />
              운동 종목 선택
            </h3>
            <p className="text-xs text-gray-400">총 {allExercises.length}종의 전문 운동 라이브러리</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] text-xs font-black rounded-xl transition"
            >
              <Plus size={14} strokeWidth={3} />
              <span>직접 등록</span>
            </button>
            <button
              onClick={onClose}
              aria-label="운동 선택 닫기"
              className="p-1.5 rounded-full text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div className="p-3 border-b border-black/5 dark:border-white/10 bg-[#F2F2F7] dark:bg-[#252528] space-y-2.5">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              aria-label="운동 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="운동명·브랜드·초성 검색"
              className="w-full bg-white dark:bg-[#1C1C1E] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 rounded-2xl pl-10 pr-16 py-2 border border-black/5 dark:border-white/10 focus:outline-none focus:border-[#0F766E] shadow-xs transition"
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

        <div className="px-4 py-2 flex items-center justify-between text-xs border-b border-black/5 dark:border-white/10">
          <span role="status" className="text-gray-500">{cleanQuery ? '전체 부위 검색' : '검색 결과'} {filteredExercises.length}개</span>
          <button type="button" className="min-h-[36px] text-[#0F766E] font-semibold" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedEquipment('all'); }}>필터 초기화</button>
        </div>
        {/* 운동 목록 */}
        <div className="p-3 overflow-y-auto flex-1 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <p className="text-xs">'{cleanQuery || '선택한 조건'}'에 맞는 운동을 찾지 못했습니다.</p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0F766E] text-white text-xs font-black rounded-2xl shadow-md hover:opacity-90 active:scale-98 transition"
              >
                <Plus size={16} strokeWidth={3} />
                <span>'{cleanQuery || '새 종목'}' 직접 등록하기</span>
              </button>
            </div>
          ) : (
            filteredExercises.slice(0, visibleCount).map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  onSelect(ex, ex.equipment, ex.defaultBrand);
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
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1C1C1E] flex items-center justify-center text-gray-400 shrink-0 border border-black/5 dark:border-white/5">
                    <Dumbbell size={18} />
                  </div>
                )}

                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-extrabold text-sm text-[#1D1D1F] dark:text-white group-hover:text-[#0F766E] transition truncate">
                      {displayExercise(ex)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#1C1C1E] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                      {ex.equipment === 'machine' ? t("머신") : ex.equipment === 'barbell' ? t("바벨") : ex.equipment === 'dumbbell' ? t("덤벨") : ex.equipment === 'cable' ? t("케이블") : '맨몸/소도구'}
                    </span>
                    {ex.id.startsWith('custom_') ? (
                      <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                        ★커스텀
                      </span>
                    ) : ex.isPopular && (
                      <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-[#0F766E] text-[10px] font-bold">
                        ★인기
                      </span>
                    )}
                  </div>

                  {/* 영문 원본 명칭 */}
                  <p className="text-[11px] text-gray-400 truncate mb-1">
                    {ex.nameEn}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-[#0F766E] font-semibold text-[11px]">
                      {ex.primaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0] || m).join(', ')}
                    </span>

                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-[#1C1C1E] group-hover:bg-[#0F766E]/10 text-gray-400 group-hover:text-[#0F766E] transition shadow-2xs shrink-0">
                  <ChevronRight size={16} />
                </div>
              </button>
            ))
          )}
          {filteredExercises.length > visibleCount && (
            <button type="button" onClick={() => setVisibleCount(count => count + 50)} className="w-full p-3 rounded-xl bg-blue-500/10 text-[#0F766E] text-sm font-bold">
              더 보기 ({Math.min(visibleCount, filteredExercises.length)} / {filteredExercises.length})
            </button>
          )}
        </div>
      </div>

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

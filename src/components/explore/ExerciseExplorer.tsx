import { displayExercise, getLanguage as exerciseLanguage } from '../../i18n';
import { t } from '../../i18n';
import { lazy, Suspense } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { 
  Search, Sparkles, ChevronRight, RotateCcw, BookOpen 
} from 'lucide-react';
import { Exercise, MuscleTarget, Category, LoadType, LOAD_TYPE_LABELS, MOVEMENT_PLANE_LABELS } from '../../types/workout';
import { matchesExerciseSearch } from '../../utils/exerciseSearch';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';
const HumanMuscle3DViewer = lazy(() => import('../3d/HumanMuscle3DViewer').then(module => ({default: module.HumanMuscle3DViewer})));

interface ExerciseExplorerProps {
  onSelectForWorkout?: (exercise: Exercise) => void;
  isDark?: boolean;
}

const getEquipmentLabel = (equipment: string) => {
  switch (equipment) {
    case 'machine': return t('머신');
    case 'barbell': return t('바벨');
    case 'dumbbell': return t('덤벨');
    case 'cable': return t('케이블');
    case 'bodyweight': return t('맨몸');
    default: return t('기타');
  }
};

export const ExerciseExplorer: React.FC<ExerciseExplorerProps> = ({ onSelectForWorkout, isDark = false }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedLoadType, setSelectedLoadType] = useState<LoadType | 'all'>('all');
  const [activeMuscleFilter, setActiveMuscleFilter] = useState<MuscleTarget | null>(null);

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    const matchSearch = matchesExerciseSearch(ex, searchQuery);

    // 다중 부위(categories) 완벽 대응: 하체 선택 시에도 데드리프트 노출, 등 선택 시에도 노출!
    const matchCat =
      selectedCategory === 'all' ||
      (ex.categories && ex.categories.includes(selectedCategory)) ||
      ex.category === selectedCategory;

    const matchLoad = selectedLoadType === 'all' || ex.loadType === selectedLoadType;

    const matchMuscle =
      !activeMuscleFilter ||
      ex.primaryMuscles.includes(activeMuscleFilter) ||
      ex.secondaryMuscles.includes(activeMuscleFilter);

    return matchSearch && matchCat && matchLoad && matchMuscle;
  });

  const [visibleCount, setVisibleCount] = useState(50);
  useEffect(() => { setVisibleCount(50); }, [searchQuery, selectedCategory, selectedLoadType, activeMuscleFilter]);

  // useCallback으로 참조를 고정: 검색어/필터 변경 등 무관한 리렌더 때마다
  // HumanMuscle3DViewer의 Three.js 씬이 통째로 재생성(카메라 리셋)되는 것을 방지
  const handleMuscleClickOn3D = useCallback((muscle: MuscleTarget) => {
    setActiveMuscleFilter((prev) => (prev === muscle ? null : muscle));
  }, []);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLoadType('all');
    setActiveMuscleFilter(null);
  };

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 3D 인체 해부학 뷰어 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#0F766E]" />
              {t("해부학 근육 시각화")}
            </h2>
            <p className="text-xs text-gray-400">
              {selectedExercise ? `${displayExercise(selectedExercise)} ${t("주동근·협응근")}` : t("인체를 터치하여 운동 찾기")}
            </p>
          </div>
        </div>

        {activeMuscleFilter && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-blue-500 font-bold">
              {t("선택된 근육:")} {MUSCLE_INFO_MAP[activeMuscleFilter]?.nameKo}
            </span>
            <button
              onClick={() => setActiveMuscleFilter(null)}
              className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-[#0F766E] text-[11px] font-bold flex items-center gap-1"
            >
              <span>{t("필터 해제")}</span>
              <RotateCcw size={10} />
            </button>
          </div>
        )}

        {/* 뷰어 컴포넌트 렌더링 */}
        <Suspense fallback={<div className="h-48 flex items-center justify-center" role="status">3D…</div>}><HumanMuscle3DViewer
          primaryMuscles={selectedExercise?.primaryMuscles || []}
          secondaryMuscles={selectedExercise?.secondaryMuscles || []}
          activeMuscleFilter={activeMuscleFilter}
          onSelectMuscle={handleMuscleClickOn3D}
          height="440px"
          isDark={isDark}
        /></Suspense>
      </div>

      {/* 선택된 운동 상세 카드 */}
      {selectedExercise && (
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#1D1D1F] dark:text-white">{displayExercise(selectedExercise)}</h3>
                <span className="px-2 py-0.5 rounded-lg bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                  {getEquipmentLabel(selectedExercise.equipment)}
                </span>
                {selectedExercise.defaultBrand && (
                  <span className="px-2 py-0.5 rounded-lg bg-[#FF9500]/10 text-[#FF9500] text-[10px] font-bold">
                    {selectedExercise.defaultBrand.split(' ')[0]}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{selectedExercise.nameEn}</span>
            </div>

            {onSelectForWorkout && (
              <button
                type="button"
                onClick={() => onSelectForWorkout(selectedExercise)}
                className="px-3.5 py-1.5 bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition active:scale-98"
              >
                + {t("기록에 담기")}
              </button>
            )}
          </div>

          {/* 주동근 & 협응근 배지 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#0F766E]/10 text-[#0F766E] font-bold text-[11px]">
                {t("주동근 (Primary)")}
              </span>
              {selectedExercise.primaryMuscles.map((m) => (
                <span key={m} className="font-bold text-gray-800 dark:text-gray-200">
                  {MUSCLE_INFO_MAP[m]?.nameKo || m}
                </span>
              ))}
            </div>

            {selectedExercise.secondaryMuscles.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-[#FF9500]/10 text-[#FF9500] font-bold text-[11px]">
                  {t("협응근 (Secondary)")}
                </span>
                {selectedExercise.secondaryMuscles.map((m) => (
                  <span key={m} className="text-gray-500 dark:text-gray-400">
                    {MUSCLE_INFO_MAP[m]?.nameKo || m}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-1">
            {exerciseLanguage() === 'ko' ? selectedExercise.description : selectedExercise.descriptionEn || selectedExercise.description}
          </p>

          {/* 가이드 */}
          {selectedExercise.instructions.length > 0 && (
            <div className="bg-[#F9F9FB] dark:bg-[#222225] p-3 rounded-2xl space-y-1.5 border border-black/5 dark:border-white/5">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                <BookOpen size={12} className="text-[#FF9500]" />
                {t("올바른 자세 가이드")}
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                {(exerciseLanguage() === 'ko' ? selectedExercise.instructions : selectedExercise.instructionsEn || selectedExercise.instructions).map((inst, i) => (
                  <li key={i} className="leading-snug">{inst}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* 검색 & 카테고리 필터 */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{t("운동 종목")} ({filteredExercises.length})</span>
          {(searchQuery || selectedCategory !== 'all' || selectedLoadType !== 'all' || activeMuscleFilter) && (
            <button onClick={clearFilters} className="text-xs text-[#0F766E] hover:underline">
              {t("필터 초기화")}
            </button>
          )}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("운동 종목 검색...")}
            placeholder={t("운동 종목 검색...")}
            className="w-full bg-white dark:bg-[#1C1C1E] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 rounded-2xl pl-10 pr-4 py-2.5 border border-black/5 dark:border-white/10 outline-none focus:border-[#0F766E] shadow-xs transition"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1D1D1F] dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white border border-black/5 dark:border-white/5'
              }`}
            >
              {cat === 'all' ? t("전체") : cat === 'chest' ? t("가슴") : cat === 'back' ? t("등") : cat === 'legs' ? t("하체") : cat === 'shoulders' ? t("어깨") : cat === 'arms' ? t("팔") : cat === 'core' ? t("복근") : t("전신")}
            </button>
          ))}
        </div>

        {/* 장비 부하 방식 필터 (원판머신, 핀머신, 바벨, 덤벨, 케이블 등) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="text-gray-400 font-semibold shrink-0">{t("장비")}:</span>
          {(['all', 'plate-loaded', 'pin-loaded', 'barbell', 'dumbbell', 'cable', 'bodyweight', 'other'] as const).map((load) => (
            <button
              key={load}
              type="button"
              onClick={() => setSelectedLoadType(load)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedLoadType === load
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] text-gray-500 dark:text-gray-400 border border-black/5 dark:border-white/5'
              }`}
            >
              {load === 'all' ? t("전체") : load === 'plate-loaded' ? t('플레이트(원판)') : load === 'pin-loaded' ? t('핀머신') : load === 'barbell' ? t("바벨") : load === 'dumbbell' ? t("덤벨") : load === 'cable' ? t("케이블") : load === 'bodyweight' ? t("맨몸") : t('기타')}
            </button>
          ))}
        </div>
      </div>

      {activeMuscleFilter && (
        <button type="button" onClick={() => setActiveMuscleFilter(null)} className="text-xs text-[#0F766E]">
          {MUSCLE_INFO_MAP[activeMuscleFilter]?.nameKo} {t("필터 해제")} ×
        </button>
      )}
      {filteredExercises.length === 0 && (
        <div className="p-6 text-center space-y-3 text-sm text-gray-500" role="status">
          <p>{t("조건에 맞는 운동이 없어요. 검색어를 줄이거나 필터를 초기화해 보세요.")}</p>
          <button type="button" onClick={clearFilters} className="text-[#0F766E] font-bold">{t("필터 초기화")}</button>
        </div>
      )}
      {/* 리스트 */}
      <div className="space-y-2">
        {filteredExercises.slice(0, visibleCount).map((ex) => {
          const isCurrent = selectedExercise?.id === ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setSelectedExercise(ex);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-full text-left p-3.5 rounded-3xl border transition-all flex items-center justify-between ${
                isCurrent
                  ? 'bg-white dark:bg-[#1C1C1E] border-[#0F766E] shadow-sm'
                  : 'bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-[#252528] border-black/5 dark:border-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-extrabold text-sm ${isCurrent ? 'text-[#0F766E]' : 'text-[#1D1D1F] dark:text-white'}`}>
                    {displayExercise(ex)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                    {getEquipmentLabel(ex.equipment)}
                  </span>
                  {ex.defaultBrand && (
                    <span className="text-[10px] text-[#FF9500] font-semibold">
                      [{ex.defaultBrand.split(' ')[0]}]
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="text-[#0F766E] font-semibold">
                    {ex.primaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0]).join(', ')}
                  </span>
                  {ex.secondaryMuscles.length > 0 && (
                    <span className="text-gray-400">
                      | {ex.secondaryMuscles.map((m) => MUSCLE_INFO_MAP[m]?.nameKo.split(' ')[0]).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-2 rounded-xl text-gray-400">
                <ChevronRight size={16} />
              </div>
            </button>
          );
        })}
        {filteredExercises.length > visibleCount && (
          <button type="button" onClick={() => setVisibleCount(count => count + 50)} className="w-full py-3 rounded-2xl bg-white dark:bg-[#1C1C1E] text-[#0F766E] text-sm font-bold">
            {t("더 보기")} ({visibleCount} / {filteredExercises.length})
          </button>
        )}
      </div>
    </div>
  );
};

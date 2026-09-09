import React, { useState } from 'react';
import { 
  Search, Sparkles, ChevronRight, RotateCcw, BookOpen 
} from 'lucide-react';
import { Exercise, MuscleTarget, Category } from '../../types/workout';
import { EXERCISES_DATABASE } from '../../data/exercises';
import { MUSCLE_INFO_MAP } from '../../data/muscleMap';
import { HumanMuscle3DViewer } from '../3d/HumanMuscle3DViewer';

interface ExerciseExplorerProps {
  onSelectForWorkout?: (exercise: Exercise) => void;
  isDark?: boolean;
}

export const ExerciseExplorer: React.FC<ExerciseExplorerProps> = ({ onSelectForWorkout, isDark = false }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(EXERCISES_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [activeMuscleFilter, setActiveMuscleFilter] = useState<MuscleTarget | null>(null);

  const filteredExercises = EXERCISES_DATABASE.filter((ex) => {
    const matchSearch =
      searchQuery.trim() === '' ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat = selectedCategory === 'all' || ex.category === selectedCategory;

    const matchMuscle =
      !activeMuscleFilter ||
      ex.primaryMuscles.includes(activeMuscleFilter) ||
      ex.secondaryMuscles.includes(activeMuscleFilter);

    return matchSearch && matchCat && matchMuscle;
  });

  const handleMuscleClickOn3D = (muscle: MuscleTarget) => {
    if (activeMuscleFilter === muscle) {
      setActiveMuscleFilter(null);
    } else {
      setActiveMuscleFilter(muscle);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveMuscleFilter(null);
  };

  return (
    <div className="pb-32 max-w-lg mx-auto px-4 space-y-4">
      {/* 3D 인체 해부학 뷰어 섹션 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base font-extrabold text-[#1D1D1F] dark:text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-[#FF2D55]" />
              3D 해부학 근육 뷰어
            </h2>
            <p className="text-xs text-gray-400">
              {selectedExercise ? `${selectedExercise.name}의 주동근·협응근` : '인체를 터치하여 운동 찾기'}
            </p>
          </div>

          {activeMuscleFilter && (
            <button
              onClick={() => setActiveMuscleFilter(null)}
              className="px-3 py-1 rounded-full bg-blue-500/10 text-[#007AFF] text-xs font-bold flex items-center gap-1"
            >
              <span>{MUSCLE_INFO_MAP[activeMuscleFilter]?.nameKo.split(' ')[0]} 해제</span>
              <RotateCcw size={11} />
            </button>
          )}
        </div>

        {/* 3D 뷰어 컴포넌트 */}
        <HumanMuscle3DViewer
          primaryMuscles={selectedExercise?.primaryMuscles || []}
          secondaryMuscles={selectedExercise?.secondaryMuscles || []}
          activeMuscleFilter={activeMuscleFilter}
          onSelectMuscle={handleMuscleClickOn3D}
          height="340px"
          isDark={isDark}
        />

        <div className="px-3 py-2 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 shadow-xs">
          <span>💡 3D 모델의 근육을 터치하면 해당 운동만 필터링됩니다.</span>
          <span className="text-[11px] text-gray-400 font-semibold">360° 회전</span>
        </div>
      </div>

      {/* 선택된 운동 상세 카드 */}
      {selectedExercise && (
        <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#1D1D1F] dark:text-white">{selectedExercise.name}</h3>
                <span className="px-2 py-0.5 rounded-lg bg-[#F2F2F7] dark:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                  {selectedExercise.equipment === 'machine' ? '머신' : selectedExercise.equipment === 'barbell' ? '바벨' : '덤벨/맨몸'}
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
                className="px-3.5 py-1.5 bg-[#007AFF] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90 transition active:scale-98"
              >
                + 기록에 담기
              </button>
            )}
          </div>

          {/* 주동근 & 협응근 배지 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-[#FF2D55]/10 text-[#FF2D55] font-bold text-[11px]">
                주동근 (Primary)
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
                  협응근 (Secondary)
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
            {selectedExercise.description}
          </p>

          {/* 가이드 */}
          {selectedExercise.instructions.length > 0 && (
            <div className="bg-[#F9F9FB] dark:bg-[#222225] p-3 rounded-2xl space-y-1.5 border border-black/5 dark:border-white/5">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block flex items-center gap-1">
                <BookOpen size={12} className="text-[#FF9500]" />
                올바른 자세 가이드
              </span>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">
                {selectedExercise.instructions.map((inst, i) => (
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
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">운동 종목 ({filteredExercises.length})</span>
          {(searchQuery || selectedCategory !== 'all' || activeMuscleFilter) && (
            <button onClick={clearFilters} className="text-xs text-[#007AFF] hover:underline">
              필터 초기화
            </button>
          )}
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="운동 검색 (예: 벤치, 스쿼트, 랫풀, 로우...)"
            className="w-full bg-white dark:bg-[#1C1C1E] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 rounded-2xl pl-10 pr-4 py-2.5 border border-black/5 dark:border-white/10 outline-none focus:border-[#007AFF] shadow-xs transition"
          />
        </div>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['all', 'chest', 'back', 'legs', 'shoulders', 'arms', 'core'] as const).map((cat) => (
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
              {cat === 'all' ? '전체' : cat === 'chest' ? '가슴' : cat === 'back' ? '등' : cat === 'legs' ? '하체' : cat === 'shoulders' ? '어깨' : cat === 'arms' ? '팔' : '복근'}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      <div className="space-y-2">
        {filteredExercises.map((ex) => {
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
                  ? 'bg-white dark:bg-[#1C1C1E] border-[#FF2D55] shadow-sm'
                  : 'bg-white dark:bg-[#1C1C1E] hover:bg-gray-50 dark:hover:bg-[#252528] border-black/5 dark:border-white/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-extrabold text-sm ${isCurrent ? 'text-[#FF2D55]' : 'text-[#1D1D1F] dark:text-white'}`}>
                    {ex.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[10px] text-gray-500 dark:text-gray-400 font-bold">
                    {ex.equipment === 'machine' ? '머신' : ex.equipment === 'barbell' ? '바벨' : '덤벨/맨몸'}
                  </span>
                  {ex.defaultBrand && (
                    <span className="text-[10px] text-[#FF9500] font-semibold">
                      [{ex.defaultBrand.split(' ')[0]}]
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="text-[#FF2D55] font-semibold">
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
      </div>
    </div>
  );
};

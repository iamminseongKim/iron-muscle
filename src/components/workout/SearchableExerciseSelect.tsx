import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Dumbbell } from 'lucide-react';
import { displayExercise, displayMuscle, t } from '../../i18n';
import type { Category, Exercise } from '../../types/workout';
import { matchesExerciseSearch } from '../../utils/exerciseSearch';

const CATEGORIES: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'chest', label: '가슴' },
  { id: 'back', label: '등' },
  { id: 'legs', label: '하체' },
  { id: 'shoulders', label: '어깨' },
  { id: 'arms', label: '팔' },
  { id: 'core', label: '복근' },
  { id: 'fullbody', label: '전신' },
];

export interface SearchableExerciseSelectProps {
  value: string | null;
  exercises: Exercise[];
  onChange: (exerciseId: string | null) => void;
  placeholder?: string;
  sourceName?: string;
  dataAiExerciseSelect?: boolean;
  className?: string;
}

export const SearchableExerciseSelect: React.FC<SearchableExerciseSelectProps> = ({
  value,
  exercises,
  onChange,
  placeholder,
  sourceName,
  dataAiExerciseSelect = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Category>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedExercise = useMemo(
    () => exercises.find(item => item.id === value),
    [exercises, value]
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus({ preventScroll: true }), 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (query.trim()) {
        return matchesExerciseSearch(item, query);
      }
      return true;
    });
  }, [exercises, query, selectedCategory]);

  const handleSelect = (id: string | null) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden native select for test & accessibility automation */}
      <select
        data-ai-exercise-select={dataAiExerciseSelect ? '' : undefined}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        value={value || ''}
        onChange={event => onChange(event.target.value || null)}
      >
        <option value="">{t('종목을 선택하세요.')}</option>
        {exercises.map(item => (
          <option key={item.id} value={item.id}>
            {displayExercise(item)}
          </option>
        ))}
      </select>

      {/* Styled Trigger Button */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#25222E] flex items-center justify-between text-left text-sm text-[#1D1D1F] dark:text-white hover:border-accent focus:border-accent-strong focus:outline-none transition shadow-2xs cursor-pointer group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
          <Dumbbell size={16} className={selectedExercise ? 'text-accent shrink-0' : 'text-gray-400 shrink-0'} />
          {selectedExercise ? (
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="font-bold truncate text-[#1D1D1F] dark:text-white">
                {displayExercise(selectedExercise)}
              </span>
              {selectedExercise.primaryMuscles?.[0] && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-semibold">
                  {displayMuscle(selectedExercise.primaryMuscles[0])}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 truncate">
              {placeholder || (sourceName ? `${t('추천')} · ${sourceName}` : t('종목을 검색하여 선택하세요'))}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className="text-gray-400 group-hover:text-accent shrink-0 transition-transform duration-200"
        />
      </button>

      {/* Full-view, Keyboard-aware Exercise Picker Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('운동 종목 선택')}
          className="exercise-picker keyboard-aware-modal fixed inset-0 z-[60] flex items-center justify-center p-3 bg-black/60 backdrop-blur-md animate-fade-in"
          style={{
            paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
          }}
          onClick={event => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="exercise-picker-dialog bg-white dark:bg-[#1E1B24] rounded-3xl w-full max-w-lg max-h-[90dvh] overflow-hidden flex flex-col shadow-2xl border border-black/10 dark:border-white/10"
          >
            {/* Header */}
            <div className="exercise-picker-header shrink-0 p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Dumbbell size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-base text-[#1D1D1F] dark:text-white truncate">
                    {t('운동 종목 선택')}
                  </h3>
                  {sourceName && (
                    <p className="exercise-picker-description text-xs text-gray-400 truncate">
                      {t('추천')} · {sourceName}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
                aria-label={t('닫기')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input & Category Filters */}
            <div className="shrink-0 p-3 border-b border-black/5 dark:border-white/10 bg-gray-50/80 dark:bg-[#25222E] space-y-2.5">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') searchInputRef.current?.blur();
                  }}
                  placeholder={t('운동명·부위·초성 검색')}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E1B24] text-sm text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:border-accent-strong focus:outline-none transition shadow-2xs"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded"
                    aria-label={t('검색어 지우기')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category filter tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition cursor-pointer ${
                      selectedCategory === category.id
                        ? 'bg-accent text-white shadow-2xs'
                        : 'bg-black/[0.04] dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-black/8 dark:hover:bg-white/10'
                    }`}
                  >
                    {t(category.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count & Clear button */}
            <div className="shrink-0 px-4 py-2 flex items-center justify-between text-xs text-gray-400 border-b border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
              <span>{t('검색 결과')} {filteredExercises.length}{t('개')}</span>
              {value && (
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 font-medium transition cursor-pointer"
                >
                  {t('선택 해제')}
                </button>
              )}
            </div>

            {/* Scrollable Exercises List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 overscroll-contain">
              {filteredExercises.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  {t('검색 결과가 없습니다.')}
                </div>
              ) : (
                filteredExercises.map(exercise => {
                  const isSelected = exercise.id === value;
                  return (
                    <button
                      key={exercise.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(exercise.id)}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between gap-3 transition cursor-pointer ${
                        isSelected
                          ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                          : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1D1D1F] dark:text-gray-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm truncate text-[#1D1D1F] dark:text-white">
                          {displayExercise(exercise)}
                        </div>
                        <div className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {exercise.category && (
                            <span className="px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 font-medium">
                              {t(exercise.category)}
                            </span>
                          )}
                          {exercise.primaryMuscles?.[0] && (
                            <span className="text-accent font-medium">
                              {displayMuscle(exercise.primaryMuscles[0])}
                            </span>
                          )}
                          {exercise.equipment && (
                            <span>· {t(exercise.equipment)}</span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check size={18} className="text-accent shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X, Dumbbell, Tag } from 'lucide-react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedExercise = useMemo(
    () => exercises.find(item => item.id === value),
    [exercises, value]
  );

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Click outside to close & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
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
    <div ref={containerRef} className={`relative w-full ${className}`}>
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
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(prev => !prev)}
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
          className={`text-gray-400 group-hover:text-accent shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Custom Search & Selection Popover */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-[#1E1B24] rounded-2xl border border-black/10 dark:border-white/15 shadow-2xl p-2.5 space-y-2 animate-fade-in"
          style={{ maxHeight: '360px' }}
        >
          {/* Search input with clear button */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={t('운동명·부위·초성 검색')}
              className="w-full pl-8 pr-8 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/80 dark:bg-[#25222E] text-xs text-[#1D1D1F] dark:text-white placeholder-gray-400 focus:border-accent-strong focus:outline-none transition"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded"
                aria-label={t('검색어 지우기')}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            {CATEGORIES.map(category => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 py-1 rounded-lg font-semibold shrink-0 transition cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-accent text-white shadow-2xs'
                    : 'bg-black/[0.04] dark:bg-white/5 text-gray-500 hover:bg-black/8 dark:hover:bg-white/10'
                }`}
              >
                {t(category.label)}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between px-1 text-[11px] text-gray-400">
            <span>{t('검색 결과')} {filteredExercises.length}{t('개')}</span>
            {value && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className="text-red-500 hover:text-red-600 dark:text-red-400 transition"
              >
                {t('선택 해제')}
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <div className="max-h-52 overflow-y-auto space-y-1 overscroll-contain pr-1">
            {filteredExercises.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">
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
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 text-accent font-bold ring-1 ring-accent/30'
                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-[#1D1D1F] dark:text-gray-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate text-[#1D1D1F] dark:text-white">
                        {displayExercise(exercise)}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate mt-0.5">
                        {exercise.category && t(exercise.category)}
                        {exercise.primaryMuscles?.[0] && ` · ${displayMuscle(exercise.primaryMuscles[0])}`}
                        {exercise.equipment && ` · ${t(exercise.equipment)}`}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-accent shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

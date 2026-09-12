import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import { Category } from '../../types/workout';
import { GrowthExerciseOption } from '../../utils/growthExercises';
import { matchesExerciseSearch } from '../../utils/exerciseSearch';

const CATEGORY_LABELS: Record<Category, string> = {
  chest: '가슴', back: '등', legs: '하체', shoulders: '어깨', arms: '팔', core: '복근/코어', fullbody: '전신',
};

export function GrowthExercisePicker({ options, selectedId, onSelect, onClose }: {
  options: GrowthExerciseOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');
  const [recordedOnly, setRecordedOnly] = useState(options.some(option => option.recordCount > 0));
  const [visibleCount, setVisibleCount] = useState(50);
  const recordedCount = options.filter(option => option.recordCount > 0).length;
  const filtered = options.filter(option => (!recordedOnly || option.recordCount > 0) && matchesExerciseSearch(option.exercise, query));

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { setVisibleCount(50); }, [query, recordedOnly]);

  return (
    <dialog ref={dialogRef} aria-labelledby="growth-picker-title" onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      style={{ top: 'calc(var(--input-viewport-top, 0px) + 1rem)', bottom: 'auto' }}
      className="mx-auto my-0 w-[calc(100%_-_2rem)] max-w-lg rounded-3xl p-0 bg-white dark:bg-[#1C1C1E] text-[#1D1D1F] dark:text-white shadow-xl backdrop:bg-black/50">
      <div className="flex flex-col" style={{ maxHeight: 'calc(var(--input-viewport-height, 100dvh) - 2rem)' }}>
        <div className="p-4 space-y-3 border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <h2 id="growth-picker-title" className="font-extrabold">성장 지표 종목 찾기</h2>
            <button type="button" onClick={onClose} aria-label="종목 선택 닫기" className="p-2 rounded-xl bg-gray-100 dark:bg-[#2C2C2E]"><X size={20} /></button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">1RM 데이터가 있는 종목부터 최근 기록순으로 보여드려요.</p>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input autoFocus value={query} onChange={event => setQuery(event.target.value)} aria-label="성장 지표 종목 검색"
              placeholder="이름·별칭·초성 검색 (예: 레그컬, ㄹㄱ)"
              className="w-full rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#0F766E]" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="검색어 지우기" className="absolute right-1 top-1 p-2"><X size={18} /></button>}
          </div>
          <div className="flex gap-2 text-xs font-bold">
            {[true, false].map(only => <button key={String(only)} type="button" aria-pressed={recordedOnly === only} onClick={() => setRecordedOnly(only)}
              className={`rounded-full px-3 py-2 ${recordedOnly === only ? 'bg-[#0F766E] text-white' : 'bg-[#F2F2F7] dark:bg-[#2C2C2E]'}`}>
              {only ? `기록 있는 종목 ${recordedCount}` : `전체 종목 ${options.length}`}
            </button>)}
          </div>
          <p role="status" className="text-xs text-gray-500">검색 결과 {filtered.length}개</p>
        </div>
        <div className="overflow-y-auto overscroll-contain p-3 space-y-1 min-h-0">
          {filtered.slice(0, visibleCount).map(({ exercise, recordCount, latestDate }) => (
            <button key={exercise.id} type="button" onClick={() => onSelect(exercise.id)} aria-pressed={exercise.id === selectedId}
              className={`w-full flex items-center gap-3 text-left rounded-2xl p-3 ${exercise.id === selectedId ? 'bg-[#0F766E]/10' : 'hover:bg-gray-50 dark:hover:bg-[#2C2C2E]'}`}>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold break-words">{exercise.name}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{CATEGORY_LABELS[exercise.category]} · {recordCount > 0 ? `1RM 기록 ${recordCount}개 · 최근 ${latestDate}` : '아직 1RM 기록 없음'}</div>
              </div>
              {exercise.id === selectedId && <Check size={18} className="shrink-0 text-[#0F766E]" />}
            </button>
          ))}
          {filtered.length === 0 && <div className="py-8 px-3 text-center text-sm text-gray-500 space-y-3">
            <p>{query ? '검색 결과가 없어요. 검색어를 줄여 보세요.' : '아직 1RM 데이터가 있는 종목이 없어요.'}</p>
            {recordedOnly && <button type="button" onClick={() => setRecordedOnly(false)} className="text-[#0F766E] font-bold">전체 종목에서 찾기</button>}
          </div>}
          {filtered.length > visibleCount && <button type="button" onClick={() => setVisibleCount(count => count + 50)} className="w-full p-3 text-sm font-bold text-[#0F766E]">더 보기 ({visibleCount} / {filtered.length})</button>}
        </div>
      </div>
    </dialog>
  );
}

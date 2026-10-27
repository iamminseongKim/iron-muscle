import React, { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { t } from '../../i18n';
import type { WorkoutSession } from '../../types/workout';
import { loadSavedSessions } from '../../utils/storage';
import { recentCompletedSessions } from '../../utils/calculations';

export function RepeatWorkoutPanel({ onRepeat }: { onRepeat: (source: WorkoutSession) => void }) {
  const [history, setHistory] = useState(() => loadSavedSessions());
  const [selected, setSelected] = useState('');
  useEffect(() => {
    const refresh = () => setHistory(loadSavedSessions());
    window.addEventListener('iron_sessions_change', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('iron_sessions_change', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  const sources = recentCompletedSessions(history).filter(session => session.exercises.some(ex =>
    ex.sets.some(set => set.completed && Number.isFinite(set.weight) && Number.isFinite(set.reps) && set.reps > 0)));
  const source = sources.find(item => item.id === selected) || sources[0];
  if (!source) return null;
  return <section data-repeat-workout className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3">
    <h3 className="text-sm font-bold flex items-center gap-2"><RotateCcw size={16} className="text-accent" />{t('지난 운동 그대로 시작')}</h3>
    <label className="block text-xs font-semibold space-y-2">
      <span>{t('이전 운동 선택')}</span>
      <select aria-label={t('이전 운동 선택')} value={source.id} onChange={event => setSelected(event.target.value)}
        className="w-full min-w-0 rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-[#302B37] px-3 py-3 text-sm">
        {sources.map(item => <option key={item.id} value={item.id}>{item.date} · {item.title}</option>)}
      </select>
    </label>
    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('완료한 세트의 중량과 횟수를 가져옵니다. 메모와 실제 휴식 시간은 복사하지 않습니다.')}</p>
    <button type="button" onClick={() => onRepeat(source)} className="w-full min-h-[44px] rounded-xl bg-accent/10 px-3 py-3 font-bold text-sm text-accent dark:text-accent-light">
      {t('지난 운동 그대로 시작')}
    </button>
  </section>;
}

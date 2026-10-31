import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Copy, Trophy } from 'lucide-react';
import { displayExercise, t, useLanguage } from '../../i18n';
import type { WorkoutSession } from '../../types/workout';
import { workoutSummary } from '../../utils/workoutFlow';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { generateAiCoachingMarkdown } from '../../utils/aiPromptGenerator';
import { copyText } from '../../utils/clipboard';

const signed = (value: number) => `${value > 0 ? '+' : ''}${value.toLocaleString()}`;

export function WorkoutCompleteSummary({ session, history, healthMessage, onHistory, onDismiss }: {
  session: WorkoutSession; history: WorkoutSession[]; healthMessage: string;
  onHistory: () => void; onDismiss: () => void;
}) {
  const language = useLanguage();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const summary = useMemo(() => workoutSummary(session, history), [session, history]);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const markdown = useMemo(() => generateAiCoachingMarkdown([session, ...history.filter(item => item.id !== session.id && item.date === session.date)], {
    language, scope: 'day', selectedDate: session.date, selectedBodyPart: 'all',
  }, history), [session, history, language]);
  const seconds = Math.max(0, Math.floor(session.durationSeconds));
  return <section data-workout-complete aria-labelledby="workout-summary-title" className="max-w-lg mx-auto px-4 pt-6 pb-32 space-y-4">
    <div className="soft-surface p-5 bg-white dark:bg-[#1E1B24] space-y-4">
      <CheckCircle2 size={40} className="text-accent" aria-hidden="true" />
      <div>
        <h2 id="workout-summary-title" tabIndex={-1} ref={heading} className="text-2xl font-extrabold outline-none break-words">{t('운동 완료 요약')}</h2>
        <p className="text-sm text-gray-500 mt-2">{t('기록이 저장되었습니다.')}</p>
        <p className="font-bold mt-3 break-words">{session.title}</p>
        <p className="text-xs text-gray-500">{session.date}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {[
          [t('운동 시간'), `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`],
          [t('완료 세트'), summary.completedSets.toLocaleString()],
          [t('총 볼륨'), `${summary.volume.toLocaleString()} kg`],
          [t('총 반복수'), summary.reps.toLocaleString()],
        ].map(([label, value]) => <div key={label} className="min-w-0 rounded-2xl bg-black/5 dark:bg-white/5 p-3">
          <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="text-lg font-extrabold mt-1 break-words tabular-nums">{value}</dd>
        </div>)}
      </dl>
      {healthMessage && <p role="status" className="text-sm text-gray-500">{healthMessage}</p>}
    </div>
    <div className="soft-surface p-4 bg-white dark:bg-[#1E1B24] space-y-3">
      <h3 className="font-bold">{t('지난 운동 대비')}</h3>
      {summary.previous ? <>
        <p className="text-xs text-gray-500">{summary.previous.date} · {t('같은 구성의 지난 운동과 비교합니다.')}</p>
        <dl className="space-y-2 text-sm">
          {[[t('완료 세트'), signed(summary.setDelta!)], [t('총 반복수'), signed(summary.repDelta!)], [t('총 볼륨'), `${signed(summary.volumeDelta!)} kg`]].map(([label, value]) =>
            <div key={label} className="flex flex-wrap justify-between gap-2"><dt>{label}</dt><dd className="font-bold tabular-nums">{value}</dd></div>)}
        </dl>
      </> : <p className="text-sm text-gray-500">{t('비교 가능한 이전 기록이 없습니다.')}</p>}
      {summary.personalBests.length > 0 && <div className="border-t border-black/10 dark:border-white/10 pt-3 space-y-2">
        <h3 className="font-bold text-accent dark:text-accent-light flex items-center gap-2"><Trophy size={16} />{t('최고 기록 경신')}</h3>
        <ul className="text-sm space-y-2">{summary.personalBests.map(record => <li key={record.exercise.id} className="break-words">
          {displayExercise(resolveRecordedExercise(record.exercise))} · {t('최고 중량')} {record.weight} {record.unit}
        </li>)}</ul>
      </div>}
    </div>
    <button type="button" data-copy-completed onClick={async () => setCopyStatus(await copyText(markdown) ? 'success' : 'failed')}
      className="w-full min-h-[48px] rounded-2xl bg-accent px-4 py-3 text-white font-bold flex items-center justify-center gap-2"><Copy size={18} />{t('오늘 기록 복사')}</button>
    {copyStatus !== 'idle' && <p role="status" className="text-sm">{t(copyStatus === 'success' ? '클립보드에 복사 완료!' : '복사하지 못했습니다. 아래 기록을 직접 선택해 복사하세요.')}</p>}
    {copyStatus === 'failed' && <textarea aria-label={t('복사할 기록')} readOnly value={markdown} onFocus={event => event.target.select()}
      className="w-full h-48 rounded-xl bg-transparent border border-black/15 dark:border-white/15 p-3 text-xs" />}
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onHistory} className="min-h-[48px] rounded-2xl bg-accent/10 text-accent dark:text-accent-light px-3 py-3 font-bold text-sm">{t('기록 보기')}</button>
      <button type="button" onClick={onDismiss} className="min-h-[48px] rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-3 font-bold text-sm">{t('새 운동 준비')}</button>
    </div>
  </section>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { WorkoutSession, WeightUnit } from '../../types/workout';
import { summarizeWorkoutDay, renderWorkoutCard } from '../../utils/workoutCard';
import { saveWorkoutImage } from '../../utils/nativeFile';

export function WorkoutShareCard({ sessions, date, unit, onClose }: { sessions: WorkoutSession[]; date: string; unit: WeightUnit; onClose: () => void }) {
  const summary = useMemo(() => summarizeWorkoutDay(sessions, date, unit), [sessions, date, unit]);
  const [light, setLight] = useState(false);
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    let active = true;
    setImage(''); setMessage('');
    document.fonts.ready.then(() => {
      if (!active) return;
      try { setImage(renderWorkoutCard(summary, light)); }
      catch { setMessage('이미지 생성에 실패했습니다. 다시 열어 주세요.'); }
    });
    return () => { active = false; };
  }, [summary, light]);
  return <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="workout-card-title" className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-lg max-h-[94dvh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} onKeyDown={e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || [])];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
      <div className="p-4 flex items-center justify-between">
        <div><h3 id="workout-card-title" className="font-black">운동 인증 카드</h3><p className="text-xs text-gray-500 mt-1">{date} · 하루의 노력을 한 장으로</p></div>
        <button type="button" aria-label="닫기" onClick={onClose} className="p-2"><X size={22}/></button>
      </div>
      <div className="px-4 pb-3 flex gap-2">{[false, true].map(value => <button key={String(value)} type="button" aria-pressed={light === value} onClick={() => setLight(value)} className={`px-4 py-2 rounded-full text-xs font-bold ${light === value ? 'bg-lime-300 text-black' : 'bg-gray-100 text-gray-600'}`}>{value ? '라이트' : '다크'}</button>)}</div>
      <div className="overflow-y-auto min-h-0 px-4 pb-4">
        {!summary.sets ? <p className="py-12 text-center text-sm text-gray-500">완료한 세트가 있는 날에 인증 카드를 만들 수 있어요.</p> : image ? <img src={image} alt={`${date} 운동 인증: ${summary.exercises.map(row => `${row.name} ${row.sets}세트 ${row.reps}회`).join(', ')}`} className="w-full rounded-xl"/> : <p role="status">이미지를 준비하고 있어요.</p>}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        {message && <p role="status" className="text-xs mb-3">{message}</p>}
        <button type="button" disabled={busy || !image || !summary.sets} className="w-full py-3 rounded-xl bg-lime-300 text-black font-black flex justify-center items-center gap-2 disabled:opacity-40" onClick={async () => {
          setBusy(true); setMessage('');
          try { const result = await saveWorkoutImage(`iron-muscle-${date}.png`, image); setMessage(result.message); }
          catch { setMessage('이미지를 저장하지 못했습니다. 다시 시도해 주세요.'); }
          finally { setBusy(false); }
        }}><Download size={18}/>{busy ? '저장 중…' : '이미지 저장 / 공유'}</button>
        <p className="text-[11px] text-gray-500 mt-2 text-center">모든 종목이 PNG 한 장에 저장됩니다.</p>
      </div>
    </div>
  </div>;
}

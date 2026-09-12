import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';
import { WorkoutSession, WeightUnit } from '../../types/workout';
import { summarizeWorkoutDay, renderWorkoutCard, recommendWorkoutQuote, loadWorkoutPhoto } from '../../utils/workoutCard';
import { saveWorkoutImage } from '../../utils/nativeFile';

export function WorkoutShareCard({ sessions, date, unit, onClose }: { sessions: WorkoutSession[]; date: string; unit: WeightUnit; onClose: () => void }) {
  const summary = useMemo(() => summarizeWorkoutDay(sessions, date, unit), [sessions, date, unit]);
  const [light, setLight] = useState(() => !document.documentElement.classList.contains('dark'));
  const [title, setTitle] = useState(() => recommendWorkoutQuote());
  const [photo, setPhoto] = useState<HTMLImageElement>();
  const [textColor, setTextColor] = useState<'auto' | 'white' | 'black'>('auto');
  const [overlay, setOverlay] = useState(0.45);
  const [photoBusy, setPhotoBusy] = useState(false);
  const photoRequest = useRef(0);
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { photoRequest.current++; document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    let active = true;
    setImage(''); setMessage('');
    const anatomy = new Image();
    anatomy.src = '/anatomy/muscle-atlas.png';
    Promise.all([document.fonts.ready, anatomy.decode()]).then(() => {
      if (!active) return;
      try { setImage(renderWorkoutCard(summary, { light, title, photo, textColor, overlay, anatomy })); }
      catch { setMessage('이미지 생성에 실패했습니다. 다시 열어 주세요.'); }
    }).catch(() => { if (active) setMessage('해부도 이미지를 불러오지 못했습니다. 다시 열어 주세요.'); });
    return () => { active = false; };
  }, [summary, light, title, photo, textColor, overlay]);
  return <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-3" onClick={onClose}>
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="workout-card-title" className="bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-lg max-h-[94dvh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} onKeyDown={e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const buttons = [...(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled)') || [])];
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }}>
      <div className="p-4 flex items-center justify-between">
        <div><h3 id="workout-card-title" className="font-black">운동 인증 카드</h3><p className="text-xs text-gray-500 mt-1">{date} · 하루의 노력을 한 장으로</p></div>
        <button type="button" aria-label="닫기" onClick={onClose} className="p-2"><X size={22}/></button>
      </div>
      <div className="overflow-y-auto min-h-0 px-4 pb-4 space-y-4">
        <div className="rounded-2xl bg-[#F2F2F7] dark:bg-[#2C2C2E] p-3 space-y-3">
          <div className="flex gap-2">{[true, false].map(value => <button key={String(value)} type="button" aria-pressed={light === value} onClick={() => setLight(value)} className={`flex-1 py-2 rounded-xl text-xs font-bold ${light === value ? 'bg-white dark:bg-[#1C1C1E] text-[#007AFF] shadow-sm' : 'text-gray-500'}`}>{value ? '라이트' : '다크'}</button>)}</div>
          <label className="block text-xs font-bold">인증 문구
            <input aria-label="인증 문구" value={title} maxLength={60} onChange={e => setTitle(e.target.value)} className="mt-2 w-full rounded-xl p-3 bg-white dark:bg-[#1C1C1E] text-sm outline-none focus:ring-2 focus:ring-[#007AFF]"/>
          </label>
          <div className="flex justify-between text-xs"><span className="text-gray-500">최대 60자</span><button type="button" onClick={() => setTitle(recommendWorkoutQuote(title))} className="font-bold text-[#007AFF]">다른 문구 추천</button></div>
          <label className="block text-xs font-bold">배경 사진
            <input type="file" accept="image/*" aria-label="배경 사진 선택" className="block mt-2 w-full text-xs file:mr-2 file:border-0 file:rounded-lg file:px-3 file:py-2 file:bg-white file:text-[#007AFF]" onChange={async e => {
              const file = e.target.files?.[0]; e.target.value = '';
              if (!file) return;
              const request = ++photoRequest.current;
              setPhotoBusy(true); setMessage('');
              try { const next = await loadWorkoutPhoto(file); if (request === photoRequest.current) setPhoto(next); }
              catch (error) { if (request === photoRequest.current) setMessage((error as Error).message); }
              finally { if (request === photoRequest.current) setPhotoBusy(false); }
            }}/>
          </label>
          {photoBusy && <p role="status" className="text-xs text-gray-500">사진을 불러오는 중…</p>}
          {photo && <><button type="button" className="text-xs text-[#FF3B30]" onClick={() => { photoRequest.current++; setPhotoBusy(false); setPhoto(undefined); }}>사진 제거</button><p className="text-[11px] text-gray-500">사진은 카드 중앙에 맞춰 잘립니다.</p></>}
          <label className="flex items-center justify-between text-xs font-bold">글자 색
            <select aria-label="글자 색" value={textColor} onChange={e => setTextColor(e.target.value as typeof textColor)} className="p-2 rounded-lg bg-white dark:bg-[#1C1C1E]"><option value="auto">자동</option><option value="white">흰색</option><option value="black">검정</option></select>
          </label>
          {photo && <label className="block text-xs font-bold">가독성 보정 · {Math.round(overlay * 100)}%<input aria-label="가독성 보정" type="range" min="0" max="0.85" step="0.05" value={overlay} onChange={e => setOverlay(Number(e.target.value))} className="block mt-2 w-full accent-[#007AFF]"/></label>}
        </div>
        {!summary.sets ? <p className="py-12 text-center text-sm text-gray-500">완료한 세트가 있는 날에 인증 카드를 만들 수 있어요.</p> : image ? <img src={image} alt={`${date} 운동 인증: ${summary.exercises.map(row => `${row.name} ${row.sets}세트 ${row.reps}회`).join(', ')}`} className="w-full rounded-xl"/> : <p role="status">이미지를 준비하고 있어요.</p>}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        {message && <p role="status" className="text-xs mb-3">{message}</p>}
        <button type="button" disabled={busy || photoBusy || !image || !summary.sets} className="w-full py-3 rounded-xl bg-[#007AFF] text-white font-black flex justify-center items-center gap-2 disabled:opacity-40" onClick={async () => {
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

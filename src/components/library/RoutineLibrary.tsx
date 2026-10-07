import React, { useEffect, useState, useRef } from 'react';
import { t, displayExercise } from '../../i18n';
import { resolveExercise } from '../../utils/exerciseResolver';
import { Routine, loadRoutines, parseRoutine, recipeFromSession, saveRoutine, deleteRoutine, routineLink, sessionFromRoutine, ROUTINES_CHANGE } from '../../utils/routines';
import { loadActiveSession, loadSavedSessions, saveActiveSession } from '../../utils/storage';
import { saveFileToDevice } from '../../utils/nativeFile';

export function RoutineLibrary() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [name, setName] = useState('');
  const [source, setSource] = useState('active');
  const [rest, setRest] = useState(90);
  const [input, setInput] = useState(() => location.hash.startsWith('#routine=') ? location.href : '');
  const [preview, setPreview] = useState<Routine | null>(null);
  const [message, setMessage] = useState('');
  const [share, setShare] = useState('');
  const history = loadSavedSessions();
  const action = (fn: () => void) => { try { fn(); setMessage(''); } catch (e) { setMessage((e as Error).message); } };
  useEffect(() => {
    const refresh = () => { try { setRoutines(loadRoutines()); } catch { setMessage('저장된 루틴을 읽지 못했습니다.'); } };
    refresh(); window.addEventListener(ROUTINES_CHANGE, refresh);
    const shared = () => {
      if (location.hash.startsWith('#routine=')) {
        try { setPreview(parseRoutine(location.href)); } catch (e) { setMessage((e as Error).message); }
      }
    };
    shared(); window.addEventListener('hashchange', shared);
    return () => { window.removeEventListener(ROUTINES_CHANGE, refresh); window.removeEventListener('hashchange', shared); };
  }, []);
  useEffect(() => { setShare(''); if (preview) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [preview]);
  const start = (routine: Routine) => action(() => {
    if (loadActiveSession()) throw new Error('먼저 진행 중인 운동을 완료하거나 취소하세요.');
    const session = sessionFromRoutine(routine);
    saveActiveSession(session);
    if (loadActiveSession()?.id !== session.id) throw new Error('저장하지 못했습니다. 저장 공간을 확인하세요.');
    window.dispatchEvent(new Event('iron_open_workout'));
  });
  const button = 'rounded-xl border border-accent-600/30 px-3 py-2 text-sm font-semibold text-accent-700 dark:text-accent-300';
  const field = 'w-full rounded-xl border border-black/15 dark:border-white/20 bg-transparent p-3 text-sm';
  return <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-4 space-y-3" aria-labelledby="routine-title">
    <h2 id="routine-title" className="scroll-mt-24 text-lg font-bold">{t('루틴 레시피')}</h2>
    <p className="text-xs text-gray-500">{t('종목·반복수·휴식만 공유합니다. 무게, 날짜, 메모, 신체 정보는 포함하지 않습니다. 루틴 이름과 사용자 종목 이름은 공유됩니다.')}</p>
    <label className="block text-sm">{t('루틴 이름')}<input aria-label={t('루틴 이름')} className={field} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
    <label className="block text-sm">{t('가져올 운동 기록')}<select className={field} value={source} onChange={e => setSource(e.target.value)}>
      <option value="active">{t('진행 중인 운동')}</option>
      {history.map(s => <option key={s.id} value={s.id}>{s.date} · {s.title}</option>)}
    </select></label>
    <label className="block text-sm">{t('기본 휴식 (초)')}<input type="number" min={0} max={3600} className={field} value={rest} onChange={e => setRest(Number(e.target.value))} /></label>
    <button className={button} onClick={() => action(() => {
      const session = source === 'active' ? loadActiveSession() : history.find(s => s.id === source);
      if (!session) throw new Error('저장할 운동 기록을 선택하세요.');
      const recipe = recipeFromSession(session, name, rest); saveRoutine(recipe); setPreview(recipe);
    })}>{t('이 구성으로 루틴 저장')}</button>
    <div className="space-y-2">
      {routines.length === 0 && <p className="text-sm text-gray-500">{t('저장한 루틴이 없습니다.')}</p>}
      {routines.map(r => <div key={r.id} className="flex flex-wrap items-center gap-2 border-t border-black/10 dark:border-white/10 pt-2">
        <button className="text-left font-semibold flex-1 min-w-0 break-words" onClick={() => { setPreview(r); setShare(''); }}>{r.name}</button>
        <button className={button} onClick={() => start(r)}>{t('루틴 시작')}</button>
        <button className={button} onClick={() => { if (confirm(t('이 루틴을 삭제하시겠습니까? 운동 기록은 유지됩니다.'))) action(() => { deleteRoutine(r.id); if (preview?.id === r.id) setPreview(null); }); }}>{t('삭제')}</button>
      </div>)}
    </div>
    <details><summary className="cursor-pointer font-semibold">{t('루틴 가져오기')}</summary>
      <textarea aria-label={t('루틴 링크 또는 JSON')} className={`${field} mt-2`} value={input} onChange={e => setInput(e.target.value)} maxLength={100000} />
      <input aria-label={t('루틴 파일 열기')} type="file" accept=".json,application/json" className="max-w-full text-sm" onChange={async e => {
        const file = e.target.files?.[0]; if (!file) return;
        try { if (file.size > 100000) throw new Error('루틴 형식이 올바르지 않거나 너무 큽니다.'); const raw = await file.text(); setInput(raw); action(() => setPreview(parseRoutine(raw))); } catch (error) { setMessage((error as Error).message); }
        e.target.value = '';
      }} />
      <button className={`${button} mt-2`} onClick={() => action(() => setPreview(parseRoutine(input)))}>{t('가져오기 미리보기')}</button>
    </details>
    {preview && <div ref={previewRef} className="scroll-mt-24 rounded-xl bg-accent-600/5 p-3 space-y-3" data-testid="routine-preview">
      <h3 className="font-bold break-words">{preview.name}</h3>
      <ol className="list-decimal pl-5 text-sm space-y-1">{preview.exercises.map((e, i) => {
        const resolved = resolveExercise(e.exerciseId);
        const label = resolved.name.startsWith('미등록 운동 (') ? e.name : displayExercise(resolved);
        return <li key={i}>{label} · {e.sets.length} {t('세트')}<div className="text-xs text-gray-500">{e.sets.map(s => `${s.reps} ${t('회')} / ${s.rest}s`).join(' · ')}</div></li>;
      })}</ol>
      <p className="text-xs text-gray-500">{t('새 운동의 무게는 0으로 시작합니다. 시작 후 본인에게 맞게 입력하세요.')}</p>
      <div className="flex flex-wrap gap-2">
        <button className={button} onClick={() => action(() => { const copy = { ...preview, id: crypto.randomUUID() }; saveRoutine(copy); setPreview(copy); historyReplace(); })}>{t('내 루틴으로 저장')}</button>
        <button className={button} onClick={() => start(preview)}>{t('루틴 시작')}</button>
        <button className={button} onClick={() => action(() => setShare(routineLink(preview)))}>{t('공유 링크 만들기')}</button>
        <button className={button} onClick={async () => { try { const result = await saveFileToDevice('routine.json', JSON.stringify(preview, null, 2), 'application/json'); if (!result.success && !result.cancelled) setMessage('파일을 저장하지 못했습니다.'); } catch { setMessage('파일을 저장하지 못했습니다.'); } }}>{t('루틴 파일 저장')}</button>
      </div>
      {share && <label className="block text-xs">{t('링크를 복사해 공유하세요.')}<textarea aria-label={t('공유 링크')} className={field} readOnly value={share} onFocus={e => e.target.select()} /></label>}
    </div>}
    {message && <p role="status" className="text-sm text-orange-600">{t(message)}</p>}
  </section>;
}
function historyReplace() { if (location.hash.startsWith('#routine=')) window.history.replaceState(null, '', location.pathname + location.search); }

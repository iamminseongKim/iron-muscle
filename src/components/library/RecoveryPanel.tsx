import React, { useEffect, useRef, useState } from 'react';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { t, displayExercise } from '../../i18n';
import { loadRecovery, purgeRecovery, RECOVERY_CHANGE, RecoveryItem, restoreRecovery } from '../../utils/recovery';

export function RecoveryPanel() {
  const [items, setItems] = useState<RecoveryItem[]>([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    const refresh = () => { try { setItems(loadRecovery()); } catch { setMessage('복구함을 읽지 못했습니다.'); } };
    refresh(); window.addEventListener(RECOVERY_CHANGE, refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(RECOVERY_CHANGE, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const action = (fn: () => void) => { try { fn(); setMessage(''); } catch (e) { setMessage((e as Error).message); } };
  return <section className="rounded-2xl bg-white dark:bg-[#1C1C1E] p-4 space-y-3">
    <h2 className="text-lg font-bold">{t('삭제 취소 · 복구함')}</h2>
    <p className="text-xs text-gray-500">{t('삭제한 운동 기록·종목·세트를 30일간 보관합니다. 이 브라우저의 데이터를 지우면 복구함도 삭제됩니다.')}</p>
    {!items.length && <p className="text-sm text-gray-500">{t('복구함이 비어 있습니다.')}</p>}
    {items.map(item => <div key={item.id} className="border-t border-black/10 dark:border-white/10 pt-3 space-y-2">
      <p className="font-semibold break-words">{item.session.title} · {t(item.kind === 'session' ? '운동 기록' : item.kind === 'exercise' ? '종목' : '세트')}</p>
      {item.exerciseId && (() => {
        const exercise = item.session.exercises.find(e => e.id === item.exerciseId);
        return exercise ? <p className="text-sm">{displayExercise(resolveRecordedExercise(exercise))}{item.setId ? ` · #${exercise.sets.find(s => s.id === item.setId)?.setNumber} ${t('세트')}` : ''}</p> : null;
      })()}
      <p className="text-xs text-gray-500">{item.session.date} · {t('삭제일')}: {new Date(item.deletedAt).toLocaleDateString()}</p>
      <div className="flex gap-3 text-sm font-semibold">
        <button className="text-teal-600 p-2" onClick={() => action(() => restoreRecovery(item.id))}>{t('복원')}</button>
        <button className="text-red-500 p-2" onClick={() => { if (confirm(t('영구 삭제하면 복원할 수 없습니다. 삭제하시겠습니까?'))) action(() => purgeRecovery(item.id)); }}>{t('영구 삭제')}</button>
      </div>
    </div>)}
    {message && <p role="status" className="text-orange-600 text-sm">{t(message)}</p>}
  </section>;
}

export function RecoveryUndo() {
  const [item, setItem] = useState<RecoveryItem | null>(null);
  const [message, setMessage] = useState('');
  const seen = useRef(new Set<string>());
  useEffect(() => {
    try { seen.current = new Set(loadRecovery().map(i => i.id)); } catch { /* Panel reports malformed storage. */ }
    const refresh = () => {
      try {
        const items = loadRecovery();
        const next = items[0];
        if (next && !seen.current.has(next.id)) { setItem(next); setMessage(''); }
        else setItem(current => current && items.some(i => i.id === current.id) ? current : null);
        seen.current = new Set(items.map(i => i.id));
      } catch { /* Source mutation was already aborted on storage errors. */ }
    };
    window.addEventListener(RECOVERY_CHANGE, refresh);
    return () => window.removeEventListener(RECOVERY_CHANGE, refresh);
  }, []);
  useEffect(() => { if (!item) return; const timer = setTimeout(() => setItem(null), 10000); return () => clearTimeout(timer); }, [item]);
  if (!item) return null;
  return <div role="status" className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl bg-gray-900 text-white p-3 shadow-xl flex flex-wrap items-center gap-3">
    <span className="text-sm flex-1">{t(message || '복구함으로 이동했습니다.')}</span>
    <button className="font-bold text-teal-300 p-2" onClick={() => { try { restoreRecovery(item.id); setItem(null); } catch (e) { setMessage((e as Error).message); } }}>{t('삭제 취소')}</button>
    <button aria-label={t('닫기')} onClick={() => setItem(null)}>×</button>
  </div>;
}

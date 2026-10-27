import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { resolveRecordedExercise } from '../../utils/exerciseResolver';
import { t, displayExercise, useLanguage } from '../../i18n';
import { loadRecovery, purgeRecoveryItems, RECOVERY_CHANGE, RETENTION_MS, RecoveryItem, restoreRecovery, restoreRecoveryItems } from '../../utils/recovery';

const kindLabel = (item: RecoveryItem) => t(item.kind === 'session' ? '운동 기록' : item.kind === 'exercise' ? '종목' : '세트');
function itemText(item: RecoveryItem) {
  const exercise = item.session.exercises.find(exercise => exercise.id === item.exerciseId);
  const set = exercise?.sets.find(set => set.id === item.setId);
  return {
    title: exercise ? displayExercise(resolveRecordedExercise(exercise)) : item.session.title,
    detail: item.kind === 'set' && set
      ? `#${set.setNumber} · ${set.weight} ${exercise?.weightUnit || item.session.weightUnit || 'kg'} × ${set.reps} ${t('회')}`
      : item.kind === 'exercise' && exercise ? `${exercise.sets.length} ${t('세트')}`
      : `${item.session.exercises.length} ${t('종목')} · ${item.session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} ${t('세트')}`,
  };
}

type Deletion = { items: RecoveryItem[]; scope: 'one' | 'selected' | 'all' };
function DeleteRecoveryDialog({ deletion, onClose, onDelete }: {
  deletion: Deletion; onClose: () => void; onDelete: (ids: string[]) => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cancel.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || [])];
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [onClose]);
  const question = deletion.scope === 'all' ? '복구함의 모든 항목을 영구 삭제할까요?' : deletion.scope === 'one' ? '이 항목을 영구 삭제할까요?' : '선택한 항목을 영구 삭제할까요?';
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="recovery-delete-title" aria-describedby="recovery-delete-warning"
      className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-3xl bg-white dark:bg-[#1E1B24] p-5 shadow-xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 id="recovery-delete-title" className="text-lg font-bold break-words">{t('삭제할 항목 확인')}</h3>
        <button type="button" aria-label={t('닫기')} onClick={onClose} className="shrink-0 min-h-[44px] min-w-[44px] flex justify-center items-center rounded-xl bg-black/5 dark:bg-white/10"><X size={18} /></button>
      </div>
      <p className="font-semibold">{t(question)}</p>
      <p id="recovery-delete-warning" className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{t('영구 삭제한 항목은 복원할 수 없습니다. 저장된 운동 기록은 유지됩니다.')}</p>
      <div className="rounded-2xl bg-black/5 dark:bg-white/5 p-3 space-y-2 text-sm">
        <p className="font-bold">{deletion.items.length} {t('항목')}</p>
        <ul className="space-y-2 max-h-36 overflow-y-auto">{deletion.items.map(item => <li key={item.id} className="break-words">
          <span className="text-xs text-gray-500">{kindLabel(item)} · </span>{itemText(item).title}
          {item.kind === 'set' && <span className="text-xs text-gray-500"> · {itemText(item).detail}</span>}
        </li>)}</ul>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button ref={cancel} type="button" onClick={onClose} className="min-h-[48px] rounded-2xl bg-black/5 dark:bg-white/10 p-3 text-sm font-bold">{t('취소')}</button>
        <button type="button" data-confirm-recovery-delete onClick={() => onDelete(deletion.items.map(item => item.id))} className="min-h-[48px] rounded-2xl bg-red-600 text-white p-3 text-sm font-bold">{t('영구 삭제')}</button>
      </div>
    </div>
  </div>;
}

export function RecoveryPanel() {
  const language = useLanguage();
  const [items, setItems] = useState<RecoveryItem[]>([]);
  const [message, setMessage] = useState('');
  const [messageCount, setMessageCount] = useState<number | null>(null);
  const [isError, setIsError] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [deletion, setDeletion] = useState<Deletion | null>(null);
  useEffect(() => {
    const refresh = () => {
      try {
        const next = loadRecovery(); setItems(next);
        if (!next.length) { setSelecting(false); setQuery(''); }
        setSelected(current => new Set([...current].filter(id => next.some(item => item.id === id))));
      } catch { setMessage('복구함을 읽지 못했습니다.'); setMessageCount(null); setIsError(true); }
    };
    refresh(); window.addEventListener(RECOVERY_CHANGE, refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener(RECOVERY_CHANGE, refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(language);
    return [...items].sort((a, b) => b.deletedAt - a.deletedAt || a.id.localeCompare(b.id)).filter(item =>
      !needle || `${item.session.title} ${item.session.date} ${kindLabel(item)} ${itemText(item).title} ${itemText(item).detail}`.toLocaleLowerCase(language).includes(needle));
  }, [items, query, language]);
  const groups = useMemo(() => {
    const result = new Map<string, RecoveryItem[]>();
    visible.forEach(item => {
      const group = result.get(item.session.id);
      if (group) group.push(item); else result.set(item.session.id, [item]);
    });
    return [...result.values()];
  }, [visible]);
  const toggleSelection = (ids: string[]) => setSelected(current => {
    const next = new Set(current), remove = ids.every(id => next.has(id));
    ids.forEach(id => { if (remove) next.delete(id); else next.add(id); });
    return next;
  });
  const act = (action: () => number, success: string) => {
    try {
      const count = action(); setMessage(success); setMessageCount(count); setIsError(false);
      setSelected(new Set()); setDeletion(null);
    } catch (error) { setMessage((error as Error).message); setMessageCount(null); setIsError(true); setDeletion(null); }
  };
  const clearSelection = () => { setSelected(new Set()); setSelecting(false); };
  const closeDeletion = React.useCallback(() => setDeletion(null), []);
  const checkbox = (ids: string[], label: string) => <input type="checkbox" aria-label={label} checked={ids.length > 0 && ids.every(id => selected.has(id))} disabled={!ids.length}
    ref={node => { if (node) node.indeterminate = ids.some(id => selected.has(id)) && !ids.every(id => selected.has(id)); }}
    onChange={() => toggleSelection(ids)} className="h-5 w-5 accent-[rgb(var(--accent-rgb))] shrink-0" />;
  return <section data-recovery-panel className="soft-surface bg-white dark:bg-[#1E1B24] p-4 space-y-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-lg font-bold flex flex-wrap items-center gap-2"><Archive size={19} className="text-accent dark:text-accent-light shrink-0" />{t('복구함')}
          <span className="text-xs font-semibold rounded-full bg-accent/10 px-2 py-1 text-accent dark:text-accent-light">{items.length}</span>
        </h2>
      </div>
      <button type="button" disabled={!items.length} onClick={() => setDeletion({ items: [...items], scope: 'all' })}
        className="min-h-[44px] shrink-0 max-w-[42%] flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold disabled:opacity-40"><Trash2 size={15} className="shrink-0" />{t('복구함 비우기')}</button>
    </div>
    <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{t('삭제한 항목은 30일 후 자동으로 삭제됩니다.')}</p>
    {items.length > 0 && <>
      <label className="flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input type="search" aria-label={t('복구함 검색')} placeholder={t('복구함 검색')} value={query}
          onChange={event => { setQuery(event.target.value); setSelected(new Set()); }} className="min-w-0 w-full bg-transparent text-sm py-1 outline-none" />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-gray-500">{t('보관 중')} · {items.length} {t('항목')}</span>
        <button type="button" onClick={() => { if (selecting) clearSelection(); else setSelecting(true); }} aria-pressed={selecting}
          className="min-h-[44px] px-3 rounded-xl bg-accent/10 text-accent dark:text-accent-light font-bold">{t(selecting ? '선택 완료' : '항목 선택')}</button>
      </div>
    </>}
    {selecting && <div data-recovery-selection className="sticky top-20 z-20 rounded-2xl border border-accent/20 bg-white dark:bg-[#25212E] shadow-lg p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="flex min-h-[44px] items-center gap-2 font-semibold cursor-pointer">{checkbox(visible.map(item => item.id), t('전체 선택'))}{t('전체 선택')}</label>
        <span className="font-bold text-accent dark:text-accent-light">{t('선택한 항목')} · {selected.size}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!selected.size} onClick={() => act(() => restoreRecoveryItems([...selected]), '복원했습니다.')}
          className="min-h-[44px] rounded-xl bg-accent px-3 py-2 text-white text-xs font-bold disabled:opacity-40">{t('선택 복원')}</button>
        <button type="button" disabled={!selected.size} onClick={() => setDeletion({ items: items.filter(item => selected.has(item.id)), scope: 'selected' })}
          className="min-h-[44px] rounded-xl bg-red-500/10 px-3 py-2 text-red-600 dark:text-red-400 text-xs font-bold disabled:opacity-40">{t('선택 삭제')}</button>
      </div>
    </div>}
    {message && <p role={isError ? 'alert' : 'status'} className={`text-sm rounded-xl p-3 ${isError ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-accent/10 text-accent dark:text-accent-light'}`}>{messageCount !== null && `${messageCount} ${t('항목')} · `}{t(message)}</p>}
    {!items.length ? <div className="py-8 text-center space-y-2 text-gray-400"><Archive size={32} className="mx-auto" /><p className="text-sm">{t('복구함이 비어 있습니다.')}</p></div> : !visible.length ? <p className="py-6 text-center text-sm text-gray-500">{t('검색 결과가 없습니다.')}</p> :
      <div className="space-y-4">{groups.map(group => <div key={group[0].session.id} className="rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="flex items-center gap-2 bg-black/[0.03] dark:bg-white/5 px-3 py-3">
          {selecting && <label className="min-h-[44px] min-w-[36px] flex items-center cursor-pointer">{checkbox(group.map(item => item.id), `${t('전체 선택')} · ${group[0].session.title}`)}</label>}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm break-words">{group[0].session.title}</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t('운동일')} · {group[0].session.date} <span className="ml-2">{group.length} {t('항목')}</span></p>
          </div>
        </div>
        <ul className="divide-y divide-black/5 dark:divide-white/10">{group.map(item => {
          const text = itemText(item);
          const days = Math.max(0, Math.ceil((item.deletedAt + RETENTION_MS - Date.now()) / 86400_000));
          return <li key={item.id} data-recovery-item={item.id} className={`p-3 ${selected.has(item.id) ? 'bg-accent/5' : ''}`}>
            <div className="flex items-start gap-2">
              {selecting && <label className="min-h-[44px] min-w-[36px] flex items-center cursor-pointer">{checkbox([item.id], `${t('선택한 항목')} · ${text.title} · ${text.detail}`)}</label>}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-md bg-black/5 dark:bg-white/10 px-1.5 py-0.5 font-semibold text-gray-500 dark:text-gray-400">{kindLabel(item)}</span>
                  <span aria-label={`${t('남은 보관 기간')} · ${days} ${t('일 남음')}`} className={days <= 3 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}>{days} {t('일 남음')}</span>
                </div>
                <p className="text-sm font-semibold break-words">{item.kind === 'session' ? t('운동 기록') : text.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 tabular-nums">{text.detail}</p>
                <p className="text-[10px] text-gray-400">{t('삭제일')} · {new Date(item.deletedAt).toLocaleString(language, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!selecting && <div className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => act(() => restoreRecoveryItems([item.id]), '복원했습니다.')} title={`${t('복원')} · ${text.title}`}
                  className="min-h-[44px] min-w-[44px] px-2 flex items-center justify-center gap-1 text-accent dark:text-accent-light text-xs font-bold rounded-xl bg-accent/10"><RotateCcw size={14} />{t('복원')}</button>
                <button type="button" aria-label={`${t('영구 삭제')} · ${text.title} · ${text.detail}`} onClick={() => setDeletion({ items: [item], scope: 'one' })}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500/10"><Trash2 size={17} /></button>
              </div>}
            </div>
          </li>;
        })}</ul>
      </div>)}</div>}
    <p className="text-[10px] leading-relaxed text-gray-400">{t('이 기기의 데이터를 지우면 복구함도 삭제됩니다.')}</p>
    {deletion && <DeleteRecoveryDialog deletion={deletion} onClose={closeDeletion} onDelete={ids => act(() => purgeRecoveryItems(ids), '영구 삭제했습니다.')} />}
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
    <button className="font-bold text-accent-300 p-2" onClick={() => { try { restoreRecovery(item.id); setItem(null); } catch (e) { setMessage((e as Error).message); } }}>{t('삭제 취소')}</button>
    <button aria-label={t('닫기')} onClick={() => setItem(null)}>×</button>
  </div>;
}

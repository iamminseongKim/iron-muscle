import { WorkoutSession } from '../types/workout';

export const RECOVERY_CHANGE = 'iron_recovery_change';
const trashKey = 'iron_recovery_v1';
const activeKey = 'iron_active_session_v1';
const historyKey = 'iron_workout_sessions_v1';
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export interface RecoveryItem {
  id: string; deletedAt: number; kind: 'session' | 'exercise' | 'set';
  location: 'active' | 'history'; session: WorkoutSession; exerciseId?: string; setId?: string;
}
const read = <T,>(key: string, fallback: T): T => JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
export function loadRecovery(): RecoveryItem[] {
  const all = read<RecoveryItem[]>(trashKey, []);
  const retained = all.filter(item => item.deletedAt > Date.now() - RETENTION_MS);
  if (retained.length !== all.length) { try { localStorage.setItem(trashKey, JSON.stringify(retained)); } catch {} }
  return retained;
}
function notify() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('iron_active_session_change', { detail: read(activeKey, null) }));
  window.dispatchEvent(new Event('iron_sessions_change'));
  window.dispatchEvent(new Event(RECOVERY_CHANGE));
}
// Archive before deleting. On quota/write failures leave the source record intact.
function commit(changes: Record<string, unknown>) {
  const before = Object.keys(changes).map(key => [key, localStorage.getItem(key)] as const);
  try {
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    for (const [key, value] of before.reverse()) {
      try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* Original archive remains recoverable. */ }
    }
    throw new Error('저장하지 못했습니다. 저장 공간을 확인하세요.');
  }
  notify();
}
function entry(session: WorkoutSession, location: RecoveryItem['location'], kind: RecoveryItem['kind'] = 'session', exerciseId?: string, setId?: string): RecoveryItem {
  return { id: crypto.randomUUID(), deletedAt: Date.now(), kind, location, session, exerciseId, setId };
}
export function removeSession(id: string, location: RecoveryItem['location']) {
  const active = read<WorkoutSession | null>(activeKey, null);
  const history = read<WorkoutSession[]>(historyKey, []);
  const session = location === 'active' ? active : history.find(s => s.id === id);
  if (!session || session.id !== id) return;
  commit({ [trashKey]: [entry(session, location), ...loadRecovery()],
    [location === 'active' ? activeKey : historyKey]: location === 'active' ? null : history.filter(s => s.id !== id) });
}
export function removeAllSessions() {
  const active = read<WorkoutSession | null>(activeKey, null);
  const history = read<WorkoutSession[]>(historyKey, []);
  commit({ [trashKey]: [...history.map(s => entry(s, 'history')), ...(active ? [entry(active, 'active')] : []), ...loadRecovery()],
    [historyKey]: [], [activeKey]: null });
}
export function saveWithRecovery(updated: WorkoutSession, location: RecoveryItem['location']) {
  const history = read<WorkoutSession[]>(historyKey, []);
  const previous = location === 'active' ? read<WorkoutSession | null>(activeKey, null) : history.find(s => s.id === updated.id);
  if (!previous || previous.id !== updated.id) throw new Error('기록이 변경되었습니다. 다시 열어 주세요.');
  const removed: RecoveryItem[] = [];
  for (const exercise of previous.exercises) {
    const next = updated.exercises.find(e => e.id === exercise.id);
    if (!next) removed.push(entry(previous, location, 'exercise', exercise.id));
    else for (const set of exercise.sets) {
      if (!next.sets.some(s => s.id === set.id)) removed.push(entry(previous, location, 'set', exercise.id, set.id));
    }
  }
  const saved = { ...updated, durationSeconds: location === 'active' ? Math.max(previous.durationSeconds, updated.durationSeconds) : updated.durationSeconds };
  commit({ ...(removed.length ? { [trashKey]: [...removed, ...loadRecovery()] } : {}),
    [location === 'active' ? activeKey : historyKey]: location === 'active' ? saved : history.map(s => s.id === saved.id ? saved : s) });
}
export function restoreRecovery(id: string) {
  const items = loadRecovery();
  const item = items.find(i => i.id === id);
  if (!item) return;
  const active = read<WorkoutSession | null>(activeKey, null);
  const history = read<WorkoutSession[]>(historyKey, []);
  // A workout may have been completed since a set was deleted: restore into that history record.
  const inHistory = history.find(s => s.id === item.session.id);
  const destination = inHistory ? 'history' : item.location;
  if (destination === 'active' && active && active.id !== item.session.id) throw new Error('먼저 진행 중인 운동을 완료하거나 취소하세요.');
  const current = inHistory || (active?.id === item.session.id ? active : undefined);
  let restored = current ? structuredClone(current) : structuredClone(item.session);
  if (current && item.kind !== 'session') {
    const original = item.session.exercises.find(e => e.id === item.exerciseId)!;
    const exerciseIndex = item.session.exercises.indexOf(original);
    const existing = restored.exercises.find(e => e.id === item.exerciseId);
    if (!existing) restored.exercises.splice(Math.min(exerciseIndex, restored.exercises.length), 0, structuredClone(original));
    else if (item.kind === 'set' && !existing.sets.some(s => s.id === item.setId)) {
      const index = original.sets.findIndex(s => s.id === item.setId);
      existing.sets.splice(Math.min(index, existing.sets.length), 0, structuredClone(original.sets[index]));
      existing.sets = existing.sets.map((s, i) => ({ ...s, setNumber: i + 1 }));
    }
  }
  // Persist the restored record first; a leftover tombstone is safe to retry after interruption.
  commit({ [destination === 'active' ? activeKey : historyKey]: destination === 'active' ? restored :
    (inHistory ? history.map(s => s.id === restored.id ? restored : s) : [restored, ...history]),
    [trashKey]: items.filter(i => i.id !== id) });
}
export function purgeRecovery(id: string) { commit({ [trashKey]: loadRecovery().filter(i => i.id !== id) }); }

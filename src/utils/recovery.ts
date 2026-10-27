import { WorkoutExercise, WorkoutSession, WorkoutSet } from '../types/workout';

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
  const all = recoverySnapshot();
  all.forEach(validateItem);
  const retained = all.filter(item => item.deletedAt > Date.now() - RETENTION_MS);
  if (retained.length !== all.length) { try { localStorage.setItem(trashKey, JSON.stringify(retained)); } catch {} }
  return retained;
}
function notify(sourceChanged = true) {
  if (typeof window === 'undefined') return;
  if (sourceChanged) {
    window.dispatchEvent(new CustomEvent('iron_active_session_change', { detail: read(activeKey, null) }));
    window.dispatchEvent(new Event('iron_sessions_change'));
  }
  window.dispatchEvent(new Event(RECOVERY_CHANGE));
}
// Archive before deleting. On quota/write failures leave the source record intact.
function commit(changes: Record<string, unknown>, sourceChanged = true) {
  const before = Object.keys(changes).map(key => [key, localStorage.getItem(key)] as const);
  try {
    for (const [key, value] of Object.entries(changes)) {
      const serialized = value === null ? null : JSON.stringify(value);
      if (serialized === null) localStorage.removeItem(key); else localStorage.setItem(key, serialized);
      if (localStorage.getItem(key) !== serialized) throw new Error('Storage write did not persist');
    }
  } catch {
    for (const [key, value] of before.reverse()) {
      try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* Original archive remains recoverable. */ }
    }
    throw new Error('저장하지 못했습니다. 저장 공간을 확인하세요.');
  }
  notify(sourceChanged);
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
const invalidRecovery = () => new Error('복구할 데이터가 올바르지 않습니다.');
const isObject = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
/** Read without pruning: bulk changes must have exactly one atomic commit. */
function recoverySnapshot(): RecoveryItem[] {
  let value: unknown;
  try { value = read(trashKey, []); } catch { throw invalidRecovery(); }
  if (!Array.isArray(value) || !value.every(item => isObject(item) && nonempty(item.id) && finite(item.deletedAt)) ||
      new Set(value.map(item => item.id)).size !== value.length) throw invalidRecovery();
  return value as RecoveryItem[];
}
function validSession(value: unknown): value is WorkoutSession {
  if (!isObject(value) || !nonempty(value.id) || typeof value.title !== 'string' || typeof value.date !== 'string' ||
      typeof value.startTime !== 'string' || !finite(value.durationSeconds) || value.durationSeconds < 0 ||
      typeof value.completed !== 'boolean' || !Array.isArray(value.exercises)) return false;
  const ids = new Set<string>();
  for (const exercise of value.exercises) {
    if (!isObject(exercise) || !nonempty(exercise.id) || ids.has(exercise.id) || !nonempty(exercise.exerciseId) ||
        typeof exercise.equipmentType !== 'string' || !Array.isArray(exercise.sets)) return false;
    ids.add(exercise.id);
    const setIds = new Set<string>();
    for (const set of exercise.sets) {
      if (!isObject(set) || !nonempty(set.id) || setIds.has(set.id) || !finite(set.setNumber) || set.setNumber < 0 ||
          !finite(set.weight) || !finite(set.reps) || set.reps < 0 || typeof set.completed !== 'boolean') return false;
      setIds.add(set.id);
    }
  }
  return true;
}
function validateItem(item: RecoveryItem) {
  if (!['session', 'exercise', 'set'].includes(item.kind) || !['active', 'history'].includes(item.location) || !validSession(item.session)) throw invalidRecovery();
  if (item.kind === 'session') return;
  const exercise = item.session.exercises.find(ex => ex.id === item.exerciseId);
  if (!exercise || (item.kind === 'set' && !exercise.sets.some(set => set.id === item.setId))) throw invalidRecovery();
}
/** Insert beside surviving snapshot neighbours, rather than stale numeric indices. */
function insertMissing<T extends { id: string }>(target: T[], original: T[], item: T) {
  if (target.some(existing => existing.id === item.id)) return;
  const sourceIndex = original.findIndex(source => source.id === item.id);
  let position = -1;
  for (let i = sourceIndex + 1; i < original.length; i++) {
    const next = target.findIndex(existing => existing.id === original[i].id);
    if (next >= 0) { position = next; break; }
  }
  if (position < 0) {
    for (let i = sourceIndex - 1; i >= 0; i--) {
      const previous = target.findIndex(existing => existing.id === original[i].id);
      if (previous >= 0) { position = previous + 1; break; }
    }
  }
  target.splice(position < 0 ? Math.min(sourceIndex, target.length) : position, 0, structuredClone(item));
}
function mergeExercise(restored: WorkoutSession, source: WorkoutSession, original: WorkoutExercise, onlySetId?: string) {
  const existing = restored.exercises.find(ex => ex.id === original.id);
  if (!existing) {
    const selected = onlySetId ? { ...original, sets: original.sets.filter(set => set.id === onlySetId) } : original;
    insertMissing(restored.exercises, source.exercises, selected);
    const inserted = restored.exercises.find(ex => ex.id === original.id)!;
    inserted.sets = inserted.sets.map((set, index) => ({ ...set, setNumber: index + 1 }));
    return;
  }
  const sets = onlySetId ? original.sets.filter(set => set.id === onlySetId) : original.sets;
  for (const set of sets) insertMissing<WorkoutSet>(existing.sets, original.sets, set);
  existing.sets = existing.sets.map((set, index) => ({ ...set, setNumber: index + 1 }));
}

export function restoreRecoveryItems(ids: string[]): number {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw invalidRecovery();
  if (!ids.length) return 0;
  const requested = new Set(ids);
  const items = recoverySnapshot();
  const storedOrder = new Map(items.map((item, index) => [item.id, index]));
  const selected = items.filter(item => requested.has(item.id) && item.deletedAt > Date.now() - RETENTION_MS)
    .sort((a, b) => b.deletedAt - a.deletedAt || storedOrder.get(a.id)! - storedOrder.get(b.id)!);
  if (!selected.length) return 0;
  selected.forEach(validateItem);
  const storedHistory: unknown = read(historyKey, []);
  const storedActive: unknown = read(activeKey, null);
  if (!Array.isArray(storedHistory) || !storedHistory.every(validSession) ||
      new Set(storedHistory.map(session => session.id)).size !== storedHistory.length ||
      (storedActive !== null && !validSession(storedActive))) throw invalidRecovery();
  const history = structuredClone(storedHistory) as WorkoutSession[];
  let active = storedActive ? structuredClone(storedActive) as WorkoutSession : null;
  const groups = new Map<string, RecoveryItem[]>();
  for (const item of selected) {
    const group = groups.get(item.session.id) || [];
    group.push(item); groups.set(item.session.id, group);
  }
  let historyChanged = false;
  let activeChanged = false;
  for (const [sessionId, group] of groups) {
    const inHistory = history.find(session => session.id === sessionId);
    const current = inHistory || (active?.id === sessionId ? active : undefined);
    const destination = inHistory ? 'history' : current ? 'active' : group.some(item => item.location === 'history') ? 'history' : 'active';
    if (destination === 'active' && active && active.id !== sessionId) throw new Error('먼저 진행 중인 운동을 완료하거나 취소하세요.');
    // Newest selected snapshot wins for newly restored fields; live fields always win.
    // Parent metadata is necessary to house a restored set, but unselected siblings stay deleted.
    const restored = current ? structuredClone(current) : { ...structuredClone(group[0].session), exercises: [] };
    for (const item of group) {
      if (item.kind === 'session') {
        for (const exercise of item.session.exercises) mergeExercise(restored, item.session, exercise);
      } else {
        const original = item.session.exercises.find(ex => ex.id === item.exerciseId)!;
        mergeExercise(restored, item.session, original, item.kind === 'set' ? item.setId : undefined);
      }
    }
    if (destination === 'active') {
      restored.durationSeconds = Math.max(restored.durationSeconds, ...group.map(item => item.session.durationSeconds));
      active = restored; activeChanged = true;
    } else {
      if (inHistory) history[history.findIndex(session => session.id === sessionId)] = restored;
      else history.unshift(restored);
      historyChanged = true;
    }
  }
  const consumed = new Set(selected.map(item => item.id));
  commit({ ...(historyChanged ? { [historyKey]: history } : {}), ...(activeChanged ? { [activeKey]: active } : {}),
    [trashKey]: items.filter(item => !consumed.has(item.id)) });
  return selected.length;
}

export function purgeRecoveryItems(ids: string[]): number {
  if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw invalidRecovery();
  if (!ids.length) return 0;
  const requested = new Set(ids);
  const items = recoverySnapshot();
  const remaining = items.filter(item => !requested.has(item.id));
  const count = items.length - remaining.length;
  if (count) commit({ [trashKey]: remaining }, false);
  return count;
}
export function clearRecovery(): number {
  const items = recoverySnapshot();
  if (items.length) commit({ [trashKey]: [] }, false);
  return items.length;
}
export function restoreRecovery(id: string) { return restoreRecoveryItems([id]); }
export function purgeRecovery(id: string) { return purgeRecoveryItems([id]); }

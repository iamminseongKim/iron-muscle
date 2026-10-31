import { normalizeAdaptiveSession } from './adaptiveTraining';
import { WorkoutSession, Exercise } from '../types/workout';
import { INITIAL_SAMPLE_HISTORY } from '../data/sampleHistory';
import { sanitizeSessionExercises } from './exerciseResolver';
import { migrateLegacySessionDates } from './calendar';

const STORAGE_KEYS = {
  SESSIONS: 'iron_workout_sessions_v1',
  ACTIVE_SESSION: 'iron_active_session_v1',
  CUSTOM_EXERCISES: 'iron_custom_exercises_v1',
  SETTINGS: 'iron_user_settings_v1',
};

export function loadSavedSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      return []; // 기본 더미 데이터 없이 깨끗한 빈 상태로 시작!
    }
    const parsed: WorkoutSession[] = JSON.parse(raw);
    const sanitized = parsed.map(session => normalizeAdaptiveSession(sanitizeSessionExercises(session)));
    const { sessions: migrated, migratedCount } = migrateLegacySessionDates(sanitized);
    if (migratedCount > 0) {
      saveSessions(migrated);
    }
    return migrated;
  } catch (e) {
    console.error('Failed to load sessions', e);
    return [];
  }
}

export function clearAllSessions(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch (e) {
    console.error('Failed to clear sessions', e);
  }
}

export function loadSampleDataForDemo(): WorkoutSession[] {
  const sanitized = INITIAL_SAMPLE_HISTORY.map(sanitizeSessionExercises);
  saveSessions(sanitized);
  return sanitized;
}

export function saveSessions(sessions: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions.map(sanitizeSessionExercises)));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

/** Commit completion without discarding an active workout on a failed write. */
export function completeWorkoutSession(session: WorkoutSession): WorkoutSession[] {
  const failure = () => new Error('운동을 저장하지 못했습니다. 저장 공간을 확인하고 다시 시도하세요.');
  let previousHistoryRaw: string | null;
  let previousActiveRaw: string | null;
  let previous: WorkoutSession[];
  let serialized: string;
  try {
    if (!session || typeof session.id !== 'string' || !session.id.trim() || session.completed !== true || !Array.isArray(session.exercises)) throw failure();
    // Read strictly: a broken history must never become an empty history on save.
    previousHistoryRaw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    previousActiveRaw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    const parsed: unknown = previousHistoryRaw === null ? [] : JSON.parse(previousHistoryRaw);
    const active: unknown = previousActiveRaw === null ? null : JSON.parse(previousActiveRaw);
    const validSession = (value: unknown): value is WorkoutSession => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
      const candidate = value as WorkoutSession;
      return typeof candidate.id === 'string' && !!candidate.id.trim() && Array.isArray(candidate.exercises);
    };
    if (!Array.isArray(parsed) || !parsed.every(validSession) || !validSession(active) || active.id !== session.id) throw failure();
    previous = parsed.map(sanitizeSessionExercises);
    const completed = sanitizeSessionExercises(session);
    serialized = JSON.stringify([completed, ...previous.filter(saved => saved.id !== session.id)]);
  } catch { throw failure(); }
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, serialized);
    if (localStorage.getItem(STORAGE_KEYS.SESSIONS) !== serialized) throw failure();
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) !== null || localStorage.getItem(STORAGE_KEYS.SESSIONS) !== serialized) throw failure();
  } catch {
    // Restore both exact raw snapshots, rather than rewriting through permissive loaders.
    for (const [key, raw] of [[STORAGE_KEYS.SESSIONS, previousHistoryRaw], [STORAGE_KEYS.ACTIVE_SESSION, previousActiveRaw]] as const) {
      try {
        if (raw === null) localStorage.removeItem(key); else localStorage.setItem(key, raw);
      } catch { /* Retain any successfully written copy if storage becomes unavailable. */ }
    }
    throw failure();
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('iron_sessions_change'));
    window.dispatchEvent(new CustomEvent('iron_active_session_change', { detail: null }));
  }
  return previous;
}

export function loadActiveSession(): WorkoutSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const parsed: WorkoutSession = JSON.parse(raw);
    const sanitized = normalizeAdaptiveSession(sanitizeSessionExercises(parsed));
    const { sessions: migrated, migratedCount } = migrateLegacySessionDates([sanitized]);
    if (migratedCount > 0) {
      saveActiveSession(migrated[0]);
    }
    return migrated[0];
  } catch (e) {
    console.error('Failed to load active session', e);
    return null;
  }
}

export function saveActiveSession(session: WorkoutSession | null): void {
  try {
    if (session) {
      // 💡 [치명적 버그 수정]: 1분대 타이머 리셋 방어
      // 컴포넌트 렌더링 지연이나 세트 업데이트로 과거 durationSeconds가 전달되더라도
      // 이미 로컬스토리지에 더 많이 누적된 실제 초가 있다면 0초나 과거 값으로 덮어쓰지 않고 보존한다.
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      if (raw) {
        try {
          const existing: WorkoutSession = JSON.parse(raw);
          if (existing.id === session.id && (existing.durationSeconds ?? 0) > (session.durationSeconds ?? 0)) {
            session.durationSeconds = existing.durationSeconds;
          }
        } catch {}
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(sanitizeSessionExercises(session)));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iron_active_session_change', { detail: session }));
    }
  } catch (e) {
    console.error('Failed to save active session', e);
  }
}

// ----------------------------------------------------
// 🌟 사용자 정의 커스텀 운동 종목 관리 (Custom Exercises)
// ----------------------------------------------------

function readCustomExercises(): Exercise[] {
  const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
  if (raw === null) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(exercise =>
    exercise && typeof exercise === 'object' && !Array.isArray(exercise)
    && typeof exercise.id === 'string' && exercise.id.trim()
  )) {
    throw new Error('Invalid custom exercise catalog');
  }
  return parsed;
}

export function loadCustomExercises(): Exercise[] {
  try {
    return readCustomExercises();
  } catch (e) {
    console.error('Failed to load custom exercises', e);
    return [];
  }
}

export function saveCustomExercise(exercise: Exercise): boolean {
  try {
    const current = readCustomExercises();
    const existingIndex = current.findIndex((e) => e.id === exercise.id);
    let updated: Exercise[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = exercise;
    } else {
      updated = [exercise, ...current];
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iron_custom_exercises_change', { detail: updated }));
    }
    return true;
  } catch (e) {
    console.error('Failed to save custom exercise', e);
    return false;
  }
}

export function deleteCustomExercise(exerciseId: string): void {
  try {
    const current = readCustomExercises();
    const updated = current.filter((e) => e.id !== exerciseId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iron_custom_exercises_change', { detail: updated }));
    }
  } catch (e) {
    console.error('Failed to delete custom exercise', e);
  }
}

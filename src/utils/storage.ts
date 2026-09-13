import { WorkoutSession, Exercise } from '../types/workout';
import { INITIAL_SAMPLE_HISTORY } from '../data/sampleHistory';
import { sanitizeSessionExercises } from './exerciseResolver';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../types/settings';

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
    return parsed.map(sanitizeSessionExercises);
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

export function loadActiveSession(): WorkoutSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    const parsed: WorkoutSession = JSON.parse(raw);
    return sanitizeSessionExercises(parsed);
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

export function loadCustomExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load custom exercises', e);
    return [];
  }
}

export function saveCustomExercise(exercise: Exercise): boolean {
  try {
    const current = loadCustomExercises();
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
    const current = loadCustomExercises();
    const updated = current.filter((e) => e.id !== exerciseId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iron_custom_exercises_change', { detail: updated }));
    }
  } catch (e) {
    console.error('Failed to delete custom exercise', e);
  }
}

// ----------------------------------------------------
// 🌟 사용자 설정 및 광고 제거 (Ad-Free) 상태 관리
// ----------------------------------------------------

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_USER_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_SETTINGS, ...parsed };
  } catch (e) {
    console.error('Failed to load user settings', e);
    return { ...DEFAULT_USER_SETTINGS };
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  try {
    const current = loadUserSettings();
    const updated: UserSettings = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('iron_user_settings_change', { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.error('Failed to save user settings', e);
    return loadUserSettings();
  }
}

export function isAdFreeUser(): boolean {
  return loadUserSettings().isAdFree;
}


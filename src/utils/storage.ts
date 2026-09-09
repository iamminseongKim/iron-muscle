import { WorkoutSession } from '../types/workout';
import { INITIAL_SAMPLE_HISTORY } from '../data/sampleHistory';
import { sanitizeSessionExercises } from './exerciseResolver';

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
      const sanitizedInitial = INITIAL_SAMPLE_HISTORY.map(sanitizeSessionExercises);
      saveSessions(sanitizedInitial);
      return sanitizedInitial;
    }
    const parsed: WorkoutSession[] = JSON.parse(raw);
    return parsed.map(sanitizeSessionExercises);
  } catch (e) {
    console.error('Failed to load sessions', e);
    return INITIAL_SAMPLE_HISTORY.map(sanitizeSessionExercises);
  }
}

export function saveSessions(sessions: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
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
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch (e) {
    console.error('Failed to save active session', e);
  }
}

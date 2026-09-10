import { Exercise, WorkoutSession } from '../types/workout';
import { isMarkdownWorkout, parseMarkdownWorkout } from './markdownParser';

export interface WorkoutBackup { format: 'iron-muscle-backup'; version: 1; exportedAt: string; sessions: WorkoutSession[]; customExercises: Exercise[]; activeSession: WorkoutSession | null; }
const keys = ['iron_workout_sessions_v1', 'iron_custom_exercises_v1', 'iron_active_session_v1'] as const;
const object = (v: any) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v: any) => typeof v === 'string';
const optionalStrings = (v: any, fields: string[]) => fields.every(k => v[k] === undefined || str(v[k]));
const num = (v: any) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
function checkSession(s: any): boolean {
  return object(s) && optionalStrings(s,['notes','conditionEmoji','endTime']) && str(s.id) && str(s.title) && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && str(s.startTime) && num(s.durationSeconds) && typeof s.completed === 'boolean' && Array.isArray(s.exercises) && s.exercises.every((e: any) =>
    object(e) && optionalStrings(e,['exerciseName','machineBrand','machineSetting','notes','groupId','groupLabel','groupColor']) && (e.executionMode === undefined || ['bilateral','unilateral','alternating'].includes(e.executionMode)) && str(e.id) && str(e.exerciseId) && ['barbell','dumbbell','machine','cable','bodyweight','other'].includes(e.equipmentType) && (!e.weightUnit || ['kg','lbs'].includes(e.weightUnit)) && Array.isArray(e.sets) && e.sets.every((t: any) =>
      object(t) && (t.side === undefined || ['both','left','right'].includes(t.side)) && (t.restSeconds === undefined || num(t.restSeconds)) && str(t.id) && num(t.setNumber) && num(t.weight) && num(t.reps) && typeof t.completed === 'boolean' && (t.rpe === undefined || (num(t.rpe) && t.rpe <= 10)) && (t.tempo === undefined || (object(t.tempo) && ['eccentric','pause','concentric'].every(k => num(t.tempo[k])))) && (t.tags === undefined || (Array.isArray(t.tags) && t.tags.every(str))) && (t.comment === undefined || str(t.comment))));
}
export function parseBackup(raw: string): WorkoutBackup {
  if (raw.length > 10_000_000) throw new Error('백업 파일은 10MB 이하만 지원합니다.');
  const trimmed = raw.trim();
  if (isMarkdownWorkout(trimmed)) {
    return parseMarkdownWorkout(trimmed);
  }
  let b: any;
  try {
    b = JSON.parse(raw);
  } catch {
    if (trimmed.includes('세션') || trimmed.includes('|')) {
      return parseMarkdownWorkout(trimmed);
    }
    throw new Error('올바른 마크다운(.md) 일지 또는 JSON 백업 형식이 아닙니다.');
  }
  if (!object(b) || b.format !== 'iron-muscle-backup' || b.version !== 1 || !Array.isArray(b.sessions) || !b.sessions.every(checkSession) || !Array.isArray(b.customExercises) || !(b.activeSession === null || checkSession(b.activeSession))) throw new Error('지원하지 않거나 손상된 백업 파일입니다.');
  for (const e of b.customExercises) {
    if (!object(e) || !optionalStrings(e,['defaultBrand']) || !['id','name','nameEn','category','equipment','description'].every(k=>str(e[k])) || !['categories','primaryMuscles','secondaryMuscles','instructions','tips'].every(k=>Array.isArray(e[k]) && e[k].every(str))) throw new Error('사용자 운동 데이터가 올바르지 않습니다.');
  }
  if (new Set(b.sessions.map((s: WorkoutSession)=>s.id)).size !== b.sessions.length || new Set(b.customExercises.map((e: Exercise)=>e.id)).size !== b.customExercises.length) throw new Error('백업 안에 중복 ID가 있습니다.');
  return b;
}
export function createBackup(): WorkoutBackup {
  return parseBackup(JSON.stringify({format:'iron-muscle-backup',version:1,exportedAt:new Date().toISOString(),sessions:JSON.parse(localStorage.getItem(keys[0]) || '[]'),customExercises:JSON.parse(localStorage.getItem(keys[1]) || '[]'),activeSession:JSON.parse(localStorage.getItem(keys[2]) || 'null')}));
}
export function restoreBackup(incoming: WorkoutBackup) {
  incoming = parseBackup(JSON.stringify(incoming));
  const current = createBackup();
  for (const e of incoming.customExercises) {
    const existing = current.customExercises.find(x=>x.id===e.id);
    if (existing && JSON.stringify(existing)!==JSON.stringify(e)) throw new Error(`사용자 운동 '${e.name}'의 ID가 기존 운동과 충돌합니다. 복원을 중단했습니다.`);
  }
  const added = incoming.sessions.filter(s=>!current.sessions.some(e=>e.id===s.id));
  const sessions = [...current.sessions,...added];
  const customExercises = [...current.customExercises,...incoming.customExercises.filter(e=>!current.customExercises.some(x=>x.id===e.id))];
  const active = current.activeSession || (incoming.activeSession && !sessions.some(s=>s.id===incoming.activeSession!.id) ? incoming.activeSession : null);
  const before = keys.map(k=>localStorage.getItem(k));
  try {
    localStorage.setItem(keys[0],JSON.stringify(sessions));
    localStorage.setItem(keys[1],JSON.stringify(customExercises));
    if (active) localStorage.setItem(keys[2],JSON.stringify(active));
  } catch (error) {
    keys.forEach((k,i)=>{try {if(before[i]===null)localStorage.removeItem(k);else localStorage.setItem(k,before[i]!);}catch{}});
    throw new Error('저장 공간 또는 저장 권한 문제로 복원하지 못했습니다.');
  }
  window.dispatchEvent(new CustomEvent('iron_custom_exercises_change',{detail:customExercises}));
  window.dispatchEvent(new CustomEvent('iron_active_session_change',{detail:active}));
  return {sessions,added:added.length,skipped:incoming.sessions.length-added.length};
}

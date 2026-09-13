import type { WorkoutSession } from '../../types/workout';

export interface BodyWeight { kg: number; measuredAt: string; source: 'manual' | 'health' }
export interface HealthPreferences { autoWeight: boolean; autoExport: boolean; weight?: BodyWeight; lastWeightSync?: string }
export interface WorkoutExport { id: string; startTime: string; endTime: string }
export interface ExportJob { workout: WorkoutExport; state: 'pending' | 'failed' | 'sent'; updatedAt: string }
const PREFERENCES = 'iron_health_preferences_v1';
const JOBS = 'iron_health_exports_v1';
export const HEALTH_CHANGE = 'iron_health_change';
export function validWeight(value: unknown): value is BodyWeight {
  const w = value as BodyWeight | undefined;
  return !!w && Number.isFinite(w.kg) && w.kg >= 1 && w.kg <= 500 &&
    ['manual', 'health'].includes(w.source) && Number.isFinite(Date.parse(w.measuredAt)) && Date.parse(w.measuredAt) <= Date.now() + 60000;
}
function changed() { if (typeof window !== 'undefined') window.dispatchEvent(new Event(HEALTH_CHANGE)); }
export function loadHealthPreferences(): HealthPreferences {
  try {
    const p = JSON.parse(localStorage.getItem(PREFERENCES) || '{}');
    return { autoWeight: p.autoWeight === true, autoExport: p.autoExport === true,
      weight: validWeight(p.weight) ? p.weight : undefined,
      lastWeightSync: typeof p.lastWeightSync === 'string' ? p.lastWeightSync : undefined };
  } catch { return { autoWeight: false, autoExport: false }; }
}
export function updateHealthPreferences(patch: Partial<HealthPreferences>) {
  const next = { ...loadHealthPreferences(), ...patch };
  if (next.weight && !validWeight(next.weight)) throw new Error('Invalid weight');
  localStorage.setItem(PREFERENCES, JSON.stringify(next));
  changed();
  return next;
}
export function saveManualWeight(kg: number) {
  return updateHealthPreferences({ weight: { kg, source: 'manual', measuredAt: new Date().toISOString() }, autoWeight: false });
}
export function workoutExport(session: WorkoutSession): WorkoutExport | null {
  const start = Date.parse(session.startTime), end = Date.parse(session.endTime || '');
  if (!session.completed || !session.id || !Number.isFinite(start) || !Number.isFinite(end) || end <= start ||
      end > Date.now() + 60000 || !session.exercises.some(e => e.sets.some(s => s.completed && s.reps > 0))) return null;
  return { id: session.id, startTime: session.startTime, endTime: session.endTime! };
}
export function loadExportJobs(): ExportJob[] {
  try {
    const jobs = JSON.parse(localStorage.getItem(JOBS) || '[]');
    if (!Array.isArray(jobs)) return [];
    return jobs.filter(j => j && ['pending', 'failed', 'sent'].includes(j.state) && typeof j.workout?.id === 'string' &&
      Number.isFinite(Date.parse(j.workout.startTime)) && Number.isFinite(Date.parse(j.workout.endTime)));
  } catch { return []; }
}
export function saveExportJob(job: ExportJob) {
  const jobs = loadExportJobs();
  localStorage.setItem(JOBS, JSON.stringify([...jobs.filter(j => j.workout.id !== job.workout.id), job]));
  changed();
}
export function enqueueWorkout(session: WorkoutSession): boolean {
  if (!loadHealthPreferences().autoExport) return false;
  const workout = workoutExport(session);
  if (!workout || loadExportJobs().some(j => j.workout.id === workout.id)) return false;
  saveExportJob({ workout, state: 'pending', updatedAt: new Date().toISOString() });
  return true;
}

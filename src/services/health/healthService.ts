import { Capacitor, registerPlugin } from '@capacitor/core';
import { loadHealthPreferences, updateHealthPreferences, loadExportJobs, saveExportJob, validWeight, type WorkoutExport } from './healthStore';
interface HealthBridge {
  status(): Promise<{ available: boolean; writeWorkout: boolean }>;
  authorize(options: { readWeight: boolean; writeWorkout: boolean }): Promise<void>;
  latestWeight(): Promise<{ kg?: number; measuredAt?: string }>;
  writeWorkout(workout: WorkoutExport): Promise<void>;
  openSettings(): Promise<void>;
}
const bridge = registerPlugin<HealthBridge>('IronHealth');
export const healthPlatform = () => Capacitor.getPlatform();
export async function healthStatus() {
  if (!Capacitor.isNativePlatform()) return { available: false, writeWorkout: false };
  return bridge.status();
}
export async function enableHealthFeature(feature: 'autoWeight' | 'autoExport') {
  if (!(await healthStatus()).available) throw new Error('unavailable');
  await bridge.authorize({ readWeight: feature === 'autoWeight', writeWorkout: feature === 'autoExport' });
  if (feature === 'autoExport' && !(await healthStatus()).writeWorkout) throw new Error('permission');
  // iOS deliberately does not reveal read authorization; only a successful query proves data availability.
  updateHealthPreferences({ [feature]: true });
  if (feature === 'autoWeight') return syncWeight();
  return false;
}
export async function syncWeight(): Promise<boolean> {
  if (!loadHealthPreferences().autoWeight) return false;
  const result = await bridge.latestWeight();
  const weight = { kg: result.kg, measuredAt: result.measuredAt, source: 'health' as const };
  if (!validWeight(weight)) return false;
  // Do not overwrite a manual edit made while the native query was in flight.
  if (!loadHealthPreferences().autoWeight) return false;
  updateHealthPreferences({ weight, lastWeightSync: new Date().toISOString() });
  return true;
}
let processing: Promise<void> | undefined;
export function flushWorkoutExports(): Promise<void> {
  if (processing) return processing;
  processing = (async () => {
    if (!loadHealthPreferences().autoExport || !(await healthStatus()).available) return;
    for (const job of loadExportJobs().filter(j => j.state !== 'sent')) {
      if (!loadHealthPreferences().autoExport) break;
      try {
        await bridge.writeWorkout(job.workout);
        saveExportJob({ ...job, state: 'sent', updatedAt: new Date().toISOString() });
      } catch {
        saveExportJob({ ...job, state: 'failed', updatedAt: new Date().toISOString() });
        break; // Avoid repeatedly prompting/failing for every queued workout when permission was revoked.
      }
    }
  })().finally(() => { processing = undefined; });
  return processing;
}
export async function refreshHealth() {
  if (!Capacitor.isNativePlatform()) return;
  await Promise.allSettled([
    loadHealthPreferences().autoWeight ? syncWeight() : Promise.resolve(),
    flushWorkoutExports(),
  ]);
}
export async function openHealthSettings() { await bridge.openSettings(); }

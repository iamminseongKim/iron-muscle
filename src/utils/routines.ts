import { Capacitor } from '@capacitor/core';
import type { WorkoutSession, WorkoutExercise, EquipmentType, ExecutionMode } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { getTodayString } from './calendar';

const key = 'iron_routines_v1';
export const ROUTINES_CHANGE = 'iron_routines_change';
export interface Routine {
  format: 'iron-muscle-routine'; version: 1; id: string; name: string;
  exercises: { exerciseId: string; name: string; equipment: EquipmentType; mode: ExecutionMode; group?: number;
    groupType?: WorkoutExercise['groupType']; sets: { reps: number; rest: number; side: 'both' | 'left' | 'right' }[] }[];
}
const error = () => new Error('루틴 형식이 올바르지 않거나 너무 큽니다.');
const text = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
/** Reconstruct an allowlisted recipe; never forward source session metadata or unknown fields. */
export function parseRoutine(raw: string): Routine {
  if (raw.length > 100000) throw error();
  if (raw.includes('#routine=')) {
    const encoded = raw.split('#routine=')[1];
    try { raw = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(encoded), c => c.charCodeAt(0))); } catch { throw error(); }
  }
  let value: any;
  try { value = JSON.parse(raw); } catch { throw error(); }
  if (!value || value.format !== 'iron-muscle-routine' || value.version !== 1 || !text(value.name, 100) || !Array.isArray(value.exercises) || !value.exercises.length || value.exercises.length > 50) throw error();
  return { format: 'iron-muscle-routine', version: 1, id: text(value.id, 100) ? value.id : crypto.randomUUID(), name: value.name.trim(),
    exercises: value.exercises.map((e: any) => {
      if (!e || !text(e.exerciseId, 160) || !text(e.name, 160) || !['smith','barbell','dumbbell','machine','cable','bodyweight','other'].includes(e.equipment) || !['bilateral','unilateral','alternating'].includes(e.mode) || !Array.isArray(e.sets) || e.sets.length < 1 || e.sets.length > 50) throw error();
      if (e.group !== undefined && (!Number.isInteger(e.group) || e.group < 0 || e.group > 49 || !['superset','compound','giant'].includes(e.groupType))) throw error();
      return { exerciseId: e.exerciseId, name: e.name, equipment: e.equipment, mode: e.mode,
        ...(e.group !== undefined ? { group: e.group, groupType: e.groupType } : {}),
        sets: e.sets.map((s: any) => {
          if (!s || !Number.isInteger(s.reps) || s.reps < 0 || s.reps > 1000 || !Number.isInteger(s.rest) || s.rest < 0 || s.rest > 3600 || !['both','left','right'].includes(s.side)) throw error();
          return { reps: s.reps, rest: s.rest, side: s.side };
        }) };
    }) };
}
export function recipeFromSession(session: WorkoutSession, name: string, rest: number): Routine {
  const groups = [...new Set(session.exercises.map(e => e.groupId).filter(Boolean))];
  return parseRoutine(JSON.stringify({ format: 'iron-muscle-routine', version: 1, id: crypto.randomUUID(), name,
    exercises: session.exercises.filter(e => e.sets.length).map(e => ({ exerciseId: e.exerciseId,
      name: resolveRecordedExercise(e).name, equipment: e.equipmentType, mode: e.executionMode || 'bilateral',
      ...(e.groupId && e.groupType && e.groupType !== 'single' ? { group: groups.indexOf(e.groupId), groupType: e.groupType } : {}),
      sets: e.sets.map(s => ({ reps: s.reps, rest: s.plannedRestSeconds ?? rest, side: s.side || 'both' })) })) }));
}
export function loadRoutines(): Routine[] { return JSON.parse(localStorage.getItem(key) || '[]').map((r: Routine) => parseRoutine(JSON.stringify(r))); }
export function saveRoutine(recipe: Routine) {
  const safe = parseRoutine(JSON.stringify(recipe));
  const list = loadRoutines();
  if (list.length >= 100 && !list.some(r => r.id === safe.id)) throw error();
  localStorage.setItem(key, JSON.stringify([safe, ...list.filter(r => r.id !== safe.id)]));
  window.dispatchEvent(new Event(ROUTINES_CHANGE));
}
export function deleteRoutine(id: string) {
  localStorage.setItem(key, JSON.stringify(loadRoutines().filter(r => r.id !== id)));
  window.dispatchEvent(new Event(ROUTINES_CHANGE));
}
export function routineLink(recipe: Routine) {
  if (Capacitor.isNativePlatform() || !/^https?:$/.test(location.protocol)) throw new Error('이 환경에서는 루틴 파일로 공유하세요.');
  const raw = JSON.stringify(parseRoutine(JSON.stringify(recipe)));
  const encoded = btoa(Array.from(new TextEncoder().encode(raw), byte => String.fromCharCode(byte)).join(''));
  const url = new URL(location.href); url.hash = `routine=${encoded}`; url.search = '';
  if (url.href.length > 16000) throw new Error('링크가 너무 깁니다. 루틴 파일로 공유하세요.');
  return url.href;
}
export function sessionFromRoutine(recipe: Routine): WorkoutSession {
  const routine = parseRoutine(JSON.stringify(recipe));
  const id = crypto.randomUUID();
  return { id, title: routine.name, date: getTodayString(), startTime: new Date().toISOString(), durationSeconds: 0, completed: false, weightUnit: 'kg',
    exercises: routine.exercises.map(e => ({ id: crypto.randomUUID(), exerciseId: e.exerciseId, exerciseName: e.name, equipmentType: e.equipment, executionMode: e.mode, weightUnit: 'kg',
      ...(e.group !== undefined ? { groupId: `${id}-group-${e.group}`, groupType: e.groupType } : {}),
      sets: e.sets.map((s, i) => ({ id: crypto.randomUUID(), setNumber: i + 1, reps: s.reps, weight: 0, completed: false, side: s.side, plannedRestSeconds: s.rest })) })) };
}

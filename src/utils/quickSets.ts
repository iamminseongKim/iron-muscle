import { WorkoutSet, Tempo } from '../types/workout';

export interface QuickSetPlan {
  mode: 'same' | 'top' | 'pyramid';
  count: number;
  weight: number;
  reps: number;
  rpe?: number;
  tempo?: Tempo;
  backoffWeight: number;
  backoffReps: number;
  backoffRpe?: number;
  weightStep: number;
  repsStep: number;
}

export function buildQuickSets(plan: QuickSetPlan): Pick<WorkoutSet, 'weight' | 'reps' | 'rpe' | 'tempo' | 'tags'>[] {
  if (!Number.isInteger(plan.count) || plan.count < 1 || plan.count > 20) throw new Error('세트 수는 1~20 사이의 정수로 입력하세요.');
  const sets = Array.from({ length: plan.count }, (_, i) => ({
    weight: plan.mode === 'top' && i > 0 ? plan.backoffWeight : plan.weight + (plan.mode === 'pyramid' ? plan.weightStep * i : 0),
    reps: plan.mode === 'top' && i > 0 ? plan.backoffReps : plan.reps + (plan.mode === 'pyramid' ? plan.repsStep * i : 0),
    rpe: plan.mode === 'top' && i > 0 ? plan.backoffRpe : plan.rpe,
    tempo: plan.tempo ? { ...plan.tempo } : undefined,
    tags: plan.mode === 'top' ? [i === 0 ? '탑세트' : '백오프'] : undefined,
  }));
  for (const set of sets) {
    set.weight = Math.round(set.weight * 100) / 100;
    if (!Number.isFinite(set.weight) || set.weight < 0 || !Number.isInteger(set.reps) || set.reps < 1) throw new Error('모든 세트의 무게는 0 이상, 횟수는 1 이상의 정수여야 합니다.');
    if (set.rpe !== undefined && (!Number.isFinite(set.rpe) || set.rpe < 6 || set.rpe > 10 || set.rpe * 2 % 1 !== 0)) throw new Error('RPE는 6~10 사이에서 0.5 단위로 입력하세요.');
    if (set.tempo && Object.values(set.tempo).some(v => !Number.isFinite(v) || v < 0 || v > 30)) throw new Error('템포는 각각 0~30초로 입력하세요.');
  }
  return sets;
}

// Never remove existing rows or overwrite completed records and their metadata.
export function applyQuickSets(existing: WorkoutSet[], plan: QuickSetPlan, side: WorkoutSet['side'] = 'both'): WorkoutSet[] {
  const planned = buildQuickSets(plan);
  let cursor = 0;
  const result = existing.map(set => {
    if (set.completed || cursor >= planned.length) return set;
    const next = planned[cursor++];
    const tags = [...(set.tags || []).filter(t => t !== '탑세트' && t !== '백오프'), ...(next.tags || [])];
    return { ...set, ...next, tags: tags.length ? tags : undefined };
  });
  while (cursor < planned.length) {
    result.push({ ...planned[cursor++], id: crypto.randomUUID(), setNumber: result.length + 1, completed: false, side });
  }
  return result;
}

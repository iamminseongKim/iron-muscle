import React, { useState } from 'react';
import { WorkoutExercise, WeightUnit } from '../../types/workout';
import { applyQuickSets, buildQuickSets, QuickSetPlan } from '../../utils/quickSets';

export function QuickSetEditor({ item, unit, onApply, onClose }: {
  item: WorkoutExercise; unit: WeightUnit; onApply: (item: WorkoutExercise) => void; onClose: () => void;
}) {
  const seed = item.sets.find(s => !s.completed) || item.sets[item.sets.length - 1];
  const [plan, setPlan] = useState<QuickSetPlan>({
    mode: 'same', count: Math.min(20, item.sets.filter(s => !s.completed).length || 3),
    weight: seed?.weight ?? 20, reps: seed?.reps || 10, rpe: seed?.rpe,
    tempo: seed?.tempo ? { ...seed.tempo } : undefined,
    backoffWeight: Math.round((seed?.weight ?? 20) * 0.9 * 2) / 2,
    backoffReps: seed?.reps || 10, backoffRpe: seed?.rpe,
    weightStep: 2.5, repsStep: -2,
  });
  const change = (patch: Partial<QuickSetPlan>) => setPlan(p => ({ ...p, ...patch }));
  const inputClass = 'w-full min-w-0 mt-1 rounded-lg p-2 bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white border border-black/10 dark:border-white/10';
  const number = (label: string, key: 'count' | 'weight' | 'reps' | 'backoffWeight' | 'backoffReps' | 'weightStep' | 'repsStep', step = 1) => (
    <label className="min-w-0 text-xs text-gray-600 dark:text-gray-300">{label}
      <input aria-label={label} className={inputClass} type="number" inputMode={step === 1 ? 'numeric' : 'decimal'} step={step} value={Number.isNaN(plan[key]) ? '' : plan[key]} onChange={e => change({ [key]: e.target.value === '' ? NaN : Number(e.target.value) })} />
    </label>
  );
  const rpe = (label: string, key: 'rpe' | 'backoffRpe') => (
    <label className="text-xs text-gray-600 dark:text-gray-300">{label}
      <select aria-label={label} className={inputClass} value={plan[key] ?? ''} onChange={e => change({ [key]: e.target.value ? Number(e.target.value) : undefined })}>
        <option value="">미지정</option>
        {Array.from({ length: 9 }, (_, i) => 6 + i * 0.5).map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );
  let error = '';
  let preview: ReturnType<typeof buildQuickSets> = [];
  try { preview = buildQuickSets(plan); } catch (e) { error = (e as Error).message; }
  const pending = item.sets.filter(s => !s.completed).length;
  return (
    <section aria-label="세트 퀵 설정" className="m-2 p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#151516] space-y-3">
      <div className="flex justify-between items-center"><h4 className="font-bold text-sm dark:text-white">세트 퀵 설정</h4><button type="button" onClick={onClose} className="text-xs p-2 text-gray-500">닫기</button></div>
      <div className="grid grid-cols-3 gap-1">
        {([['same', '동일 반복'], ['top', '탑 + 백오프'], ['pyramid', '피라미드']] as const).map(([mode, label]) => <button type="button" key={mode} aria-pressed={plan.mode === mode} onClick={() => change({ mode })} className={`rounded-lg py-2 text-xs font-bold ${plan.mode === mode ? 'bg-[#FF2D55] text-white' : 'bg-white dark:bg-[#2C2C2E] text-gray-500'}`}>{label}</button>)}
      </div>
      <p className="text-xs text-gray-500">{plan.mode === 'same' ? '한 번 입력한 값을 여러 세트에 반복합니다.' : plan.mode === 'top' ? '첫 세트는 탑세트, 나머지는 백오프로 설정합니다.' : '첫 세트를 기준으로 무게와 횟수를 일정하게 바꿉니다. 감소는 음수로 입력하세요.'}</p>
      <div className="grid grid-cols-2 gap-3">
        {number('설정할 세트 수', 'count')}
        {rpe(plan.mode === 'top' ? '탑세트 RPE' : '공통 RPE', 'rpe')}
        {number(`${plan.mode === 'top' ? '탑세트' : '첫 세트'} 무게 (${unit})`, 'weight', 0.5)}
        {number(`${plan.mode === 'top' ? '탑세트' : '첫 세트'} 횟수`, 'reps')}
        {plan.mode === 'top' && <>{number(`백오프 무게 (${unit})`, 'backoffWeight', 0.5)}{number('백오프 횟수', 'backoffReps')}{rpe('백오프 RPE', 'backoffRpe')}</>}
        {plan.mode === 'pyramid' && <>{number(`세트당 무게 변화 (${unit})`, 'weightStep', 0.5)}{number('세트당 횟수 변화', 'repsStep')}</>}
      </div>
      <label className="flex items-center gap-2 text-xs dark:text-gray-200"><input type="checkbox" checked={!!plan.tempo} onChange={e => change({ tempo: e.target.checked ? { eccentric: 3, pause: 0, concentric: 1 } : undefined })} />공통 템포 설정 (초)</label>
      {plan.tempo && <div className="grid grid-cols-3 gap-2">{([['eccentric', '이완'], ['pause', '정지'], ['concentric', '수축']] as const).map(([key, label]) => <label key={key} className="text-xs text-gray-500">{label}<input aria-label={`공통 템포 ${label}`} type="number" inputMode="decimal" min="0" max="30" step="0.5" className={inputClass} value={Number.isNaN(plan.tempo![key]) ? '' : plan.tempo![key]} onChange={e => change({ tempo: { ...plan.tempo!, [key]: e.target.value === '' ? NaN : Number(e.target.value) } })} /></label>)}</div>}
      <div className="rounded-lg bg-white dark:bg-[#2C2C2E] p-2 text-xs space-y-1">
        <p className="font-bold text-gray-600 dark:text-gray-200">적용 미리보기</p>
        {error ? <p role="alert" className="text-red-500">{error}</p> : <ol className="max-h-40 overflow-y-auto space-y-1">{preview.map((s, i) => <li key={i} className="text-gray-600 dark:text-gray-300">{i + 1}. {s.tags?.[0] || ''} {s.weight}{unit} × {s.reps}회 · RPE {s.rpe ?? '—'} · {s.tempo ? `${s.tempo.eccentric}-${s.tempo.pause}-${s.tempo.concentric}초` : '템포 —'}</li>)}</ol>}
      </div>
      <p className="text-xs text-gray-500">완료한 세트는 유지합니다. 미완료 세트부터 {Number.isFinite(plan.count) ? plan.count : '—'}개에 적용하며 부족하면 추가합니다.{pending > plan.count ? ` 남는 ${pending - plan.count}개 세트는 유지합니다.` : ''} RPE 미지정·템포 해제 시 대상 세트의 해당 값도 지워집니다.</p>
      <button type="button" disabled={!!error} onClick={() => { onApply({ ...item, sets: applyQuickSets(item.sets, plan, item.executionMode === 'unilateral' ? 'left' : 'both') }); onClose(); }} className="w-full py-3 rounded-xl bg-[#FF2D55] text-white text-sm font-bold disabled:opacity-40">{Number.isFinite(plan.count) ? plan.count : '—'}세트 적용</button>
    </section>
  );
}

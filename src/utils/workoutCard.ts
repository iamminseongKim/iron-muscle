import { WorkoutSession, WeightUnit } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { KG_TO_LBS } from './calculations';

export function summarizeWorkoutDay(sessions: WorkoutSession[], date: string, unit: WeightUnit = 'kg') {
  const rows = new Map<string, { name: string; sets: number; reps: number; maxWeight: number }>();
  let seconds = 0, volumeKg = 0;
  for (const session of sessions.filter(s => s.date === date)) {
    let hasCompleted = false;
    for (const exercise of session.exercises) {
      const sets = exercise.sets.filter(s => s.completed && s.reps > 0);
      if (!sets.length) continue;
      hasCompleted = true;
      const resolved = resolveRecordedExercise(exercise);
      const row = rows.get(resolved.id) || { name: resolved.name, sets: 0, reps: 0, maxWeight: 0 };
      for (const set of sets) {
        const kg = Math.max(0, set.weight) / (exercise.weightUnit === 'lbs' ? KG_TO_LBS : 1);
        row.sets++;
        row.reps += set.reps;
        row.maxWeight = Math.max(row.maxWeight, kg * (unit === 'lbs' ? KG_TO_LBS : 1));
        volumeKg += kg * set.reps;
      }
      rows.set(resolved.id, row);
    }
    if (hasCompleted) seconds += Math.max(0, session.durationSeconds);
  }
  const exercises = [...rows.values()];
  return { date, unit, exercises, seconds, volume: Math.round(volumeKg * (unit === 'lbs' ? KG_TO_LBS : 1)),
    sets: exercises.reduce((sum, row) => sum + row.sets, 0), reps: exercises.reduce((sum, row) => sum + row.reps, 0) };
}

export function renderWorkoutCard(summary: ReturnType<typeof summarizeWorkoutDay>, light = false): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 만들 수 없는 환경입니다.');
  const font = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  const wrap = (value: string) => {
    ctx.font = `bold 36px ${font}`;
    const lines: string[] = [];
    let line = '';
    for (const char of value) {
      if (ctx.measureText(line + char).width > 790 && line) { lines.push(line); line = ''; }
      line += char;
    }
    if (line) lines.push(line);
    return lines;
  };
  const rows = summary.exercises.map(row => ({ ...row, lines: wrap(row.name) }));
  canvas.width = 1080;
  canvas.height = Math.max(1350, 650 + rows.reduce((sum, row) => sum + 100 + row.lines.length * 44, 0));
  const bg = light ? '#f4f5ef' : '#101310', fg = light ? '#182016' : '#f4f7ee', muted = light ? '#58624f' : '#a7b19d', accent = light ? '#3c6217' : '#c6f36b';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const text = (value: string, x: number, y: number, size: number, color = fg, bold = false) => {
    ctx.font = `${bold ? 'bold' : 'normal'} ${size}px ${font}`; ctx.fillStyle = color; ctx.fillText(value, x, y);
  };
  ctx.fillStyle = accent; ctx.fillRect(64, 64, 10, 32);
  text('IRON MUSCLE / WORKOUT LOG', 94, 89, 25, accent, true);
  text('오늘도, 해냈다.', 64, 202, 76, fg, true);
  text(summary.date.replace(/-/g, '.'), 68, 261, 30, muted);
  const stats = [[String(summary.exercises.length), '운동 종목'], [String(summary.sets), '완료 세트'], [String(Math.round(summary.seconds / 60)), '운동 시간 (분)']];
  stats.forEach(([value, label], i) => { text(value, 68 + i * 330, 366, 68, accent, true); text(label, 68 + i * 330, 410, 26, muted); });
  text(`총 ${summary.reps.toLocaleString()}회  /  ${summary.volume.toLocaleString()} ${summary.unit} 볼륨`, 68, 476, 30, fg, true);
  let y = 525;
  rows.forEach((row, index) => {
    ctx.fillStyle = light ? '#d5dacd' : '#30392b'; ctx.fillRect(64, y, 952, 1);
    text(String(index + 1).padStart(2, '0'), 68, y + 59, 27, accent, true);
    row.lines.forEach((line, n) => text(line, 140, y + 60 + n * 44, 36, fg, true));
    text(`${row.sets}세트 · ${row.reps}회 · ${row.maxWeight > 0 ? `최고 ${Number(row.maxWeight.toFixed(1))}${summary.unit}` : '맨몸'}`, 140, y + 60 + row.lines.length * 44, 27, muted);
    y += 100 + row.lines.length * 44;
  });
  text('완료 세트 기준 · 볼륨은 기록 중량 × 반복수', 68, canvas.height - 76, 23, muted);
  text('BUILT BY EFFORT.  /  IRON MUSCLE', 68, canvas.height - 36, 22, accent, true);
  return canvas.toDataURL('image/png');
}

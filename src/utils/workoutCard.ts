import { ANATOMY_REGIONS } from '../data/anatomyRegions';
import { WorkoutSession, WeightUnit } from '../types/workout';
import { resolveRecordedExercise } from './exerciseResolver';
import { KG_TO_LBS } from './calculations';

export function summarizeWorkoutDay(sessions: WorkoutSession[], date: string, unit: WeightUnit = 'kg') {
  const rows = new Map<string, { name: string; sets: number; reps: number; maxWeight: number; groupLabel?: string }>();
  const primaryMuscles = new Set<string>(), secondaryMuscles = new Set<string>();
  const groupLabels = new Map<string, string>();
  const exerciseIds = new Set<string>();
  let seconds = 0, volumeKg = 0;
  for (const [sessionIndex, session] of sessions.filter(s => s.date === date).entries()) {
    let hasCompleted = false;
    for (const exercise of session.exercises) {
      const sets = exercise.sets.filter(s => s.completed && s.reps > 0);
      if (!sets.length) continue;
      hasCompleted = true;
      const resolved = resolveRecordedExercise(exercise);
      resolved.primaryMuscles.forEach(m => primaryMuscles.add(m));
      resolved.secondaryMuscles.forEach(m => secondaryMuscles.add(m));
      exerciseIds.add(resolved.id);
      const grouped = exercise.groupId && exercise.groupType && exercise.groupType !== 'single';
      const groupKey = grouped ? JSON.stringify([sessionIndex, exercise.groupId, exercise.groupType]) : '';
      if (groupKey && !groupLabels.has(groupKey)) {
        let number = groupLabels.size + 1, letter = '';
        while (number > 0) { number--; letter = String.fromCharCode(65 + number % 26) + letter; number = Math.floor(number / 26); }
        const kind = exercise.groupType === 'superset' ? '슈퍼' : exercise.groupType === 'compound' ? '컴파운드' : '자이언트';
        groupLabels.set(groupKey, `${kind} ${letter}`);
      }
      const rowKey = JSON.stringify([resolved.id, groupKey]);
      const row = rows.get(rowKey) || { name: resolved.name, sets: 0, reps: 0, maxWeight: 0, groupLabel: groupLabels.get(groupKey) };
      for (const set of sets) {
        const kg = Math.max(0, set.weight) / (exercise.weightUnit === 'lbs' ? KG_TO_LBS : 1);
        row.sets++;
        row.reps += set.reps;
        row.maxWeight = Math.max(row.maxWeight, kg * (unit === 'lbs' ? KG_TO_LBS : 1));
        volumeKg += kg * set.reps;
      }
      rows.set(rowKey, row);
    }
    if (hasCompleted) seconds += Math.max(0, session.durationSeconds);
  }
  const exercises = [...rows.values()];
  return { exerciseCount: exerciseIds.size, primaryMuscles: [...primaryMuscles], secondaryMuscles: [...secondaryMuscles].filter(m => !primaryMuscles.has(m)), date, unit, exercises, seconds, volume: Math.round(volumeKg * (unit === 'lbs' ? KG_TO_LBS : 1)),
    sets: exercises.reduce((sum, row) => sum + row.sets, 0), reps: exercises.reduce((sum, row) => sum + row.reps, 0) };
}

export const WORKOUT_CARD_QUOTES = ['오늘의 나를 기록하다.', '조금씩, 더 강하게.', '꾸준함이 만드는 변화.', '나만의 속도로, 한 걸음 더.', '오늘의 노력은 남는다.', '어제보다 한 세트 더.'];

export function recommendWorkoutQuote(previous = ''): string {
  const choices = WORKOUT_CARD_QUOTES.filter(quote => quote !== previous);
  return choices[Math.floor(Math.random() * choices.length)];
}

export interface WorkoutCardStyle {
  light: boolean;
  title: string;
  photo?: HTMLImageElement;
  anatomy?: HTMLImageElement;
  textColor: 'auto' | 'white' | 'black';
  overlay: number;
}

/** Decode only the chosen local file; downsample large photos before rendering. */
export async function loadWorkoutPhoto(file: File): Promise<HTMLImageElement> {
  if (file.size > 30 * 1024 * 1024) throw new Error('30MB 이하의 사진을 골라 주세요.');
  const url = URL.createObjectURL(file);
  try {
    const source = new Image();
    source.src = url;
    await source.decode();
    const scale = Math.min(1, 2160 / Math.max(source.naturalWidth, source.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(source.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('사진을 열 수 없습니다.');
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const photo = new Image();
    photo.src = canvas.toDataURL('image/jpeg', 0.9);
    await photo.decode();
    return photo;
  } catch (error) {
    if (error instanceof Error && error.message.includes('30MB')) throw error;
    throw new Error('사진을 열 수 없습니다. JPG 또는 PNG 사진으로 다시 골라 주세요.');
  } finally { URL.revokeObjectURL(url); }
}

export function renderWorkoutCard(summary: ReturnType<typeof summarizeWorkoutDay>, style: WorkoutCardStyle): string {
  const { light, photo } = style;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 만들 수 없는 환경입니다.');
  const font = '"Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
  const wrap = (value: string, size = 36, width = 790) => {
    ctx.font = `bold ${size}px ${font}`;
    const lines: string[] = [];
    let line = '';
    for (const char of value) {
      if (ctx.measureText(line + char).width > width && line) { lines.push(line); line = ''; }
      line += char;
    }
    if (line) lines.push(line);
    return lines;
  };
  const rows = summary.exercises.map(row => ({ ...row, lines: wrap(row.name) }));
  const titleLines = wrap(style.title.trim() || '오늘의 운동', 64, 944);
  const extraHeight = Math.max(0, titleLines.length - 1) * 76;
  canvas.width = 1080;
  canvas.height = Math.max(1630 + extraHeight, 930 + extraHeight + rows.reduce((sum, row) => sum + 100 + row.lines.length * 44, 0));
  const darkText = style.textColor === 'black' || (style.textColor === 'auto' && !photo && light);
  const bg = light ? '#F2F2F7' : '#000000';
  const fg = darkText ? '#1D1D1F' : '#FFFFFF';
  const muted = photo ? fg : darkText ? '#6E6E73' : '#AEAEB2';
  const accent = photo || style.textColor !== 'auto' ? fg : fg;
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (photo) {
    const scale = Math.max(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight);
    const width = photo.naturalWidth * scale, height = photo.naturalHeight * scale;
    ctx.drawImage(photo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }
  // The veil follows the text color so both dark and light lettering stay readable.
  if (photo || style.textColor !== 'auto') {
    ctx.fillStyle = darkText ? `rgba(255,255,255,${photo ? style.overlay : 0.92})` : `rgba(0,0,0,${photo ? style.overlay : 0.92})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const text = (value: string, x: number, y: number, size: number, color = fg, bold = false) => {
    ctx.font = `${bold ? 'bold' : 'normal'} ${size}px ${font}`; ctx.fillStyle = color; ctx.fillText(value, x, y);
  };
  ctx.fillStyle = accent; ctx.fillRect(64, 64, 10, 32);
  text('IRON MUSCLE / WORKOUT LOG', 94, 89, 25, accent, true);
  titleLines.forEach((line, index) => text(line, 64, 202 + index * 76, 64, fg, true));
  text(summary.date.replace(/-/g, '.'), 68, 261 + extraHeight, 30, muted);
  const stats = [[String(summary.exerciseCount), '운동 종목'], [String(summary.sets), '완료 세트'], [String(Math.round(summary.seconds / 60)), '운동 시간 (분)']];
  stats.forEach(([value, label], i) => {
    text(value, 68 + i * 330, 366 + extraHeight, 68, accent, true); text(label, 68 + i * 330, 410 + extraHeight, 26, muted); });
  text(`총 ${summary.reps.toLocaleString()}회  /  ${summary.volume.toLocaleString()} ${summary.unit} 볼륨`, 68, 476 + extraHeight, 30, fg, true);
  let y = 525 + extraHeight;
  rows.forEach((row, index) => {
    ctx.fillStyle = darkText ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.22)'; ctx.fillRect(64, y, 952, 1);
    text(String(index + 1).padStart(2, '0'), 68, y + 59, 27, accent, true);
    row.lines.forEach((line, n) => text(line, 140, y + 60 + n * 44, 36, fg, true));
    text(`${row.groupLabel ? `[${row.groupLabel}] · ` : ''}${row.sets}세트 · ${row.reps}회 · ${row.maxWeight > 0 ? `최고 ${Number(row.maxWeight.toFixed(1))}${summary.unit}` : '맨몸'}`, 140, y + 60 + row.lines.length * 44, 27, muted);
    y += 100 + row.lines.length * 44;
  });
  if (style.anatomy) {
    ctx.save();
    const x = 752, y = canvas.height - 365, scale = 250 / 1122;
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(x - 12, y - 12, 274, 336, 18); ctx.fill();
    ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.drawImage(style.anatomy, 0, 0, 1122, 1402);
    for (const region of ANATOMY_REGIONS) {
      const primary = summary.primaryMuscles.includes(region.id);
      if (!primary && !summary.secondaryMuscles.includes(region.id)) continue;
      ctx.fillStyle = primary ? '#FF2D55' : '#FF9500'; ctx.globalAlpha = 0.8;
      ctx.fill(new Path2D(region.d));
      if (region.mirror) { ctx.save(); ctx.translate(region.mirror, 0); ctx.scale(-1, 1); ctx.fill(new Path2D(region.d)); ctx.restore(); }
    }
    ctx.restore();
    text('오늘 운동한 부위', 68, canvas.height - 246, 28, fg, true);
    text('● 주동근', 68, canvas.height - 201, 24, '#FF2D55');
    text('● 협응근', 68, canvas.height - 163, 24, '#FF9500');
    if (!summary.primaryMuscles.length && !summary.secondaryMuscles.length) text('등록된 부위 정보 없음', 68, canvas.height - 122, 23, muted);
  }
  text('완료 세트 기준 · 볼륨은 기록 중량 × 반복수', 68, canvas.height - 76, 23, muted);
  text('IRON MUSCLE  /  나의 운동 기록', 68, canvas.height - 36, 22, accent, true);
  return canvas.toDataURL('image/png');
}

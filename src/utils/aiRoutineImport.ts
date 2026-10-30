import type { Exercise, WeightUnit, WorkoutSession, WorkoutSet, EquipmentType, ExecutionMode, LoadType, Category, MuscleTarget } from '../types/workout';
import { getExerciseSearchFields, normalizeSearch } from './exerciseSearch';
import { getTodayString } from './calendar';
import { t, displayMuscle } from '../i18n';
import { MUSCLE_INFO_MAP } from '../data/muscleMap';

export interface ImportedSet extends Pick<WorkoutSet, 'rpe' | 'tempo' | 'comment' | 'side'> {
  reps: number;
  weight: number;
  restSeconds: number;
}
export interface ImportedExerciseProposal {
  category?: Category;
  primaryMuscles?: MuscleTarget[];
  secondaryMuscles?: MuscleTarget[];
  nameEn?: string;
}
export interface ImportedExercise {
  proposal?: ImportedExerciseProposal;
  sourceName: string;
  exerciseId: string | null;
  weightUnit: WeightUnit;
  equipmentType?: EquipmentType;
  executionMode: ExecutionMode;
  loadType?: LoadType;
  notes?: string;
  sets: ImportedSet[];
}
export interface ImportedWorkout {
  title: string;
  notes?: string;
  exercises: ImportedExercise[];
}

const invalid = () => new Error('AI 루틴 형식을 확인하세요. 예시의 표 또는 JSON 형식을 사용하세요.');
const record = (value: unknown): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
};
function number(value: unknown, fallback: number, max: number, integer = false): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max || (integer && !Number.isInteger(value))) throw invalid();
  return value;
}
function name(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 160) throw invalid();
  return value.trim();
}
function unit(value: unknown): WeightUnit {
  if (value === undefined || value === 'kg') return 'kg';
  if (value === 'lbs') return 'lbs';
  throw invalid();
}
function choice<T extends string>(value: unknown, allowed: readonly T[], fallback?: T): T | undefined {
  if (value === undefined) return fallback;
  const found = allowed.find(item => item === value);
  if (!found) throw invalid();
  return found;
}
function note(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > 2000) throw invalid();
  return value;
}
function tempo(value: unknown): WorkoutSet['tempo'] {
  if (value === undefined) return undefined;
  const parts = record(value);
  if (parts.eccentric === undefined || parts.pause === undefined || parts.concentric === undefined) throw invalid();
  return { eccentric: number(parts.eccentric, 0, 30), pause: number(parts.pause, 0, 30), concentric: number(parts.concentric, 0, 30) };
}
function set(value: Record<string, unknown>, defaults: Record<string, unknown>, mode: ExecutionMode): ImportedSet {
  const inherited = (key: string) => value[key] === undefined ? defaults[key] : value[key];
  const reps = number(inherited('reps'), 10, 1000, true);
  if (reps < 1) throw invalid();
  const rawRpe = inherited('rpe');
  const rpe = rawRpe === undefined ? undefined : number(rawRpe, 0, 10);
  if (rpe !== undefined && (rpe < 6 || !Number.isInteger(rpe * 2))) throw invalid();
  return {
    reps, weight: number(inherited('weight'), 0, 2000), restSeconds: number(inherited('restSeconds'), 90, 3600, true),
    rpe, tempo: tempo(inherited('tempo')), comment: note(inherited('comment')),
    side: choice(inherited('side'), ['left', 'right', 'both'], mode === 'unilateral' ? 'left' : 'both'),
  };
}
function muscles(value: unknown): MuscleTarget[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 17) throw invalid();
  return [...new Set(value.map(id => {
    const found = Object.values(MUSCLE_INFO_MAP).find(muscle => muscle.id === id);
    if (!found) throw invalid();
    return found.id;
  }))];
}
function proposal(row: Record<string, unknown>): ImportedExerciseProposal | undefined {
  const category = choice(row.category, ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody']);
  const primaryMuscles = muscles(row.primaryMuscles);
  const secondaryMuscles = muscles(row.secondaryMuscles);
  const nameEn = row.nameEn === undefined ? undefined : name(row.nameEn);
  if (primaryMuscles?.some(id => secondaryMuscles?.includes(id))) throw invalid();
  if (category === undefined && primaryMuscles === undefined && secondaryMuscles === undefined && nameEn === undefined) return undefined;
  return { category, primaryMuscles, secondaryMuscles, nameEn };
}
function exercise(value: unknown, catalog: Exercise[]): ImportedExercise {
  const row = record(value);
  const sourceName = name(row.name === undefined ? row.exerciseId : row.name);
  const normalized = normalizeSearch(sourceName);
  const candidates = catalog.filter(item => item.id === sourceName || getExerciseSearchFields(item).some(field => field.trim() && normalizeSearch(field) === normalized));
  let exerciseId: string | null = candidates.length === 1 ? candidates[0].id : null;
  if (row.exerciseId !== undefined) {
    const id = name(row.exerciseId);
    if (row.name !== undefined && candidates.length && !candidates.some(item => item.id === id)) throw invalid();
    exerciseId = catalog.some(item => item.id === id) ? id : null;
  }
  const executionMode = choice(row.executionMode, ['bilateral', 'unilateral', 'alternating'], 'bilateral') || 'bilateral';
  const equipmentType = choice(row.equipmentType, ['smith', 'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other']);
  const loadType = choice(row.loadType, ['plate-loaded', 'pin-loaded', 'barbell', 'dumbbell', 'cable', 'bodyweight', 'other']);
  let sets: ImportedSet[];
  if (Array.isArray(row.sets)) {
    if (!row.sets.length || row.sets.length > 50) throw invalid();
    sets = row.sets.map(value => {
      const item = record(value);
      if (item.weightUnit !== undefined) throw invalid();
      return set(item, row, executionMode);
    });
  } else {
    const count = number(row.sets, 3, 50, true);
    if (count < 1) throw invalid();
    sets = Array.from({ length: count }, () => set(row, {}, executionMode));
  }
  return { sourceName, exerciseId, proposal: proposal(row), weightUnit: unit(row.weightUnit), equipmentType, executionMode, loadType, notes: note(row.notes), sets };
}

const headers: Record<string, string> = {
  category: 'category', '부위': 'category', '운동부위': 'category', primarymuscles: 'primaryMuscles', '주동근': 'primaryMuscles', secondarymuscles: 'secondaryMuscles', '보조근': 'secondaryMuscles', nameen: 'nameEn', '영문명': 'nameEn',
  name: 'name', exercise: 'name', '종목': 'name', '운동': 'name', '운동명': 'name', '종목명': 'name',
  sets: 'sets', '세트': 'sets', '세트수': 'sets', reps: 'reps', '반복': 'reps', '반복수': 'reps', '횟수': 'reps',
  weight: 'weight', '무게': 'weight', '중량': 'weight', rest: 'restSeconds', restseconds: 'restSeconds', '휴식': 'restSeconds', '휴식초': 'restSeconds',
  rpe: 'rpe', '운동강도': 'rpe', tempo: 'tempo', '템포': 'tempo', notes: 'notes', '메모': 'notes', comment: 'comment', '세트메모': 'comment',
  executionmode: 'executionMode', '수행방식': 'executionMode', loadtype: 'loadType', '로딩방식': 'loadType', equipmenttype: 'equipmentType', '기구유형': 'equipmentType', side: 'side', '방향': 'side',
  unit: 'weightUnit', weightunit: 'weightUnit', '단위': 'weightUnit',
};
const cells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim().replace(/\*\*/g, ''));
function markdown(raw: string): Record<string, unknown> {
  const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  let title = 'AI 루틴';
  let columns: string[] | null = null;
  const exercises: Record<string, unknown>[] = [];
  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line) && !columns) { title = line.replace(/^#{1,3}\s+/, ''); continue; }
    if (!line.includes('|')) throw invalid();
    const values = cells(line);
    if (!columns) {
      columns = values.map(value => headers[normalizeSearch(value)] || '');
      if (columns.some(column => !column) || new Set(columns).size !== columns.length || !columns.includes('name') || !columns.includes('sets') || !columns.includes('reps')) throw invalid();
      continue;
    }
    if (values.every(value => /^:?-{3,}:?$/.test(value))) {
      if (values.length !== columns.length || exercises.length) throw invalid();
      continue;
    }
    if (values.length !== columns.length) throw invalid();
    const row: Record<string, unknown> = {};
    columns.forEach((column, index) => {
      const value = values[index];
      if (['primaryMuscles', 'secondaryMuscles'].includes(column)) row[column] = value ? value.split(',').map(id => id.trim()) : [];
      else if (['name', 'notes', 'comment', 'executionMode', 'loadType', 'equipmentType', 'side', 'category', 'nameEn'].includes(column)) row[column] = value;
      else if (column === 'tempo') {
        const parts = value.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/);
        if (!parts) throw invalid();
        row.tempo = { eccentric: Number(parts[1]), pause: Number(parts[2]), concentric: Number(parts[3]) };
      }
      else if (column === 'weightUnit') {
        if (row.weightUnit !== undefined && row.weightUnit !== value) throw invalid();
        row.weightUnit = value;
      }
      else {
        const match = value.match(/^(\d+(?:\.\d+)?)\s*(kg|lbs|초|s|회|세트)?$/i);
        if (!match) throw invalid();
        const suffix = match[2]?.toLowerCase();
        if (suffix && !((column === 'weight' && ['kg', 'lbs'].includes(suffix)) || (column === 'restSeconds' && ['초', 's'].includes(suffix)) || (column === 'reps' && suffix === '회') || (column === 'sets' && suffix === '세트'))) throw invalid();
        row[column] = Number(match[1]);
        if (column === 'weight' && suffix) {
          if (row.weightUnit !== undefined && row.weightUnit !== suffix) throw invalid();
          row.weightUnit = suffix;
        }
      }
    });
    const unitColumn = columns.indexOf('weightUnit');
    if (unitColumn >= 0 && row.weightUnit !== values[unitColumn]) throw invalid();
    exercises.push(row);
  }
  return { title, exercises };
}

export function parseImportedWorkout(raw: string, catalog: Exercise[]): ImportedWorkout {
  if (!raw.trim() || raw.length > 100000) throw invalid();
  let source = raw.trim();
  if (source.startsWith('```')) {
    const fenced = source.match(/^```(?:json|markdown|md)?\s*\n([\s\S]*?)\n```$/i);
    if (!fenced) throw invalid();
    source = fenced[1].trim();
  }
  let value: unknown;
  if (/^[{[]/.test(source)) {
    try { value = JSON.parse(source); } catch { throw invalid(); }
  } else value = markdown(source);
  const root = record(value);
  if (!Array.isArray(root.exercises) || !root.exercises.length || root.exercises.length > 50) throw invalid();
  const title = root.title === undefined ? 'AI 루틴' : name(root.title);
  return { title, notes: note(root.notes), exercises: root.exercises.map(value => exercise(value, catalog)) };
}

export function sessionFromImportedWorkout(draft: ImportedWorkout, catalog: Exercise[]): WorkoutSession {
  if (!draft.exercises.length || draft.exercises.some(row => !row.exerciseId || !catalog.some(item => item.id === row.exerciseId))) throw new Error('모든 종목을 선택하세요.');
  return {
    id: crypto.randomUUID(), title: draft.title, date: getTodayString(), startTime: new Date().toISOString(),
    durationSeconds: 0, completed: false, weightUnit: 'kg', notes: draft.notes,
    exercises: draft.exercises.map(row => {
      const item = catalog.find(item => item.id === row.exerciseId);
      if (!item) throw new Error('모든 종목을 선택하세요.');
      const equipmentType = row.equipmentType || item.equipment;
      const loadType = row.loadType || item.loadType || (equipmentType === 'machine' || equipmentType === 'smith' ? 'plate-loaded' : undefined);
      return {
        id: crypto.randomUUID(), exerciseId: item.id, exerciseName: item.name, equipmentType, executionMode: row.executionMode, loadType, notes: row.notes,
        weightUnit: row.weightUnit,
        sets: row.sets.map((set, index) => ({ id: crypto.randomUUID(), setNumber: index + 1, weight: set.weight, reps: set.reps, plannedRestSeconds: set.restSeconds, rpe: set.rpe, tempo: set.tempo ? { ...set.tempo } : undefined, comment: set.comment, side: set.side, completed: false })),
      };
    }),
  };
}

const AI_ROUTINE_SAMPLE = { title: 'Upper body', notes: 'Stay within a comfortable range', exercises: [
  { name: 'Barbell Bench Press', category: 'chest', primaryMuscles: ['chest'], secondaryMuscles: ['triceps'], exerciseId: 'bench-press', sets: 3, reps: 10, weight: 0, restSeconds: 90, weightUnit: 'kg', executionMode: 'bilateral', rpe: 8, tempo: { eccentric: 3, pause: 1, concentric: 1 }, notes: 'Adjust load to your ability', comment: 'Controlled movement' },
  { name: 'Lat Pulldown', exerciseId: 'lat-pulldown', equipmentType: 'machine', loadType: 'pin-loaded', executionMode: 'bilateral', weightUnit: 'kg', sets: [
    { reps: 12, weight: 0, restSeconds: 120, rpe: 7.5, tempo: { eccentric: 2, pause: 1, concentric: 1 }, side: 'both', comment: 'First set' },
    { reps: 12, weight: 0, restSeconds: 120, side: 'both', comment: 'Second set' },
  ] },
] };
export const AI_ROUTINE_EXAMPLE = JSON.stringify(AI_ROUTINE_SAMPLE, null, 2);
export const AI_ROUTINE_MARKDOWN_EXAMPLE = '# Upper body\n| name | sets | reps | weight | rest |\n| --- | --- | --- | --- | --- |\n| Barbell Bench Press | 3 | 10 | 0kg | 90s |';

export function buildAiRoutinePrompt(): string {
  const example = { ...AI_ROUTINE_SAMPLE, exercises: AI_ROUTINE_SAMPLE.exercises.map(({ exerciseId, ...exercise }) => exercise) };
  return [
    t('아이언 머슬 앱에 가져올 운동 루틴을 함께 정하고 싶습니다. 당신은 앱 밖에서 사용하는 AI입니다. 먼저 대화로 나에게 맞는 구성을 정해 주세요.'),
    t('처음에는 운동 목적, 원하는 부위, 운동 경력과 난이도, 이용 가능한 기구, 주당 운동 횟수, 한 번의 운동 시간, 선호하거나 피하고 싶은 동작을 물어봐 주세요. 내 답변에 따라 종목과 세트 구성을 제안하고 대화로 수정해 주세요.'),
    t('내가 구성을 확정한 뒤에만 최종 JSON 코드 블록 하나를 출력해 주세요. 아래 예시는 형식 설명용입니다. 종목과 수치는 대화에서 정하고, 목표·부위·난이도 요약은 title 또는 notes에 적어 주세요. exerciseId를 만들지 말고 일반적인 동작 이름을 name에 쓰세요. 브랜드는 자동 지정하지 마세요.'),
    t('최종 결과는 이번에 시작할 1회 운동 루틴으로 출력해 주세요. 주간 계획이나 days 배열 대신 title과 exercises를 사용하고, 확정된 JSON 코드 블록 밖에는 설명을 붙이지 마세요. sets와 reps는 정수, weight는 숫자, weightUnit은 kg 또는 lbs로 쓰고 무게가 미정이면 0으로 두세요.'),
    t('JSON은 title과 exercises를 사용합니다. 종목마다 name, sets, reps, weight, restSeconds, weightUnit을 지정하세요. sets에는 세트별 객체 배열도 사용할 수 있습니다.'),
    t('선택 필드: 루틴 notes, 종목 equipmentType·executionMode·loadType·notes, 세트 rpe·tempo·comment·side. RPE는 6~10에서 0.5 단위, tempo는 eccentric·pause·concentric 각각 0~30초입니다.'),
    t('executionMode는 bilateral·unilateral·alternating, loadType은 pin-loaded·plate-loaded·barbell·dumbbell·cable·bodyweight·other, equipmentType은 smith·barbell·dumbbell·machine·cable·bodyweight·other입니다. side는 left·right·both이며 단위는 종목별로 지정합니다.'),
    t('종목은 최대 50개, 종목당 세트는 최대 50개입니다. 반복수는 1~1000, 무게는 0~2000, 휴식은 0~3600초입니다. 생략하면 3세트, 10회, 0kg, 90초를 사용합니다.'),
    t('executionMode는 동작의 한팔·한발 여부가 아니라 기록 방식입니다. 한팔·한발 종목도 기본은 bilateral과 side=both입니다. 사용자가 좌우를 따로 기록하겠다고 명시적으로 요청한 경우에만 unilateral과 left·right를 사용하세요.'),
    t('새 종목의 category, primaryMuscles, secondaryMuscles를 제안해 주세요. 근육은 아래 ID를 사용하고 불확실하면 생략하세요. 제안은 앱에서 사용자가 확인한 뒤 신규 운동에만 저장하며 기존 종목의 근육 정보는 바꾸지 않습니다.'),
    [['chest', '가슴'], ['back', '등'], ['legs', '하체'], ['shoulders', '어깨'], ['arms', '팔'], ['core', '복근'], ['fullbody', '전신']].map(([id, label]) => `${id}=${t(label)}`).join(', '),
    Object.values(MUSCLE_INFO_MAP).map(muscle => `${muscle.id}=${displayMuscle(muscle.id)}`).join(', '),
    t('restSeconds는 권장 휴식 시간입니다. 세트 완료 후 타이머의 기본값으로 사용하며 사용자가 직접 조절하거나 종료할 수 있습니다.'),
    JSON.stringify(example, null, 2),
  ].join('\n\n');
}

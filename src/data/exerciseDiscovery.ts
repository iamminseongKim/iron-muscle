// Editorial browsing choices, not measured global popularity. IDs and history stay intact.
export const CORE_EXERCISE_IDS = [
  'bench-press', 'dumbbell-bench-press', 'incline-dumbbell-press', 'Machine_Bench_Press',
  'pec-deck-fly', 'push-up', 'dumbbell-fly', 'smith-flat-bench-press',
  'lat-pulldown', 'cable-row', 'pull-up', 'machine_assisted_pull_up', 'barbell-row',
  'straight-arm-pulldown', 't-bar-row', 'deadlift',
  'barbell-squat', 'leg-press', 'leg-extension', 'seated-leg-curl', 'romanian-deadlift',
  'hip-thrust', 'hip-abduction', 'hip-adduction', 'dumbbell-lunge', 'standing-calf-raise',
  'dumbbell-shoulder-press', 'lateral-raise', 'overhead-press', 'Reverse_Machine_Flyes',
  'single-arm-cable-lateral-raise', 'barbell-curl', 'dumbbell-curl', 'hammer-curl',
  'triceps-pushdown', 'triceps-dips', 'incline-dumbbell-curl', 'crunch', 'plank',
  'Pallof_Press', 'dumbbell-romanian-deadlift', 'smith-romanian-deadlift', 'seated-cable-fly',
  'one-arm-dumbbell-row', 'face-pull', 'lying-leg-curl', 'rope-pushdown',
  'Machine_Shoulder_Military_Press', 'ab-roller', 'Mountain_Climbers',
  'Dead_Bug',
  'EZ-Bar_Skullcrusher',
  'machine-front-pulldown', 'machine-seated-row', 'machine-high-row',
  'machine-low-row', 'v-squat-machine', 'machine-lateral-raise',
] as const;

export const DISCOVERY_ALIASES: Record<string, string[]> = {
  'bench-press': ['벤치', '벤치프레스', 'flat bench press'],
  'lat-pulldown': ['랫풀', '랫풀다운', 'lat pulldown'],
  'cable-row': ['시티드로우', '시티드 로우', 'seated row'],
  'machine-seated-row': ['시티드로우', '시티드 로우', 'seated row', '머신 시티드로우', '체스트서포티드로우'],
  'machine-front-pulldown': ['프론트풀다운', '프론트 풀다운', 'front pulldown'],
  'machine-high-row': ['하이로우', '하이 로우', 'high row'],
  'machine-low-row': ['로우로우', '로우 로우', 'low row'],
  'v-squat-machine': ['브이스쿼트', '브이 스쿼트', 'v squat', 'v-squat'],
  'machine-lateral-raise': ['머신 사레레', '사레레 머신', 'machine lateral raise'],
  'lateral-raise': ['사레레', '사이드래터럴레이즈', '덤벨 사레레'],
  'single-arm-cable-lateral-raise': ['케이블 사레레', '케이블 사이드 레터럴 레이즈'],
  'Reverse_Machine_Flyes': ['리버스펙덱', '리어델트머신', 'reverse pec deck', 'rear delt machine'],
  'Machine_Bench_Press': ['체스트프레스', 'chest press machine'],
  'romanian-deadlift': ['RDL', '바벨 RDL'],
  'overhead-press': ['OHP', '오버헤드프레스', '밀리터리프레스'],
  'triceps-pushdown': ['삼두푸시다운', '케이블푸시다운'],
  'bayesian-cable-curl': ['베이지안컬', '베이지안 컬'],
  'Trap_Bar_Deadlift': ['트랩바 데드리프트', '헥스바 데드리프트'],
};

// Reviewed equivalent entries: demote repeated imports; never remap saved records.
export const DISCOVERY_DUPLICATES: Record<string, string> = {
  'smith-shoulder-press': 'smith-overhead-press',
  'Smith_Machine_Overhead_Shoulder_Press': 'smith-overhead-press',
  'Smith_Machine_Incline_Bench_Press': 'smith-incline-bench-press',
  'Smith_Machine_Bench_Press': 'smith-flat-bench-press',
  'Smith_Machine_Squat': 'smith-squat',
  'pendulum-squat': 'pendulum-squat-machine',
  'low-to-high-cable-flye': 'cable-low-to-high-fly',
  'high-to-low-cable-flye': 'cable-high-to-low-fly',
};

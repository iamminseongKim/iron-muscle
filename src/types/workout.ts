export type MuscleTarget =
  | 'chest'          // 대흉근
  | 'chest_upper'    // 상부 대흉근
  | 'lats'           // 광배근
  | 'traps'          // 승모근
  | 'erectors'       // 척추기립근
  | 'deltoid_front'  // 전면 삼각근
  | 'deltoid_side'   // 측면 삼각근
  | 'deltoid_rear'   // 후면 삼각근
  | 'biceps'         // 상완이두근
  | 'triceps'        // 상완삼두근
  | 'forearms'       // 전완근
  | 'abs'            // 복직근
  | 'obliques'       // 복사근
  | 'glutes'         // 둔근
  | 'quads'          // 대퇴사두근
  | 'hamstrings'     // 햄스트링
  | 'calves';        // 종아리/비복근

export type Category = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'fullbody';

export type EquipmentType = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'other';

export const POPULAR_MACHINE_BRANDS = [
  'Hammer Strength (해머 스트렝스)',
  'Cybex (싸이벡스)',
  'Life Fitness (라이프 피트니스)',
  'Panatta (파나타)',
  'Technogym (테크노짐)',
  'NewTech (뉴텍)',
  'Arsenal Strength (아스널 스트렝스)',
  'Matrix (매트릭스)',
  'Nautilus (너틸러스)',
  'Prime (프라임)',
  'Precor (프리코)',
  'Gymleco (짐레코)',
  '기타 (직접 입력)'
] as const;

export interface Tempo {
  eccentric: number;  // 이완/네거티브 (초)
  pause: number;      // 정지 (초)
  concentric: number; // 수축/단축 (초)
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number; // 6.0 ~ 10.0 (0.5 단위)
  tempo?: Tempo;
  comment?: string;
  tags?: string[]; // '웜업', '탑세트', '백오프', '드롭세트', '실패지점', '스트랩 착용' 등
  previousWeight?: number;
  previousReps?: number;
  restSeconds?: number; // 실제로 소요된 휴식 시간 (초)
  side?: 'left' | 'right' | 'both'; // 편측(원암/원레그) 수행 시 좌/우 기록
}

export type ExecutionMode = 'bilateral' | 'unilateral' | 'alternating'; // 투암(양측) | 원암(편측) | 교대

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  'bilateral': '투암/양측 (Bilateral)',
  'unilateral': '원암/편측 (Unilateral)',
  'alternating': '교대 (Alternating)',
};

export type ExerciseGroupType = 'single' | 'superset' | 'compound' | 'giant';

export type LoadType = 'plate-loaded' | 'pin-loaded' | 'barbell' | 'dumbbell' | 'cable' | 'bodyweight';

export type MovementPlane =
  | 'vertical-pull'   // 수직 당기기 (하이로우, 랫풀다운 등)
  | 'horizontal-row'  // 수평 당기기 (로우로우, 시티드로우 등)
  | 'incline-press'   // 인클라인 프레스
  | 'flat-press'      // 플랫 프레스
  | 'decline-press'   // 디클라인 프레스
  | 'overhead-press'  // 오버헤드 프레스
  | 'lateral-raise'   // 측면 레터럴 레이즈
  | 'rear-delt'       // 후면 삼각근 / 페이스풀
  | 'squat-pattern'   // 스쿼트 / 레그프레스 / 핵스쿼트
  | 'hip-hinge'       // 데드리프트 / 백익스텐션
  | 'leg-curl'        // 레그컬 (햄스트링)
  | 'leg-extension'   // 레그익스텐션 (대퇴사두)
  | 'fly'             // 펙덱플라이 / 케이블크로스
  | 'arm-isolation'   // 이두/삼두 고립 컬 및 푸시다운
  | 'core';           // 복근 / 코어

export const MOVEMENT_PLANE_LABELS: Record<MovementPlane, string> = {
  'vertical-pull': '수직 당기기',
  'horizontal-row': '수평 로우',
  'incline-press': '인클라인 프레스',
  'flat-press': '플랫 프레스',
  'decline-press': '디클라인 프레스',
  'overhead-press': '오버헤드 프레스',
  'lateral-raise': '측면 레이즈',
  'rear-delt': '후면 삼각근',
  'squat-pattern': '스쿼트/프레스',
  'hip-hinge': '힙힌지/데드리프트',
  'leg-curl': '레그 컬',
  'leg-extension': '레그 익스텐션',
  'fly': '플라이/모으기',
  'arm-isolation': '팔 고립',
  'core': '복근/코어',
};

export const LOAD_TYPE_LABELS: Record<LoadType, string> = {
  'plate-loaded': '플레이트로디드 (원판)',
  'pin-loaded': '핀로드 (핀머신)',
  'barbell': '바벨',
  'dumbbell': '덤벨',
  'cable': '케이블',
  'bodyweight': '맨몸/소도구',
};

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  category: Category;
  categories: Category[]; // 다중 부위 지원 (예: 데드리프트 -> ['back', 'legs'])
  equipment: EquipmentType;
  loadType?: LoadType;
  movementPlane?: MovementPlane;
  primaryMuscles: MuscleTarget[];
  secondaryMuscles: MuscleTarget[];
  description: string;
  instructions: string[];
  tips: string[];
  defaultBrand?: string;
  isPopular?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  equipmentType: EquipmentType;
  loadType?: LoadType; // 'plate-loaded' | 'pin-loaded' (머신 시 플레이트 vs 핀머신 실시간 토글)
  executionMode?: ExecutionMode; // 'bilateral' | 'unilateral' (투암 vs 원암 실시간 토글)
  machineBrand?: string;
  machineSetting?: string; // 예: "의자 높이 4, 등받이 2칸"
  sets: WorkoutSet[];
  notes?: string;

  // 종목 묶기 (슈퍼세트 / 컴파운드세트 / 자이언트세트)
  groupId?: string;
  groupType?: ExerciseGroupType;
  groupLabel?: string; // 예: "슈퍼세트 A-1", "컴파운드 B-2"
  groupColor?: string;
}

export interface WorkoutSession {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime?: string;
  durationSeconds: number;
  exercises: WorkoutExercise[];
  notes?: string;
  conditionEmoji?: string; // 🔥, 💪, 🥱, 🤕, 🚀
  isDeload?: boolean;
  overallRpe?: number;
  bodyWeight?: number;
  completed: boolean;
}

export interface MuscleInfo {
  id: MuscleTarget;
  nameKo: string;
  nameEn: string;
  view: 'front' | 'back' | 'both';
  category: Category;
  description: string;
}

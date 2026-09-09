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
}

export interface Exercise {
  id: string;
  name: string;
  nameEn: string;
  category: Category;
  equipment: EquipmentType;
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
  machineBrand?: string;
  machineSetting?: string; // 예: "의자 높이 4, 등받이 2칸"
  sets: WorkoutSet[];
  notes?: string;
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

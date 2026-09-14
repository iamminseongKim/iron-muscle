import { Exercise } from '../types/workout';

// Sources and duplicate audit: docs/exercise-discovery.md. Original descriptions.
export const DISCOVERY_ADDITIONS: Exercise[] = [
  {
    id: 'dumbbell-romanian-deadlift', name: '덤벨 루마니안 데드리프트', nameEn: 'Dumbbell Romanian Deadlift',
    category: 'legs', categories: ['legs', 'back'], equipment: 'dumbbell', loadType: 'dumbbell', movementPlane: 'hip-hinge',
    primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['erectors'],
    aliases: ['덤벨 RDL', '덤벨 알디엘', 'DB RDL'],
    description: '덤벨을 몸 가까이 유지하며 엉덩이를 뒤로 보내는 힙힌지 운동입니다.',
    descriptionEn: 'A dumbbell hip hinge performed from standing with a slight knee bend.',
    instructions: ['덤벨을 들고 서서 무릎을 살짝 굽힙니다.', '등의 자세를 유지하며 엉덩이를 뒤로 보내고 덤벨을 다리 가까이 내립니다.', '자세를 유지할 수 있는 범위에서 멈춘 뒤 엉덩이를 펴며 일어섭니다.'],
    instructionsEn: ['Stand with dumbbells and slightly bent knees.', 'Move the hips back, keeping the weights near the legs and the back steady.', 'Stop within a controlled range and extend the hips to stand.'],
    tips: ['바닥에 닿는 깊이보다 자세를 유지하는 범위를 우선합니다.'], images: [], level: 'intermediate',
  },
  {
    id: 'smith-romanian-deadlift', name: '스미스머신 루마니안 데드리프트', nameEn: 'Smith Machine Romanian Deadlift',
    category: 'legs', categories: ['legs', 'back'], equipment: 'machine', loadType: 'plate-loaded', movementPlane: 'hip-hinge',
    primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['erectors'],
    aliases: ['스미스 RDL', '스미스 알디엘', 'Smith RDL'],
    description: '스미스머신의 바 경로에 맞춰 서서 수행하는 루마니안 데드리프트입니다.',
    descriptionEn: 'A Romanian deadlift using the guided bar of a Smith machine.',
    instructions: ['바 경로와 발 위치를 확인하고 안전 스토퍼를 설정합니다.', '바를 허벅지 앞에 잡고 무릎을 살짝 굽힌 상태에서 엉덩이를 뒤로 보냅니다.', '등의 자세를 유지할 수 있는 깊이까지만 내린 뒤 일어섭니다.'],
    instructionsEn: ['Check the bar path and foot position, and set the safety stops.', 'Hold the bar in front of the thighs and hinge with slightly bent knees.', 'Lower only through a controlled range, then extend the hips.'],
    tips: ['기구마다 바 경사와 시작 무게가 다르므로 확인 후 기록합니다.'], images: [], level: 'beginner',
  },
  {
    id: 'seated-cable-fly', name: '시티드 케이블 플라이', nameEn: 'Seated Cable Fly',
    category: 'chest', categories: ['chest'], equipment: 'cable', loadType: 'cable', movementPlane: 'fly',
    primaryMuscles: ['chest'], secondaryMuscles: ['deltoid_front'],
    aliases: ['앉아서 케이블 플라이', '시티드 케이블 플라이', 'Seated Cable Chest Fly'],
    description: '벤치에 앉아 상체를 지지하고 양쪽 케이블을 가슴 앞으로 모으는 운동입니다.',
    descriptionEn: 'A seated chest fly using two cable handles and a supporting bench.',
    instructions: ['양쪽 풀리 사이에 벤치를 놓고 앉은 어깨 높이 부근으로 손잡이를 맞춥니다.', '등을 지지하고 팔꿈치를 약간 굽힌 채 손잡이를 가슴 앞으로 모읍니다.', '팔꿈치 각도를 크게 바꾸지 않고 편안한 범위까지 천천히 벌립니다.'],
    instructionsEn: ['Set a bench between the pulleys with handles near seated shoulder height.', 'Support the back and bring the handles together with softly bent elbows.', 'Keep the elbow angle steady as you return through a comfortable arc.'],
    tips: ['어깨가 과하게 뒤로 젖혀지지 않는 범위를 사용합니다.'], images: [], level: 'beginner',
  },
];

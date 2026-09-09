import { MuscleInfo, MuscleTarget } from '../types/workout';

export const MUSCLE_INFO_MAP: Record<MuscleTarget, MuscleInfo> = {
  chest: {
    id: 'chest',
    nameKo: '대흉근 (가슴)',
    nameEn: 'Pectoralis Major',
    view: 'front',
    category: 'chest',
    description: '가슴의 주 근육으로 팔을 안쪽으로 모으고 앞으로 밀어내는 동작을 담당합니다.'
  },
  chest_upper: {
    id: 'chest_upper',
    nameKo: '상부 대흉근 (윗가슴)',
    nameEn: 'Clavicular Head of Pectoralis',
    view: 'front',
    category: 'chest',
    description: '쇄골 아래쪽 가슴 상부로, 인클라인 계열 프레스 시 집중 자극됩니다.'
  },
  lats: {
    id: 'lats',
    nameKo: '광배근 (활배근)',
    nameEn: 'Latissimus Dorsi',
    view: 'back',
    category: 'back',
    description: '등의 넓이를 결정하는 핵심 근육으로 상체를 당길 때 강력하게 작용합니다.'
  },
  traps: {
    id: 'traps',
    nameKo: '승모근',
    nameEn: 'Trapezius',
    view: 'back',
    category: 'back',
    description: '목과 등 상부, 어깨를 연결하는 다이아몬드 형태의 안정화 근육입니다.'
  },
  erectors: {
    id: 'erectors',
    nameKo: '척추기립근',
    nameEn: 'Erector Spinae',
    view: 'back',
    category: 'back',
    description: '척추를 따라 길게 뻗은 코어 근육으로 허리를 꼿꼿이 펴고 보호합니다.'
  },
  deltoid_front: {
    id: 'deltoid_front',
    nameKo: '전면 삼각근 (앞어깨)',
    nameEn: 'Anterior Deltoid',
    view: 'front',
    category: 'shoulders',
    description: '어깨의 앞쪽 부위로 팔을 앞으로 들어올리는 동작과 프레스 시 주동/협응합니다.'
  },
  deltoid_side: {
    id: 'deltoid_side',
    nameKo: '측면 삼각근 (옆어깨)',
    nameEn: 'Lateral Deltoid',
    view: 'both',
    category: 'shoulders',
    description: '어깨 프레임의 너비를 넓혀주는 역삼각형 체형의 핵심 근육입니다.'
  },
  deltoid_rear: {
    id: 'deltoid_rear',
    nameKo: '후면 삼각근 (뒷어깨)',
    nameEn: 'Posterior Deltoid',
    view: 'back',
    category: 'shoulders',
    description: '어깨 뒤쪽의 입체감을 완성하고 둥근 어깨(라운드 숄더)를 교정합니다.'
  },
  biceps: {
    id: 'biceps',
    nameKo: '상완이두근 (알통)',
    nameEn: 'Biceps Brachii',
    view: 'front',
    category: 'arms',
    description: '팔 앞쪽 근육으로 팔꿈치를 굽히고 손목을 회외(비틀기)할 때 수축합니다.'
  },
  triceps: {
    id: 'triceps',
    nameKo: '상완삼두근',
    nameEn: 'Triceps Brachii',
    view: 'back',
    category: 'arms',
    description: '팔 전체 부피의 60% 이상을 차지하며 팔꿈치를 펴는 미는 힘의 원천입니다.'
  },
  forearms: {
    id: 'forearms',
    nameKo: '전완근 (팔뚝)',
    nameEn: 'Forearms',
    view: 'both',
    category: 'arms',
    description: '악력과 손목의 안정성을 지지하여 무거운 중량을 통제하는 바탕이 됩니다.'
  },
  abs: {
    id: 'abs',
    nameKo: '복직근 (식스팩)',
    nameEn: 'Rectus Abdominis',
    view: 'front',
    category: 'core',
    description: '상체와 하체를 접어주는 중심 코어로 척추의 굴곡과 복압을 형성합니다.'
  },
  obliques: {
    id: 'obliques',
    nameKo: '외복사근 (옆구리)',
    nameEn: 'External Obliques',
    view: 'front',
    category: 'core',
    description: '허리의 비틀림과 좌우 굴곡을 통제하며 탄탄한 허리 라인을 만듭니다.'
  },
  glutes: {
    id: 'glutes',
    nameKo: '둔근 (엉덩이)',
    nameEn: 'Gluteus Maximus',
    view: 'back',
    category: 'legs',
    description: '인체에서 가장 큰 파워를 뿜어내는 고관절 신전의 핵심 대형 근육입니다.'
  },
  quads: {
    id: 'quads',
    nameKo: '대퇴사두근 (앞허벅지)',
    nameEn: 'Quadriceps',
    view: 'front',
    category: 'legs',
    description: '무릎을 펴는 하체 전면의 4개 대형 근육 복합체입니다.'
  },
  hamstrings: {
    id: 'hamstrings',
    nameKo: '햄스트링 (뒷허벅지)',
    nameEn: 'Hamstrings',
    view: 'back',
    category: 'legs',
    description: '무릎을 굽히고 고관절을 펴며 폭발적인 하체 힘과 무릎 안정성을 부여합니다.'
  },
  calves: {
    id: 'calves',
    nameKo: '비복근/가자미근 (종아리)',
    nameEn: 'Gastrocnemius & Soleus',
    view: 'back',
    category: 'legs',
    description: '발목을 아래로 펴며 점프와 보행의 지지 기반이 되는 하체 말단 근육입니다.'
  }
};

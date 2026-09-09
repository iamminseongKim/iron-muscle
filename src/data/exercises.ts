import { Exercise } from '../types/workout';

export const EXERCISES_DATABASE: Exercise[] = [
  // =================== 가슴 (CHEST) ===================
  {
    id: 'bench-press',
    name: '바벨 벤치프레스',
    nameEn: 'Barbell Flat Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['deltoid_front', 'triceps'],
    description: '상체 가슴 근육의 전체적인 매스와 전신 협응력을 발달시키는 3대 운동 중 하나입니다.',
    instructions: [
      '벤치에 누워 견갑골(날개뼈)을 모으고 하강시켜 가슴을 열어줍니다.',
      '어깨너비보다 살짝 넓게 바벨을 잡고 흉골 아랫부분을 향해 통제하며 내립니다.',
      '팔꿈치가 과도하게 벌어지지 않도록 주의하며 대흉근의 수축으로 바벨을 밀어올립니다.'
    ],
    tips: ['허리는 과신전되지 않고 손바닥 하나 들어갈 아치를 유지하세요.', '네거티브 이완 시 바벨을 통제하며 2~3초간 천천히 내리세요.'],
    isPopular: true
  },
  {
    id: 'incline-bench-press',
    name: '인클라인 바벨 벤치프레스',
    nameEn: 'Incline Barbell Bench Press',
    category: 'chest',
    equipment: 'barbell',
    primaryMuscles: ['chest_upper'],
    secondaryMuscles: ['deltoid_front', 'triceps'],
    description: '윗가슴(쇄골두)을 집중 타겟하여 입체감 있는 가슴 상부 라인을 완성합니다.',
    instructions: [
      '30~45도 각도의 인클라인 벤치에 견갑을 고정하고 눕습니다.',
      '바벨을 쇄골 바로 아래 지점으로 천천히 내립니다.',
      '상부 대흉근으로 밀어 올린다는 느낌에 집중하여 바벨을 수직으로 밀어냅니다.'
    ],
    tips: ['벤치 각도가 45도를 넘으면 어깨 전면 개입이 너무 커지니 30도가 이상적입니다.'],
    isPopular: true
  },
  {
    id: 'dumbbell-bench-press',
    name: '덤벨 벤치프레스',
    nameEn: 'Dumbbell Bench Press',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['deltoid_front', 'triceps'],
    description: '바벨보다 더 깊은 이완과 넓은 가동 범위를 통해 대흉근 안쪽까지 강하게 수축시킵니다.',
    instructions: [
      '양손에 덤벨을 들고 벤치에 누워 가슴 높이에 위치시킵니다.',
      '가슴 근육이 최대로 늘어나는 것을 느끼며 덤벨을 깊게 내립니다.',
      '포물선을 그리며 밀어 올리되 덤벨끼리 부딪치지 않고 장력을 유지합니다.'
    ],
    tips: ['손목이 뒤로 꺾이지 않도록 중립을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'incline-dumbbell-press',
    name: '인클라인 덤벨 프레스',
    nameEn: 'Incline Dumbbell Press',
    category: 'chest',
    equipment: 'dumbbell',
    primaryMuscles: ['chest_upper'],
    secondaryMuscles: ['deltoid_front', 'triceps'],
    description: '윗가슴의 가동 범위를 극대화하여 쇄골 라인의 근육 밀도를 높입니다.',
    instructions: [
      '인클라인 벤치에 앉아 무릎 반동을 이용해 덤벨을 어깨 위로 올립니다.',
      '윗가슴을 밀어 올리며 천천히 팔꿈치를 45도 각도로 내립니다.',
      '정점에서 윗가슴을 강하게 쥐어짜며 수축합니다.'
    ],
    tips: ['팔꿈치가 어깨선과 일직선이 되지 않도록 약간 안쪽으로 넣으세요.'],
    isPopular: true
  },
  {
    id: 'machine-chest-press',
    name: '체스트 프레스 머신',
    nameEn: 'Machine Chest Press',
    category: 'chest',
    equipment: 'machine',
    defaultBrand: 'Hammer Strength (해머 스트렝스)',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['deltoid_front', 'triceps'],
    description: '고정된 궤적으로 부상 위험 없이 목표 부위에 안전하게 고중량 타격을 줄 수 있습니다.',
    instructions: [
      '손잡이 높이가 가슴 중앙 또는 유두선에 오도록 의자 높이를 조절합니다.',
      '등받이에 견갑을 단단히 붙이고 가슴을 열어줍니다.',
      '손잡이를 앞으로 힘차게 밀며 대흉근을 수축합니다.'
    ],
    tips: ['밀었을 때 팔꿈치를 완전히 락아웃하지 말고 살짝 구부린 상태로 긴장을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'pec-deck-fly',
    name: '펙덱 플라이 (머신 플라이)',
    nameEn: 'Pec Deck Machine Fly',
    category: 'chest',
    equipment: 'machine',
    defaultBrand: 'Cybex (싸이벡스)',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['deltoid_front'],
    description: '가슴 안쪽 골 형성과 최대 수축/이완을 이끌어내는 고립 운동의 정석입니다.',
    instructions: [
      '팔꿈치가 가슴 중앙 높이에 오도록 시트를 설정합니다.',
      '팔꿈치를 살짝 구부린 채 고정하고 큰 나무를 안듯이 모아줍니다.',
      '정점에서 1초간 쥐어짠 후 대흉근이 팽팽해질 때까지 통제하며 벌립니다.'
    ],
    tips: ['어깨가 으쓱 올라가지 않도록 가슴을 내밀고 견갑을 하강하세요.'],
    isPopular: true
  },
  {
    id: 'cable-crossover',
    name: '케이블 크로스오버',
    nameEn: 'Cable Crossover',
    category: 'chest',
    equipment: 'cable',
    primaryMuscles: ['chest', 'chest_upper'],
    secondaryMuscles: ['deltoid_front'],
    description: '케이블의 지속적인 장력을 활용해 가슴 하부 또는 상부를 다각도로 공략합니다.',
    instructions: [
      '양쪽 도르래를 위 또는 아래에 고정하고 손잡이를 잡고 한 발 앞으로 나옵니다.',
      '상체를 살짝 숙이고 팔꿈치를 반쯤 편 상태로 가슴 앞으로 교차하듯 모읍니다.',
      '대흉근의 강한 수축감을 느끼며 천천히 원위치로 돌아갑니다.'
    ],
    tips: ['팔 힘이 아닌 가슴으로 모으는 감각에 집중하세요.'],
    isPopular: false
  },
  {
    id: 'dips-chest',
    name: '딥스 (가슴 포커스)',
    nameEn: 'Chest Dips',
    category: 'chest',
    equipment: 'bodyweight',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'deltoid_front'],
    description: '상체 스쿼트라 불리는 맨몸 최강의 아랫가슴 및 상체 프레스 운동입니다.',
    instructions: [
      '바를 잡고 상체를 30도 정도 앞으로 숙이며 체중을 지탱합니다.',
      '팔꿈치가 90도가 될 때까지 상체 기울기를 유지하며 깊게 내려갑니다.',
      '가슴 아랫부분으로 바닥을 밀어낸다는 느낌으로 상체를 들어 올립니다.'
    ],
    tips: ['상체를 수직으로 세우면 삼두근 개입이 커지므로 가슴 운동 시에는 반드시 상체를 숙이세요.'],
    isPopular: true
  },
  {
    id: 'push-up',
    name: '푸쉬업 (팔굽혀펴기)',
    nameEn: 'Standard Push Up',
    category: 'chest',
    equipment: 'bodyweight',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'deltoid_front', 'abs'],
    description: '언제 어디서나 상체 전면부와 전신 코어를 강화할 수 있는 기본 운동입니다.',
    instructions: [
      '어깨너비보다 조금 넓게 손을 짚고 머리부터 발끝까지 일직선을 만듭니다.',
      '가슴이 바닥에 닿기 직전까지 천천히 몸 전체를 내립니다.',
      '복압을 유지한 채 손바닥 전체로 바닥을 밀어 시작 자세로 복귀합니다.'
    ],
    tips: ['엉덩이가 처지거나 위로 솟지 않도록 둔근과 복근에 힘을 주세요.'],
    isPopular: false
  },

  // =================== 등 (BACK) ===================
  {
    id: 'deadlift-conventional',
    name: '컨벤셔널 데드리프트',
    nameEn: 'Conventional Deadlift',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['erectors', 'glutes', 'hamstrings'],
    secondaryMuscles: ['lats', 'traps', 'forearms', 'quads'],
    description: '지면에서 중량을 뽑아 올리는 전신 후면 사슬과 악력, 코어의 절대적인 파워를 만듭니다.',
    instructions: [
      '바벨이 발등 중앙(미드풋)에 오도록 정강이를 바벨 가까이 위치시킵니다.',
      '고관절을 접고 힌지를 만들어 바벨을 견고하게 잡고 광배근을 조입니다.',
      '발바닥으로 지면을 밀며 둔근과 기립근을 동시에 펴 바벨을 끌어올립니다.'
    ],
    tips: ['허리가 둥글게 말리지 않도록 가슴을 펴고 복압을 단단히 채우세요.'],
    isPopular: true
  },
  {
    id: 'deadlift-sumo',
    name: '스모 데드리프트',
    nameEn: 'Sumo Deadlift',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['glutes', 'quads'],
    secondaryMuscles: ['erectors', 'hamstrings', 'traps', 'forearms'],
    description: '넓은 보폭과 수직에 가까운 상체 각도로 둔근과 내전근의 파워를 극대화합니다.',
    instructions: [
      '발을 어깨너비의 1.5~2배 넓게 벌리고 발끝을 바깥 45도 방향으로 엽니다.',
      '골반을 바벨 가까이 밀착시키며 무릎을 바깥으로 벌려 바벨을 그립합니다.',
      '바닥을 양옆으로 찢는다는 느낌으로 다리를 밀며 둔근을 수축시킵니다.'
    ],
    tips: ['무릎이 안쪽으로 모이지 않도록 외회전 텐션을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'deadlift-romanian',
    name: '루마니안 데드리프트',
    nameEn: 'Romanian Deadlift (RDL)',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['hamstrings', 'glutes', 'erectors'],
    secondaryMuscles: ['lats', 'traps', 'forearms'],
    description: '선 자세에서 고관절 힌지만을 이용하여 햄스트링과 둔근, 척추기립근을 집중 신장성 수축시킵니다.',
    instructions: [
      '바벨을 든 채 가슴을 펴고 어깨너비로 섭니다.',
      '무릎은 살짝 고정한 상태에서 엉덩이를 뒤로 멀리 밀며 바벨을 허벅지 라인 따라 내립니다.',
      '햄스트링이 팽팽하게 늘어남을 느끼고 엉덩이를 앞으로 밀어 넣으며 일어섭니다.'
    ],
    tips: ['바벨이 허벅지에서 멀어지면 허리에 큰 부담이 가므로 몸에 바짝 붙이세요.'],
    isPopular: true
  },
  {
    id: 'barbell-row',
    name: '바벨 벤트오버 로우',
    nameEn: 'Barbell Bent-Over Row',
    category: 'back',
    equipment: 'barbell',
    primaryMuscles: ['lats', 'traps'],
    secondaryMuscles: ['erectors', 'biceps', 'deltoid_rear'],
    description: '상체 후면의 입체적인 두께감과 등의 전체적인 근육량을 폭발시키는 핵심 종목입니다.',
    instructions: [
      '상체를 45도 정도로 숙이고 척추 중립을 유지합니다.',
      '팔꿈치를 뒤쪽 대각선 방향으로 당겨 바벨을 하복부(배꼽) 쪽으로 끌어옵니다.',
      '등 중앙과 광배근을 1초간 강하게 조인 후 광배근으로 버티며 내립니다.'
    ],
    tips: ['반동을 쓰지 않고 등 근육의 수축만으로 당기는 통제력을 기르세요.'],
    isPopular: true
  },
  {
    id: 'pull-up',
    name: '풀업 (턱걸이)',
    nameEn: 'Pull Up',
    category: 'back',
    equipment: 'bodyweight',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'traps', 'deltoid_rear'],
    description: '역삼각형 프레임과 광배근의 너비를 만드는 최고의 상체 맨몸 당기기 운동입니다.',
    instructions: [
      '어깨너비보다 넓게 오버그립으로 바를 잡고 매달립니다.',
      '견갑골을 먼저 끌어내린 후 쇄골을 바에 닿게 한다는 느낌으로 당겨 오릅니다.',
      '정점에서 광배근을 쥐어짜고 등을 펴면서 천천히 내려옵니다.'
    ],
    tips: ['반동 키핑을 자제하고 광배근의 고립감에 집중하세요.'],
    isPopular: true
  },
  {
    id: 'lat-pulldown',
    name: '랫 풀 다운',
    nameEn: 'Lat Pulldown',
    category: 'back',
    equipment: 'cable',
    defaultBrand: 'Life Fitness (라이프 피트니스)',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'deltoid_rear', 'traps'],
    description: '체중 조절이 용이하여 누구나 광배근의 너비를 정밀하게 타겟할 수 있는 머신입니다.',
    instructions: [
      '허벅지 패드를 단단히 조절하고 넓은 그립으로 바를 잡고 앉습니다.',
      '가슴을 위로 들고 팔꿈치를 옆구리 쪽으로 꽂아 넣듯이 쇄골 앞까지 당깁니다.',
      '광배근이 쭉 펴지는 것을 느끼며 천천히 바를 되돌립니다.'
    ],
    tips: ['상체를 지나치게 뒤로 눕히면 등 상부로 자극이 분산되니 15도 정도만 젖히세요.'],
    isPopular: true
  },
  {
    id: 'seated-cable-row',
    name: '시티드 케이블 로우',
    nameEn: 'Seated Cable Row',
    category: 'back',
    equipment: 'cable',
    defaultBrand: 'NewTech (뉴텍)',
    primaryMuscles: ['lats', 'traps'],
    secondaryMuscles: ['biceps', 'erectors', 'deltoid_rear'],
    description: '수평 방향으로 당겨 등의 중심부 두께감과 능형근, 하부 승모근을 두껍게 채웁니다.',
    instructions: [
      '발판에 발을 디디고 무릎을 살짝 구부린 채 허리를 꼿꼿이 세웁니다.',
      'V바 또는 손잡이를 잡고 배꼽 쪽으로 팔꿈치를 당기며 가슴을 엽니다.',
      '견갑골을 강하게 접어 모은 후 등이 늘어나는 것을 통제하며 이완합니다.'
    ],
    tips: ['허리를 앞뒤로 흔들지 말고 상체 각도를 단단히 유지하세요.'],
    isPopular: true
  },
  {
    id: 'iso-lateral-row',
    name: '하이 로우 머신 (해머 로우)',
    nameEn: 'Iso-Lateral High Row Machine',
    category: 'back',
    equipment: 'machine',
    defaultBrand: 'Hammer Strength (해머 스트렝스)',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'traps', 'deltoid_rear'],
    description: '사선 위에서 아래로 당기는 자연스러운 인체역학 궤적으로 광배근 하부까지 강력하게 자극합니다.',
    instructions: [
      '가슴 패드에 상체를 단단히 밀착시키고 손잡이를 잡습니다.',
      '한 팔씩 또는 양팔로 팔꿈치를 골반 쪽으로 깊숙이 당깁니다.',
      '최대 수축 후 천천히 늘려주며 광배근의 신장을 극대화합니다.'
    ],
    tips: ['해머 스트렝스 특유의 수렴/발산 궤적을 온전히 느껴보세요.'],
    isPopular: true
  },
  {
    id: 't-bar-row',
    name: 'T바 로우',
    nameEn: 'T-Bar Row',
    category: 'back',
    equipment: 'machine',
    defaultBrand: 'Arsenal Strength (아스널 스트렝스)',
    primaryMuscles: ['traps', 'lats'],
    secondaryMuscles: ['biceps', 'erectors', 'deltoid_rear'],
    description: '등 안쪽의 깊은 근육층까지 고중량으로 묵직하게 때려 넣는 두께감 특화 운동입니다.',
    instructions: [
      '발판에 올라서서 무릎을 굽히고 힌지 자세를 만듭니다.',
      '중립 그립 손잡이를 쥐고 명치 아래쪽으로 강하게 당겨 올립니다.',
      '등 전체가 쥐어짜지는 느낌 후 천천히 내립니다.'
    ],
    tips: ['복압을 팽팽하게 유지하여 요추의 부담을 덜어주세요.'],
    isPopular: false
  },

  // =================== 하체 (LEGS) ===================
  {
    id: 'barbell-squat',
    name: '바벨 백 스쿼트',
    nameEn: 'Barbell Back Squat',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves', 'erectors', 'abs'],
    description: '웨이트 트레이닝의 왕. 하체 전체의 근력과 전신 호르몬 분비를 촉진하는 필수 운동입니다.',
    instructions: [
      '승모근 위에 바벨을 견착하고 발을 어깨너비로 벌립니다.',
      '고관절과 무릎을 동시에 접으며 허벅지가 지면과 수평 이하가 될 때까지 깊게 앉습니다.',
      '발바닥 전체로 지면을 강하게 밀어내며 일어섭니다.'
    ],
    tips: ['무릎이 발끝 방향과 일치하도록 벌려주며 내려가세요.'],
    isPopular: true
  },
  {
    id: 'front-squat',
    name: '바벨 프론트 스쿼트',
    nameEn: 'Barbell Front Squat',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['quads', 'abs'],
    secondaryMuscles: ['glutes', 'erectors'],
    description: '전면 쇄골/어깨에 바벨을 얹어 대퇴사두근과 상체 직립 코어에 부하를 집중시킵니다.',
    instructions: [
      '바벨을 전면 삼각근 위에 얹고 팔꿈치를 높이 들어 올립니다.',
      '상체를 꼿꼿이 세운 상태를 유지하며 엉덩이를 무릎 사이로 떨어뜨립니다.',
      '대퇴사두근의 힘으로 지면을 수직으로 밀어 일어섭니다.'
    ],
    tips: ['팔꿈치가 아래로 떨어지면 바벨이 굴러 떨어지니 항상 높게 유지하세요.'],
    isPopular: false
  },
  {
    id: 'leg-press',
    name: '파워 레그 프레스',
    nameEn: '45-Degree Leg Press',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'Cybex (싸이벡스)',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    description: '허리 부담 없이 안전하게 대퇴사두근과 둔근에 고중량 과부하를 걸 수 있는 최고의 머신입니다.',
    instructions: [
      '등받이에 등을 밀착시키고 발판 중앙에 발을 어깨너비로 둡니다.',
      '안전바를 풀고 무릎이 가슴 쪽으로 올 때까지 90도 이상 깊게 내립니다.',
      '발뒤꿈치와 미드풋으로 발판을 힘껏 밀어 올립니다.'
    ],
    tips: ['밀었을 때 무릎 관절을 튕기듯 완전히 펴면 위험하니 살짝 여유를 두세요.'],
    isPopular: true
  },
  {
    id: 'hack-squat',
    name: '핵 스쿼트 머신',
    nameEn: 'Hack Squat Machine',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'Arsenal Strength (아스널 스트렝스)',
    primaryMuscles: ['quads'],
    secondaryMuscles: ['glutes'],
    description: '등을 패드에 대고 안정적으로 고립하여 앞허벅지(대퇴직근/외측광근)를 불태웁니다.',
    instructions: [
      '어깨 패드 아래 들어가 등을 패드에 붙이고 발판에 발을 올립니다.',
      '무릎을 굽히며 허벅지가 발판과 수평이 될 때까지 통제하며 하강합니다.',
      '앞허벅지의 수축력으로 발판을 밀어 시작 자세로 복귀합니다.'
    ],
    tips: ['골반이 패드에서 뜨지 않도록 손잡이를 몸 쪽으로 당겨 견고히 밀착하세요.'],
    isPopular: true
  },
  {
    id: 'leg-extension',
    name: '레그 익스텐션',
    nameEn: 'Leg Extension',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'Technogym (테크노짐)',
    primaryMuscles: ['quads'],
    secondaryMuscles: [],
    description: '대퇴사두근의 완벽한 단독 고립을 이끌어내며 무릎 주변 근육을 선명하게 다듬습니다.',
    instructions: [
      '무릎 회전축과 머신의 축이 일치하도록 등받이를 조절하고 발목 패드를 겁니다.',
      '손잡이를 꽉 잡고 다리를 곧게 펴며 대퇴사두근을 1초간 강하게 쥐어짭니다.',
      '무게의 저항을 버티며 천천히 내립니다.'
    ],
    tips: ['정점에서 엉덩이가 들썩이지 않도록 시트에 골반을 고정하세요.'],
    isPopular: true
  },
  {
    id: 'lying-leg-curl',
    name: '라잉 레그 컬',
    nameEn: 'Lying Leg Curl',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'Life Fitness (라이프 피트니스)',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['calves'],
    description: '엎드린 상태에서 무릎을 굽혀 햄스트링의 전체 길이를 강력하게 수축시킵니다.',
    instructions: [
      '패드에 엎드려 아킬레스건 윗부분에 롤러 패드를 위치시킵니다.',
      '골반이 패드에서 뜨지 않도록 손잡이를 당기며 발뒤꿈치를 엉덩이 쪽으로 접습니다.',
      '햄스트링의 긴장을 유지하며 천천히 다리를 폅니다.'
    ],
    tips: ['발목을 당긴 상태(배측굴곡)로 수행하면 햄스트링에 더 높은 긴장감이 전달됩니다.'],
    isPopular: true
  },
  {
    id: 'seated-leg-curl',
    name: '시티드 레그 컬',
    nameEn: 'Seated Leg Curl',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'Panatta (파나타)',
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: [],
    description: '앉은 상태에서 고관절이 굴곡되어 햄스트링이 최대로 늘어난 상태에서 수축을 개시합니다.',
    instructions: [
      '허벅지 윗부분 고정 패드를 단단히 누르고 시트에 깊숙이 앉습니다.',
      '발목을 걸고 무릎을 아래쪽으로 깊게 구부려 엉덩이 밑까지 당깁니다.',
      '햄스트링의 이완을 느끼며 천천히 돌아갑니다.'
    ],
    tips: ['근비대에 매우 유리한 고관절 신장 자세를 제공하는 최고의 햄스트링 머신입니다.'],
    isPopular: true
  },
  {
    id: 'hip-thrust',
    name: '바벨 힙 쓰러스트',
    nameEn: 'Barbell Hip Thrust',
    category: 'legs',
    equipment: 'barbell',
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'erectors'],
    description: '엉덩이 근육(대둔근)의 수평 신전력을 극대화하여 탄탄한 둔근을 만듭니다.',
    instructions: [
      '벤치에 날개뼈 하단을 대고 골반 접히는 지점에 바벨 패드를 얹습니다.',
      '발바닥으로 지면을 밀며 골반을 천장으로 높이 들어 올립니다.',
      '정점에서 엉덩이를 강하게 쥐어짜고 천천히 골반을 내립니다.'
    ],
    tips: ['허리를 꺾지 말고 골반을 후방경사시켜 둔근만 꽉 조이세요.'],
    isPopular: true
  },
  {
    id: 'bulgarian-split-squat',
    name: '불가리안 스플릿 스쿼트',
    nameEn: 'Bulgarian Split Squat',
    category: 'legs',
    equipment: 'dumbbell',
    primaryMuscles: ['quads', 'glutes'],
    secondaryMuscles: ['hamstrings', 'calves'],
    description: '한 발로 지탱하여 둔근과 대퇴사두근의 불균형을 해소하고 지옥 같은 자극을 선사합니다.',
    instructions: [
      '벤치 뒤에 한 발을 얹고 앞발은 앞으로 성큼 딛습니다.',
      '앞쪽 무릎이 90도가 될 때까지 수직으로 깊게 앉습니다.',
      '앞발 뒤꿈치로 바닥을 차며 올라옵니다.'
    ],
    tips: ['상체를 살짝 숙이면 둔근, 똑바로 세우면 대퇴사두근에 부하가 쏠립니다.'],
    isPopular: true
  },
  {
    id: 'standing-calf-raise',
    name: '스탠딩 카프 레이즈',
    nameEn: 'Standing Calf Raise',
    category: 'legs',
    equipment: 'machine',
    defaultBrand: 'NewTech (뉴텍)',
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    description: '종아리(비복근)를 완전히 늘리고 최대로 수축시켜 하체의 완성도를 높입니다.',
    instructions: [
      '발 앞꿈치만 발판에 걸치고 어깨 패드를 얹고 섭니다.',
      '뒤꿈치를 발판 아래로 최대한 내려 종아리를 깊게 이완합니다.',
      '발끝으로 지면을 밀어 까치발을 들듯 최대로 수축하고 1초간 정지합니다.'
    ],
    tips: ['반동을 쓰지 말고 최하단과 최상단에서 멈추는 정적 수축을 적용하세요.'],
    isPopular: false
  },

  // =================== 어깨 (SHOULDERS) ===================
  {
    id: 'overhead-press',
    name: '오버헤드 프레스 (밀리터리 프레스)',
    nameEn: 'Overhead Barbell Press (OHP)',
    category: 'shoulders',
    equipment: 'barbell',
    primaryMuscles: ['deltoid_front', 'deltoid_side'],
    secondaryMuscles: ['triceps', 'traps', 'abs'],
    description: '선 자세에서 바벨을 머리 위로 밀어 올리는 어깨 프레임과 코어 협응의 최고봉입니다.',
    instructions: [
      '바벨을 쇄골 위에 얹고 둔근과 복근을 단단히 조여 기립합니다.',
      '턱을 살짝 뒤로 당기며 바벨을 정수리 위 수직 방향으로 밀어 올립니다.',
      '머리가 바벨 아래로 통과하며 팔을 완전히 펴고 천천히 쇄골로 내립니다.'
    ],
    tips: ['허리가 뒤로 젖혀지지 않도록 복압을 단단히 유지하세요.'],
    isPopular: true
  },
  {
    id: 'dumbbell-shoulder-press',
    name: '덤벨 숄더 프레스',
    nameEn: 'Seated Dumbbell Shoulder Press',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['deltoid_front', 'deltoid_side'],
    secondaryMuscles: ['triceps', 'traps'],
    description: '각 팔의 독립적인 균형과 깊은 가동 범위로 어깨 전면과 측면의 볼륨을 채웁니다.',
    instructions: [
      '각도를 75~85도로 맞춘 벤치에 앉아 덤벨을 귀 옆 높이에 둡니다.',
      '팔꿈치가 어깨보다 살짝 앞으로 나오게 한 채 위로 수렴하듯 밀어 올립니다.',
      '귀 옆까지 어깨 근육의 긴장을 느끼며 천천히 내립니다.'
    ],
    tips: ['팔꿈치를 완전히 펴지 말고 어깨 장력을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'side-lateral-raise',
    name: '사이드 레터럴 레이즈 (사레레)',
    nameEn: 'Side Lateral Raise',
    category: 'shoulders',
    equipment: 'dumbbell',
    primaryMuscles: ['deltoid_side'],
    secondaryMuscles: ['traps'],
    description: '넓은 어깨 프레임의 핵심인 측면 삼각근을 정밀 타겟하는 대표 고립 운동입니다.',
    instructions: [
      '덤벨을 쥐고 팔꿈치를 살짝 굽힌 상태로 몸 옆에 둡니다.',
      '손목이 아닌 팔꿈치를 멀리 던진다는 느낌으로 어깨높이까지 들어 올립니다.',
      '측면 삼각근으로 무게를 받아내며 천천히 저항하며 내립니다.'
    ],
    tips: ['승모근 개입을 줄이려면 어깨를 으쓱거리지 말고 하강시켜 고정하세요.'],
    isPopular: true
  },
  {
    id: 'cable-lateral-raise',
    name: '케이블 사이드 레터럴 레이즈',
    nameEn: 'Cable Lateral Raise',
    category: 'shoulders',
    equipment: 'cable',
    primaryMuscles: ['deltoid_side'],
    secondaryMuscles: [],
    description: '시작 지점부터 끝까지 장력이 끊기지 않아 측면 삼각근에 지속적인 텐션을 줍니다.',
    instructions: [
      '케이블을 최하단에 두고 반대쪽 손으로 손잡이를 잡습니다.',
      '대각선 방향으로 팔꿈치를 들어 올려 어깨와 평행하게 만듭니다.',
      '케이블에 끌려가지 않도록 저항하며 복귀합니다.'
    ],
    tips: ['가동 범위 전체에서 측면 어깨가 찢어지는 듯한 자극을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'face-pull',
    name: '페이스 풀 (케이블 로프)',
    nameEn: 'Cable Face Pull',
    category: 'shoulders',
    equipment: 'cable',
    primaryMuscles: ['deltoid_rear', 'traps'],
    secondaryMuscles: ['deltoid_side'],
    description: '후면 삼각근, 회전근개, 상부 등을 강화하여 라운드 숄더를 교정하고 어깨 건강을 지킵니다.',
    instructions: [
      '로프를 눈높이에 맞추고 엄지가 뒤를 향하게 잡습니다.',
      '로프의 매듭을 이마/미간 쪽으로 당기며 팔꿈치를 뒤로 벌립니다.',
      '마지막에 어깨를 외회전하며 후면 삼각근을 강하게 수축합니다.'
    ],
    tips: ['팔꿈치를 손목보다 높은 위치로 유지하며 당기세요.'],
    isPopular: true
  },
  {
    id: 'rear-delt-fly',
    name: '리어 델트 플라이 (리버스 펙덱)',
    nameEn: 'Reverse Pec Deck Fly',
    category: 'shoulders',
    equipment: 'machine',
    defaultBrand: 'Cybex (싸이벡스)',
    primaryMuscles: ['deltoid_rear'],
    secondaryMuscles: ['traps'],
    description: '후면 삼각근을 흔들림 없이 고립하여 입체감 있는 뒷어깨 알맹이를 만듭니다.',
    instructions: [
      '머신을 마주보고 앉아 가슴 패드에 상체를 대고 손잡이를 잡습니다.',
      '팔꿈치를 살짝 굽힌 상태로 뒤쪽 벽을 향해 팔을 수평으로 벌립니다.',
      '등 근육이 접히기 직전 후면 삼각근만의 힘으로 버티며 모아줍니다.'
    ],
    tips: ['견갑골을 모으지 말고 고정한 채 어깨 후면만으로 벌리세요.'],
    isPopular: true
  },

  // =================== 팔 (ARMS - BICEPS / TRICEPS / FOREARMS) ===================
  {
    id: 'barbell-curl',
    name: '바벨 컬',
    nameEn: 'Barbell Biceps Curl',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    description: '상완이두근의 전체적인 볼륨과 크기를 키우는 가장 대표적인 상완 운동입니다.',
    instructions: [
      '어깨너비로 언더그립 바벨을 잡고 팔꿈치를 옆구리에 고정합니다.',
      '팔꿈치가 앞으로 튀어나가지 않게 주의하며 바벨을 가슴 높이로 컬합니다.',
      '이두근의 긴장을 놓지 않고 2~3초에 걸쳐 천천히 내립니다.'
    ],
    tips: ['몸을 앞뒤로 흔드는 치팅을 삼가고 이두근의 장력에 집중하세요.'],
    isPopular: true
  },
  {
    id: 'dumbbell-hammer-curl',
    name: '덤벨 해머 컬',
    nameEn: 'Dumbbell Hammer Curl',
    category: 'arms',
    equipment: 'dumbbell',
    primaryMuscles: ['biceps', 'forearms'],
    secondaryMuscles: [],
    description: '손바닥이 마주 보는 중립 그립으로 상완근과 상완요골근을 키워 팔의 두께감을 극대화합니다.',
    instructions: [
      '망치를 쥐듯 덤벨을 수직으로 잡고 섭니다.',
      '팔꿈치를 고정한 채 덤벨 머리가 어깨 쪽을 향하게 들어 올립니다.',
      '상완 바깥쪽과 전완근의 수축을 느끼며 내립니다.'
    ],
    tips: ['손목을 비틀지 말고 단단히 고정하세요.'],
    isPopular: true
  },
  {
    id: 'preacher-curl',
    name: '프리처 컬 머신',
    nameEn: 'Preacher Curl Machine',
    category: 'arms',
    equipment: 'machine',
    defaultBrand: 'Precor (프리코)',
    primaryMuscles: ['biceps'],
    secondaryMuscles: [],
    description: '팔을 패드에 단단히 고정하여 몸의 반동을 100% 원천 차단하는 순수 이두 고립기입니다.',
    instructions: [
      '겨드랑이를 프리처 패드 상단에 밀착시키고 손잡이를 잡습니다.',
      '이두근을 수축하며 손잡이를 턱 쪽으로 감아올립니다.',
      '팔꿈치가 다 펴지기 직전까지 긴장을 유지하며 이완합니다.'
    ],
    tips: ['최하단에서 팔꿈치를 과도하게 펴면 인대에 무리가 갈 수 있으니 살짝 여유를 두세요.'],
    isPopular: false
  },
  {
    id: 'skull-crusher',
    name: '스컬 크러셔 (라잉 트라이셉스 익스텐션)',
    nameEn: 'Lying Triceps Extension (Skull Crusher)',
    category: 'arms',
    equipment: 'barbell',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    description: '삼두근의 장두(Long head)를 강력하게 스트레칭시켜 팔 뒤쪽의 말발굽 볼륨을 완성합니다.',
    instructions: [
      '벤치에 누워 EZ바를 어깨 위로 수직으로 뻗습니다.',
      '팔꿈치 위치를 고정한 채 이마나 정수리 쪽으로 바를 천천히 내립니다.',
      '삼두근의 수축력으로 팔꿈치를 펴서 원위치로 밉니다.'
    ],
    tips: ['팔꿈치가 바깥으로 벌어지지 않도록 모아주는 힘을 유지하세요.'],
    isPopular: true
  },
  {
    id: 'cable-triceps-pushdown',
    name: '케이블 삼두 푸시다운',
    nameEn: 'Cable Triceps Pushdown',
    category: 'arms',
    equipment: 'cable',
    primaryMuscles: ['triceps'],
    secondaryMuscles: [],
    description: '바 또는 로프를 아래로 내리눌러 삼두근 외측두와 내측두를 펌핑시킵니다.',
    instructions: [
      '케이블에 일자바 또는 로프를 장착하고 가슴을 폅니다.',
      '팔꿈치를 옆구리에 고정하고 바닥을 향해 힘차게 눌러 폅니다.',
      '정점에서 1초간 쥐어짠 후 팔꿈치가 90도가 될 때까지 통제하며 올립니다.'
    ],
    tips: ['어깨가 앞으로 말리지 않도록 가슴을 활짝 열어두세요.'],
    isPopular: true
  },

  // =================== 코어 / 복근 (CORE / ABS) ===================
  {
    id: 'hanging-leg-raise',
    name: '행잉 레그 레이즈',
    nameEn: 'Hanging Leg Raise',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['obliques', 'forearms'],
    description: '철봉에 매달려 골반을 말아올리며 하복부와 전체 복근을 두껍게 단련합니다.',
    instructions: [
      '철봉에 매달려 어깨 패킹을 유지합니다.',
      '다리만 드는 것이 아니라 골반을 가슴 쪽으로 둥글게 말아올립니다.',
      '복근의 긴장을 유지하며 반동 없이 다리를 내립니다.'
    ],
    tips: ['몸이 앞뒤로 흔들리면 무릎을 살짝 구부려 진행해 보세요.'],
    isPopular: true
  },
  {
    id: 'cable-woodchopper',
    name: '케이블 우드초퍼',
    nameEn: 'Cable Woodchopper',
    category: 'core',
    equipment: 'cable',
    primaryMuscles: ['obliques'],
    secondaryMuscles: ['abs'],
    description: '몸통의 대각선 회전을 통해 옆구리 외복사근의 탄탄한 기능과 라인을 다듬습니다.',
    instructions: [
      '케이블을 높은 위치에 두고 양손으로 손잡이를 잡고 옆으로 섭니다.',
      '골반과 몸통을 대각선 아래 반대편 무릎 방향으로 강하게 회전시킵니다.',
      '복사근의 긴장을 느끼며 천천히 되돌아옵니다.'
    ],
    tips: ['팔로 끌어당기지 말고 몸통(복사근)을 쥐어짜듯 돌리세요.'],
    isPopular: false
  },
  {
    id: 'ab-wheel-rollout',
    name: '앱 롤아웃 (AB 슬라이드)',
    nameEn: 'Ab Wheel Rollout',
    category: 'core',
    equipment: 'bodyweight',
    primaryMuscles: ['abs'],
    secondaryMuscles: ['lats', 'deltoid_front'],
    description: '복직근의 신장성 수축과 코어의 안티-익스텐션(신전 방지) 저항력을 끝판왕으로 단련합니다.',
    instructions: [
      '무릎을 바닥에 대고 휠 손잡이를 잡습니다.',
      '골반을 먼저 앞으로 밀며 몸을 최대한 앞으로 길게 뻗습니다.',
      '허리가 꺾이지 않도록 복근을 쥐어짜며 휠을 무릎 쪽으로 당겨옵니다.'
    ],
    tips: ['허리 통증이 생기면 가동 범위를 줄이고 복압을 유지하세요.'],
    isPopular: true
  }
];

import { Exercise } from '../types/workout';

export const EXERCISES_DATABASE: Exercise[] = [
  {
    "id": "bench-press",
    "name": "바벨 벤치프레스",
    "nameEn": "Barbell Flat Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "상체 가슴 근육의 전체적인 매스와 전신 협응력을 발달시키는 대표적인 3대 운동입니다.",
    "instructions": [
      "벤치에 누워 견갑골을 모으고 하강시켜 흉곽을 열어줍니다.",
      "어깨너비보다 살짝 넓게 바벨을 잡고 흉골 아랫부분을 향해 통제하며 내립니다.",
      "대흉근의 수축력으로 밀어 올립니다."
    ],
    "tips": [
      "허리는 자연스러운 아치를 유지하세요.",
      "네거티브 시 2~3초간 천천히 통제하세요."
    ],
    "isPopular": true
  },
  {
    "id": "incline-bench-press",
    "name": "인클라인 바벨 벤치프레스",
    "nameEn": "Incline Barbell Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "윗가슴(쇄골두)을 집중 타겟하여 꽉 찬 가슴 상부 라인을 만듭니다.",
    "instructions": [
      "30~45도 인클라인 벤치에 누워 쇄골 바로 아래로 바벨을 내립니다.",
      "상부 대흉근으로 밀어 올린다는 느낌에 집중합니다."
    ],
    "tips": [
      "각도가 45도를 넘으면 어깨 전면 개입이 커집니다."
    ],
    "isPopular": true
  },
  {
    "id": "decline-bench-press",
    "name": "디클라인 바벨 벤치프레스",
    "nameEn": "Decline Barbell Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "decline-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "가슴 아랫라인을 정밀하게 다듬고 어깨 부담을 줄인 프레스입니다.",
    "instructions": [
      "디클라인 벤치에서 바벨을 아랫가슴 라인으로 내렸다가 밉니다."
    ],
    "tips": [
      "그립을 너무 좁게 잡지 마세요."
    ]
  },
  {
    "id": "dumbbell-bench-press",
    "name": "덤벨 벤치프레스",
    "nameEn": "Dumbbell Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "바벨보다 더 깊은 가동 범위로 대흉근 안쪽까지 강하게 자극합니다.",
    "instructions": [
      "덤벨을 가슴 옆에 두고 깊게 이완한 후 호를 그리며 모아 밀어 올립니다."
    ],
    "tips": [
      "덤벨끼리 부딪치지 않고 장력을 유지하세요."
    ],
    "isPopular": true
  },
  {
    "id": "incline-dumbbell-press",
    "name": "인클라인 덤벨 프레스",
    "nameEn": "Incline Dumbbell Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "쇄골 아래 윗가슴에 최대의 가동 범위와 수축감을 제공합니다.",
    "instructions": [
      "인클라인 벤치에서 덤벨을 쇄골 옆으로 내렸다가 윗가슴으로 밀어냅니다."
    ],
    "tips": [
      "어깨가 으쓱하지 않게 견갑을 하강 고정하세요."
    ],
    "isPopular": true
  },
  {
    "id": "decline-dumbbell-press",
    "name": "디클라인 덤벨 프레스",
    "nameEn": "Decline Dumbbell Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "decline-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "덤벨의 자유로운 궤적으로 아랫가슴을 집중 조각합니다.",
    "instructions": [
      "디클라인 벤치에서 가슴 하부 깊숙이 이완 후 밀어냅니다."
    ],
    "tips": [
      "시선은 위를 향하세요."
    ]
  },
  {
    "id": "dumbbell-fly",
    "name": "덤벨 플라이",
    "nameEn": "Flat Dumbbell Fly",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "대흉근을 양옆으로 길게 찢어주는 고립 이완 운동입니다.",
    "instructions": [
      "팔꿈치를 살짝 굽힌 채 큰 나무를 껴안듯 가슴을 벌렸다가 모아줍니다."
    ],
    "tips": [
      "어깨 관절에 통증이 없는 선까지만 내리세요."
    ]
  },
  {
    "id": "incline-dumbbell-fly",
    "name": "인클라인 덤벨 플라이",
    "nameEn": "Incline Dumbbell Fly",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "윗가슴의 가로 방향 이완 신전을 극대화하는 고립 운동입니다.",
    "instructions": [
      "30도 벤치에서 덤벨을 양옆 사선 위로 열었다가 상부 가슴으로 모읍니다."
    ],
    "tips": [
      "팔꿈치 각도를 일정하게 고정하세요."
    ]
  },
  {
    "id": "hammer-iso-chest-press",
    "name": "체스트 프레스",
    "nameEn": "Chest Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "해머스트렝스 고유의 수렴 궤적으로 가슴 전체에 강렬한 수축을 제공합니다.",
    "instructions": [
      "시트 높이를 조절하고 호를 그리며 밀어냅니다."
    ],
    "tips": [
      "좌우 독립 암으로 비대칭을 교정합니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-iso-incline-press",
    "name": "인클라인 프레스",
    "nameEn": "Incline Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "독보적인 인클라인 수렴 궤적으로 쇄골 윗가슴을 저격하는 명기입니다.",
    "instructions": [
      "윗가슴 방향 사선 위로 자연스럽게 밀어 올립니다."
    ],
    "tips": [
      "등받이에 등을 단단히 밀착하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-iso-decline-press",
    "name": "디클라인 프레스",
    "nameEn": "Decline Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "decline-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "아랫가슴 라인을 완벽하게 고립시켜주는 플레이트로디드 머신입니다.",
    "instructions": [
      "팔꿈치를 가슴 아래 방향으로 호를 그리며 수축합니다."
    ],
    "tips": [
      "어깨 부담이 적어 고중량 훈련에 좋습니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-iso-wide-chest",
    "name": "와이드 체스트 프레스",
    "nameEn": "Wide Chest",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "넓은 그립 출발 지점에서 가슴 안쪽까지 깊게 모아주는 광폭 궤적 프레스입니다.",
    "instructions": [
      "가슴을 활짝 열고 팔꿈치가 안쪽으로 모이도록 강하게 수축합니다."
    ],
    "tips": [
      "수축 정점에서 1초간 쥐어짜세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-super-incline-press",
    "name": "슈퍼 인클라인 프레스",
    "nameEn": "Super Incline Press",
    "category": "chest",
    "categories": [
      "chest",
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "최상부 쇄골두와 전면 삼각근 경계선을 완벽히 채워주는 급경사 프레스입니다.",
    "instructions": [
      "수직에 가깝게 위로 밀어올려 윗가슴 정점을 자극합니다."
    ],
    "tips": [
      "고중량보다는 수축 감각에 집중하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-select-chest-press",
    "name": "실렉트 체스트 프레스",
    "nameEn": "Select Chest Press (Pin)",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "핀 셀렉터 방식으로 빠르고 안전하게 무게를 조절하며 가슴을 훈련합니다.",
    "instructions": [
      "핀을 꽂고 부드럽게 밀어냅니다."
    ],
    "tips": [
      "드롭세트 진행에 최적입니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "cybex-chest-press",
    "name": "이글 체스트 프레스",
    "nameEn": "Cybex Eagle Chest Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "인체 관절 회전축에 최적화된 부드러운 장력의 싸이벡스 대표 핀머신입니다.",
    "instructions": [
      "듀얼 축 핸들을 잡고 자연스러운 각도로 가슴을 모아줍니다."
    ],
    "tips": [
      "끝까지 유지되는 텐션을 느껴보세요."
    ],
    "defaultBrand": "Cybex (싸이벡스)"
  },
  {
    "id": "panatta-super-incline",
    "name": "파나타 슈퍼 인클라인 체스트 프레스",
    "nameEn": "Panatta Super Incline Chest Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "이탈리아 명품 파나타의 극강 윗가슴 타겟 플레이트로디드 머신입니다.",
    "instructions": [
      "윗가슴 궤적을 따라 유려하게 밀어냅니다."
    ],
    "tips": [
      "네거티브 저항이 탁월합니다."
    ],
    "defaultBrand": "Panatta (파나타)"
  },
  {
    "id": "pec-deck-fly",
    "name": "펙덱 플라이 머신",
    "nameEn": "Pec Deck Machine Fly",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "머신으로 궤적이 고정되어 대흉근 중앙 안쪽을 완벽하게 고립시킵니다.",
    "instructions": [
      "팔꿈치 안쪽으로 패드를 밀어 가슴 안쪽을 짭니다."
    ],
    "tips": [
      "어깨가 말리지 않게 흉곽을 세우세요."
    ],
    "isPopular": true
  },
  {
    "id": "cable-crossover-high-low",
    "name": "케이블 크로스오버 (하이 투 로우)",
    "nameEn": "Cable Crossover (High to Low)",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "위에서 아래로 당겨 대흉근 하부와 가슴 아랫라인을 정밀 분리합니다.",
    "instructions": [
      "상체를 살짝 숙이고 아래 사선으로 손을 모읍니다."
    ],
    "tips": [
      "손끝이 아랫배 앞에서 마주치도록 모아주세요."
    ]
  },
  {
    "id": "cable-crossover-low-high",
    "name": "케이블 크로스오버 (로우 투 하이)",
    "nameEn": "Cable Crossover (Low to High)",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "description": "아래에서 사선 위로 퍼올려 윗가슴 안쪽 섬유를 완벽히 채웁니다.",
    "instructions": [
      "도르래를 바닥에 두고 쇄골 높이로 손을 모아 올립니다."
    ],
    "tips": [
      "어깨가 솟지 않게 하강 고정하세요."
    ]
  },
  {
    "id": "dips-chest",
    "name": "체스트 딥스",
    "nameEn": "Parallel Bar Chest Dips",
    "category": "chest",
    "categories": [
      "chest",
      "arms",
      "shoulders"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "decline-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "deltoid_front"
    ],
    "description": "체중을 이용해 가슴 하부와 삼두근 전체를 폭발적으로 키우는 상체 스쿼트입니다.",
    "instructions": [
      "상체를 30도 숙이고 가슴을 늘려 내려갔다 밀어 올립니다."
    ],
    "tips": [
      "상체를 앞으로 숙여야 가슴에 부하가 실립니다."
    ],
    "isPopular": true
  },
  {
    "id": "assisted-dips-machine",
    "name": "어시스트 딥스 머신",
    "nameEn": "Assisted Dips Machine",
    "category": "chest",
    "categories": [
      "chest",
      "arms"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "decline-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "핀 무게 보조를 받아 초보자도 안전하게 딥스 자세를 수행합니다.",
    "instructions": [
      "패드에 무릎을 올리고 상체를 숙여 가슴에 집중합니다."
    ],
    "tips": [
      "핀 무게가 무거울수록 쉬워집니다."
    ]
  },
  {
    "id": "push-up",
    "name": "푸시업 (팔굽혀펴기)",
    "nameEn": "Standard Push-Up",
    "category": "chest",
    "categories": [
      "chest",
      "arms",
      "core"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "deltoid_front",
      "abs"
    ],
    "description": "상체 전체와 코어를 단련하는 맨몸 운동의 기본입니다.",
    "instructions": [
      "몸을 일직선으로 유지하고 가슴이 바닥에 닿기 직전까지 내립니다."
    ],
    "tips": [
      "허리가 처지지 않도록 복근을 조이세요."
    ]
  },
  {
    "id": "smith-incline-bench-press",
    "name": "스미스머신 인클라인 벤치프레스",
    "nameEn": "Smith Machine Incline Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "barbell",
    "movementPlane": "incline-press",
    "primaryMuscles": [
      "chest_upper"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "고정된 레일 덕분에 밸런스 걱정 없이 윗가슴에 고중량을 실을 수 있습니다.",
    "instructions": [
      "바벨이 쇄골 바로 아래로 떨어지도록 벤치 위치를 맞춥니다."
    ],
    "tips": [
      "수직 궤적으로 밀어내세요."
    ]
  },
  {
    "id": "smith-flat-bench-press",
    "name": "스미스머신 플랫 벤치프레스",
    "nameEn": "Smith Machine Flat Bench Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "barbell",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front",
      "triceps"
    ],
    "description": "안전 고리가 있어 파트너 없이도 안전하게 한계 지점까지 훈련합니다.",
    "instructions": [
      "흉골 아래로 바벨을 내렸다가 밀어 올립니다."
    ],
    "tips": [
      "안전 스토퍼를 가슴 높이에 맞추세요."
    ]
  },
  {
    "id": "dumbbell-pullover-chest",
    "name": "덤벨 풀오버 (가슴 집중)",
    "nameEn": "Dumbbell Pullover (Chest Focus)",
    "category": "chest",
    "categories": [
      "chest",
      "back"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "fly",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "lats",
      "triceps"
    ],
    "description": "흉곽을 확장하고 대흉근 상부와 전거근을 길게 늘려주는 클래식 운동입니다.",
    "instructions": [
      "덤벨을 머리 뒤로 천천히 내렸다가 가슴 위로 끌어옵니다."
    ],
    "tips": [
      "팔꿈치를 살짝 굽힌 상태를 유지하세요."
    ]
  },
  {
    "id": "conventional-deadlift",
    "name": "컨벤셔널 데드리프트",
    "nameEn": "Conventional Barbell Deadlift",
    "category": "back",
    "categories": [
      "back",
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "erectors",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [
      "lats",
      "traps",
      "forearms",
      "quads"
    ],
    "description": "전신 후면 사슬과 기립근, 둔근, 햄스트링을 통틀어 가장 무거운 무게를 다루는 최고의 전신 복합 운동입니다.",
    "instructions": [
      "발을 골반 너비로 벌리고 정강이를 바벨에 바짝 붙입니다.",
      "고관절을 접고 힙 힌지를 만들어 바벨을 견고히 잡습니다.",
      "광배근을 조여 바를 몸에 밀착시키며 바닥을 발로 밀어 일어섭니다."
    ],
    "tips": [
      "허리가 굽지 않도록 흉곽을 세우고 복압을 100% 채우세요."
    ],
    "isPopular": true
  },
  {
    "id": "romanian-deadlift",
    "name": "루마니안 데드리프트",
    "nameEn": "Romanian Deadlift (RDL)",
    "category": "back",
    "categories": [
      "back",
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "hamstrings",
      "erectors",
      "glutes"
    ],
    "secondaryMuscles": [
      "lats",
      "traps"
    ],
    "description": "등 하부 기립근과 햄스트링/둔근을 긴장 상태로 유지하며 강력한 힙힌지 스트레칭을 유도합니다.",
    "instructions": [
      "엉덩이를 뒤로 멀리 보내며 바벨을 허벅지를 따라 정강이 중간까지 내립니다.",
      "햄스트링이 최대로 늘어나는 지점에서 둔근을 수축하며 일어섭니다."
    ],
    "tips": [
      "무릎을 과하게 굽히지 말고 고관절의 앞뒤 이동에 집중하세요."
    ],
    "isPopular": true
  },
  {
    "id": "rack-pull",
    "name": "랙 풀 (부분 데드리프트)",
    "nameEn": "Barbell Rack Pull",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "traps",
      "erectors",
      "lats"
    ],
    "secondaryMuscles": [
      "glutes",
      "forearms"
    ],
    "description": "파워랙 무릎 높이에서 바벨을 뽑아 올려 등 상부와 기립근에 초고중량을 퍼붓습니다.",
    "instructions": [
      "무릎 바로 아래 랙 핀에서 바벨을 잡고 견갑을 뒤로 잠그며 강하게 락아웃합니다."
    ],
    "tips": [
      "등의 두께감 형성에 최고의 운동입니다."
    ]
  },
  {
    "id": "barbell-bent-over-row",
    "name": "바벨 벤트오버 로우",
    "nameEn": "Barbell Bent-Over Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps",
      "erectors",
      "deltoid_rear"
    ],
    "description": "등 전체의 프레임과 두께감을 동시에 구축하는 대표적인 프리웨이트 로우입니다.",
    "instructions": [
      "상체를 45도 숙이고 허리를 곧게 편 힙힌지 자세를 취합니다.",
      "팔꿈치를 몸통 뒤로 당기며 바벨을 배꼽 쪽으로 끌어올립니다."
    ],
    "tips": [
      "반동을 쓰지 않고 상체 각도를 일정하게 고정하세요."
    ],
    "isPopular": true
  },
  {
    "id": "pendlay-row",
    "name": "펜들레이 로우",
    "nameEn": "Pendlay Barbell Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "traps",
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "erectors"
    ],
    "description": "매 세트 바닥에 바벨을 완전히 내려놓고 순간적인 폭발력으로 등 상부를 가격합니다.",
    "instructions": [
      "상체를 바닥과 수평으로 숙이고 바닥에서 가슴 아랫단으로 폭발적으로 당깁니다."
    ],
    "tips": [
      "순수 파워를 키울 수 있습니다."
    ]
  },
  {
    "id": "t-bar-row",
    "name": "T-바 로우 (프리웨이트)",
    "nameEn": "T-Bar Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "barbell",
    "loadType": "plate-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "traps",
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "erectors"
    ],
    "description": "중립 손잡이로 등 안쪽과 능형근, 광배근 중심부를 묵직하게 채워줍니다.",
    "instructions": [
      "다리 사이에 바벨을 둔 채 가슴을 펴고 배꼽 쪽으로 당깁니다."
    ],
    "tips": [
      "상체가 너무 일어서지 않도록 고관절을 접으세요."
    ]
  },
  {
    "id": "hammer-iso-high-row",
    "name": "하이 로우",
    "nameEn": "High Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "traps",
      "deltoid_rear"
    ],
    "description": "위에서 사선 아래로 당겨오는 황금 궤적으로 광배근 하부와 등 중앙을 털어주는 명기입니다.",
    "instructions": [
      "팔꿈치를 옆구리 뒤쪽으로 찍어 누르듯 사선 아래로 당깁니다."
    ],
    "tips": [
      "원암으로 진행하면 광배근 수축감을 극대화할 수 있습니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-iso-front-pulldown",
    "name": "프론트 랫 풀다운",
    "nameEn": "Front Lat Pulldown",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "몸 앞쪽에서 호를 그리며 쇄골 쪽으로 당겨지는 최고의 수직 당기기 머신입니다.",
    "instructions": [
      "팔꿈치를 수직으로 내리며 광배근을 짭니다."
    ],
    "tips": [
      "견갑을 먼저 하강시킨 후 팔을 당기세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-iso-low-row",
    "name": "로우 로우",
    "nameEn": "Low Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps",
      "deltoid_rear"
    ],
    "description": "아래에서 위로 당겨 올려 광배근 중하부와 능형근의 두께감을 극대화합니다.",
    "instructions": [
      "패드에 기대고 핸들을 잡아 팔꿈치를 골반 쪽으로 깊게 당깁니다."
    ],
    "tips": [
      "광배근이 걸리는 지점까지만 당기세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-dy-row",
    "name": "D.Y. 로우 (도리안 예이츠)",
    "nameEn": "D.Y. Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "traps"
    ],
    "description": "도리안 예이츠의 광배근 철학이 담긴 언더그립 최적화 로우 머신입니다.",
    "instructions": [
      "역그립으로 잡고 팔꿈치를 골반 쪽으로 강하게 당깁니다."
    ],
    "tips": [
      "광배근 하부 부착점까지 꽉 차는 수축감을 제공합니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-iso-mid-row",
    "name": "미드 로우",
    "nameEn": "Mid Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "traps",
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "deltoid_rear"
    ],
    "description": "수평으로 정직하게 당겨 승모근 중하부와 능형근의 완벽한 수축을 이끌어냅니다.",
    "instructions": [
      "가슴 패드를 대고 핸들을 몸쪽으로 수평 견인합니다."
    ],
    "tips": [
      "견갑골을 강하게 뒤로 모아주세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-iso-bench-row",
    "name": "호리존탈 벤치 로우",
    "nameEn": "Horizontal Bench Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "플랫 벤치에 엎드린 상태로 진행하여 허리 부담을 없애고 등만 고립합니다.",
    "instructions": [
      "패드에 엎드려 핸들을 잡고 팔꿈치를 들어 올립니다."
    ],
    "tips": [
      "허리 디스크가 있는 분들에게 최고의 등 두께감 운동입니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-iso-super-lat",
    "name": "슈퍼 랫 풀다운",
    "nameEn": "Super Lat Pulldown",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "넓은 그립 출발 지점에서 수직 수렴하는 극강의 광배근 상부 머신입니다.",
    "instructions": [
      "팔꿈치를 넓게 벌리며 아래로 찍어 내립니다."
    ],
    "tips": [
      "광배근 외측 프레임 형성에 탁월합니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-underhand-pulldown",
    "name": "언더핸드 풀다운",
    "nameEn": "Underhand Pulldown",
    "category": "back",
    "categories": [
      "back",
      "arms"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "역그립으로 광배근 하부와 이두근을 동시에 공략합니다.",
    "instructions": [
      "손바닥이 몸을 보게 쥐고 가슴 하단으로 당깁니다."
    ],
    "tips": [
      "수축 시 가슴을 살짝 내밀어주세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-select-lat-pulldown",
    "name": "실렉트 랫 풀다운",
    "nameEn": "Select Lat Pulldown (Pin)",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "핀 셀렉터 방식으로 부드러운 도르래 저항을 통해 광배근 상부를 넓혀줍니다.",
    "instructions": [
      "와이드 바를 잡고 쇄골 쪽으로 당깁니다."
    ],
    "tips": [
      "상체를 과도하게 뒤로 눕히지 마세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-select-seated-row",
    "name": "실렉트 시티드 로우",
    "nameEn": "Select Seated Row (Pin)",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "다양한 핸들 각도와 핀 조절로 손쉽게 등 안쪽을 고립시키는 핀머신입니다.",
    "instructions": [
      "핸들을 가슴 쪽으로 당겨 견갑을 모읍니다."
    ],
    "tips": [
      "이완 시 광배근이 길게 늘어나는 것을 충분히 느끼세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-select-assist-chin",
    "name": "어시스트 풀업 머신",
    "nameEn": "Select Assisted Chin",
    "category": "back",
    "categories": [
      "back",
      "arms"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "원하는 무게만큼 보조를 받아 완벽한 자세로 턱걸이를 수행합니다.",
    "instructions": [
      "패드에 무릎을 올리고 가슴을 바에 닿게 당깁니다."
    ],
    "tips": [
      "반동 없이 수행하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-select-back-extension",
    "name": "백 익스텐션 머신",
    "nameEn": "Select Back Extension",
    "category": "back",
    "categories": [
      "back",
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "erectors"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "description": "앉아서 안전하게 척추기립근에 핀 부하를 걸어 요통을 예방하고 기둥을 세웁니다.",
    "instructions": [
      "패드를 등에 대고 뒤로 밀어 기립근을 수축합니다."
    ],
    "tips": [
      "복압을 팽팽하게 유지하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-mts-high-row",
    "name": "MTS 듀얼 핀 하이 로우",
    "nameEn": "MTS High Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "양쪽 핀 타워가 독립되어 플레이트 머신의 궤적과 핀머신의 편리함을 합쳤습니다.",
    "instructions": [
      "각 손을 독립적으로 아래 사선으로 당깁니다."
    ],
    "tips": [
      "MTS 특유의 초경량 관성 저항을 느껴보세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "hammer-mts-row",
    "name": "MTS 듀얼 핀 로우",
    "nameEn": "MTS Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "traps",
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "독립 핀 스택으로 좌우 균형 있게 등 중앙부를 타격합니다.",
    "instructions": [
      "패드에 기대어 수평으로 당겨옵니다."
    ],
    "tips": [
      "좌우 한 팔씩 번갈아 원암 로우로도 최적입니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "cybex-eagle-seated-row",
    "name": "이글 시티드 로우",
    "nameEn": "Cybex Eagle Seated Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "회전 핸들 축으로 손목 무리 없이 등 깊은 곳까지 텐션을 전달합니다.",
    "instructions": [
      "손잡이가 몸 안쪽으로 회전하며 당겨지도록 당깁니다."
    ],
    "tips": [
      "싸이벡스 특유의 쫀쫀한 텐션을 유지하세요."
    ],
    "defaultBrand": "Cybex (싸이벡스)"
  },
  {
    "id": "panatta-super-lat-pulldown",
    "name": "파나타 슈퍼 랫 풀다운",
    "nameEn": "Panatta Super Lat Pulldown Circular",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "원형 궤적을 따라 광배근 결대로 접히는 명품 머신입니다.",
    "instructions": [
      "팔꿈치가 광배근 안쪽으로 빨려 들어가듯 당깁니다."
    ],
    "tips": [
      "이완 시 광배근이 극한으로 스트레칭됩니다."
    ],
    "defaultBrand": "Panatta (파나타)"
  },
  {
    "id": "newtech-torque-lat-pulldown",
    "name": "토크 와이드 랫 풀다운",
    "nameEn": "NewTech Torque Wide Lat Pulldown",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "한국인 체형에 최적화된 프레임 각도로 광배근 바깥쪽을 넓혀줍니다.",
    "instructions": [
      "가슴을 들고 쇄골 쪽으로 찍어 내립니다."
    ],
    "tips": [
      "양손을 독립적으로 움직여 밸런스를 맞추세요."
    ],
    "defaultBrand": "NewTech (뉴텍)"
  },
  {
    "id": "lat-pulldown-wide",
    "name": "랫 풀다운 (와이드 그립)",
    "nameEn": "Lat Pulldown (Wide Grip)",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "traps"
    ],
    "description": "대원근과 상부 광배근을 넓혀 역삼각형 V-Taper 체형을 만들어주는 기본 머신입니다.",
    "instructions": [
      "어깨너비 1.5배로 바를 잡고 가슴 윗부분으로 수직 견인합니다."
    ],
    "tips": [
      "팔꿈치를 주머니에 꽂는다는 느낌을 유지하세요."
    ],
    "isPopular": true
  },
  {
    "id": "lat-pulldown-mag",
    "name": "랫 풀다운 (맥그립 / 패러렐)",
    "nameEn": "Lat Pulldown (MAG Grip Neutral)",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "손목과 전완근의 피로를 없애고 광배근에만 100% 텐션을 걸어줍니다.",
    "instructions": [
      "중립 맥그립을 손바닥으로 받치듯 잡고 명치 방향으로 당깁니다."
    ],
    "tips": [
      "스트랩 없이도 등의 깊은 곳까지 자극을 전달합니다."
    ]
  },
  {
    "id": "lat-pulldown-under",
    "name": "랫 풀다운 (언더그립 / 리버스)",
    "nameEn": "Lat Pulldown (Underhand Reverse Grip)",
    "category": "back",
    "categories": [
      "back",
      "arms"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "description": "손바닥이 몸을 향하는 역그립으로 광배근 하부 깊숙한 곳까지 자극을 꽂아넣습니다.",
    "instructions": [
      "어깨너비로 언더핸드 그립을 잡고 아랫가슴으로 당깁니다."
    ],
    "tips": [
      "이두근 개입을 감안하여 광배근 수축에 집중하세요."
    ]
  },
  {
    "id": "seated-cable-row",
    "name": "시티드 케이블 로우 (V-그립)",
    "nameEn": "Seated Cable Row (V-Bar)",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps",
      "erectors"
    ],
    "description": "케이블의 지속적인 텐션으로 등 중앙부와 능형근의 두께를 빌드업합니다.",
    "instructions": [
      "발판을 밀어 자리를 잡고 배꼽 쪽으로 V바를 당깁니다."
    ],
    "tips": [
      "이완 시 상체가 앞으로 과하게 딸려가지 않도록 하세요."
    ],
    "isPopular": true
  },
  {
    "id": "pull-up",
    "name": "풀업 (턱걸이)",
    "nameEn": "Pull-Up",
    "category": "back",
    "categories": [
      "back",
      "arms"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps",
      "traps",
      "forearms"
    ],
    "description": "자기 체중을 다루며 상체 전체의 프레임을 구축하는 최고의 맨몸 등 운동입니다.",
    "instructions": [
      "어깨보다 넓게 잡고 가슴을 봉에 닿게 한다는 느낌으로 당겨 올라갑니다."
    ],
    "tips": [
      "반동 없이 통제된 템포로 수행하세요."
    ],
    "isPopular": true
  },
  {
    "id": "chin-up",
    "name": "친업 (언더그립 턱걸이)",
    "nameEn": "Chin-Up",
    "category": "back",
    "categories": [
      "back",
      "arms"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "secondaryMuscles": [
      "forearms"
    ],
    "description": "이두근과 광배근 하부를 동시에 폭발적으로 자극하는 언더핸드 풀업입니다.",
    "instructions": [
      "손바닥이 얼굴을 보게 잡고 턱이 바 위로 넘어갈 때까지 당깁니다."
    ],
    "tips": [
      "풀업보다 더 깊은 수축 범위를 가져갈 수 있습니다."
    ]
  },
  {
    "id": "straight-arm-pulldown",
    "name": "스트레이트 암 케이블 풀다운 (암풀다운)",
    "nameEn": "Cable Straight Arm Pulldown",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "triceps",
      "deltoid_rear"
    ],
    "description": "이두근 개입을 배제하고 광배근만을 단독 고립시키는 최고의 단관절 운동입니다.",
    "instructions": [
      "상체를 30도 숙이고 호를 그리며 바를 허벅지 앞쪽으로 눌러 당깁니다."
    ],
    "tips": [
      "광배근을 날개처럼 펼쳤다가 조여주세요."
    ],
    "isPopular": true
  },
  {
    "id": "nautilus-pullover-machine",
    "name": "너틸러스 풀오버 머신",
    "nameEn": "Nautilus Pullover Machine",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "vertical-pull",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "chest",
      "triceps"
    ],
    "description": "아놀드 슈워제네거가 극찬했던 전설적인 광배근 고립 머신입니다.",
    "instructions": [
      "팔꿈치를 패드에 올리고 허벅지 앞까지 눌러 내립니다."
    ],
    "tips": [
      "손아귀 힘이 빠져도 팔꿈치로 광배근을 털 수 있습니다."
    ]
  },
  {
    "id": "one-arm-dumbbell-row",
    "name": "원암 덤벨 로우",
    "nameEn": "One-Arm Dumbbell Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "horizontal-row",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "traps",
      "biceps",
      "deltoid_rear"
    ],
    "description": "한 손씩 진행하여 광배근을 바닥 끝까지 늘리고 골반까지 깊게 쥐어짭니다.",
    "instructions": [
      "한쪽 무릎을 벤치에 대고 반대 손으로 덤벨을 골반 쪽으로 당깁니다."
    ],
    "tips": [
      "몸통을 과도하게 비틀지 마세요."
    ]
  },
  {
    "id": "back-extension",
    "name": "백 익스텐션 (하이퍼익스텐션)",
    "nameEn": "Hyperextension (Back Extension)",
    "category": "back",
    "categories": [
      "back",
      "legs"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "erectors",
      "glutes",
      "hamstrings"
    ],
    "secondaryMuscles": [],
    "description": "허리 척추기립근과 둔근의 지구력을 보강하고 부상을 예방하는 필수 보강 운동입니다.",
    "instructions": [
      "골반을 패드에 대고 상체를 숙였다가 기립근 힘으로 일직선까지 듭니다."
    ],
    "tips": [
      "허리를 뒤로 과도하게 꺾지 마세요."
    ]
  },
  {
    "id": "good-morning",
    "name": "바벨 굿모닝",
    "nameEn": "Barbell Good Morning",
    "category": "back",
    "categories": [
      "back",
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "erectors",
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "traps"
    ],
    "description": "바벨을 승모근에 얹고 인사하듯 상체를 숙여 후면 사슬 전체의 장력을 극대화합니다.",
    "instructions": [
      "등을 곧게 펴고 고관절을 뒤로 빼며 상체를 숙였다 돌아옵니다."
    ],
    "tips": [
      "무게 욕심을 버리고 정밀한 힙힌지 궤적에 집중하세요."
    ]
  },
  {
    "id": "barbell-back-squat",
    "name": "바벨 백스쿼트",
    "nameEn": "Barbell Back Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "erectors",
      "calves"
    ],
    "description": "하체와 전신 호르몬 분비를 촉진하는 최고의 웨이트 트레이닝의 왕입니다.",
    "instructions": [
      "승모근 상부에 바벨을 얹고 흉곽을 세웁니다.",
      "고관절과 무릎을 동시에 굽히며 허벅지가 바닥과 수평 이하가 될 때까지 깊게 앉습니다.",
      "발바닥 전체로 지면을 밀며 일어섭니다."
    ],
    "tips": [
      "무릎이 안쪽으로 모이지 않도록 발끝 방향으로 열어주세요."
    ],
    "isPopular": true
  },
  {
    "id": "barbell-front-squat",
    "name": "바벨 프론트 스쿼트",
    "nameEn": "Barbell Front Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes",
      "abs",
      "erectors"
    ],
    "description": "바벨을 쇄골 앞쪽에 얹고 상체를 수직으로 세워 대퇴사두근 앞쪽을 집중 폭격합니다.",
    "instructions": [
      "팔꿈치를 높게 들고 상체를 꼿꼿이 세운 채 깊게 앉았다 일어납니다."
    ],
    "tips": [
      "허리 부담이 백스쿼트보다 적습니다."
    ]
  },
  {
    "id": "sumo-deadlift",
    "name": "스모 데드리프트",
    "nameEn": "Sumo Barbell Deadlift",
    "category": "legs",
    "categories": [
      "legs",
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "erectors",
      "hamstrings",
      "traps"
    ],
    "description": "넓은 보폭으로 고관절 내전근과 둔근에 부하를 집중시키고 상체 각도를 더 세워 진행합니다.",
    "instructions": [
      "넓은 스탠스로 서서 무릎을 발끝 방향으로 열며 바를 잡고 지면을 찢듯이 밉니다."
    ],
    "tips": [
      "정강이가 바닥과 수직에 가깝게 유지되도록 스탠스를 조절하세요."
    ],
    "isPopular": true
  },
  {
    "id": "stiff-leg-deadlift",
    "name": "스티프 레그 데드리프트",
    "nameEn": "Stiff-Leg Deadlift",
    "category": "legs",
    "categories": [
      "legs",
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "secondaryMuscles": [
      "erectors"
    ],
    "description": "무릎 굴곡을 최소화하여 햄스트링 상부와 둔근 하단을 극한으로 이완합니다.",
    "instructions": [
      "무릎 각도를 살짝 굽힌 채 고정하고 상체를 수평 가까이 숙였다 올라옵니다."
    ],
    "tips": [
      "허리가 말리지 않는 유연성 범위까지만 내리세요."
    ]
  },
  {
    "id": "trap-bar-deadlift",
    "name": "트랩바 데드리프트",
    "nameEn": "Trap Bar (Hex Bar) Deadlift",
    "category": "legs",
    "categories": [
      "legs",
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "quads",
      "glutes",
      "erectors"
    ],
    "secondaryMuscles": [
      "traps",
      "lats"
    ],
    "description": "중립 손잡이로 척추 전단력을 최소화하며 안전하게 고중량을 들어올립니다.",
    "instructions": [
      "트랩바 중앙에 서서 양쪽 손잡이를 잡고 지면을 강하게 밀어냅니다."
    ],
    "tips": [
      "허리 부담이 있는 분들에게 최적입니다."
    ]
  },
  {
    "id": "leg-press-45",
    "name": "파워 레그프레스 (45도)",
    "nameEn": "45-Degree Leg Press",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "description": "척추 압박 없이 하체 전체에 수백 킬로그램의 고중량을 실을 수 있는 머신입니다.",
    "instructions": [
      "발판 중앙에 발을 두고 무릎이 가슴 옆으로 올 때까지 내렸다가 밉니다."
    ],
    "tips": [
      "무릎을 완전히 펴서 관절을 잠그지 마세요."
    ],
    "isPopular": true
  },
  {
    "id": "hammer-linear-hack-squat",
    "name": "리니어 핵스쿼트",
    "nameEn": "Linear Hack Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "description": "등받이에 상체를 고정하고 대퇴사두근 외측광근을 찢어버리는 전설의 핵스쿼트입니다.",
    "instructions": [
      "어깨 패드를 대고 발을 발판 아래쪽에 두어 대퇴사두의 깊은 이완을 유도하며 앉습니다."
    ],
    "tips": [
      "발뒤꿈치가 뜨지 않도록 주의하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-v-squat",
    "name": "V-스쿼트",
    "nameEn": "V-Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "description": "원호 궤적을 그리며 둔근과 대퇴사두를 모두 폭발적으로 키웁니다.",
    "instructions": [
      "정면을 보고 앉거나 뒤돌아서 리버스 V스쿼트로도 훈련합니다."
    ],
    "tips": [
      "리버스로 진행 시 둔근에 자극이 집중됩니다."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "panatta-pendulum-squat",
    "name": "파나타 펜듈럼 스쿼트",
    "nameEn": "Panatta Pendulum Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "description": "추 원리로 앉을수록 저항이 최적화되어 대퇴사두 빗살무늬를 조각하는 끝판왕 머신입니다.",
    "instructions": [
      "발판에 발을 디디고 깊이 앉아 무릎을 앞으로 밀어내며 대퇴직근을 폭격합니다."
    ],
    "tips": [
      "허리 부담이 0에 수렴합니다."
    ],
    "defaultBrand": "Panatta (파나타)"
  },
  {
    "id": "belt-squat-machine",
    "name": "벨트 스쿼트 머신",
    "nameEn": "Belt Squat Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [],
    "description": "골반에 벨트를 걸어 척추 로딩을 완벽히 제거한 채 하체 순수 관절만 고립시킵니다.",
    "instructions": [
      "벨트를 착용하고 풀스쿼트로 앉았다 일어납니다."
    ],
    "tips": [
      "허리 디스크가 있어도 안전하게 하체를 털 수 있습니다."
    ]
  },
  {
    "id": "leg-extension-pin",
    "name": "레그 익스텐션 핀머신",
    "nameEn": "Seated Leg Extension Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "leg-extension",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [],
    "description": "대퇴사두근만을 단독 분리하여 앞벅지의 선명한 갈래와 디테일을 만듭니다.",
    "instructions": [
      "발목 패드를 밀어 다리를 수평까지 들어 올립니다."
    ],
    "tips": [
      "정점에서 1~2초간 쥐어짜세요."
    ],
    "isPopular": true
  },
  {
    "id": "hammer-plate-leg-extension",
    "name": "레그 익스텐션",
    "nameEn": "Leg Extension",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "leg-extension",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [],
    "description": "원판의 묵직한 중량감을 대퇴사두 끝까지 전달합니다.",
    "instructions": [
      "등받이에 등을 붙이고 핸들을 당기며 발을 차올립니다."
    ],
    "tips": [
      "엉덩이가 뜨지 않도록 고정하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "seated-leg-curl",
    "name": "시티드 레그컬 핀머신",
    "nameEn": "Seated Leg Curl Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "leg-curl",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "description": "고관절이 굴곡된 상태에서 햄스트링을 수축시켜 근비대를 극대화합니다.",
    "instructions": [
      "허벅지 패드를 누르고 발목 패드를 엉덩이 아래로 강하게 접어 내립니다."
    ],
    "tips": [
      "신장성 수축 시 천천히 버티며 올리세요."
    ],
    "isPopular": true
  },
  {
    "id": "lying-leg-curl",
    "name": "라잉 레그컬 핀머신",
    "nameEn": "Lying Leg Curl Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "leg-curl",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "description": "엎드려 진행하여 햄스트링 단축성 수축의 정점을 찍어주는 전통의 명기입니다.",
    "instructions": [
      "패드에 엎드려 엉덩이 쪽으로 발을 접어 올립니다."
    ],
    "tips": [
      "골반이 들썩이지 않도록 복압을 잡으세요."
    ]
  },
  {
    "id": "barbell-hip-thrust",
    "name": "바벨 힙 쓰러스트",
    "nameEn": "Barbell Hip Thrust",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "quads"
    ],
    "description": "대둔근의 최대 단축 지점에 엄청난 저항을 걸어 최고의 엉덩이 볼륨을 만듭니다.",
    "instructions": [
      "벤치에 등을 대고 골반에 바벨을 얹은 뒤 천장으로 높게 들어 올립니다."
    ],
    "tips": [
      "골반을 후방 경사시키며 둔근으로 수축하세요."
    ],
    "isPopular": true
  },
  {
    "id": "hip-thrust-machine",
    "name": "힙 쓰러스트 머신 (부티 빌더)",
    "nameEn": "Hip Thrust Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "description": "바벨 세팅 없이 안전벨트만 착용하고 초고중량 힙 트레이닝을 수행합니다.",
    "instructions": [
      "벨트를 채우고 발바닥으로 지면을 밀어 골반을 들어 올립니다."
    ],
    "tips": [
      "정점에서 둔근을 강하게 쥐어짜세요."
    ]
  },
  {
    "id": "hip-abduction-out-thigh",
    "name": "아웃타이 (힙 어브덕션 핀머신)",
    "nameEn": "Seated Hip Abduction (Out-Thigh)",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [],
    "description": "중둔근과 소둔근을 정밀 타겟하여 골반 옆 라인과 힙업을 완성합니다.",
    "instructions": [
      "패드를 무릎 바깥에 대고 다리를 양옆으로 힘차게 벌립니다."
    ],
    "tips": [
      "상체를 살짝 앞으로 숙이면 둔근 상부에 더 강한 자극이 옵니다."
    ],
    "isPopular": true
  },
  {
    "id": "hip-adduction-in-thigh",
    "name": "인타이 (힙 어덕션 핀머신)",
    "nameEn": "Seated Hip Adduction (In-Thigh)",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "hip-hinge",
    "primaryMuscles": [
      "quads"
    ],
    "secondaryMuscles": [
      "glutes"
    ],
    "description": "허벅지 안쪽 내전근을 발달시켜 탄탄하고 균형 잡힌 하체 프레임을 만듭니다.",
    "instructions": [
      "패드를 무릎 안쪽에 대고 다리를 안쪽으로 강하게 모아줍니다."
    ],
    "tips": [
      "이완 시 가동 범위를 무리하게 넓히지 마세요."
    ]
  },
  {
    "id": "walking-lunge",
    "name": "덤벨 워킹 런지",
    "nameEn": "Dumbbell Walking Lunge",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "glutes",
      "quads"
    ],
    "secondaryMuscles": [
      "hamstrings",
      "calves"
    ],
    "description": "하체의 전후 밸런스와 편측 근력 및 둔근의 깊은 분리를 이끌어냅니다.",
    "instructions": [
      "덤벨을 들고 크게 내딛으며 뒷무릎이 바닥에 닿기 직전까지 앉습니다."
    ],
    "tips": [
      "앞발 뒤꿈치로 지면을 밀며 전진하세요."
    ]
  },
  {
    "id": "bulgarian-split-squat",
    "name": "불가리안 스플릿 스쿼트 (BSS)",
    "nameEn": "Bulgarian Split Squat",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "description": "한쪽 다리로만 체중을 지탱하여 둔근과 대퇴사두를 불태우는 지옥의 편측 운동입니다.",
    "instructions": [
      "뒷발을 벤치에 얹고 앞다리로 깊게 스쿼트하듯 앉았다가 일어납니다."
    ],
    "tips": [
      "상체를 살짝 숙이면 둔근에 집중됩니다."
    ]
  },
  {
    "id": "standing-calf-raise",
    "name": "스탠딩 카프레이즈 머신",
    "nameEn": "Standing Calf Raise Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "description": "종아리의 하트 모양 비복근을 두껍고 입체감 있게 단련합니다.",
    "instructions": [
      "발끝으로 블록을 디디고 뒤꿈치를 깊게 내렸다가 까치발로 높게 솟아오릅니다."
    ],
    "tips": [
      "정점에서 1초간 정지하세요."
    ]
  },
  {
    "id": "seated-calf-raise",
    "name": "시티드 카프레이즈 머신",
    "nameEn": "Seated Calf Raise (Plate-Loaded)",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "squat-pattern",
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "description": "무릎이 굽혀진 상태에서 종아리 깊은 층의 가자미근을 단독 타겟합니다.",
    "instructions": [
      "무릎 패드를 누르고 발목 가동 범위를 끝까지 활용하여 오르내립니다."
    ],
    "tips": [
      "발목 안정성에 필수적입니다."
    ]
  },
  {
    "id": "barbell-overhead-press",
    "name": "바벨 오버헤드 프레스 (밀리터리 프레스)",
    "nameEn": "Barbell Overhead Press (OHP)",
    "category": "shoulders",
    "categories": [
      "shoulders",
      "arms",
      "core"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "deltoid_front"
    ],
    "secondaryMuscles": [
      "deltoid_side",
      "triceps",
      "traps",
      "abs"
    ],
    "description": "서서 바벨을 머리 위로 밀어올려 전면 삼각근과 상체 전체의 스트렝스를 구축하는 3대급 운동입니다.",
    "instructions": [
      "쇄골 위에 바벨을 얹고 정수리 위로 수직으로 밀어 올립니다."
    ],
    "tips": [
      "허리가 뒤로 젖혀지지 않도록 엉덩이에 힘을 꽉 주세요."
    ],
    "isPopular": true
  },
  {
    "id": "dumbbell-shoulder-press",
    "name": "시티드 덤벨 숄더 프레스",
    "nameEn": "Seated Dumbbell Shoulder Press",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "deltoid_front"
    ],
    "secondaryMuscles": [
      "deltoid_side",
      "triceps"
    ],
    "description": "덤벨의 자유로운 회전으로 어깨 충돌 없이 전면과 측면 삼각근을 꽉 채웁니다.",
    "instructions": [
      "직각 벤치에 앉아 귀 옆에서 머리 위로 호를 그리며 밀어 올립니다."
    ],
    "tips": [
      "팔꿈치를 살짝 앞으로 두세요."
    ],
    "isPopular": true
  },
  {
    "id": "arnold-press",
    "name": "아놀드 프레스",
    "nameEn": "Arnold Dumbbell Press",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "deltoid_front",
      "deltoid_side"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "손목을 180도 회전시키며 밀어올려 전면부터 측면 삼각근까지 유기적으로 자극합니다.",
    "instructions": [
      "손바닥이 얼굴을 보게 쥐고 회전시키며 위로 밀어 올립니다."
    ],
    "tips": [
      "부드러운 회전 리듬을 유지하세요."
    ]
  },
  {
    "id": "hammer-iso-shoulder-press",
    "name": "숄더 프레스",
    "nameEn": "Shoulder Press",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "deltoid_front"
    ],
    "secondaryMuscles": [
      "deltoid_side",
      "triceps"
    ],
    "description": "수렴하는 프레스 궤적으로 어깨 관절 부담 없이 대포알 전면 삼각근을 만듭니다.",
    "instructions": [
      "손잡이를 잡고 머리 위로 힘차게 밀어 올립니다."
    ],
    "tips": [
      "승모근을 하강 고정하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)",
    "isPopular": true
  },
  {
    "id": "hammer-select-shoulder-press",
    "name": "실렉트 숄더 프레스",
    "nameEn": "Select Shoulder Press",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "deltoid_front"
    ],
    "secondaryMuscles": [
      "triceps"
    ],
    "description": "핀 셀렉터 방식으로 빠르고 안전하게 드롭세트와 텐션을 유지합니다.",
    "instructions": [
      "그립을 선택하여 부드럽게 위로 밀어냅니다."
    ],
    "tips": [
      "다양한 각도로 자극을 유도하세요."
    ],
    "defaultBrand": "Hammer Strength (해머 스트렝스)"
  },
  {
    "id": "dumbbell-lateral-raise",
    "name": "덤벨 사이드 래터럴 레이즈 (사레레)",
    "nameEn": "Dumbbell Side Lateral Raise",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "lateral-raise",
    "primaryMuscles": [
      "deltoid_side"
    ],
    "secondaryMuscles": [
      "traps"
    ],
    "description": "어깨 너비를 넓혀주는 대표적인 측면 삼각근 고립 운동입니다.",
    "instructions": [
      "양옆으로 물을 따르듯 어깨 높이까지 들어 올립니다."
    ],
    "tips": [
      "어깨 뽕으로만 들어 올린다는 느낌을 유지하세요."
    ],
    "isPopular": true
  },
  {
    "id": "cable-lateral-raise",
    "name": "케이블 사이드 래터럴 레이즈",
    "nameEn": "Cable Lateral Raise",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "lateral-raise",
    "primaryMuscles": [
      "deltoid_side"
    ],
    "secondaryMuscles": [],
    "description": "시작부터 끝까지 케이블의 연속적인 저항이 측면 삼각근을 고문합니다.",
    "instructions": [
      "도르래를 바닥에 두고 대각선 옆으로 들어 올립니다."
    ],
    "tips": [
      "몸통 뒤로 케이블을 통과시키면 더 깊은 수축이 가능합니다."
    ]
  },
  {
    "id": "machine-lateral-raise",
    "name": "머신 사이드 래터럴 레이즈 핀머신",
    "nameEn": "Machine Lateral Raise",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "lateral-raise",
    "primaryMuscles": [
      "deltoid_side"
    ],
    "secondaryMuscles": [],
    "description": "패드가 팔꿈치에 닿아 전완근 피로 없이 측면 삼각근만 100% 고립시킵니다.",
    "instructions": [
      "팔꿈치를 패드에 대고 날개를 펴듯 밀어 올립니다."
    ],
    "tips": [
      "손목 힘이 약한 분들에게 최적입니다."
    ],
    "isPopular": true
  },
  {
    "id": "reverse-pec-deck-fly",
    "name": "리버스 펙덱 플라이 (후면 삼각근)",
    "nameEn": "Reverse Pec Deck Fly (Rear Delt)",
    "category": "shoulders",
    "categories": [
      "shoulders",
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "rear-delt",
    "primaryMuscles": [
      "deltoid_rear"
    ],
    "secondaryMuscles": [
      "traps"
    ],
    "description": "어깨 뒤쪽의 입체감을 살리고 라운드숄더를 교정하는 최고의 후면 삼각근 운동입니다.",
    "instructions": [
      "가슴 패드에 상체를 대고 양옆 뒤쪽으로 넓게 벌려줍니다."
    ],
    "tips": [
      "어깨 뒤쪽 근육으로만 벌리세요."
    ],
    "isPopular": true
  },
  {
    "id": "face-pull",
    "name": "케이블 로프 페이스 풀",
    "nameEn": "Cable Rope Face Pull",
    "category": "shoulders",
    "categories": [
      "shoulders",
      "back"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "rear-delt",
    "primaryMuscles": [
      "deltoid_rear",
      "traps"
    ],
    "secondaryMuscles": [],
    "description": "회전근개와 후면 삼각근, 상부 승모근을 동시에 단련하는 어깨 건강 필수 운동입니다.",
    "instructions": [
      "눈높이 케이블에서 로프를 이마 쪽으로 당깁니다."
    ],
    "tips": [
      "당기면서 외회전을 함께 만들어주세요."
    ],
    "isPopular": true
  },
  {
    "id": "barbell-shrug",
    "name": "바벨 슈러그",
    "nameEn": "Barbell Shrug",
    "category": "shoulders",
    "categories": [
      "shoulders",
      "back"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "overhead-press",
    "primaryMuscles": [
      "traps"
    ],
    "secondaryMuscles": [
      "forearms"
    ],
    "description": "목 옆 상부 승모근의 우람한 볼륨을 만들어내는 운동입니다.",
    "instructions": [
      "어깨를 귀에 닿게 한다는 느낌으로 수직으로 끌어올립니다."
    ],
    "tips": [
      "수직으로만 오르내리세요."
    ]
  },
  {
    "id": "barbell-curl",
    "name": "바벨 바이셉스 컬",
    "nameEn": "Standing Barbell Bicep Curl",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [
      "forearms"
    ],
    "description": "상완이두근의 전체적인 두께와 고중량을 다룰 수 있는 팔 전면의 기본 운동입니다.",
    "instructions": [
      "팔꿈치를 옆구리에 고정한 채 가슴 쪽으로 감아 올립니다."
    ],
    "tips": [
      "치팅을 자제하세요."
    ],
    "isPopular": true
  },
  {
    "id": "ez-bar-preacher-curl",
    "name": "EZ-바 프리처 컬",
    "nameEn": "EZ-Bar Preacher Curl",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "description": "프리처 벤치에 팔을 고정하여 치팅을 차단하고 이두근 하부 피크를 세웁니다.",
    "instructions": [
      "겨드랑이를 패드에 밀착시키고 이두근의 장력으로 말아 올립니다."
    ],
    "tips": [
      "팔꿈치 과신전에 주의하세요."
    ]
  },
  {
    "id": "incline-dumbbell-curl",
    "name": "인클라인 덤벨 컬",
    "nameEn": "Incline Dumbbell Curl",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "biceps"
    ],
    "secondaryMuscles": [],
    "description": "인클라인 벤치에 누워 이두근 장두를 극한으로 스트레칭합니다.",
    "instructions": [
      "인클라인 벤치에 기대어 덤벨을 감아 올립니다."
    ],
    "tips": [
      "팔꿈치를 앞으로 당겨오지 마세요."
    ]
  },
  {
    "id": "dumbbell-hammer-curl",
    "name": "덤벨 해머 컬",
    "nameEn": "Dumbbell Hammer Curl",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "dumbbell",
    "loadType": "dumbbell",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "biceps",
      "forearms"
    ],
    "secondaryMuscles": [],
    "description": "망치를 쥐듯 중립 그립으로 상완근과 완요골근을 키워 팔의 두께를 완성합니다.",
    "instructions": [
      "손바닥이 마주보게 덤벨을 쥐고 어깨 쪽으로 들어 올립니다."
    ],
    "tips": [
      "팔의 두께감 형성에 최고의 운동입니다."
    ],
    "isPopular": true
  },
  {
    "id": "cable-pushdown-rope",
    "name": "케이블 트라이셉스 푸시다운 (로프)",
    "nameEn": "Cable Triceps Rope Pushdown",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "description": "로프를 아래로 찢으며 삼두근 외측두의 말발굽 라인을 조각합니다.",
    "instructions": [
      "팔꿈치를 옆구리에 박아두고 로프를 바닥으로 내린 뒤 양옆으로 벌려줍니다."
    ],
    "tips": [
      "팔꿈치를 흔들리지 않게 고정하세요."
    ],
    "isPopular": true
  },
  {
    "id": "cable-pushdown-straight",
    "name": "케이블 푸시다운 (스트레이트 바)",
    "nameEn": "Cable Straight Bar Pushdown",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "description": "안정적인 바 그립으로 삼두근 전체에 고중량을 밀어붙입니다.",
    "instructions": [
      "상체를 살짝 숙인 채 수직 아래로 팔을 완전히 폅니다."
    ],
    "tips": [
      "손목이 꺾이지 않게 주의하세요."
    ]
  },
  {
    "id": "skull-crusher",
    "name": "라잉 트라이셉스 익스텐션 (스컬 크러셔)",
    "nameEn": "EZ-Bar Skull Crusher (Lying Extension)",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "description": "벤치에 누워 이마 쪽으로 바벨을 내리며 삼두근 장두의 매스를 키웁니다.",
    "instructions": [
      "EZ바를 이마 뒤쪽으로 천천히 내렸다가 삼두 힘으로 폅니다."
    ],
    "tips": [
      "팔꿈치가 바깥으로 너무 벌어지지 않게 모아주세요."
    ],
    "isPopular": true
  },
  {
    "id": "close-grip-bench-press",
    "name": "클로즈그립 바벨 벤치프레스",
    "nameEn": "Close-Grip Barbell Bench Press",
    "category": "arms",
    "categories": [
      "arms",
      "chest"
    ],
    "equipment": "barbell",
    "loadType": "barbell",
    "movementPlane": "flat-press",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [
      "chest",
      "deltoid_front"
    ],
    "description": "좁은 그립으로 벤치프레스를 수행하여 삼두근에 초고중량을 꽂아넣습니다.",
    "instructions": [
      "어깨너비 정도로 바벨을 좁게 잡고 팔꿈치를 몸통에 붙이며 밉니다."
    ],
    "tips": [
      "너무 좁게(20cm 미만) 잡지 마세요."
    ]
  },
  {
    "id": "overhead-cable-extension",
    "name": "오버헤드 케이블 트라이셉스 익스텐션",
    "nameEn": "Overhead Cable Rope Triceps Extension",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "arm-isolation",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "description": "팔을 머리 위로 든 상태에서 삼두근 장두를 최대로 늘려 수축시킵니다.",
    "instructions": [
      "등 뒤에서 케이블 로프를 잡고 머리 앞쪽으로 팔을 뻗어줍니다."
    ],
    "tips": [
      "팔꿈치 위치를 고정하세요."
    ]
  },
  {
    "id": "hanging-leg-raise",
    "name": "행잉 레그레이즈",
    "nameEn": "Hanging Leg Raise",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "core",
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [
      "obliques",
      "forearms"
    ],
    "description": "철봉에 매달려 골반을 말아 올려 하복부를 완전히 단축시키는 최고의 복근 운동입니다.",
    "instructions": [
      "철봉에 매달려 골반을 말아올리며 다리를 90도 이상 듭니다."
    ],
    "tips": [
      "골반을 가슴 쪽으로 말아올리는 것이 핵심입니다."
    ],
    "isPopular": true
  },
  {
    "id": "cable-crunch",
    "name": "케이블 크런치 (닐링 로프 크런치)",
    "nameEn": "Kneeling Cable Rope Crunch",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "cable",
    "loadType": "cable",
    "movementPlane": "core",
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [],
    "description": "케이블의 지속적인 무게 저항으로 복직근에 왕자 팩의 두께감을 만듭니다.",
    "instructions": [
      "무릎을 꿇고 로프를 귀 옆에 둔 채 등을 둥글게 말아 팔꿈치를 무릎에 붙입니다."
    ],
    "tips": [
      "복근으로만 수축하세요."
    ],
    "isPopular": true
  },
  {
    "id": "machine-ab-crunch",
    "name": "머신 크런치 ",
    "nameEn": "Abdominal Crunch Machine",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "movementPlane": "core",
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [],
    "description": "원하는 무게를 핀으로 설정하여 복직근 상하부를 정밀하게 수축합니다.",
    "instructions": [
      "패드를 가슴에 대고 복근을 쥐어짜며 상체를 웅크립니다."
    ],
    "tips": [
      "배로 당기세요."
    ]
  },
  {
    "id": "plank",
    "name": "플랭크",
    "nameEn": "Standard Plank",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "core",
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [
      "glutes",
      "deltoid_front"
    ],
    "description": "코어의 심부 근육과 전신 안정성을 기르는 정적 버티기 운동입니다.",
    "instructions": [
      "머리부터 뒤꿈치까지 완벽한 일직선을 유지하며 버팁니다."
    ],
    "tips": [
      "엉덩이가 위로 솟지 않게 하세요."
    ]
  },
  {
    "id": "ab-roller",
    "name": "AB 롤아웃 (AB 슬라이드)",
    "nameEn": "Ab Wheel Roller",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "bodyweight",
    "loadType": "bodyweight",
    "movementPlane": "core",
    "primaryMuscles": [
      "abs"
    ],
    "secondaryMuscles": [
      "lats",
      "deltoid_front"
    ],
    "description": "롤러를 앞으로 밀어내며 복근의 원심성 수축 한계를 시험하는 고난도 코어 운동입니다.",
    "instructions": [
      "롤러를 앞으로 굴려 몸을 최대한 편 뒤 복근 힘으로 당겨옵니다."
    ],
    "tips": [
      "허리가 꺾이지 않도록 주의하세요."
    ]
  }
];

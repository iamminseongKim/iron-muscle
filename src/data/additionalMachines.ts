import { Exercise } from '../types/workout';

// Sources and selection notes: docs/exercise-sources.md
export const ADDITIONAL_MACHINES: Exercise[] = [
  {
    "id": "belt-squat-machine",
    "name": "벨트 스쿼트 머신",
    "nameEn": "Belt Squat",
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
    "aliases": [
      "벨트스쿼트",
      "벨스쿼트"
    ],
    "description": "골반 벨트에 저항을 연결해 수행하는 스쿼트입니다.",
    "instructions": [
      "벨트를 골반에 고정하고 발판 위에서 손잡이를 잡습니다.",
      "안전장치를 해제하고 무릎과 고관절을 굽혔다가 발판을 밀며 일어납니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "pendulum-squat-machine",
    "name": "펜듈럼 스쿼트 머신",
    "nameEn": "Pendulum Squat",
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
    "aliases": [
      "펜듈럼",
      "펜더럼",
      "펜둘럼"
    ],
    "description": "회전축을 중심으로 움직이는 레버를 이용하는 스쿼트입니다.",
    "instructions": [
      "어깨 패드와 등받이를 몸에 맞추고 발판에 발을 고정합니다.",
      "안전장치를 풀고 편안한 범위까지 앉았다가 천천히 올라옵니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "glute-drive-machine",
    "name": "힙 쓰러스트 머신 (글루트 드라이브)",
    "nameEn": "Glute Drive",
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
    "aliases": [
      "힙쓰러스트머신",
      "힙스러스트머신",
      "글루트드라이브",
      "부티빌더"
    ],
    "description": "등을 지지하고 골반에 저항을 걸어 엉덩이를 들어 올리는 운동입니다.",
    "instructions": [
      "등을 패드에 대고 골반 벨트를 고정한 뒤 양발을 발판에 놓습니다.",
      "발로 발판을 누르며 골반을 올리고 허리를 과하게 젖히지 않은 채 돌아옵니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "pullover-machine",
    "name": "머신 풀오버",
    "nameEn": "Machine Pullover",
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
      "chest"
    ],
    "aliases": [
      "풀오버머신",
      "풀오바",
      "해머풀오버"
    ],
    "description": "레버의 원호를 따라 팔을 내리며 광배근을 사용하는 운동입니다.",
    "instructions": [
      "좌석 높이를 조절하고 기구의 팔 패드 또는 손잡이에 팔을 댑니다.",
      "몸통을 고정한 채 팔을 몸 앞으로 내렸다가 천천히 되돌립니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "iso-lateral-low-row-machine",
    "name": "아이소 레터럴 로우 로우 머신",
    "nameEn": "Iso-Lateral Low Row",
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
      "traps",
      "biceps",
      "deltoid_rear"
    ],
    "aliases": [
      "로우로우",
      "로우로우머신",
      "해머로우로우",
      "로우로"
    ],
    "description": "가슴 지지대와 독립 레버를 사용하는 낮은 궤적의 로우 운동입니다.",
    "instructions": [
      "가슴을 패드에 지지하고 양쪽 손잡이를 잡습니다.",
      "몸통을 젖히지 않고 팔꿈치를 뒤로 당겼다가 천천히 팔을 뻗습니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "dy-row-machine",
    "name": "D.Y. 로우 머신",
    "nameEn": "Iso-Lateral D.Y. Row",
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
    "aliases": [
      "디와이로우",
      "디와이",
      "해머dy로우",
      "언더그립로우머신"
    ],
    "description": "언더그립 손잡이와 독립 레버를 사용하는 로우 운동입니다.",
    "instructions": [
      "좌석과 가슴 패드를 조절하고 손바닥이 위를 향하도록 손잡이를 잡습니다.",
      "팔꿈치를 몸통 가까이 당긴 뒤 가슴 지지를 유지하며 돌아옵니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "kneeling-leg-curl-machine",
    "name": "닐링 레그 컬 머신",
    "nameEn": "Kneeling Leg Curl",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "leg-curl",
    "primaryMuscles": [
      "hamstrings"
    ],
    "secondaryMuscles": [
      "calves"
    ],
    "aliases": [
      "니링레그컬",
      "닐링레그컬",
      "원레그레그컬머신"
    ],
    "description": "한쪽 무릎을 지지하고 반대쪽 다리를 굽히는 레그 컬입니다.",
    "instructions": [
      "지지하는 무릎을 패드에 올리고 운동하는 다리의 발목 위에 롤러를 맞춥니다.",
      "골반을 고정한 채 무릎을 굽혀 롤러를 올렸다가 천천히 내립니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "seated-lateral-raise-machine",
    "name": "시티드 레터럴 레이즈 머신",
    "nameEn": "Seated Lateral Raise Machine",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "movementPlane": "lateral-raise",
    "primaryMuscles": [
      "deltoid_side"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "aliases": [
      "머신사레레",
      "시티드사레레",
      "레터럴레이즈머신"
    ],
    "description": "좌석에 앉아 양팔을 옆으로 들어 올리는 어깨 운동입니다.",
    "instructions": [
      "좌석 높이를 조절해 팔을 패드에 대고 손잡이를 잡습니다.",
      "몸통을 고정하고 팔을 옆으로 올렸다가 반동 없이 내립니다.",
      "운동을 마치면 기구의 안전장치를 확인하고 저항을 내려놓습니다."
    ],
    "tips": [
      "기구에 부착된 사용법에 따라 좌석과 시작 위치를 조절하세요.",
      "통증 없는 범위에서 움직이고, 기구가 다르면 브랜드와 설정을 따로 기록하세요."
    ],
    "isPopular": true,
    "images": []
  },
  {
    "id": "standing-abductor-machine",
    "name": "스탠딩 힙 어브덕션 머신",
    "nameEn": "Standing Abductor",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [],
    "aliases": [
      "스탠딩어브덕터",
      "스탠딩아웃타이",
      "파나타스탠딩어브덕션",
      "Panatta",
      "파나타"
    ],
    "description": "서서 양다리를 바깥쪽으로 벌리는 운동입니다.",
    "instructions": [
      "손잡이를 잡고 발판과 다리 패드에 몸을 맞춥니다.",
      "몸통을 고정하고 다리를 벌렸다가 천천히 모읍니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "horizontal-leg-press-machine",
    "name": "수평 레그 프레스 머신",
    "nameEn": "Horizontal Leg Press",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "aliases": [
      "수평레그프레스",
      "시티드레그프레스",
      "파나타레그프레스",
      "Panatta",
      "파나타"
    ],
    "description": "앉은 자세에서 수평 방향으로 발판을 미는 운동입니다.",
    "instructions": [
      "좌석을 조절해 등을 지지하고 발판에 양발을 놓습니다.",
      "허리가 등받이에서 뜨지 않는 범위에서 무릎을 굽혔다가 발판을 밉니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "circular-lat-pulldown-machine",
    "name": "서큘러 랫 풀다운 머신",
    "nameEn": "Super Lat Pulldown Circular",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "aliases": [
      "서큘러랫풀다운",
      "써큘러랫풀다운",
      "파나타랫풀다운",
      "Panatta",
      "파나타"
    ],
    "description": "원호 궤적을 따라 양팔을 당기는 독립 레버 풀다운입니다.",
    "instructions": [
      "좌석과 허벅지 패드를 맞추고 위쪽 손잡이를 잡습니다.",
      "몸통을 과하게 젖히지 않고 팔꿈치를 아래로 당겼다가 되돌립니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "prime-extreme-row-machine",
    "name": "익스트림 로우 머신",
    "nameEn": "Extreme Row",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "traps",
      "biceps",
      "deltoid_rear"
    ],
    "aliases": [
      "익스트림로우",
      "프라임로우",
      "프라임익스트림로우",
      "Prime",
      "프라임"
    ],
    "description": "좌석과 가슴 패드 위치를 조절하는 가슴 지지 로우입니다.",
    "instructions": [
      "가슴 패드와 좌석 높이를 맞추고 손잡이를 잡습니다.",
      "가슴 지지를 유지하며 팔꿈치를 뒤로 당겼다가 천천히 뻗습니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "multi-hip-extension-machine",
    "name": "멀티 힙 익스텐션 머신",
    "nameEn": "Multi-Hip Extension",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "aliases": [
      "멀티힙",
      "멀티힙익스텐션",
      "머신힙익스텐션",
      "Prime",
      "프라임"
    ],
    "description": "멀티 힙 머신의 롤러를 다리 뒤로 밀며 고관절을 펴는 운동입니다.",
    "instructions": [
      "기구의 회전축과 고관절 높이를 맞추고 허벅지 뒤에 롤러를 댑니다.",
      "골반을 고정하고 다리를 뒤로 밀었다가 천천히 돌아옵니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "standing-chest-press-machine",
    "name": "스탠딩 체스트 프레스 머신",
    "nameEn": "Standing Chest Press",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "chest"
    ],
    "secondaryMuscles": [
      "triceps",
      "deltoid_front"
    ],
    "aliases": [
      "스탠딩체스트프레스",
      "스탠딩가슴프레스",
      "Gymleco",
      "짐레코"
    ],
    "description": "서서 가슴 높이의 손잡이를 앞으로 미는 프레스입니다.",
    "instructions": [
      "기구의 지지대에 몸을 맞추고 손잡이를 가슴 높이에서 잡습니다.",
      "몸통을 안정적으로 유지하며 앞으로 밀었다가 천천히 돌아옵니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "incline-pec-fly-machine",
    "name": "인클라인 펙 플라이 머신",
    "nameEn": "Incline Pec Fly",
    "category": "chest",
    "categories": [
      "chest"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "chest_upper",
      "chest"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "aliases": [
      "인클라인플라이머신",
      "인클라인펙덱",
      "Gymleco",
      "짐레코"
    ],
    "description": "경사진 지지대에서 양팔을 모으는 플라이입니다.",
    "instructions": [
      "등을 지지대에 대고 손잡이와 좌석 위치를 맞춥니다.",
      "팔꿈치를 약간 굽힌 채 팔을 모았다가 편안한 범위까지 벌립니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "upright-row-machine",
    "name": "업라이트 로우 머신",
    "nameEn": "Upright Row Machine",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "deltoid_side",
      "traps"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "aliases": [
      "머신업라이트로우",
      "업라이트로우머신",
      "Gymleco",
      "짐레코"
    ],
    "description": "독립 레버 손잡이를 위로 당기는 어깨 운동입니다.",
    "instructions": [
      "발을 안정적으로 두고 양손으로 손잡이를 잡습니다.",
      "어깨가 편안한 높이까지 팔꿈치를 들어 손잡이를 당겼다가 내립니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "donkey-calf-raise-machine",
    "name": "동키 카프 레이즈 머신",
    "nameEn": "Donkey Calf Raise Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "calves"
    ],
    "secondaryMuscles": [],
    "aliases": [
      "동키카프머신",
      "덩키카프머신",
      "동키레이즈",
      "Gymleco",
      "짐레코"
    ],
    "description": "상체를 지지하고 골반 패드의 저항을 받으며 뒤꿈치를 올립니다.",
    "instructions": [
      "발 앞부분을 발판에 대고 상체와 골반을 기구 패드에 맞춥니다.",
      "발목을 움직여 뒤꿈치를 올렸다가 천천히 내립니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "selectorized-lateral-raise-machine",
    "name": "시티드 레터럴 레이즈 (핀머신)",
    "nameEn": "Selectorized Seated Lateral Raise",
    "category": "shoulders",
    "categories": [
      "shoulders"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "deltoid_side"
    ],
    "secondaryMuscles": [
      "deltoid_front"
    ],
    "aliases": [
      "핀머신사레레",
      "프라임사레레",
      "시티드사이드레터럴레이즈",
      "Prime",
      "프라임"
    ],
    "description": "핀으로 저항을 선택하고 앉아서 팔을 옆으로 드는 운동입니다.",
    "instructions": [
      "좌석을 조절해 기구의 회전축에 어깨 높이를 맞춥니다.",
      "가슴 지지를 유지하며 팔을 옆으로 올렸다가 천천히 내립니다."
    ],
    "tips": [
      "기구의 사용 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 통증 없는 범위에서 수행하세요."
    ],
    "images": []
  },
  {
    "id": "vertical-leg-press-machine",
    "name": "수직 레그 프레스 머신",
    "nameEn": "Vertical Leg Press",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "aliases": [
      "버티컬레그프레스",
      "수직레그프레스"
    ],
    "description": "누운 자세에서 위쪽 발판을 밀어 올리는 레그 프레스입니다.",
    "instructions": [
      "등과 골반을 패드에 대고 발판에 양발을 놓은 뒤 안전 스토퍼를 맞춥니다.",
      "안전장치를 해제하고 편안한 범위에서 무릎을 굽혔다가 발판을 밀어 올립니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  },
  {
    "id": "torso-rotation-machine",
    "name": "토르소 로테이션 머신",
    "nameEn": "Torso Rotation",
    "category": "core",
    "categories": [
      "core"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "obliques"
    ],
    "secondaryMuscles": [
      "abs"
    ],
    "aliases": [
      "토소로테이션",
      "몸통회전",
      "로터리토르소"
    ],
    "description": "골반을 지지하고 몸통을 회전하는 코어 머신 운동입니다.",
    "instructions": [
      "좌석과 패드를 몸에 맞추고 회전 시작 위치를 설정합니다.",
      "골반을 지지한 채 몸통을 천천히 돌렸다가 돌아오고 반대 방향도 수행합니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  },
  {
    "id": "glute-kickback-machine",
    "name": "글루트 킥백 머신",
    "nameEn": "Glute Kickback Machine",
    "category": "legs",
    "categories": [
      "legs"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "glutes"
    ],
    "secondaryMuscles": [
      "hamstrings"
    ],
    "aliases": [
      "힙킥백머신",
      "글루트머신",
      "엉덩이킥백"
    ],
    "description": "몸통을 패드에 지지하고 한쪽 발로 저항을 뒤로 미는 운동입니다.",
    "instructions": [
      "몸통을 패드에 지지하고 운동하는 발을 발판에 올립니다.",
      "골반을 고정하고 발판을 뒤로 밀었다가 천천히 돌아옵니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  },
  {
    "id": "seated-back-extension-machine",
    "name": "시티드 백 익스텐션 머신",
    "nameEn": "Seated Back Extension Machine",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "pin-loaded",
    "primaryMuscles": [
      "erectors"
    ],
    "secondaryMuscles": [],
    "aliases": [
      "허리머신",
      "백익스텐션머신",
      "시티드백익스텐션"
    ],
    "description": "앉아서 등 패드에 저항을 주며 몸통을 펴는 운동입니다.",
    "instructions": [
      "좌석과 등 패드를 맞추고 발을 지지대에 고정합니다.",
      "골반을 안정적으로 유지하며 몸통을 폈다가 천천히 시작 위치로 돌아옵니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  },
  {
    "id": "iso-lateral-pulldown-machine",
    "name": "독립 레버 랫 풀다운 머신",
    "nameEn": "Iso Lateral Pulldown",
    "category": "back",
    "categories": [
      "back"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "lats"
    ],
    "secondaryMuscles": [
      "biceps"
    ],
    "aliases": [
      "아이소레터럴풀다운",
      "독립암풀다운",
      "레버풀다운"
    ],
    "description": "좌우 독립 레버를 위에서 아래로 당기는 풀다운입니다.",
    "instructions": [
      "좌석과 허벅지 패드를 맞추고 양쪽 손잡이를 잡습니다.",
      "몸통을 고정하고 팔꿈치를 아래로 당겼다가 천천히 돌아옵니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  },
  {
    "id": "iso-lateral-triceps-machine",
    "name": "독립 레버 트라이셉스 머신",
    "nameEn": "Iso Lateral Triceps",
    "category": "arms",
    "categories": [
      "arms"
    ],
    "equipment": "machine",
    "loadType": "plate-loaded",
    "primaryMuscles": [
      "triceps"
    ],
    "secondaryMuscles": [],
    "aliases": [
      "아이소레터럴트라이셉스",
      "독립암삼두머신"
    ],
    "description": "좌우 독립 레버의 저항을 팔꿈치를 펴며 밀어내는 삼두 운동입니다.",
    "instructions": [
      "좌석을 조절하고 팔을 지지대에 맞춰 양쪽 손잡이를 잡습니다.",
      "상완을 고정하고 팔꿈치를 폈다가 천천히 굽힙니다."
    ],
    "tips": [
      "기구 안내에 따라 시작 위치와 저항을 조절하세요.",
      "반동 없이 편안한 범위에서 움직이고 기구 설정을 기록하세요."
    ],
    "images": []
  }
];

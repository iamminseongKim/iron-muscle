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
  },
{
  "id": "independent-arm-curl",
  "name": "독립암 암컬 머신",
  "nameEn": "Independent Arm Curl",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "좌우 레버를 각각 움직이며 팔꿈치를 굽히는 이두 운동입니다.",
  "instructions": [
    "상완을 패드에 대고 좌석을 조절합니다.",
    "상완을 고정하고 양쪽 손잡이를 각각 당긴 뒤 천천히 폅니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 바이셉 컬 교대 컬"
  ],
  "images": []
},
{
  "id": "spider-arm-curl",
  "name": "스파이더 암컬 머신",
  "nameEn": "Spider Arm Curl",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "가슴을 지지하고 팔을 아래로 내려 수행하는 암컬입니다.",
  "instructions": [
    "가슴 패드와 좌석을 조절하고 손잡이를 잡습니다.",
    "어깨를 움직이지 않고 팔꿈치를 굽혔다가 천천히 폅니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 엎드린 컬 체스트 서포티드 컬"
  ],
  "images": []
},
{
  "id": "high-arm-curl-120",
  "name": "하이 암컬 머신 (120도)",
  "nameEn": "High Arm Curl 120",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "상완을 높게 지지하는 구조의 암컬입니다.",
  "instructions": [
    "상완을 높은 패드에 올리고 회전축에 팔꿈치를 맞춥니다.",
    "상완을 패드에 둔 채 손잡이를 당기고 천천히 되돌립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 하이컬 바이셉 컬"
  ],
  "images": []
},
{
  "id": "incline-arm-curl-machine",
  "name": "인클라인 암컬 머신",
  "nameEn": "Incline Arm Curl Machine",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "팔이 몸통 뒤쪽에 위치하는 구조의 암컬입니다.",
  "instructions": [
    "등받이에 몸을 지지하고 뒤쪽 손잡이를 잡습니다.",
    "어깨 위치를 유지하면서 팔꿈치를 굽혔다가 천천히 폅니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 마이너스45 컬 스트레치 컬"
  ],
  "images": []
},
{
  "id": "supinating-curl-machine",
  "name": "회외 암컬 머신",
  "nameEn": "Supinating Biceps Curl",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "팔을 굽히면서 손바닥 방향도 회전시키는 암컬입니다.",
  "instructions": [
    "좌석과 등받이를 조절하고 회전 손잡이를 잡습니다.",
    "팔꿈치를 굽히며 손바닥을 위로 돌린 뒤 천천히 되돌립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 수피네이팅 바이셉 컬"
  ],
  "images": []
},
{
  "id": "multi-angle-biceps-machine",
  "name": "다각도 암컬 머신",
  "nameEn": "Multi Angle Biceps Curl",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "biceps"
  ],
  "secondaryMuscles": [],
  "description": "상완 지지 각도를 바꾸어 사용하는 암컬 머신입니다.",
  "instructions": [
    "무게를 내린 상태에서 지지대 각도와 좌석을 고정합니다.",
    "팔꿈치를 축에 맞춘 뒤 상완을 고정하고 컬을 수행합니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "이두 멀티 앵글 바이셉 컬"
  ],
  "images": []
},
{
  "id": "french-press-machine",
  "name": "프렌치 프레스 머신",
  "nameEn": "French Press Machine",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "triceps"
  ],
  "secondaryMuscles": [],
  "description": "상완을 위로 둔 상태에서 팔꿈치를 펴는 삼두 운동입니다.",
  "instructions": [
    "등을 지지하고 머리 위 손잡이를 잡습니다.",
    "상완을 고정한 채 팔꿈치를 폈다가 천천히 굽힙니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "삼두 오버헤드 익스텐션"
  ],
  "images": []
},
{
  "id": "arm-extension-90-machine",
  "name": "암 익스텐션 머신 (90도)",
  "nameEn": "Arm Extension 90",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "triceps"
  ],
  "secondaryMuscles": [],
  "description": "상완을 앞으로 지지하고 팔꿈치를 펴는 삼두 머신입니다.",
  "instructions": [
    "좌석을 조절하고 상완을 지지대에 올립니다.",
    "어깨가 들리지 않게 손잡이를 밀어 팔꿈치를 펴고 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "삼두 90도 익스텐션"
  ],
  "images": []
},
{
  "id": "multi-angle-triceps-machine",
  "name": "다각도 삼두 익스텐션 머신",
  "nameEn": "Multi Angle Triceps",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "triceps"
  ],
  "secondaryMuscles": [],
  "description": "상완 지지 각도를 조절할 수 있는 삼두 머신입니다.",
  "instructions": [
    "저항을 내린 상태에서 지지대 각도를 고정합니다.",
    "상완을 지지하고 팔꿈치를 폈다가 천천히 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "삼두 멀티 앵글 트라이셉"
  ],
  "images": []
},
{
  "id": "pronating-triceps-machine",
  "name": "회내 삼두 익스텐션 머신",
  "nameEn": "Pronating Triceps",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "triceps"
  ],
  "secondaryMuscles": [],
  "description": "팔꿈치 신전과 손잡이 회전을 함께 수행하는 머신입니다.",
  "instructions": [
    "상완을 패드에 고정하고 회전 손잡이를 잡습니다.",
    "팔꿈치를 펴며 손잡이 회전 경로를 따라 움직인 뒤 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "삼두 프로네이팅 트라이셉"
  ],
  "images": []
},
{
  "id": "wrist-curl-machine",
  "name": "전완 리스트 컬 머신",
  "nameEn": "Forearm Wrist Curl",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "forearms"
  ],
  "secondaryMuscles": [],
  "description": "전완을 지지하고 손목을 굽히는 머신 운동입니다.",
  "instructions": [
    "전완을 지지대에 놓고 손잡이를 잡습니다.",
    "팔을 고정한 채 손목을 굽혔다가 천천히 되돌립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "전완 손목 컬"
  ],
  "images": []
},
{
  "id": "forearm-rotation-machine",
  "name": "전완 회전 머신",
  "nameEn": "Forearm Rotation",
  "category": "arms",
  "categories": [
    "arms"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "arm-isolation",
  "primaryMuscles": [
    "forearms"
  ],
  "secondaryMuscles": [],
  "description": "손잡이에 저항을 걸고 전완을 회전시키는 운동입니다.",
  "instructions": [
    "기구 안내에 맞춰 손잡이와 팔의 위치를 조절합니다.",
    "몸통 반동 없이 손잡이를 회전시키고 천천히 되돌립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "전완 손목 회전"
  ],
  "images": []
},
{
  "id": "circular-row-machine",
  "name": "서큘러 로우 머신",
  "nameEn": "Circular Row",
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
  "secondaryMuscles": [],
  "description": "원호 경로의 레버를 당기는 로우 머신입니다.",
  "instructions": [
    "가슴 지지대와 좌석을 조절하고 손잡이를 잡습니다.",
    "가슴을 지지한 채 팔꿈치를 뒤로 당기고 천천히 뻗습니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "등 원형 로우"
  ],
  "images": []
},
{
  "id": "front-dorsy-bar-machine",
  "name": "스탠딩 티바 로우 머신",
  "nameEn": "Standing T Bar Row",
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
  "secondaryMuscles": [],
  "description": "서서 몸을 숙인 자세로 레버 바를 당기는 로우입니다.",
  "instructions": [
    "발판 위에서 안정적으로 서고 손잡이를 잡습니다.",
    "몸통 각도를 유지하며 손잡이를 몸 쪽으로 당겼다가 내립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "등 프론트 도르시 바"
  ],
  "images": []
},
{
  "id": "shoulder-front-press-machine",
  "name": "숄더 프런트 프레스 머신",
  "nameEn": "Shoulder Front Press",
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
  "secondaryMuscles": [],
  "description": "몸 앞쪽의 손잡이를 위로 미는 어깨 머신입니다.",
  "instructions": [
    "등받이에 기대고 좌석 높이를 손잡이에 맞춥니다.",
    "몸통을 고정하고 손잡이를 위로 밀었다가 천천히 내립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "어깨 전면 프론트 프레스"
  ],
  "images": []
},
{
  "id": "lower-chest-fly-machine",
  "name": "하부 체스트 플라이 머신",
  "nameEn": "Lower Chest Fly",
  "category": "chest",
  "categories": [
    "chest"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "fly",
  "primaryMuscles": [
    "chest"
  ],
  "secondaryMuscles": [],
  "description": "손잡이를 아래쪽으로 모으는 경로의 가슴 플라이입니다.",
  "instructions": [
    "등을 패드에 대고 좌석 높이를 조절합니다.",
    "팔꿈치 각도를 유지하며 손잡이를 아래로 모으고 되돌립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "가슴 하부 펙 플라이"
  ],
  "images": []
},
{
  "id": "supine-bench-press-machine",
  "name": "라잉 벤치 프레스 머신",
  "nameEn": "Horizontal Bench Press Machine",
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
  "secondaryMuscles": [],
  "description": "벤치에 누워 독립 레버를 밀어 올리는 머신입니다.",
  "instructions": [
    "벤치에 눕고 손잡이 시작 위치와 안전장치를 조절합니다.",
    "등을 지지한 채 손잡이를 위로 밀고 천천히 내립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "가슴 누워서 수평 벤치프레스"
  ],
  "images": []
},
{
  "id": "squat-lunge-machine",
  "name": "스쿼트 런지 머신",
  "nameEn": "Squat Lunge Machine",
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
  "description": "몸 옆의 레버 손잡이를 들고 런지를 수행하는 머신입니다.",
  "instructions": [
    "안정적으로 엇갈려 서고 몸 옆 손잡이를 잡습니다.",
    "무릎과 고관절을 굽혔다가 앞발로 밀어 올라옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "하체 런지 레버"
  ],
  "images": []
},
{
  "id": "independent-45-leg-press-machine",
  "name": "독립 발판 45도 레그 프레스 머신",
  "nameEn": "Independent 45 Degree Leg Press",
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
  "description": "좌우 발판을 각각 움직일 수 있는 경사 레그 프레스입니다.",
  "instructions": [
    "등받이를 조절하고 양쪽 발판에 발을 놓습니다.",
    "안전장치를 풀고 각 발판을 통제하며 밀었다가 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "하체 원레그 독립 레그프레스"
  ],
  "images": []
},
{
  "id": "calf-hack-machine",
  "name": "카프 핵 머신",
  "nameEn": "Calf Hack Machine",
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
  "description": "경사진 슬라이드에 몸을 지지하는 카프 레이즈입니다.",
  "instructions": [
    "몸을 패드에 지지하고 앞꿈치를 발판에 놓습니다.",
    "무릎 각도를 유지하며 뒤꿈치를 올렸다가 천천히 내립니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "하체 종아리 핵 카프"
  ],
  "images": []
},
{
  "id": "leg-press-bridge-machine",
  "name": "레버 브리지 레그 프레스 머신",
  "nameEn": "Leg Press Bridge",
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
  "description": "회전 레버 구조를 사용하는 레그 프레스 머신입니다.",
  "instructions": [
    "등받이와 좌석을 조절하고 발판에 양발을 놓습니다.",
    "허리를 패드에 지지한 채 발판을 밀고 천천히 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "하체 레그프레스 브릿지"
  ],
  "images": []
},
{
  "id": "three-dimensional-hip-abduction-machine",
  "name": "입체 궤적 힙 어브덕션 머신",
  "nameEn": "3D Hip Abduction",
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
  "secondaryMuscles": [],
  "description": "다리를 벌리면서 뒤쪽으로도 움직이는 궤적의 힙 머신입니다.",
  "instructions": [
    "좌석과 등받이 위치를 조절하고 다리를 패드 안쪽에 놓습니다.",
    "골반을 고정하고 패드 궤적을 따라 다리를 벌린 뒤 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "힙 엉덩이 3D 어브덕터 외전"
  ],
  "images": []
},
{
  "id": "multihip-abduction-machine",
  "name": "멀티 힙 외전 머신",
  "nameEn": "Multi Hip Abduction",
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
  "description": "서서 한쪽 다리의 바깥 면으로 롤러를 밀어내는 운동입니다.",
  "instructions": [
    "회전축과 골반 높이를 맞추고 허벅지 바깥쪽에 롤러를 댑니다.",
    "손잡이를 잡고 몸통을 고정한 채 다리를 옆으로 벌렸다가 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "힙 엉덩이 멀티힙 어브덕션"
  ],
  "images": []
},
{
  "id": "kneeling-torso-rotation-machine",
  "name": "니링 토르소 회전 머신",
  "nameEn": "Kneeling Torso Rotation",
  "category": "core",
  "categories": [
    "core"
  ],
  "equipment": "machine",
  "loadType": "pin-loaded",
  "movementPlane": "core",
  "primaryMuscles": [
    "obliques"
  ],
  "secondaryMuscles": [],
  "description": "무릎을 지지하고 하체를 회전시키는 코어 머신입니다.",
  "instructions": [
    "무릎과 허벅지를 지지대에 놓고 상체 손잡이를 잡습니다.",
    "상체를 안정시킨 상태에서 하체 지지대를 천천히 회전시키고 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "코어 복사근 무릎 몸통 회전"
  ],
  "images": []
},
{
  "id": "total-core-crunch-machine",
  "name": "토탈 코어 크런치 머신",
  "nameEn": "Total Core Crunch",
  "category": "core",
  "categories": [
    "core"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "core",
  "primaryMuscles": [
    "abs"
  ],
  "secondaryMuscles": [],
  "description": "상체와 골반 쪽 레버를 함께 움직여 몸통을 접는 머신입니다.",
  "instructions": [
    "등과 다리를 지지하고 손잡이를 잡습니다.",
    "몸통을 접으며 상하체 지지대를 가까이 모았다가 천천히 폅니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "코어 복근 더블 크런치"
  ],
  "images": []
},
{
  "id": "reverse-crunch-machine",
  "name": "리버스 크런치 머신",
  "nameEn": "Reverse Crunch Machine",
  "category": "core",
  "categories": [
    "core"
  ],
  "equipment": "machine",
  "loadType": "plate-loaded",
  "movementPlane": "core",
  "primaryMuscles": [
    "abs"
  ],
  "secondaryMuscles": [],
  "description": "코어 머신의 하체 레버로 골반을 말아 올리는 운동입니다.",
  "instructions": [
    "상체를 지지하고 다리를 하체 지지대에 놓습니다.",
    "반동 없이 골반을 말아 올린 뒤 천천히 시작 위치로 돌아옵니다.",
    "세트를 마치면 저항을 내려놓고 안전장치를 확인합니다."
  ],
  "tips": [
    "기구에 표시된 사용법에 따라 시작 위치를 조절하세요.",
    "기구와 설정이 다르면 기록에서 구분하세요."
  ],
  "aliases": [
    "코어 복근 역 크런치"
  ],
  "images": []
}
];

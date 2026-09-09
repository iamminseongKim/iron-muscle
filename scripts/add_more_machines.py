import json
import sys
import os

sys.path.append(os.path.abspath('scripts'))
from build_db import exercises

extra_machines = [
# 4 more Hammer Strength Back machines (Total 18 Hammer Strength Back machines!)
  {
    id: hammer-iso-lateral-row,
    name: 해머스트렝스 플레이트 아이소래터럴 로우,
    nameEn: Hammer Strength Iso-Lateral Row,
    category: back,
    categories: [back],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: horizontal-row,
    primaryMuscles: [lats, traps],
    secondaryMuscles: [biceps],
    description: 한 손씩 독립적으로 당겨 광배근 외측과 등 중앙을 고립하는 클래식 로우입니다.,
    instructions: [가슴 패드에 상체를 대고 팔꿈치를 수평 뒤로 강하게 당깁니다.],
    tips: [원암 로우로 진행 시 가동 범위가 더 깊어집니다.],
    defaultBrand: Hammer Strength (해머 스트렝스)
  },
  {
    id: hammer-plate-tbar-row,
    name: 해머스트렝스 플레이트 체스트 서포티드 T-바 로우,
    nameEn: Hammer Strength Plate-Loaded T-Bar Row,
    category: back,
    categories: [back],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: horizontal-row,
    primaryMuscles: [traps, lats],
    secondaryMuscles: [biceps, deltoid_rear],
    description: 가슴 지지 패드가 있어 허리 부하 없이 승모근과 능형근을 완전히 접어버리는 명기입니다.,
    instructions: [와이드 또는 뉴트럴 그립을 잡고 가슴을 편 채 팔꿈치를 모아 올립니다.],
    tips: [수축 끝에서 1초간 등을 쥐어짜세요.],
    defaultBrand: Hammer Strength (해머 스트렝스),
    isPopular: True
  },
  {
    id: hammer-mts-front-pulldown,
    name: 해머스트렝스 MTS 듀얼 핀 프론트 풀다운,
    nameEn: Hammer Strength MTS Front Pulldown,
    category: back,
    categories: [back],
    equipment: machine,
    loadType: pin-loaded,
    movementPlane: vertical-pull,
    primaryMuscles: [lats],
    secondaryMuscles: [biceps],
    description: 듀얼 독립 핀 스택으로 매끄럽게 호를 그리며 쇄골 쪽으로 당겨지는 고급 핀머신입니다.,
    instructions: [시트를 조절하고 양손을 쇄골 쪽으로 부드럽게 당겨 내립니다.],
    tips: [MTS 케이블의 즉각적인 반응성을 활용하세요.],
    defaultBrand: Hammer Strength (해머 스트렝스)
  },
  {
    id: hammer-ground-base-jammer,
    name: 해머스트렝스 그라운드 베이스 로우 (재머),
    nameEn: Hammer Strength Ground Base Jammer Row,
    category: back,
    categories: [back, legs, core],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: horizontal-row,
    primaryMuscles: [lats, traps],
    secondaryMuscles: [erectors, glutes, quads],
    description: 서서 지면을 지지하며 당겨 전신 기능성과 등 전체 파워를 동시에 폭발시키는 그라운드 베이스 머신입니다.,
    instructions: [기마 자세로 서서 코어를 잡고 손잡이를 몸쪽으로 폭발적으로 당깁니다.],
    tips: [선수 트레이닝과 파워 빌딩에 최고의 머신입니다.],
    defaultBrand: Hammer Strength (해머 스트렝스)
  },

  // 싸이벡스 & 뉴텍 & 아스널 & 파나타 추가 머신들
  {
    id: cybex-plate-overhead-pulldown,
    name: 싸이벡스 플레이트 오버헤드 풀다운,
    nameEn: Cybex Plate-Loaded Overhead Pulldown,
    category: back,
    categories: [back],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: vertical-pull,
    primaryMuscles: [lats],
    secondaryMuscles: [biceps],
    description: 싸이벡스 특유의 가변 저항 곡선으로 이완 시 어깨 부담이 전혀 없는 풀다운입니다.,
    instructions: [핸들을 쥐고 팔꿈치를 수직 아래로 눌러줍니다.],
    tips: [정점에서 묵직하게 버텨주세요.],
    defaultBrand: Cybex (싸이벡스)
  },
  {
    id: cybex-squat-press,
    name: 싸이벡스 스쿼트 프레스 (스쿼트 머신),
    nameEn: Cybex Squat Press Machine,
    category: legs,
    categories: [legs],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: squat-pattern,
    primaryMuscles: [quads, glutes],
    secondaryMuscles: [hamstrings],
    description: 등받이가 누워있지 않고 스쿼트 모션을 그대로 재현하면서 허리를 보호하는 프리미엄 머신입니다.,
    instructions: [발판에 서서 스쿼트하듯 깊게 앉았다가 일어섭니다.],
    tips: [발끝과 무릎 방향을 일치시키세요.],
    defaultBrand: Cybex (싸이벡스)
  },
  {
    id: arsenal-reloaded-pendulum,
    name: 아스널 스트렝스 리로디드 펜듈럼 스쿼트,
    nameEn: Arsenal Strength ReLoaded Pendulum Squat,
    category: legs,
    categories: [legs],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: squat-pattern,
    primaryMuscles: [quads],
    secondaryMuscles: [glutes],
    description: 미국 하드코어 보디빌더들의 성지 아스널 스트렝스의 대퇴사두 분리 펜듈럼 머신입니다.,
    instructions: [발판을 깊게 밟고 무릎을 앞으로 밀어내며 대퇴직근을 한계까지 찢습니다.],
    tips: [최하단에서 튕기지 말고 정지 후 밀어 올리세요.],
    defaultBrand: Arsenal Strength (아스널 스트렝스),
    isPopular: True
  },
  {
    id: arsenal-standing-lateral,
    name: 아스널 스트렝스 플레이트 스탠딩 래터럴 레이즈,
    nameEn: Arsenal Strength Plate Lateral Raise,
    category: shoulders,
    categories: [shoulders],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: lateral-raise,
    primaryMuscles: [deltoid_side],
    secondaryMuscles: [],
    description: 서서 진행하여 전신의 자연스러운 중심 이동과 함께 측면 삼각근에 괴물 같은 과부하를 줍니다.,
    instructions: [패드에 팔꿈치를 대고 양옆으로 밀어 올립니다.],
    tips: [원판을 꽂아 무게를 미세하게 올리기 좋습니다.],
    defaultBrand: Arsenal Strength (아스널 스트렝스)
  },
  {
    id: panatta-converging-incline,
    name: 파나타 컨버징 인클라인 체스트 프레스,
    nameEn: Panatta Converging Incline Chest Press,
    category: chest,
    categories: [chest],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: incline-press,
    primaryMuscles: [chest_upper],
    secondaryMuscles: [deltoid_front, triceps],
    description: 인체 가슴 섬유 결대로 안쪽으로 모아주는 수렴 궤적으로 윗가슴 안쪽 골을 파냅니다.,
    instructions: [밀어내면서 손잡이가 가운데로 모이도록 수축합니다.],
    tips: [팔꿈치가 어깨선 위로 올라가지 않게 하세요.],
    defaultBrand: Panatta (파나타)
  },
  {
    id: panatta-standing-leg-curl,
    name: 파나타 스탠딩 레그컬 머신,
    nameEn: Panatta Standing One-Leg Curl,
    category: legs,
    categories: [legs],
    equipment: machine,
    loadType: pin-loaded,
    movementPlane: leg-curl,
    primaryMuscles: [hamstrings],
    secondaryMuscles: [],
    description: 서서 한 다리씩 햄스트링을 고립시켜 좌우 밸런스를 완벽하게 맞춥니다.,
    instructions: [한쪽 다리를 롤러에 대고 엉덩이 쪽으로 접어 올립니다.],
    tips: [골반을 고정하고 허리를 꺾지 마세요.],
    defaultBrand: Panatta (파나타)
  },
  {
    id: newtech-hack-squat,
    name: 뉴텍 45도 핵스쿼트 머신,
    nameEn: NewTech M-Torture Hack Squat,
    category: legs,
    categories: [legs],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: squat-pattern,
    primaryMuscles: [quads],
    secondaryMuscles: [glutes],
    description: 한국 헬스장의 표준 뉴텍의 부드러운 베어링으로 대퇴사두를 불태우는 명기입니다.,
    instructions: [등을 대고 발판 아래쪽에 발을 둔 뒤 깊게 앉았다가 일어납니다.],
    tips: [발바닥 앞꿈치와 뒤꿈치 접지를 모두 유지하세요.],
    defaultBrand: NewTech (뉴텍),
    isPopular: True
  },
  {
    id: newtech-incline-chest-press,
    name: 뉴텍 토크 인클라인 체스트 프레스,
    nameEn: NewTech Torque Incline Chest Press,
    category: chest,
    categories: [chest],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: incline-press,
    primaryMuscles: [chest_upper],
    secondaryMuscles: [deltoid_front, triceps],
    description: 국내 피트니스 센터에서 가장 사랑받는 윗가슴 타겟 플레이트로디드 프레스입니다.,
    instructions: [시트를 맞추고 사선 위로 가슴을 모아 밀어냅니다.],
    tips: [손목을 곧게 펴고 밀어주세요.],
    defaultBrand: NewTech (뉴텍)
  },
  {
    id: newtech-seated-dip,
    name: 뉴텍 토크 시티드 딥스 머신,
    nameEn: NewTech Torque Seated Dip,
    category: arms,
    categories: [arms, chest],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: decline-press,
    primaryMuscles: [triceps],
    secondaryMuscles: [chest],
    description: 앉아서 아래로 핸들을 눌러 삼두근 전체와 가슴 하부를 안전하게 고중량으로 털어냅니다.,
    instructions: [패드에 몸을 고정하고 손잡이를 아래로 강하게 밀어 내립니다.],
    tips: [어깨가 위로 솟지 않도록 승모근을 누르세요.],
    defaultBrand: NewTech (뉴텍)
  },
  {
    id: technogym-pure-strength-chest,
    name: 테크노짐 퓨어스트렝스 체스트 프레스,
    nameEn: Technogym Pure Strength Chest Press,
    category: chest,
    categories: [chest],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: flat-press,
    primaryMuscles: [chest],
    secondaryMuscles: [deltoid_front, triceps],
    description: 올림픽 공식 공급사 테크노짐의 인체역학 퓨어스트렝스 플레이트 프레스입니다.,
    instructions: [밀어내는 궤적을 따라 부드럽게 가슴을 수축합니다.],
    tips: [부드러운 저항 곡선을 즐겨보세요.],
    defaultBrand: Technogym (테크노짐)
  },
  {
    id: technogym-pure-strength-pulldown,
    name: 테크노짐 퓨어스트렝스 풀다운,
    nameEn: Technogym Pure Strength Pulldown,
    category: back,
    categories: [back],
    equipment: machine,
    loadType: plate-loaded,
    movementPlane: vertical-pull,
    primaryMuscles: [lats],
    secondaryMuscles: [biceps],
    description: 원호 궤적으로 광배근 외측을 안전하고 정밀하게 스트레칭하는 유럽 명품 머신입니다.,
    instructions: [양손으로 핸들을 쥐고 아래로 부드럽게 당깁니다.],
    tips: [상체 각도를 고정하고 광배근에 집중하세요.],
    defaultBrand: Technogym (테크노짐)
  }
]

exercises.extend(extra_machines)

header = import { Exercise } from '../types/workout';\n\nexport const EXERCISES_DATABASE: Exercise[] = 
content = header + json.dumps(exercises, indent=2, ensure_ascii=False) + ;\n

with open('src/data/exercises.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(fTotal exercises now: {len(exercises)} with multi-category and complete machine taxonomy!)

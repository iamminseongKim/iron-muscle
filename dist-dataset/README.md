# free-exercise-db (한국어 번역 에디션)

이 데이터셋은 [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)의 876가지 운동 데이터를 기반으로, 웨이트 트레이닝 및 피트니스 표준 한국어 명칭과 타겟 근육(주동근/협응근), 운동 가이드라인을 매핑하여 제작한 오픈소스 한국어 운동 데이터베이스입니다.

## 파일 구성
- `free-exercise-db-ko.json`: 876종 운동의 한국어명, 영문 원본명, 장비, 난이도, 주동근/협응근, 카테고리, jsDelivr 고해상도 시연 사진 URL(2프레임), 단계별 수행 지침(instructions) 포함.

## 데이터 스키마 예시
```json
{
  "id": "barbell-bench-press",
  "name": "바벨 벤치프레스",
  "nameEn": "Barbell Bench Press",
  "category": "chest",
  "equipment": "barbell",
  "level": "intermediate",
  "primaryMuscles": ["chest"],
  "secondaryMuscles": ["triceps", "deltoid_front"],
  "images": [
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press/0.jpg",
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Bench_Press/1.jpg"
  ],
  "instructions": [
    "벤치에 누워 바를 어깨너비보다 약간 넓게 잡습니다.",
    "가슴을 펴고 바를 천천히 가슴 중앙으로 내립니다.",
    "가슴 근육의 수축을 느끼며 바를 밀어 올립니다."
  ]
}
```

## GitHub 레포지토리 배포 안내
본 폴더(`dist-dataset/`)를 새로운 GitHub 레포지토리(예: `iamminseongKim/free-exercise-db-ko`)로 포크/푸시하여 누구나 사용할 수 있는 오픈소스 프로젝트로 단독 배포할 수 있습니다.

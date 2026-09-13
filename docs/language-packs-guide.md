# 언어 팩 (Language Packs) 개발 가이드

Iron Muscle Tracker는 v3.20.0부터 독립 모듈형 언어 팩 구조를 채택하여, UI 텍스트·해부학 근육명·운동 종목 명칭을 8개 공식 지원 언어로 유지 관리합니다.

## 지원 언어 목록

- 한국어 (`ko`) - 기본 언어
- English (`en`)
- 日本語 (`ja`)
- 简体中文 (`zh-CN`)
- 繁體中文 (`zh-TW`)
- Español (`es`)
- Français (`fr`)
- Deutsch (`de`)

---

## 디렉터리 구조

모든 언어 팩은 `src/i18n/locales/` 아래에 언어 코드별로 격리되어 있습니다:

```
src/i18n/locales/
├── ko/
│   ├── ui.json        # UI 버튼, 메뉴, 라벨, 모달 등 텍스트
│   ├── muscles.json   # 17개 해부학 타겟 근육 명칭
│   └── exercises.json # 운동 종목 ID 및 이름 번역
├── en/
├── ja/
├── zh-CN/
├── zh-TW/
├── es/
├── fr/
├── de/
└── index.ts           # 8개 언어 팩 통합 export (LocalePack)
```

---

## 신규 기능 및 변경 시 반영 지침

### 1. 신규 UI 문구 추가 시
1. 컴포넌트에서 `t('새로운 문구 키')` 형태로 호출합니다.
2. `src/i18n/locales/ko/ui.json`에 원문 키와 한국어 값을 등록합니다.
3. 나머지 언어(`en`, `ja`, `zh-CN`, `zh-TW`, `es`, `fr`, `de`)의 `ui.json`에 번역문을 추가합니다.
4. 아직 번역되지 않은 경우 영문 번역 또는 기본 키로 안전하게 폴백됩니다.

### 2. 신규 운동 종목 추가 시
1. 운동 객체 정의(`src/data/exercises.ts` 또는 `additionalExercises.ts`) 시 `id`, `name`, `nameEn`, `description`, `descriptionEn`, `instructions`, `instructionsEn`을 작성합니다.
2. 각 언어별 `src/i18n/locales/<lang>/exercises.json`에 `id` 및 `name`을 키로 등록하여 해당 언어 번역명을 매핑합니다:
   ```json
   "smith-shoulder-press": "スミスマシン・ショルダープレス",
   "스미스 머신 숄더 프레스": "スミスマシン・ショルダープレス"
   ```
3. 특정 언어의 번역이 누락된 경우, `displayExercise`가 자동으로 `exercise.nameEn` 또는 `exercise.name`으로 안전 폴백 처리하여 빈칸이나 오류가 발생하지 않습니다.
4. 다국어 검색: `matchesExerciseSearch`가 `getAllExerciseTranslations`를 참조하므로, `exercises.json`에 등록된 외국어로 검색해도 해당 종목이 자동 매칭됩니다.

### 3. 해부학 근육 추가/변경 시
- `src/i18n/locales/<lang>/muscles.json`에 근육 타겟 키(`MuscleTarget`) 및 한국어 약칭을 등록합니다.

---

## 검증 테스트

언어 팩 수정 후 아래 명령어로 8개 언어 무결성 및 빌드를 검증합니다:

```bash
npm test && npm run build
```
- `scripts/test-i18n.mjs`가 언어 팩의 모든 키 존재 여부와 다국어 렌더링, 폴백 및 검색 색인을 전수 검사합니다.

# [기획 및 설계서] Iron Muscle × 삼성 헬스 & 애플 건강 앱 연동

> **문서 상태**: 기획 완료 (Draft / Proposed for Future Release)  
> **대상 플랫폼**: iOS (Apple HealthKit), Android (Health Connect / Samsung Health)  
> **철학**: 로컬 퍼스트(Local-First), 제로 외부 서버(Zero External Server), 온디바이스 프라이버시  

---

## 1. 개요 및 목적 (Overview & Value Proposition)

### 1.1 배경
웨이트 트레이닝 유저는 운동 수행 시 스마트워치(Apple Watch, Galaxy Watch) 및 스마트 체중계(인바디, 위딩스 등)를 적극적으로 활용합니다.
현재 Iron Muscle은 운동 기록 및 점진적 과부하 추적에 특화되어 있으나, 사용자의 체중이나 심박수, 칼로리 소모 내역이 OS 공식 건강 앱(애플 건강, 삼성 헬스)과 단절되어 있습니다.

### 1.2 핵심 목표
1. **운동 성과 자동 동기화 (Outbound)**: 세션 완료 즉시 애플 피트니스 링(움직이기·운동하기) 및 삼성 헬스 일일 활동 목표를 채워 유저 성취감 고취.
2. **생체 데이터 기반 트레이닝 지능화 (Inbound)**:
   - 스마트 체중계의 최신 체중을 자동 반영하여 **맨몸 운동 및 어시스트 운동(체중 - 보조무게)의 유효 하중과 1RM을 정밀 계산**.
   - 스마트워치 실시간 심박수를 활용한 **심박 회복 기반 맞춤 휴식 타이머** 제공.
   - 전날 수면 품질 및 HRV(심박 변이도)를 감지하여 **자동 디로딩 또는 볼륨 조절 가이드** 제시.
3. **로컬 프라이버시 유지**: 외부 클라우드 전송 없이 사용자 스마트폰 내부에서만 건강 데이터 통신.

---

## 2. 시스템 아키텍처 (System Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Iron Muscle App (React + TS)                 │
├─────────────────────────────────────────────────────────────────┤
│               src/services/health/healthService.ts              │
│       (플랫폼 감지, 권한 요청, 정규화된 HealthAdapter 인터페이스)      │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
      [iOS Platform]                    [Android Platform]
               ▼                                  ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│       Apple HealthKit        │   │    Google Health Connect     │
│ (@capacitor/apple-healthkit) │   │ (Health Connect Android SDK) │
├──────────────────────────────┤   ├──────────────────────────────┤
│      애플 건강 (iOS Health)   │   │    삼성 헬스 (Samsung Health) │
│      애플 워치 (Apple Watch) │   │    갤럭시 워치 (Galaxy Watch) │
└──────────────────────────────┘   └──────────────────────────────┘
```

- **iOS 연동**: Apple HealthKit Framework.
- **Android 연동**: **Health Connect (헬스 커넥트)**.
  - 최신 Android 14+부터 시스템 프레임워크로 내장되었으며, 삼성 헬스(Samsung Health)와 구글 핏(Google Fit)이 Health Connect를 단일 허브로 공유합니다.
  - Iron Muscle이 Health Connect 표준 API에 쓰고 읽으면, 삼성 헬스와 자동으로 양방향 동기화됩니다.

---

## 3. 단계별 상세 기능 명세 (Feature Roadmap)

### Phase 1: MVP (운동 세션 내보내기 & 체중 동기화) — *우선 권장*

#### 1. 운동 세션 완료 후 건강 앱 자동 기록 (Outbound)
- **트리거**: `WorkoutLogger`에서 "운동 완료" 버튼 누르고 세션이 저장될 때.
- **기록 데이터 필드**:
  - `WorkoutType`: `HKWorkoutActivityType.traditionalStrengthTraining` (근력 운동)
  - `StartTime` / `EndTime`: 세션 시작 및 종료 ISO 타임스탬프
  - `TotalEnergyBurned`: 운동 시간, 총 볼륨, RPE 기반 추정 활동 칼로리 (kcal)
  - `Metadata`:
    - `total_volume_kg`: 총 볼륨 (kg)
    - `total_sets`: 완료 세트 수
    - `total_reps`: 총 반복 횟수
    - `exercise_count`: 수행한 종목 수
- **유저 효과**: 애플 피트니스 링(초록색 운동 링, 빨간색 칼로리 링)과 삼성 헬스 운동 목표가 즉시 채워짐.

#### 2. 사용자 체중(Body Mass) 자동 동기화 (Inbound)
- **트리거**: 앱 실행 시 또는 운동 시작 시 건강 앱의 가장 최근 체중 샘플 1건 조회.
- **활용처**:
  - **맨몸 운동(풀업, 딥스, 푸시업)**: 기본 하중 = 사용자 실제 체중.
  - **머신/밴드 어시스티드 운동**:
    $$\text{실제 유효 부하} = \text{동기화된 체중} - \text{보조 중량}$$
    (예: 체중 75kg, 머신 어시스트 풀업 -30kg 수행 시 -> 실제 유효 부하 45kg 자동 반영)
  - **체중 대비 1RM 비율(Strength-to-Weight Ratio)**:
    $$\text{스쿼트 1RM 비율} = \frac{\text{스쿼트 1RM}}{\text{체중}}$$
    (예: "체중 대비 2.0배 스쿼트 달성! 🏆" 배지 수여)

---

### Phase 2: 실시간 트레이닝 지능화 (스마트워치 심박수 연동)

#### 1. 심박수 회복 기반 스마트 휴식 타이머
- **기존 방식**: 60초, 90초 등 단순 시간 카운트다운.
- **스마트 방식**:
  - 고중량 세트(RPE 8.5 이상) 완료 후 심박수가 급상승했을 때, 워치 실시간 심박수를 모니터링.
  - 심박수가 유저의 안정 기준선(예: 110~120bpm 이하)으로 떨어지면:
    👉 *"심박수가 안정 영역으로 회복되었습니다. 다음 세트를 시작할 준비가 되었습니다!"* 알림 발생.
- **세트별 심박 데이터 일지 기록**: 세트별 최고 심박수(Peak HR) 및 평균 심박수를 세트 옵션 카드에 함께 기록.

#### 2. 세트 간 휴식(Rest Interval) 세그먼트 기록
- HealthKit `HKWorkoutEvent` (Pause / Resume)을 통해 세트 수행 중(Active)과 세트 간 휴식(Rest)을 구간별로 쪼개어 워크아웃 분석 차트에 기록.

---

### Phase 3: 회복도 분석 & 체성분 대시보드

#### 1. 수면 품질 & HRV 기반 '컨디션 회복도 점수'
- 아침 첫 운동 시작 전, 전날 밤 수면 시간 및 야간 HRV(심박 변이도)를 조회.
- 수면 부족 및 HRV 급감 감지 시:
  - *"신경계 피로가 누적된 상태입니다. 오늘은 고중량 탑세트 대신 **디로딩 세션**으로 전환하거나 중량을 10% 낮추는 것을 추천합니다."* 스마트 코칭 팝업.

#### 2. 체성분(골격근량, 체지방률) 오버레이 차트
- 인바디 등 스마트 체중계에서 측정한 골격근량(Skeletal Muscle Mass)과 체지방률 추이를 Iron Muscle 성장 탭에 오버레이하여 표시.
- "골격근량 1kg 증가 시 벤치프레스 1RM 4.5kg 상승" 같은 상관관계 통계 분석 제공.

---

## 4. UI / UX 인터페이스 설계

### 4.1 설정 화면 (`SettingsModal` or `BackupPanel`)
```
┌────────────────────────────────────────────────────────┐
│ 🏥 건강 앱 연동 (Health Integration)                  │
├────────────────────────────────────────────────────────┤
│ [스위치 ON] Apple 건강 / 삼성 헬스 연동 활성화          │
│                                                        │
│ 세부 권한 설정:                                        │
│  ☑️ 운동 기록 저장 (세션 완료 시 자동 전송)             │
│  ☑️ 체중 동기화 (맨몸/어시스트 부하 계산에 반영)        │
│  ⬜ 스마트워치 심박수 읽기 (스마트 휴식 타이머)          │
│  ⬜ 수면 및 회복 지표 읽기 (디로딩 추천)               │
│                                                        │
│ 최근 동기화: 오늘 15:40 (체중 74.5kg 동기화됨)          │
└────────────────────────────────────────────────────────┘
```

### 4.2 세션 완료 모달
- 운동 완료 팝업 하단에 연동 상태 배지 표시:
  `[✓ Apple 건강에 1시간 15분, 420kcal 기록됨]`

---

## 5. 보안 및 OS 권한 요구사항 (Privacy & Permissions)

### 5.1 iOS (Apple HealthKit)
- `Info.plist` 필수 키 추가:
  - `NSHealthShareUsageDescription`: "체중 및 심박수 데이터를 읽어 운동 부하와 회복 상태를 정밀하게 분석합니다."
  - `NSHealthUpdateUsageDescription`: "완료한 근력 운동 세션과 활동 칼로리를 애플 건강 앱에 기록합니다."
- App Store 심사 지침 5.1.3(Health and Health Research) 준수:
  - 건강 데이터를 광고 및 제3자 마케팅에 절대 사용하지 않음.
  - 온디바이스 로컬 저장 원칙.

### 5.2 Android (Google Health Connect)
- `AndroidManifest.xml` 권한 선언:
  - `android.permission.health.READ_WEIGHT`
  - `android.permission.health.WRITE_EXERCISE`
  - `android.permission.health.READ_HEART_RATE`
- Health Connect 백엔드 연결 인텐트 (`androidx.health.connect.client`).
- 앱 내 명확한 개인정보 처리방침(Privacy Policy) 링크 제공.

---

## 6. 개발 단계 및 소요 리소스 추정

| 단계 | 개발 내용 | 예상 난이도 | 주요 산출물 |
|---|---|---|---|
| **Step 1 (초기 기반)** | `src/services/health/` 서비스 모듈 추상화 & UI 설정 스위치 제작 | 보통 | `HealthService` 인터페이스 |
| **Step 2 (iOS 연동)** | Capacitor HealthKit 플러그인 연결 & 세션 쓰기 / 체중 읽기 | 보통 | iOS 네이티브 연동 |
| **Step 3 (Android 연동)**| Health Connect API 클라이언트 연동 (삼성 헬스 호환) | 보통 | Android 네이티브 연동 |
| **Step 4 (부가 기능)** | 심박수 기반 타이머 & HRV 회복 점수 코칭 | 다소 높음 | 실시간 스마트 타이머 |

---

## 7. 결론

삼성 헬스와 애플 건강 연동은 **1) 피트니스 링을 채우는 일상적 만족감**과 **2) 스마트 체중계 체중을 맨몸/어시스트 풀업 계산에 실시간 반영하는 전문성**을 동시에 제공하는 최고의 기능입니다.
향후 해당 기능 개발 시 본 기획서의 **Phase 1 (MVP)**부터 단계적으로 착수하는 것을 추천합니다.

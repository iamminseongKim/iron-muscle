# 🏋️‍♂️ 아이언 머슬 트래커 (IRON MUSCLE TRACKER)
### 100% 로컬 독립형 Apple 스타일 피트니스 & 운동 기록 어플리케이션
**[ iPhone · iPad · Android 로컬 전용 완벽 지원 ]**

[![Mobile Build](https://github.com/iamminseongKim/iron-muscle/actions/workflows/build-mobile.yml/badge.svg)](https://github.com/iamminseongKim/iron-muscle/actions/workflows/build-mobile.yml)
[![Release](https://img.shields.io/github/v/release/iamminseongKim/iron-muscle?color=FF2D55&logo=github)](https://github.com/iamminseongKim/iron-muscle/releases)
![iOS](https://img.shields.io/badge/iOS-iPhone%20%26%20iPad-000000?style=flat&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-APK%20Direct-3DDC84?style=flat&logo=android&logoColor=white)
![Offline](https://img.shields.io/badge/Storage-100%25%20Local%20Offline-green?style=flat)

> **🔒 100% 로컬 프라이버시 보장**:  
> 외부 서버나 클라우드 DB를 일절 사용하지 않으며, 모든 운동 데이터와 설정은 오직 사용자의 기기 내부(로컬)에만 저장됩니다.

---

## 📱 기기별 로컬 설치 및 사용 가이드

### 🍎 1. 아이폰 & 아이패드 (iPhone / iPad)

#### 💻 [방법 1] Mac Xcode 실기기 직접 빌드 (가장 추천)
개인 무료 Apple ID만 있으면 본인의 iPhone 또는 iPad에 영구적으로 네이티브 앱을 설치할 수 있습니다.

```bash
# 1. 저장소 복제 및 의존성 설치
git clone https://github.com/iamminseongKim/iron-muscle.git
cd iron-muscle
npm install
npm run build

# 2. iOS Xcode 프로젝트 열기
npx cap open ios
```
1. Xcode의 `App` 타겟 ➔ `Signing & Capabilities` 탭에서 본인의 **개인 무료 Apple ID (Personal Team)**를 선택합니다.
2. Mac에 케이블 또는 동일 Wi-Fi로 연결된 본인의 iPhone이나 iPad를 빌드 타겟으로 지정합니다.
3. 상단의 **▶ 실행 (Run, `Cmd + R`)** 버튼을 누르면 기기에 바로 설치됩니다.
4. 아이폰/아이패드의 [설정] ➔ [일반] ➔ [VPN 및 기기 관리]에서 본인의 개발자 계정을 '신뢰'로 승인하면 끝납니다.

#### 📥 [방법 2] iOS `.ipa` 로컬 사이드로딩 (AltStore / Sideloadly)
맥북이 없거나 PC(Windows) 환경에서 설치하고자 할 때 사용합니다.

1. [GitHub Releases](https://github.com/iamminseongKim/iron-muscle/releases) 페이지에서 최신 **`IronMuscle-iOS.ipa`** 파일을 다운로드합니다.
2. PC에 설치된 **AltStore** 또는 **Sideloadly** 프로그램을 실행합니다.
3. 다운로드한 `.ipa` 파일을 선택하고 본인의 Apple ID로 기기에 직접 사이드로딩 설치합니다.

#### 🌐 [방법 3] 가정 내 로컬 Wi-Fi 접속 (무설치 로컬 모드)
컴퓨터에서 로컬 개발 서버를 켜두고 동일한 공유기(Wi-Fi)에 연결된 아이폰/아이패드로 접속하는 방법입니다.

```bash
npm run dev -- --host
```
터미널에 출력되는 로컬 IP 주소(예: `http://192.168.0.15:3000`)를 아이폰/아이패드 브라우저에 입력하여 즉시 사용합니다.

---

### 🤖 2. 안드로이드 (Android) 스마트폰 및 태블릿

1. 스마트폰 브라우저에서 [GitHub Releases](https://github.com/iamminseongKim/iron-muscle/releases) 페이지로 접속합니다.
2. 최신 릴리즈의 Assets에서 **`IronMuscle-vX.X.X.apk`** 링크를 터치하여 다운로드합니다.
3. 다운로드가 완료된 `.apk` 파일을 터치하여 **'출처를 알 수 없는 앱 설치 허용'** 후 설치를 완료합니다.

> 💡 **v3.7.2+ 무중단 덮어쓰기 업데이트**:  
> v3.7.2부터 일관된 영구 릴리즈 서명키가 적용되어, 향후 새 버전이 나오더라도 **앱을 삭제할 필요 없이 다운로드한 APK를 바로 설치하여 기존 운동 기록을 100% 보존한 채 덮어쓰기 업데이트**가 가능합니다.

---

## 🌟 핵심 기능 및 특장점

### 1. 🧹 클린 부팅 & [운동 시작] 라이프사이클
- **초기 더미 데이터 완전 제거**: 신규 사용자는 0개의 깨끗한 상태에서 시작합니다 (원할 경우 1클릭 샘플 데이터 제공).
- **오늘 운동할 부위 다중 선택**:
  - `[가슴]`, `[등]`, `[하체]`, `[어깨]`, `[이두]`, `[삼두]`, `[복근]`, `[전신]` 8대 타겟 부위를 자유롭게 다중 선택.
  - 부위 선택에 따라 루틴 이름 자동 추천 (예: 가슴 + 삼두 선택 ➔ `"가슴 & 삼두 루틴"`).
- **시작 버튼을 눌러야 타이머 가동**: 시작 전에는 타이머가 돌지 않으며, `[🔥 새 운동 시작하기]`를 누르면 정식 세션이 생성됩니다.
- **`[운동 취소]` 및 `[운동 완료]` 분리**: 작성 중 취소하거나 완료 후 기록 저장 시 안전하게 초기 대기 화면으로 복귀합니다.

### 2. 🚀 스마트 종목 라이브러리 (80+ 순수 생체역학 명칭)
- **첫 종목 추가 시 선택 부위 최우선 추천**:
  - 운동을 시작하면 종목 추가 모달이 열리며, 방금 선택한 부위가 담긴 **`[🔥 오늘 목표]`** 탭이 기본 활성화되어 오늘 할 종목을 1초 만에 담을 수 있습니다.
- **순수 생체역학 명칭 표준화**:
  - 특정 머신 제조사 브랜드명이나 불필요한 수식어를 걷어내고 순수 운동 명칭으로 체계화.
- **다중 타겟팅 매핑**:
  - 데드리프트는 `등`과 `하체` 모두에서 필터링되는 등 다중 관절/부위 매핑 지원.

### 3. 🦾 편측성 (원암/투암) & ⚙️ 부하 방식 (플레이트/핀머신) 원터치 토글
- **원터치 물리 속성 전환**:
  - `[투암 (양측)]` ⇋ `[원암 (편측 L/R)]`
  - `[플레이트 (원판)]` ⇋ `[핀머신]`
- **원암 선택 시 좌(L) / 우(R) 독립 기록**:
  - 좌우 근력 불균형 및 편측 운동(원암 덤벨 로우, 원암 케이블 푸시다운 등)을 세트별로 구분하여 기록.

### 4. ⏱️ 애플 감성 듀얼 스마트 타이머
- **상시 상단 총 운동 시간 타이머**: 일시정지, 계속 진행, 분:초 단위 실시간 측정.
- **세트 완료 시 대형 원형 스마트 휴식 타이머**:
  - 세트 완료 체크 시 대형 원형 프로그레스 타이머 팝업.
  - **실제로 쉰 시간(초)이 해당 세트 데이터에 영구 저장**되어 휴식 시간 통제 분석 가능.

### 5. 🔗 다중 종목 묶기 (슈퍼세트 / 컴파운드세트 / 자이언트세트)
- 종목들을 묶어서 번갈아 수행할 수 있도록 그룹화 지원.
- 묶인 종목 좌측에 시그니처 연결 브래킷(테두리)과 `[⚡ 슈퍼세트 A-1]`, `[⚡ 슈퍼세트 A-2]` 배지 표시.

### 6. 📅 [기록 조회] 피드 & 깃허브 스타일 잔디 캘린더
- **일간 (Daily)**: 날짜별 상세 피드 (세트, 무게, 횟수, 1RM, RPE, 템포, 실제 쉰 시간).
- **월간 (Monthly)**: 깃허브 스타일 **출석 잔디 캘린더 히트맵**으로 이번 달 운동 빈도와 볼륨 강도 파악.
- **연간 (Yearly)**: 월별 운동 빈도 막대그래프, 연간 총 운동일수 및 누적 톤수 통계.

### 7. ✏️ 과거 운동 기록 수정(Edit) & 🗑️ 삭제(Delete)
- 과거에 저장된 운동 일지의 **날짜 이동, 제목, 메모, 당일 컨디션** 수정.
- 종목별 세트의 **무게(kg), 횟수(회), RPE, 실제 쉰 시간(초)** 인라인 수정.
- 세트 추가/삭제 및 잘못 등록된 운동 삭제, 확인 팝업 후 안전 삭제.

### 8. 🤖 AI 분석용 Markdown (.md) 추출
- 운동 일지를 ChatGPT, Claude, Gemini 등에 전달하여 피드백을 받을 수 있도록 정규화된 마크다운 표 생성.
- AI 전용 4대 코칭 질문(점진적 과부하 달성도, 피로도, 좌우 밸런스, 다음 주차 추천 중량) 자동 포함.
- 원터치 클립보드 복사 및 `.md` 파일 다운로드 지원.

---

## 🛠️ 기술 스택 (Tech Stack)

| 레이어 | 기술 |
| :--- | :--- |
| **Frontend Framework** | React 18 (TypeScript) |
| **Build & Bundler** | Vite 4.5 (Optimized Chunks) |
| **Styling & Design System** | Tailwind CSS 3.4 (Apple SF Pro Style, Dark/Light Mode) |
| **Mobile Runtime** | Capacitor 5 (iOS & Android Native Bridge) |
| **3D Engine** | Three.js (WebGL 60fps Anatomy Visualizer) |
| **Iconography** | Lucide React |
| **CI / CD** | GitHub Actions (Android APK & iOS IPA 산출물 빌드) |

---

## 🚀 로컬 개발 가이드

```bash
# 1. 저장소 복제
git clone https://github.com/iamminseongKim/iron-muscle.git
cd iron-muscle

# 2. 패키지 설치
npm install

# 3. 로컬 개발 서버 시작
npm run dev
# 브라우저에서 http://localhost:3000 접속

# 4. 프로덕션 빌드
npm run build

# 5. 모바일 동기화 (Capacitor Sync)
npx cap sync
```

### 🔐 다른 PC에서 개발 시 Android 릴리즈 서명키 동기화
다른 PC에서 로컬 릴리즈 빌드를 진행할 경우, 비공개 키 저장소(`iron-muscle-keys`)를 1회 클론하여 환경변수를 로드합니다:
```bash
# 1. 키스토어 클론 (최초 1회)
git clone https://github.com/iamminseongKim/iron-muscle-keys.git ~/.iron-muscle-keystore

# 2. 서명 환경변수 로드
source ~/.iron-muscle-keystore/setup-env.sh

# 3. 릴리즈 APK 빌드
cd android && ./gradlew assembleRelease
```
> ※ GitHub Actions를 통한 클라우드 릴리즈 빌드는 GitHub Secrets가 이미 등록되어 있어 다른 PC에서 별도 설정 없이 태그 푸시만으로 자동 서명 배포됩니다.

---

## 📄 라이선스 (License)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/iamminseongKim/iron-muscle/blob/main/LICENSE)

본 프로젝트는 **MIT 라이선스** 하에 완전 오픈소스로 공개됩니다.

- ✅ 상업적 사용 허용
- ✅ 수정 및 재배포 허용
- ✅ 개인/팀 프로젝트 자유 활용
- ✅ 포크 및 커스텀 무제한

자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참고해 주세요.

---

## 🙌 기여 (Contributing)

이슈, 버그 리포트, 기능 제안은 [GitHub Issues](https://github.com/iamminseongKim/iron-muscle/issues)를 이용해 주세요.
Pull Request도 언제든지 환영합니다! 🎉

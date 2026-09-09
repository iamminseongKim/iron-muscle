# 🏋️‍♂️ 아이언 머슬 트래커 (IRON MUSCLE TRACKER)
### 3D 해부학적 근육 뷰어 기반 크로스 플랫폼(Android & iOS) 운동 관리 어플리케이션

![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android%20%26%20iOS-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

---

## 🌟 핵심 기능 요약

### 1. 🩻 3D 인터랙티브 인체 해부학 근육 뷰어 (Three.js WebGL 자체 탑재)
- **외부 다운로드 없이 100% 브라우저/모바일 60fps 렌더링**: 대흉근, 광배근, 승모근, 삼각근(전/측/후), 이두, 삼두, 전완, 복근(식스팩), 둔근, 대퇴사두, 햄스트링, 비복근 등 20여 개 부위 정밀 3D 모델링.
- **주동근 & 협응근 시각화**: 
  - **주동근(Primary)**: 강렬한 네온 크림슨 레드(`#FF2244`) + 발광(Glow)
  - **협응근(Secondary)**: 앰버 오렌지(`#FF9900`) + 은은한 발광
  - **비타겟 부위**: 다크 메탈릭 차콜 실버
- **인터랙션**: 360도 마우스/터치 드래그 회전, 핀치 줌인/줌아웃, 원클릭 [전면(Front) / 후면(Back)] 시점 전환.
- 💡 **3D 근육 터치 역방향 검색**: 3D 인체 모델에서 특정 근육(예: 광배근)을 클릭하면, 해당 부위를 자극하는 운동들만 한 번에 모아 역으로 찾아줍니다!

### 2. 📝 운동 기록 & 지난번 기록 실시간 대조
- **세트 관리**: 세트 번호, 지난 기록(회색 텍스트), 중량(kg), 반복수(Reps), 완료 체크 토글, 세트 추가/삭제.
- **프리웨이트 vs 머신 선택 & 브랜드 지정**:
  - 프리웨이트 / 머신 원클릭 전환.
  - 머신 선택 시 대표 브랜드(`해머 스트렝스`, `싸이벡스`, `뉴텍`, `파나타`, `라이프 피트니스`, `테크노짐` 등) 선택 또는 직접 입력.
  - 머신 세팅 메모(시트 높이, 핀 번호, 각도 등) 지원.
- **실시간 최고 기록 분석**: 추정 1RM, 1세트 최고 볼륨, 최대 중량, 총 세션 볼륨 자동 계산.

### 3. ⏱️ 스마트 휴식(쉬는 시간) 타이머
- **자동 트리거**: 세트 완료 체크 시 설정된 휴식 시간(60~180초) 자동 카운트다운 시작.
- **편의 조작**: `+10초`, `-10초`, `일시정지/재생`, `리셋`.
- **사운드 & 진동 알림**: 카운트다운 종료 시 Web Audio API 기반 비프음 멜로디 및 모바일 햅틱 진동 발생.
- **전역 플로팅 바**: 다른 탭이나 운동을 둘러보더라도 타이머가 유지됨.

### 4. 📊 RPE / RIR 및 ⏱️ 템포(TUT) 점진적 과부하 시스템
- **RPE 초보자 가이드**: 팝업 모달을 통해 RPE 6~10점 및 RIR(남은 반복 횟수)을 알기 쉽게 설명.
- **RPE 보정 1RM 계산**: $RIR = 10 - RPE$ 공식을 적용한 정밀 잠재 1RM 추정.
- **수축·이완 템포(TUT) 설정**:
  - 이완-정지-수축 초 단위 조절 (`[표준 2-0-1]`, `[네거티브 3-1-1]`, `[고장력 4-2-1]`).
  - 중량이 같아도 긴장 지속시간(Time Under Tension) 증가를 통한 실질적 점진적 과부하 달성 분석!

### 5. 💬 오늘 운동 일지 & 특정 세트 메모
- **세션 총평 & 컨디션**: 🔥(최상), 💪(보통), 🥱(피곤), 🤕(부상주의), 🚀(신기록) 이모지 선택 및 일지 작성.
- **세트별 미세 코멘트 & 태그**: `[웜업]`, `[탑세트]`, `[백오프]`, `[드롭세트]`, `[실패지점]`, `[스트랩 착용]` 원클릭 태그 및 자유 메모.

### 6. 📈 종목별 통합 성장 분석 & 🔄 디로딩(Deload) 관리 대시보드
- **Cross-Brand Growth Analytics**: 머신 브랜드가 달라도(해머 vs 싸이벡스 등) 종목 전체에 대한 1RM 성장률(%) 및 타임라인 차트 제공.
- **디로딩 위크(Deload Week) 피로도 모니터링**: 최근 훈련 평균 RPE를 계산하여 피로도 누적 시 디로딩 주간 권장 알림.

---

## 📱 안드로이드 및 iOS 네이티브 빌드 & CI/CD

### 1) 로컬 개발 서버 실행 (웹 브라우저)
```bash
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

### 2) 안드로이드 Studio에서 실행 & APK 빌드
```bash
# 안드로이드 프로젝트 열기
npm run cap:android

# 또는 터미널에서 바로 Debug APK 빌드:
cd android
./gradlew assembleDebug
# 산출물 위치: android/app/build/outputs/apk/debug/app-debug.apk
```

### 3) iOS (Xcode) 실행 (Mac 환경)
```bash
npm run cap:ios
```

### 4) GitHub Actions 자동 빌드 CI/CD (`.github/workflows/build-mobile.yml`)
- 코드를 GitHub 저장소에 `git push`하면, GitHub Actions 클라우드 러너가 자동으로:
  1. 웹앱 빌드 (`npm run build`)
  2. 안드로이드 Gradle 빌드 (`./gradlew assembleDebug`)
  3. **`IronMuscle-Android-Debug-APK` 파일(.apk)을 Artifacts 탭에 자동 업로드**
  4. 스마트폰 브라우저나 PC에서 다운로드받아 폰에 즉시 설치 가능!

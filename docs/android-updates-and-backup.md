# 기록을 유지하는 Android 업데이트

## 문제 원인

기존 CI는 새 GitHub runner에서 `assembleDebug`를 실행했습니다. 디버그 키를 보존하지 않아 배포마다 서명이 달라질 수 있습니다. Android는 같은 applicationId와 호환되는 서명, 같거나 높은 versionCode의 APK만 기존 앱 위에 업데이트합니다. 앱 삭제 시 앱 내부 localStorage도 삭제됩니다.

- [Android 업데이트 조건](https://developer.android.com/google/play/app-updates)
- [앱 서명](https://developer.android.com/studio/publish/app-signing)

## 한 번 필요한 설정

기존 설치 APK에 서명한 개인 키가 있다면 그 키를 재사용합니다. APK만으로 개인 키를 복구할 수 없습니다. 키가 없다면 영구 릴리즈 키를 한 번 만들고, 최초 전환 때만 백업 → 재설치 → 복원해야 합니다.

`keytool -genkeypair -keystore iron-muscle-release.jks -alias iron-muscle -keyalg RSA -keysize 2048 -validity 10000`

명령에서 묻는 비밀번호는 따로 안전하게 보관합니다. 키 파일과 비밀번호는 저장소에 커밋하지 마세요. GitHub 저장소 Settings → Secrets and variables → Actions에 다음을 등록합니다.

- `ANDROID_KEYSTORE_BASE64`: 키 파일을 Base64로 변환한 내용
- `ANDROID_KEYSTORE_PASSWORD`: 키 저장소 비밀번호
- `ANDROID_KEY_ALIAS`: 예시 명령에서는 `iron-muscle`
- `ANDROID_KEY_PASSWORD`: 키 비밀번호 (PKCS12 기본 키 저장소는 보통 저장소 비밀번호와 동일)

키 파일은 별도 안전한 위치에 반드시 백업합니다. 이 환경은 GitHub CLI 로그인이 없어 Secrets를 등록하지 않았습니다. Secrets가 없으면 배포 빌드는 실패하도록 구성했습니다. 임시 서명 APK를 다시 배포하지 않습니다.

CI 릴리즈는 `assembleRelease`, `versionCode=1000+github.run_number`를 사용합니다. 같은 워크플로를 유지하고 이전보다 낮은 versionCode로 배포하지 않습니다. PR의 디버그 APK는 확인용이며 릴리즈에 게시하지 않습니다. 로컬 릴리즈 빌드는 같은 키 환경 변수와 충분히 높은 `ANDROID_VERSION_CODE`를 사용해야 합니다.

## 백업과 복원

새 앱의 기록 조회 → 파일로 백업을 사용합니다. Android는 시스템 파일 저장 선택창을 열어 Downloads나 사용자가 선택한 클라우드 폴더에 JSON을 저장합니다. 앱 내부 폴더가 아니므로 앱 삭제와 분리됩니다. 저장 취소와 저장 실패는 성공으로 표시하지 않습니다.

복원은 JSON 파일 선택 또는 JSON 텍스트 붙여넣기 → 내용 확인 → 기존 기록에 합쳐 복원 순서입니다. 기존 기록은 유지하며 같은 세션 ID는 건너뜁니다. 사용자 운동의 동일 ID가 다른 내용을 가리키면 복원을 중단합니다. 진행 중인 운동은 기존 활성 세션이 없을 때만 복원합니다. 완료 기록·사용자 운동·진행 중인 세션을 보존하고, 테마 등 표시 설정은 백업 대상이 아닙니다.

현재 설치된 구버전에 백업 기능이 없다면 삭제 전에 기존 AI 일지를 추출해 별도 보관하세요. 이미 삭제된 앱 내부 기록은 JSON 기능을 추가하는 것만으로 되살아나지 않습니다. 이번에 제공한 일지는 별도의 개인 복원 JSON으로 재구성했습니다. 개인 기록을 앱 번들이나 공개 저장소에 포함하지 않습니다.

복원 JSON의 세트 합계는 8종목·29세트·13,000kg·350회입니다. 원문 메모를 따라 V스쿼트, 바이킹 프레스, 스탠딩 레터럴 레이즈로 교정했습니다. 실제 시작 시각을 알 수 없어 00:00을 자리표시자로 쓰고, 원문 1분은 그대로 남겨 주석을 달았습니다. 좌우가 불명확한 세트는 추정하지 않았습니다.

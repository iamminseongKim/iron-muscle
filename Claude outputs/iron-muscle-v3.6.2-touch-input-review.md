# Iron Muscle v3.6.2 — 안드로이드/iOS 터치·입력 이슈 코드 점검 결과

점검 범위: `src/` 전체 (컴포넌트 30개, exercises.ts 데이터 파일 제외), `index.html`, `index.css`, `capacitor.config.ts`, `android/app/.../AndroidManifest.xml`. 실기기 실행 검증은 하지 않은 **정적 코드 리뷰** 결과이며, 코드상 근거가 있는 것과 재현 가능성이 높은 추정을 구분해 표기했습니다.

---

## ■ 1. [확인됨/HIGH] 3D 해부도 뷰어 — 터치 드래그 시 페이지가 같이 스크롤됨

**파일:** `src/components/3d/HumanMuscle3DViewer.tsx:192-194`

```ts
container.addEventListener('touchstart', onTouchStart, { passive: true });
container.addEventListener('touchmove', onTouchMove, { passive: true });
container.addEventListener('touchend', onTouchEnd);
```

`touchmove`가 `{ passive: true }`로 등록되어 있어 `onTouchMove` 안에서 `preventDefault()`를 호출해도 무시됩니다(실제로 지금 코드엔 `preventDefault()` 호출 자체도 없음). 반면 데스크톱용 `onWheel`은 같은 파일 190번 줄에서 `{ passive: false }` + `e.preventDefault()`로 정확히 처리되어 있어, 터치 쪽만 이 처리가 빠진 상태입니다.

- 결과: 모바일에서 손가락으로 3D 모델을 회전시키려고 드래그하면, 브라우저 기본 스크롤/팬 제스처가 같이 발동해 **모델 회전과 동시에 배경 페이지가 스크롤**됩니다. 두 손가락 핀치 줌(카메라 줌)도 마찬가지로 브라우저의 네이티브 제스처와 충돌할 수 있습니다.
- 컨테이너 div(`HumanMuscle3DViewer.tsx:292`)에도 `touch-action` CSS가 지정돼 있지 않아 이중으로 막을 방법이 없습니다.
- **수정 방향:** `touchstart`/`touchmove` 리스너를 `{ passive: false }`로 바꾸고 제스처 중일 때 `e.preventDefault()` 호출, 컨테이너에 `style={{ touchAction: 'none' }}` 추가. `touchcancel` 핸들러도 없어 통화/알림 등으로 터치가 중단되면 `isDragging` 플래그가 true로 남을 수 있으니 `touchend`와 동일하게 처리 권장.

## ■ 2. [확인됨/MEDIUM] 3D 뷰어가 부모 리렌더마다 통째로 재생성됨 (드래그 중 리셋 가능)

**파일:** `src/components/explore/ExerciseExplorer.tsx:46-51`, `HumanMuscle3DViewer.tsx:231`

`ExerciseExplorer`의 `handleMuscleClickOn3D`가 `useCallback` 없이 매 렌더마다 새로 생성되고, 이 함수가 `HumanMuscle3DViewer`의 `onSelectMuscle` prop으로 전달됩니다. `HumanMuscle3DViewer`의 Three.js 초기화 `useEffect`(라인 40~231)는 의존성 배열에 `onSelectMuscle`을 포함하고 있어(`[isAutoRotate, onSelectMuscle, isDark]`), **검색어 입력, 카테고리 필터 변경 등 부모의 아무 상태 변화로 리렌더될 때마다 WebGLRenderer를 dispose하고 완전히 새로 만듭니다.** 카메라 위치·회전 각도가 초기값으로 리셋되고, 사용자가 손가락으로 회전 중이던 제스처도 중간에 끊길 수 있습니다.

- **수정 방향:** `handleMuscleClickOn3D`를 `useCallback`으로 감싸거나, `onSelectMuscle`/`isAutoRotate`를 ref로 옮겨 씬 재생성 조건에서 제외.

## ■ 3. [확인됨/HIGH] 휴식 타이머 및 총 운동 시간 타이머가 백그라운드 전환 시 부정확해짐

**파일:** `src/App.tsx:108-126`, `src/components/workout/RestTimer.tsx:23-42`, `src/components/workout/RestTimerModal.tsx:44-59`

세 곳 모두 실제 경과 시간(`Date.now()` 델타)이 아니라 `setInterval(..., 1000)`이 몇 번 실행됐는지로 초를 세는 방식입니다(`prev + 1` / `prev - 1`). iOS WKWebView와 Android WebView는 앱이 백그라운드로 전환되거나(홈 버튼, 알림 확인, 전화 수신, 화면 잠금) 탭이 비활성화되면 JS 타이머 실행을 지연시키거나 통째로 멈춥니다.

- 결과: 휴식 중 전화를 받거나 화면을 껐다 켜면, 실제로는 90초가 지났어도 타이머는 몇 초만 지난 것처럼 표시됩니다. 헤더의 "총 운동 시간" 위젯도 동일한 방식이라 세트 사이 잠깐 다른 앱을 확인하기만 해도 실제 운동 시간보다 적게 기록됩니다.
- **수정 방향:** 시작 시각(`Date.now()`)을 저장해두고 매 tick마다 `remaining = target - Math.floor((Date.now() - startTime)/1000)`처럼 재계산. 추가로 `document.addEventListener('visibilitychange', ...)` 또는 `@capacitor/app`의 `App.addListener('resume', ...)`으로 포그라운드 복귀 시 즉시 재보정하는 것을 권장. 코드 전체에서 `visibilitychange`나 Capacitor `App` 플러그인 사용처가 전혀 없는 것도 확인했습니다.

## ■ 4. [확인됨/HIGH] 모든 input/textarea에 `user-select: none` + `-webkit-touch-callout: none`을 전역 강제 적용

**파일:** `src/index.css:6-32`

```css
*, *::before, *::after {
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
input, textarea {
  -webkit-touch-callout: none !important;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none !important;
  -webkit-user-select: none !important;
}
```

의도(주석: "터치 핀/물방울/돋보기 원천 차단")는 이해되지만, 이 규칙이 버튼·카드 같은 비입력 요소뿐 아니라 **input/textarea 자기 자신에도 걸려 있는 것**이 문제입니다. `user-select: none`을 폼 요소 자체에 주는 것은 일부 Android WebView(Chromium 계열) 버전에서 탭했을 때 캐럿이 안 보이거나 포커스가 아예 안 잡히는 알려진 호환성 이슈가 있고, 최소한 롱프레스 복사/붙여넣기(예: 다른 앱에서 복사한 메모를 세트 코멘트/세션 노트에 붙여넣기)가 이 앱 전체에서 완전히 불가능해집니다.

이 파일에서 `SetRow.tsx`(112-125줄), `RestTimerModal.tsx`(30-34줄)에 이미 "안드로이드 커서/물방울 핸들 잔존 버그" 관련 수동 workaround(`blur()` + `removeAllRanges()`)가 여러 군데 들어가 있는 것 자체가, 이 전역 CSS 규칙만으로는 문제가 완전히 해결되지 않고 있다는 정황 증거입니다.

- **수정 방향:** `user-select`/`touch-callout` 무력화는 버튼·라벨·카드처럼 실제로 선택이 필요 없는 요소로 범위를 좁히고, `input`/`textarea`/`select`/`[contenteditable]`에는 적용하지 않는 것을 권장합니다(적어도 `user-select: text`로 되돌리기).

## ■ 5. [확인됨/MEDIUM] 세트 무게/횟수 입력 — "포커스 후 첫 입력 덮어쓰기" 로직의 소수점 버그

**파일:** `src/components/workout/SetRow.tsx:45-98`

Android에서 숫자 입력창 포커스 시 기존 값이 자동 선택되지 않는 문제를 우회하려고, 포커스 직후 첫 `onChange`에서 "새로 입력한 부분만 채택"하는 diff 로직을 직접 구현해 두셨습니다. 의도 자체는 합리적이지만:

```ts
if (rawVal.length < prevStr.length) {           // 45라인 근처: 첫 입력이 백스페이스면 전체 0으로
  onUpdate({ ...set, weight: 0 });
  return;
}
let newlyTyped = rawVal;
if (prevStr && rawVal.startsWith(prevStr)) {
  newlyTyped = rawVal.slice(prevStr.length);      // 기존 문자열 뒤에 이어붙은 부분만 취함
}
const num = parseFloat(newlyTyped) || 0;
```

기존 값이 예를 들어 `100`일 때 포커스 후 커서가 끝에 있는 상태로 소수점(`.`)을 먼저 입력하면 `rawVal = "100."`이 되고, `newlyTyped`는 `"."` 하나만 남아 `parseFloat('.') || 0` → **무게가 즉시 0으로 초기화**됩니다(표시값도 `value={set.weight || ''}`라 0은 빈 문자열로 보여 사용자는 입력창이 갑자기 비어버린 것처럼 보입니다). 즉 "기존 값 뒤에 소수점을 이어서 세밀하게 수정"하는 흐름이 막혀 있습니다. reps 쪽(`parseInt`)은 소수점을 안 쓰니 이 특정 케이스는 영향이 적지만 동일 패턴이라 유사 엣지 케이스가 있을 수 있습니다.

- **수정 방향:** `newlyTyped`가 숫자로 파싱 불가능하거나(`.`, `-` 단독 등) 빈 문자열이면 0으로 덮어쓰지 말고 "덮어쓰기 모드를 유지한 채 다음 입력을 기다리는" 임시 문자열 상태로 남겨두는 처리 추가 검토.

## ■ 6. [확인됨/HIGH] AndroidManifest.xml에 `windowSoftInputMode` 미설정 → 키보드가 입력창을 가릴 수 있음

**파일:** `android/app/src/main/AndroidManifest.xml`

`<activity>` 태그에 `android:windowSoftInputMode`가 아예 없습니다. Capacitor가 기본 생성하는 값이 아니라 순수 Android 기본 동작(`adjustUnspecified`, 실기기/제조사에 따라 `adjustPan`처럼 동작)에 맡겨진 상태라, 키보드가 올라올 때 WebView가 자동으로 리사이즈되지 않을 가능성이 높습니다. 이 앱은 `SessionNotesModal`, `SetCommentModal`, 머신 세팅 텍스트 입력 등 모달 하단부에 텍스트 입력창이 많고, `AddExerciseModal`도 `fixed inset-0`으로 화면 전체를 덮는 구조라(`AddExerciseModal.tsx:198` 부근) 키보드가 뜨면 입력창이나 하단 리스트가 가려질 위험이 있습니다.

- **수정 방향:** `android:windowSoftInputMode="adjustResize"`를 `<activity>`에 추가. (`npx cap sync` 후에도 유지되도록 Capacitor 설정 쪽에 반영 필요)

## ■ 7. [추정/LOW-MEDIUM] 운동 검색 모달의 `autoFocus` — iOS에서 키보드가 안 열릴 수 있음

**파일:** `src/components/workout/AddExerciseModal.tsx:227`

검색 인풋에 `autoFocus`가 걸려 있는데, iOS WKWebView는 `.focus()` 호출이 사용자 제스처(탭)와 완전히 동기적으로 이어지지 않으면(리액트 렌더 커밋 타이밍, 모달 열림 애니메이션 등) 캐럿은 보이지만 소프트 키보드는 뜨지 않는 경우가 종종 보고됩니다. 실기기 확인이 필요한 항목이라 우선순위는 낮게 표시했습니다.

---

## 요약 (우선순위순)

1. 3D 해부도 뷰어 터치 시 페이지 스크롤 동시 발생 (`HumanMuscle3DViewer.tsx`)
2. 휴식/운동 타이머가 백그라운드 전환 후 부정확 (`App.tsx`, `RestTimer.tsx`, `RestTimerModal.tsx`)
3. 전역 `user-select:none` / `touch-callout:none`이 input/textarea에도 적용되어 있는 문제 (`index.css`)
4. Android `windowSoftInputMode` 미설정으로 키보드가 입력창을 가릴 가능성 (`AndroidManifest.xml`)
5. 3D 뷰어가 부모 리렌더마다 재생성되며 드래그 중 리셋 가능 (`ExerciseExplorer.tsx` / `HumanMuscle3DViewer.tsx`)
6. 무게 입력 소수점 첫 입력 시 값이 0으로 초기화 (`SetRow.tsx`)
7. (추정) 검색 모달 autoFocus가 iOS에서 키보드를 안 띄울 수 있음 (`AddExerciseModal.tsx`)

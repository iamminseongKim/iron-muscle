import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const imgDir = '/Users/minseong/study/iron-muscle/public/screenshots';
const toB64 = name => 'data:image/png;base64,' + readFileSync(join(imgDir, name)).toString('base64');

const b64_1 = toB64('02-3d-anatomy-dual.png');
const b64_2 = toB64('03-3d-muscle-selected.png');
const b64_3 = toB64('01-workout-logger-active.png');
const b64_4 = toB64('04-smart-search.png');
const b64_5 = toB64('05-stats-growth.png');

const outPath = '/Users/minseong/.gemini/antigravity/brain/4b359622-ecbd-4d96-92a5-0bfa5769ffbf/portfolio_showcase.html';

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <title>Iron Muscle Tracker v3.9.0 기능별 포트폴리오 쇼케이스</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .phone-mockup {
      position: relative;
      border: 8px solid #2A2E39;
      border-radius: 40px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08);
      background: #111;
      max-width: 320px;
      margin: 0 auto;
    }
    .phone-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 18px;
      background: #2A2E39;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      z-index: 20;
    }
  </style>
</head>
<body class="bg-[#0B0C10] text-[#E5E7EB] min-h-screen p-4 md:p-10 font-sans antialiased">
  <div class="max-w-5xl mx-auto space-y-12">

    <!-- 포트폴리오 헤더 -->
    <header class="text-center space-y-4 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] text-xs font-black tracking-wider">
        <span>IRON MUSCLE TRACKER v3.9.0</span>
        <span>•</span>
        <span>포트폴리오 기능 쇼케이스</span>
      </div>
      <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
        진짜 헬스인을 위한<br><span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D55] via-[#FF9500] to-[#FFCC00]">3D 해부도 & 스마트 운동 로거</span>
      </h1>
      <p class="text-sm md:text-base text-gray-400">
        서버와 광고 없는 100% 프라이버시 로컬 아키텍처 위에, 오픈소스 3D 해부학 모델과 900+개 전문 운동 데이터베이스를 결합한 모바일 피트니스 앱입니다.
      </p>

      <!-- 기술 스택 태그 -->
      <div class="flex items-center justify-center gap-2 flex-wrap pt-2">
        <span class="px-3 py-1 bg-[#1A1D24] rounded-lg text-xs font-semibold text-gray-300 border border-gray-800">React 18</span>
        <span class="px-3 py-1 bg-[#1A1D24] rounded-lg text-xs font-semibold text-gray-300 border border-gray-800">TypeScript</span>
        <span class="px-3 py-1 bg-[#1A1D24] rounded-lg text-xs font-semibold text-gray-300 border border-gray-800">Three.js / WebGL</span>
        <span class="px-3 py-1 bg-[#1A1D24] rounded-lg text-xs font-semibold text-gray-300 border border-gray-800">Capacitor (Android & iOS)</span>
        <span class="px-3 py-1 bg-[#1A1D24] rounded-lg text-xs font-semibold text-gray-300 border border-gray-800">Tailwind CSS</span>
        <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold">100% Offline Local</span>
      </div>

      <!-- 상단 복사 액션 버튼 그룹 -->
      <div class="flex items-center justify-center gap-3 pt-4 flex-wrap">
        <button onclick="copyRenderedSelection()" class="px-5 py-3 bg-gradient-to-r from-[#FF2D55] to-[#FF375F] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF2D55]/30 hover:opacity-95 transition flex items-center gap-2 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
          <span>📋 본문 서식(이미지 포함) 원클릭 복사</span>
        </button>
        <button onclick="copyWebHtml()" class="px-4 py-3 bg-[#1A1D24] hover:bg-[#222731] text-gray-200 font-bold text-sm rounded-xl border border-gray-700 transition flex items-center gap-2 active:scale-95">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
          <span>HTML 소스코드 복사</span>
        </button>
        <a href="https://github.com/iamminseongKim/iron-muscle/releases/tag/v3.9.0" target="_blank" class="px-4 py-3 bg-[#1A1D24] hover:bg-[#222731] text-gray-300 font-bold text-sm rounded-xl border border-gray-800 transition flex items-center gap-2">
          <span>깃허브 릴리즈</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </header>

    <!-- 복사 알림 토스트 -->
    <div id="toast" class="hidden fixed bottom-6 right-6 bg-[#007AFF] text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm z-50 transition-all flex items-center gap-2">
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      <span id="toastMsg">클립보드에 복사되었습니다!</span>
    </div>

    <!-- 복사 대상 컨테이너 -->
    <main id="printable-content" class="space-y-16">

      <!-- 1. 3D 해부도 앞뒤 동시 뷰 -->
      <section class="bg-[#12141A] border border-gray-800/80 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div class="w-full lg:w-1/2 space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 text-xs font-bold border border-purple-500/30">
            <span>FEATURE 01</span>
            <span>•</span>
            <span>v3.9.0 NEW</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">오프라인 3D 근육 해부도<br><span class="text-purple-400">앞뒤 함께 뷰포트 분할 렌더링</span></h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            외부 네트워크 통신 없이 앱 패키지 내부에 번들링된 오픈소스(BodyParts3D & Z-Anatomy, CC BY-SA) 정밀 해부학 GLB 모델을 사용합니다.
            단일 WebGL 캔버스에서 Viewport Scissor 기술을 활용해 전면과 후면을 동시에 렌더링하여 자극 부위를 한눈에 파악할 수 있습니다.
          </p>
          <div class="space-y-2 pt-2">
            <div class="flex items-center gap-2 text-xs font-semibold text-gray-300">
              <span class="w-2.5 h-2.5 rounded-full bg-[#FF2D55]"></span>
              <span><strong>주동근(Primary Muscle):</strong> 주요 타깃 근육 레드 컬러 하이라이트</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-gray-300">
              <span class="w-2.5 h-2.5 rounded-full bg-[#FF9500]"></span>
              <span><strong>협응근(Secondary Muscle):</strong> 보조 협응 부위 오렌지 컬러 하이라이트</span>
            </div>
            <div class="flex items-center gap-2 text-xs font-semibold text-gray-300">
              <span class="w-2.5 h-2.5 rounded-full bg-[#328BFF]"></span>
              <span><strong>성능 최적화:</strong> 467개 메쉬를 17개 부위로 mergeGeometries 병합 (Draw Call 최소화)</span>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <img src="${b64_1}" alt="3D 해부도 앞뒤 함께 뷰" class="w-full h-auto block">
          </div>
        </div>
      </section>

      <!-- 2. 3D 부위 터치 선택 & 타깃 운동 매핑 -->
      <section class="bg-[#12141A] border border-gray-800/80 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
        <div class="w-full lg:w-1/2 space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">
            <span>FEATURE 02</span>
            <span>•</span>
            <span>INTERACTIVE RAYCASTING</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">터치로 찾는 운동<br><span class="text-blue-400">Raycaster 3D 근육 인터랙션</span></h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            3D 인체 모델의 특정 근육을 손가락으로 터치하면 Three.js Raycasting을 통해 해당 근육 부위(전완근, 가슴, 둔근 등)가 블루 컬러로 실시간 강조되며, 하단에 해당 부위를 단련할 수 있는 운동 리스트가 자동으로 필터링됩니다.
          </p>
          <div class="space-y-2 pt-2 text-xs text-gray-300">
            <p>✓ <strong>자유로운 조작:</strong> OrbitControls 기반 드래그 360도 회전, 두 손가락 줌, 시점 리셋 버튼</p>
            <p>✓ <strong>척추기립근 투과:</strong> 등 부위 관찰 시 흉요근막을 제외하여 내부 기립근을 명확히 확인 가능</p>
            <p>✓ <strong>원터치 필터 해제:</strong> 상단 필터 태그에서 언제든 기본 상태로 복귀</p>
          </div>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <img src="${b64_2}" alt="3D 근육 터치 선택" class="w-full h-auto block">
          </div>
        </div>
      </section>

      <!-- 3. 실전 운동 로거 -->
      <section class="bg-[#12141A] border border-gray-800/80 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div class="w-full lg:w-1/2 space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <span>FEATURE 03</span>
            <span>•</span>
            <span>WORKOUT LOGGER</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">헬스장에서 가장 빠른 기록<br><span class="text-emerald-400">헤더 통합 타이머 & 스마트 로거</span></h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            운동 중 불필요한 터치를 줄이기 위해 최적화된 UX를 제공합니다. 헤더에 총 운동시간 스톱워치 캡슐이 실시간으로 작동하며, 세트 완료 시 원터치 체크와 함께 다음 세트 휴식 타이머가 연동됩니다.
          </p>
          <div class="space-y-2 pt-2 text-xs text-gray-300">
            <p>✓ <strong>세트별 정밀 기록:</strong> 무게(kg/lbs 자동환산), 횟수, 세트 완료 체크, RPE 자각도</p>
            <p>✓ <strong>원암(L/R) & 부하 토글:</strong> 원암 분리 기록, 핀로드/원판(플레이트) 머신 속성 원터치 지정</p>
            <p>✓ <strong>1RM 실시간 추정:</strong> 세트 입력과 동시에 Epley 공식 기반 추정 1RM 계산 및 표시</p>
            <p>✓ <strong>국내 인기 머신 브랜드:</strong> 뉴텍, 아틀란티스, 싸이벡스, 해머스트렝스 등 머신 설정 메모</p>
          </div>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <img src="${b64_3}" alt="실전 운동 로거 화면" class="w-full h-auto block">
          </div>
        </div>
      </section>

      <!-- 4. 900+ 전문 운동 DB & 스마트 초성 검색 -->
      <section class="bg-[#12141A] border border-gray-800/80 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
        <div class="w-full lg:w-1/2 space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30">
            <span>FEATURE 04</span>
            <span>•</span>
            <span>900+ EXERCISES</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">900+ 운동 DB &<br><span class="text-amber-400">초성/은어 검색 엔진</span></h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            방대한 900여 종의 운동이 100% 한국어로 번역 및 매핑되어 있습니다. 복잡한 영문명 대신 헬스인들이 자주 쓰는 초성 및 은어 검색을 자체 정규식 엔진으로 완벽하게 지원합니다.
          </p>
          <div class="space-y-2 pt-2 text-xs text-gray-300">
            <p>✓ <strong>초성 검색 완벽 대응:</strong> <code>ㅂㅅㅅ</code> ➔ 불가리안 스플릿 스쿼트, <code>사레레</code> ➔ 사이드 래터럴 레이즈</p>
            <p>✓ <strong>타깃 부위 및 장비 필터링:</strong> 가슴, 등, 하체, 어깨, 팔, 복근 및 바벨/덤벨/머신/케이블 탭</p>
            <p>✓ <strong>올바른 자세 가이드:</strong> 초보자도 쉽게 따라 할 수 있는 상세 수행 방법 제공</p>
          </div>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <img src="${b64_4}" alt="초성 검색 및 운동 DB" class="w-full h-auto block">
          </div>
        </div>
      </section>

      <!-- 5. 종목별 1RM 성장 지표 & 통계 대시보드 -->
      <section class="bg-[#12141A] border border-gray-800/80 rounded-3xl p-6 md:p-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div class="w-full lg:w-1/2 space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold border border-rose-500/30">
            <span>FEATURE 05</span>
            <span>•</span>
            <span>GROWTH & ANALYTICS</span>
          </div>
          <h2 class="text-2xl md:text-3xl font-black text-white">점진적 과부하 트래킹<br><span class="text-rose-400">통합 통계 & 1RM 성장 지표</span></h2>
          <p class="text-gray-400 text-sm leading-relaxed">
            나의 과거 운동 일지들이 쌓여 시각적인 통계 대시보드로 재탄생합니다. 종목별 1RM 성장 추이와 최근 평균 강도(RPE), 세션별 총 볼륨(kg)을 체계적으로 추적하여 정체기 극복을 돕습니다.
          </p>
          <div class="space-y-2 pt-2 text-xs text-gray-300">
            <p>✓ <strong>종목별 근력 성장 지표:</strong> 머신 브랜드가 달라도 종목 전체 1RM 성장 추적</p>
            <p>✓ <strong>과거 일지 즉시 조회:</strong> 날짜별 세션, 세트 수, 최고 무게 원클릭 열람 및 수정</p>
            <p>✓ <strong>AI 분석 마크다운 내보내기:</strong> ChatGPT/Claude에 질문할 수 있는 표 포맷 즉시 복사</p>
          </div>
        </div>
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <img src="${b64_5}" alt="통계 & 성장 대시보드" class="w-full h-auto block">
          </div>
        </div>
      </section>

    </main>

    <!-- 푸터 -->
    <footer class="border-t border-gray-800 pt-8 text-center text-xs text-gray-500 space-y-2">
      <p>Iron Muscle Tracker • 100% Free & Open-Source Fitness Logger</p>
      <p>3D Models courtesy of BodyParts3D (DBCLS, CC BY-SA 2.1 Japan) & Z-Anatomy (CC BY-SA 4.0)</p>
    </footer>

  </div>

  <script>
    function showToast(msg) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMsg').innerText = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2800);
    }

    // 본문 전체 서식 및 이미지 복사
    async function copyRenderedSelection() {
      const el = document.getElementById('printable-content');
      try {
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
        showToast('서식과 이미지가 클립보드에 복사되었습니다! 에디터에 Ctrl+V 하세요.');
      } catch (e) {
        showToast('복사 실패: ' + e.message);
      }
    }

    // 웹 GitHub raw URL 기반 HTML 소스코드 복사
    async function copyWebHtml() {
      const htmlCode = \`<div style="max-width: 680px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1D1D1F; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
  <div style="background: linear-gradient(135deg, #11141C 0%, #1E2433 100%); padding: 36px 24px; text-align: center; color: #FFFFFF;">
    <div style="display: inline-block; background-color: rgba(255, 45, 85, 0.2); color: #FF2D55; font-size: 12px; font-weight: 800; padding: 4px 12px; border-radius: 999px; margin-bottom: 12px;">v3.9.0 포트폴리오 쇼케이스</div>
    <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 900;">오프라인 3D 해부도 & 스마트 운동 일지<br><span style="color: #FF2D55;">Iron Muscle Tracker</span></h1>
    <p style="margin: 0; font-size: 13px; color: #9CA3AF;">서버·광고 없는 100% 무료 로컬 앱의 주요 화면과 기능을 소개합니다.</p>
  </div>
  <div style="padding: 24px 20px;">
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
      <h2 style="font-size: 18px; font-weight: 900; color: #111827; margin: 0 0 8px 0;">🩻 1. 오프라인 3D 근육 해부도 (앞뒤 동시 뷰)</h2>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 14px 0;">BodyParts3D & Z-Anatomy 오픈소스 GLB 내장. 주동근(빨강)과 협응근(주황)을 전면/후면 동시 분할 뷰포트로 직관적으로 확인합니다.</p>
      <div style="text-align: center;"><img src="https://raw.githubusercontent.com/iamminseongKim/iron-muscle/main/public/screenshots/02-3d-anatomy-dual.png" alt="3D 근육 해부도" style="max-width: 280px; width: 100%; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12);"></div>
    </div>
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
      <h2 style="font-size: 18px; font-weight: 900; color: #111827; margin: 0 0 8px 0;">👆 2. 3D 모델 터치 선택 & 운동 자동 추천</h2>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 14px 0;">3D 인체 모델에서 자극하고 싶은 부위를 터치하면 파란색 하이라이트와 함께 해당 부위 맞춤 운동 목록이 자동 필터링됩니다.</p>
      <div style="text-align: center;"><img src="https://raw.githubusercontent.com/iamminseongKim/iron-muscle/main/public/screenshots/03-3d-muscle-selected.png" alt="3D 터치 선택" style="max-width: 280px; width: 100%; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12);"></div>
    </div>
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
      <h2 style="font-size: 18px; font-weight: 900; color: #111827; margin: 0 0 8px 0;">⏱️ 3. 헬스장에서 가장 빠른 실전 운동 로거</h2>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 14px 0;">헤더 일체형 스톱워치, 세트별 무게/횟수/RPE, 1RM 실시간 계산, 국내 인기 머신 브랜드(뉴텍, 아틀란티스, 싸이벡스 등) 설정 메모를 지원합니다.</p>
      <div style="text-align: center;"><img src="https://raw.githubusercontent.com/iamminseongKim/iron-muscle/main/public/screenshots/01-workout-logger-active.png" alt="운동 로거" style="max-width: 280px; width: 100%; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12);"></div>
    </div>
    <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
      <h2 style="font-size: 18px; font-weight: 900; color: #111827; margin: 0 0 8px 0;">🔍 4. 900개 운동 DB & 기막힌 초성 검색</h2>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 14px 0;">ㅂㅅㅅ 치면 '불스스', 사레레 치면 '사이드 래터럴 레이즈' 즉시 검색! 100% 한국어화와 올바른 자세 가이드 제공.</p>
      <div style="text-align: center;"><img src="https://raw.githubusercontent.com/iamminseongKim/iron-muscle/main/public/screenshots/04-smart-search.png" alt="초성 검색" style="max-width: 280px; width: 100%; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12);\"></div>
    </div>
    <div style="margin-bottom: 28px;">
      <h2 style="font-size: 18px; font-weight: 900; color: #111827; margin: 0 0 8px 0;">📈 5. 종목별 1RM 성장 지표 & 통계 대시보드</h2>
      <p style="font-size: 13px; color: #4B5563; margin: 0 0 14px 0;">누적된 운동 데이터를 바탕으로 종목별 최고 1RM 성장 추이와 총 볼륨을 분석하고, AI 피드백용 마크다운 표 내보내기를 지원합니다.</p>
      <div style="text-align: center;"><img src="https://raw.githubusercontent.com/iamminseongKim/iron-muscle/main/public/screenshots/05-stats-growth.png" alt="성장 통계" style="max-width: 280px; width: 100%; border-radius: 18px; box-shadow: 0 8px 18px rgba(0,0,0,0.12);\"></div>
    </div>
    <div style="background-color: #11141C; border-radius: 16px; padding: 20px; text-align: center; color: #FFFFFF;">
      <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800;">무료 다운로드 (Android & iOS)</h3>
      <p style="margin: 0 0 14px 0; font-size: 12px; color: #9CA3AF;">광고, 결제, 회원가입 없이 누구나 무료로 사용하실 수 있습니다.</p>
      <a href="https://github.com/iamminseongKim/iron-muscle/releases/tag/v3.9.0" target="_blank" style="display: inline-block; background-color: #FF2D55; color: #FFFFFF; font-weight: 800; font-size: 13px; padding: 10px 20px; border-radius: 10px; text-decoration: none;">🚀 GitHub 릴리즈 다운로드</a>
    </div>
  </div>
</div>\`;
      await navigator.clipboard.writeText(htmlCode);
      showToast('HTML 소스코드가 클립보드에 복사되었습니다! (게시판 HTML 모드용)');
    }
  </script>
</body>
</html>`;

writeFileSync(outPath, html, 'utf8');
console.log('SUCCESS: portfolio_showcase.html written with embedded Base64!');

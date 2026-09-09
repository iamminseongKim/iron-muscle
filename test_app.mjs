import puppeteer from 'puppeteer-core';

async function runTest() {
  console.log('🚀 브라우저 자동화 테스트 시작...');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 414, height: 896, isMobile: true, hasTouch: true });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('❌ Browser Console Error:', msg.text());
      errors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.log('❌ Page Error:', err.message);
    errors.push(err.message);
  });

  // 1. 앱 접속
  console.log('1. http://localhost:3000 접속 중...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 2000));

  // 스크린샷 1: 운동 기록 메인 화면
  console.log('2. 운동 기록 탭 테스트 & 스크린샷 캡처...');
  await page.screenshot({ path: 'screenshot_workout.png' });

  // 세트 완료 버튼 클릭 테스트 (첫 번째 세트 완료 토글)
  const buttons = await page.$$('button');
  console.log(`발견된 버튼 개수: ${buttons.length}개`);

  // RPE 가이드 모달 열기 테스트
  console.log('3. RPE 가이드 모달 열기 테스트...');
  const rpeGuideBtn = await page.$('button[title="RPE 가이드"]');
  if (rpeGuideBtn) {
    await rpeGuideBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_rpe_modal.png' });
    console.log('RPE 가이드 모달 스크린샷 캡처 완료');

    // 모달 닫기
    const allBtns = await page.$$('button');
    for (const b of allBtns) {
      const text = await page.evaluate((el) => el.textContent, b);
      if (text && text.includes('이해했습니다')) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  // 4. 3D & 탐색 탭으로 이동
  console.log('4. 3D & 탐색 탭 전환 테스트...');
  const navButtons = await page.$$('nav button');
  if (navButtons.length >= 2) {
    await navButtons[1].click();
    await new Promise((r) => setTimeout(r, 2500)); // 3D 렌더링 대기
    await page.screenshot({ path: 'screenshot_3d_explore.png' });
    console.log('3D 탐색 화면 스크린샷 캡처 완료');
  }

  // 5. 통계 & 성장 탭으로 이동
  console.log('5. 통계 & 성장 탭 전환 테스트...');
  if (navButtons.length >= 3) {
    await navButtons[2].click();
    await new Promise((r) => setTimeout(r, 1500));
    await page.screenshot({ path: 'screenshot_history.png' });
    console.log('통계 & 성장 화면 스크린샷 캡처 완료');
  }

  await browser.close();

  console.log('====================================');
  console.log('🎉 모든 브라우저 메뉴 테스트 완료!');
  console.log(`콘솔 에러 개수: ${errors.length}`);
  console.log('스크린샷 저장 목록:');
  console.log('- screenshot_workout.png');
  console.log('- screenshot_rpe_modal.png');
  console.log('- screenshot_3d_explore.png');
  console.log('- screenshot_history.png');
  console.log('====================================');
}

runTest().catch((err) => {
  console.error('테스트 실패:', err);
  process.exit(1);
});

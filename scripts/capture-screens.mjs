import puppeteer from 'puppeteer-core';
import { mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'public', 'screenshots');
const artifactDir = '/Users/minseong/.gemini/antigravity/brain/4b359622-ecbd-4d96-92a5-0bfa5769ffbf/screenshots';
mkdirSync(outDir, { recursive: true });
mkdirSync(artifactDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: [
    '--enable-webgl',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--no-sandbox'
  ]
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle0' });

  // 샘플 데이터 주입 & 활성 세션 주입
  await page.evaluate(() => {
    const sampleHistory = [
      {
        id: 'session-20260901',
        title: '하체 & 등 파워 데이',
        date: '2026-09-01',
        durationSeconds: 4500,
        conditionEmoji: '🔥',
        overallRpe: 8.5,
        completed: true,
        exercises: [
          {
            id: 'ex-1',
            exerciseId: 'conventional-deadlift',
            equipmentType: 'barbell',
            sets: [
              { id: 's1', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.0 },
              { id: 's2', setNumber: 2, weight: 100, reps: 6, completed: true, rpe: 8.0 },
              { id: 's3', setNumber: 3, weight: 140, reps: 3, completed: true, rpe: 9.0 }
            ]
          },
          {
            id: 'ex-2',
            exerciseId: 'leg-press',
            equipmentType: 'machine',
            machineBrand: 'Cybex (싸이벡스)',
            sets: [
              { id: 's4', setNumber: 1, weight: 160, reps: 12, completed: true, rpe: 8.0 },
              { id: 's5', setNumber: 2, weight: 200, reps: 10, completed: true, rpe: 8.5 }
            ]
          }
        ]
      },
      {
        id: 'session-20260904',
        title: '가슴 & 삼두 펌핑 데이',
        date: '2026-09-04',
        durationSeconds: 4200,
        conditionEmoji: '💪',
        overallRpe: 8.0,
        completed: true,
        exercises: [
          {
            id: 'ex-3',
            exerciseId: 'bench-press',
            equipmentType: 'barbell',
            sets: [
              { id: 's7', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.5 },
              { id: 's8', setNumber: 2, weight: 80, reps: 8, completed: true, rpe: 8.5 },
              { id: 's9', setNumber: 3, weight: 100, reps: 5, completed: true, rpe: 9.5 }
            ]
          }
        ]
      }
    ];

    const activeSession = {
      id: 'active-session-demo',
      title: '가슴 & 어깨 루틴',
      targetMuscles: ['chest', 'deltoid_front', 'triceps'],
      startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      durationSeconds: 1520,
      completed: false,
      exercises: [
        {
          id: 'act-ex-1',
          exerciseId: 'bench-press',
          equipmentType: 'barbell',
          sets: [
            { id: 'as-1', setNumber: 1, weight: 60, reps: 10, completed: true, rpe: 7.5, restSeconds: 90 },
            { id: 'as-2', setNumber: 2, weight: 80, reps: 8, completed: true, rpe: 8.5, restSeconds: 120 },
            { id: 'as-3', setNumber: 3, weight: 90, reps: 6, completed: false, rpe: 9.0, restSeconds: 120 }
          ]
        },
        {
          id: 'act-ex-2',
          exerciseId: 'standing_lateral_raise_machine',
          equipmentType: 'machine',
          machineBrand: 'Arsenal Strength (아스널)',
          loadType: 'plate',
          sets: [
            { id: 'as-4', setNumber: 1, weight: 15, reps: 15, completed: true, rpe: 8.0 },
            { id: 'as-5', setNumber: 2, weight: 20, reps: 12, completed: false, rpe: 8.5 }
          ]
        }
      ]
    };

    localStorage.setItem('iron_workout_sessions_v1', JSON.stringify(sampleHistory));
    localStorage.setItem('iron_active_session_v1', JSON.stringify(activeSession));
  });

  await page.reload({ waitUntil: 'networkidle0' });

  const saveShot = async (name) => {
    const p1 = join(outDir, name);
    const p2 = join(artifactDir, name);
    await page.screenshot({ path: p1, fullPage: false });
    copyFileSync(p1, p2);
    console.log('Saved:', name);
  };

  const clickTab = async (text) => {
    await page.evaluate((t) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.textContent.includes(t));
      if (target) target.click();
    }, text);
  };

  // 1. [운동 기록] 활성 세션 화면 (세트 기록, 무게/횟수/RPE, 머신 브랜드, 헤더 시계)
  console.log('1. 운동 진행 로거...');
  await clickTab('운동 기록');
  await new Promise(r => setTimeout(r, 1000));
  await saveShot('01-workout-logger-active.png');

  // 2. [운동 탐색] 3D 해부도 앞뒤 함께 뷰
  console.log('2. 3D 해부도...');
  await clickTab('운동 탐색');
  await page.waitForSelector('[data-model="bodyparts3d-z-anatomy"]', { timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  await saveShot('02-3d-anatomy-dual.png');

  // 3. [운동 탐색] 3D 전면 회전 & 부위 선택
  console.log('3. 3D 근육 선택...');
  await page.mouse.click(162, 360);
  await new Promise(r => setTimeout(r, 1000));
  await saveShot('03-3d-muscle-selected.png');

  // 4. [운동 탐색] 초성 검색 ('ㅂㅅㅅ')
  console.log('4. 초성 검색...');
  const searchInput = await page.$('input[placeholder*="검색"]');
  if (searchInput) {
    await searchInput.click();
    await page.keyboard.type('ㅂㅅㅅ');
    await new Promise(r => setTimeout(r, 800));
    await saveShot('04-smart-search.png');
  }

  // 5. [통계 & 성장] 탭
  console.log('5. 통계 & 성장 대시보드...');
  await clickTab('통계 & 성장');
  await new Promise(r => setTimeout(r, 1500));
  await saveShot('05-stats-growth.png');

  console.log('ALL SCREENSHOTS UPDATED PERFECTLY!');
} finally {
  await browser.close();
}

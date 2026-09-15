import assert from 'node:assert/strict';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/utils/calendar.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
});

const {
  getDaysInMonth,
  getFirstDayOfWeek,
  generateCalendarGrid,
  getPrevMonthString,
  getNextMonthString,
  getPrevDayString,
  getNextDayString,
  formatLocalDate,
} = await import(
  `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`
);

console.log('--- 1. 월별 일수 및 윤년 계산 검증 ---');
// 9월은 30일
assert.equal(getDaysInMonth(2026, 9), 30, '2026년 9월은 30일이어야 합니다.');
// 8월은 31일
assert.equal(getDaysInMonth(2026, 8), 31, '2026년 8월은 31일이어야 합니다.');
// 2024년 2월(윤년)은 29일
assert.equal(getDaysInMonth(2024, 2), 29, '2024년 2월(윤년)은 29일이어야 합니다.');
// 2025년 2월(평년)은 28일
assert.equal(getDaysInMonth(2025, 2), 28, '2025년 2월(평년)은 28일이어야 합니다.');
// 2026년 2월(평년)은 28일
assert.equal(getDaysInMonth(2026, 2), 28, '2026년 2월(평년)은 28일이어야 합니다.');

console.log('--- 2. 1일의 시작 요일 검증 ---');
// 2026년 9월 1일은 화요일 (0:일, 1:월, 2:화)
assert.equal(getFirstDayOfWeek(2026, 9), 2, '2026년 9월 1일은 화요일(2)이어야 합니다.');
// 2026년 1월 1일은 목요일 (4:목)
assert.equal(getFirstDayOfWeek(2026, 1), 4, '2026년 1월 1일은 목요일(4)이어야 합니다.');

console.log('--- 3. 2026년 9월 달력 그리드 생성 검증 ---');
const grid202609 = generateCalendarGrid('2026-09', '2026-09-15');

// 총 셀 수는 7의 배수여야 함 (5주 = 35칸)
assert.equal(grid202609.length % 7, 0, '달력 그리드는 7열 단위(7의 배수)여야 합니다.');
assert.equal(grid202609.length, 35, '2026년 9월은 5주 35칸 그리드여야 합니다.');

// 앞쪽 2칸(화요일 전인 일, 월)은 8월 30일, 31일이어야 함
assert.equal(grid202609[0].dateString, '2026-08-30');
assert.equal(grid202609[0].dayOfWeek, 0); // 일요일
assert.equal(grid202609[0].isCurrentMonth, false);

assert.equal(grid202609[1].dateString, '2026-08-31');
assert.equal(grid202609[1].dayOfWeek, 1); // 월요일
assert.equal(grid202609[1].isCurrentMonth, false);

// 3번째 칸(index 2)부터 9월 1일(화요일)이어야 함
assert.equal(grid202609[2].dateString, '2026-09-01');
assert.equal(grid202609[2].dayOfWeek, 2); // 화요일
assert.equal(grid202609[2].isCurrentMonth, true);

// 9월 15일은 화요일이어야 하며, isToday가 true여야 함
const cellSep15 = grid202609.find((c) => c.dateString === '2026-09-15');
assert(cellSep15, '9월 15일 셀이 존재해야 합니다.');
assert.equal(cellSep15.dayOfWeek, 2, '9월 15일은 화요일(2)이어야 합니다.');
assert.equal(cellSep15.isToday, true, '9월 15일은 오늘(isToday: true)이어야 합니다.');
assert.equal(cellSep15.isCurrentMonth, true);

// 9월의 마지막 날은 30일(수요일)이어야 함 (31일은 없어야 함!)
const sepDays = grid202609.filter((c) => c.isCurrentMonth);
assert.equal(sepDays.length, 30, '9월의 날짜 수는 정확히 30일이어야 합니다.');
assert.equal(sepDays[sepDays.length - 1].dateString, '2026-09-30');
assert.equal(sepDays[sepDays.length - 1].dayOfWeek, 3); // 수요일

// 30일 뒤 3칸(목, 금, 토)은 10월 1, 2, 3일이어야 함
const lastIndex = grid202609.length - 1;
assert.equal(grid202609[lastIndex - 2].dateString, '2026-10-01');
assert.equal(grid202609[lastIndex - 2].dayOfWeek, 4); // 목요일
assert.equal(grid202609[lastIndex - 2].isCurrentMonth, false);

assert.equal(grid202609[lastIndex - 1].dateString, '2026-10-02');
assert.equal(grid202609[lastIndex - 1].dayOfWeek, 5); // 금요일

assert.equal(grid202609[lastIndex].dateString, '2026-10-03');
assert.equal(grid202609[lastIndex].dayOfWeek, 6); // 토요일

console.log('--- 4. 월/일 네비게이션 유틸 검증 ---');
assert.equal(getPrevMonthString('2026-09'), '2026-08');
assert.equal(getNextMonthString('2026-09'), '2026-10');
assert.equal(getPrevMonthString('2026-01'), '2025-12');
assert.equal(getNextMonthString('2026-12'), '2027-01');

assert.equal(getPrevDayString('2026-09-01'), '2026-08-31');
assert.equal(getNextDayString('2026-08-31'), '2026-09-01');

console.log('PASS: 캘린더 날짜 계산, 요일 정렬, 월말 일수 및 네비게이션 검증 완료');

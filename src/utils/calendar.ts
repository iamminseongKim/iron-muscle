/**
 * 달력 날짜 계산 및 그리드 생성 유틸리티
 * 외부 패키지 없이 자바스크립트 표준 Date 객체를 활용하여
 * 윤년, 월말 일수, 시작 요일, 타임존 안전 변환을 완벽하게 처리합니다.
 */

import { WorkoutSession } from '../types/workout';

export interface CalendarCell {
  dateString: string; // 'YYYY-MM-DD'
  dayNumber: number; // 1 ~ 31
  isCurrentMonth: boolean;
  isToday: boolean;
  dayOfWeek: number; // 0: 일요일, 1: 월요일, ..., 6: 토요일
  year: number;
  month: number; // 1 ~ 12
}

/**
 * 로컬 날짜 기준 'YYYY-MM-DD' 포맷 반환 (타임존 안전)
 */
export function formatLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 로컬 날짜 기준 'YYYY-MM' 포맷 반환 (타임존 안전)
 */
export function formatLocalMonth(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * 오늘 날짜 문자열 ('YYYY-MM-DD')
 */
export function getTodayString(): string {
  return formatLocalDate(new Date());
}

/**
 * 해당 연/월의 총 일수 반환 (month는 1-based: 1~12)
 * 표준 Date의 0일 트릭을 사용하여 28, 29(윤년), 30, 31일을 정확히 계산
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 해당 연/월 1일의 요일 반환 (0: 일요일 ~ 6: 토요일)
 */
export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * 이전 달 'YYYY-MM' 반환
 */
export function getPrevMonthString(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  return formatLocalMonth(prevDate);
}

/**
 * 다음 달 'YYYY-MM' 반환
 */
export function getNextMonthString(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const nextDate = new Date(y, m, 1);
  return formatLocalMonth(nextDate);
}

/**
 * 전날 'YYYY-MM-DD' 반환
 */
export function getPrevDayString(dateString: string): string {
  const [y, m, d] = dateString.split('-').map(Number);
  const prevDate = new Date(y, m - 1, d - 1);
  return formatLocalDate(prevDate);
}

/**
 * 다음날 'YYYY-MM-DD' 반환
 */
export function getNextDayString(dateString: string): string {
  const [y, m, d] = dateString.split('-').map(Number);
  const nextDate = new Date(y, m - 1, d + 1);
  return formatLocalDate(nextDate);
}

/**
 * 임의의 일수 n을 더하거나 뺀 'YYYY-MM-DD' 반환
 */
export function addDays(dateString: string, days: number): string {
  const [y, m, d] = dateString.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d + days);
  return formatLocalDate(targetDate);
}

/**
 * 7열 달력 그리드 셀 배열 생성
 * - 1일 시작 요일 전까지의 이전 달 날짜들(패딩)
 * - 현재 월의 1일 ~ 마지막 일
 * - 주차 마무리를 위한 다음 달 날짜들(패딩)
 */
export function generateCalendarGrid(
  yearMonth: string,
  todayStr: string = getTodayString()
): CalendarCell[] {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return [];
  }

  const firstDay = getFirstDayOfWeek(year, month);
  const daysInCurrentMonth = getDaysInMonth(year, month);

  const cells: CalendarCell[] = [];

  // 1. 이전 달 날짜 패딩
  if (firstDay > 0) {
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    const startPrevDay = daysInPrevMonth - firstDay + 1;

    for (let day = startPrevDay; day <= daysInPrevMonth; day++) {
      const dayStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(prevYear, prevMonth - 1, day).getDay();
      cells.push({
        dateString: dayStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dayStr === todayStr,
        dayOfWeek,
        year: prevYear,
        month: prevMonth,
      });
    }
  }

  // 2. 현재 월 날짜
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = (firstDay + (day - 1)) % 7;
    cells.push({
      dateString: dayStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dayStr === todayStr,
      dayOfWeek,
      year,
      month,
    });
  }

  // 3. 다음 달 날짜 패딩 (7열 완성: 5주=35칸 또는 6주=42칸)
  const remainder = cells.length % 7;
  if (remainder > 0) {
    const nextPaddingCount = 7 - remainder;
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    for (let day = 1; day <= nextPaddingCount; day++) {
      const dayStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = new Date(nextYear, nextMonth - 1, day).getDay();
      cells.push({
        dateString: dayStr,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: dayStr === todayStr,
        dayOfWeek,
        year: nextYear,
        month: nextMonth,
      });
    }
  }

  return cells;
}

/**
 * 과거 버그(toISOString().split('T')[0])로 인해
 * 로컬 시간대와 다르게 UTC 날짜로 기록된 운동 세션 날짜를 로컬 날짜로 자동 보정합니다.
 *
 * 보정 조건:
 * 1. session.startTime이 존재함
 * 2. startTime을 로컬로 파싱한 날짜(formatLocalDate(new Date(session.startTime)))와 session.date가 다름
 * 3. session.date가 startTime의 UTC 날짜(session.startTime.slice(0, 10))와 정확히 일치함
 *    (즉 운동 시작 시점에 toISOString().split('T')[0]이 그대로 session.date로 쓰였던 세션)
 */
export function migrateLegacySessionDates(sessions: WorkoutSession[]): {
  sessions: WorkoutSession[];
  migratedCount: number;
} {
  let migratedCount = 0;
  const migrated = sessions.map((s) => {
    if (!s.startTime) return s;
    const utcDateStr = s.startTime.slice(0, 10);
    const startDate = new Date(s.startTime);
    if (isNaN(startDate.getTime())) return s;

    const localDateStr = formatLocalDate(startDate);

    // 저장된 session.date가 UTC 날짜와 같고, 로컬 날짜와 다른 경우 (오전 0~9시 KST 운동 등)
    if (s.date === utcDateStr && s.date !== localDateStr) {
      migratedCount++;
      return {
        ...s,
        date: localDateStr,
      };
    }
    return s;
  });

  return { sessions: migrated, migratedCount };
}


import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(dateString: string, formatStr: string = 'yyyy년 MM월 dd일'): string {
  return format(parseISO(dateString), formatStr, { locale: ko });
}

export function formatTime(dateString: string): string {
  return format(parseISO(dateString), 'HH:mm', { locale: ko });
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/** `2026-05-06` 형태의 날짜 값 문자열. 서버 date 파라미터와 캘린더 key에 함께 사용합니다. */
export function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = startOfDay(date);
  next.setDate(next.getDate() + days);

  return next;
}

/** 일요일 시작 기준 주의 첫 날. */
export function getWeekStart(date: Date): Date {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

export function isSameDate(first: Date, second: Date): boolean {
  return formatDateValue(first) === formatDateValue(second);
}

export function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

const WEEKDAY_SHORT_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** 홈/컨디션 헤더의 날짜 라벨. 예: `{ year: '2026', date: '05.06.wed' }` */
export function formatCalendarDateLabel(date: Date): { year: string; date: string } {
  const weekday = WEEKDAY_SHORT_LABELS[date.getDay()] ?? '';

  return {
    year: String(date.getFullYear()),
    date: `${padNumber(date.getMonth() + 1)}.${padNumber(date.getDate())}.${weekday}`,
  };
}

import {
  addDays,
  formatCalendarDateLabel,
  formatDateValue,
  getWeekStart,
  startOfDay,
} from '@/lib/utils/date';

export { formatDateValue, isSameDate } from '@/lib/utils/date';

export type HomeViewMode = 'daily' | 'weekly' | 'monthly';

export interface HomeCalendarDay {
  date: Date;
  dateValue: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasMemo: boolean;
  scheduleCount: number;
  previewTitles: string[];
}

const WEEK_LENGTH = 7;
const MONTH_GRID_LENGTH = 42;
const DAY_MS = 24 * 60 * 60 * 1000;

export function getNextHomeViewMode(mode: HomeViewMode): HomeViewMode {
  switch (mode) {
    case 'daily':
      return 'weekly';
    case 'weekly':
      return 'monthly';
    case 'monthly':
      return 'daily';
  }
}

export function getZoomedHomeViewMode(mode: HomeViewMode, direction: 'in' | 'out'): HomeViewMode {
  if (direction === 'out') {
    return mode === 'daily' ? 'weekly' : 'monthly';
  }

  return mode === 'monthly' ? 'weekly' : 'daily';
}

export function getWeekDateValues(date: Date): string[] {
  const weekStart = getWeekStart(date);

  return Array.from({ length: WEEK_LENGTH }, (_, index) =>
    formatDateValue(addDays(weekStart, index)),
  );
}

export function getMonthDateValues(date: Date): string[] {
  const monthGridStart = getWeekStart(new Date(date.getFullYear(), date.getMonth(), 1));

  return Array.from({ length: MONTH_GRID_LENGTH }, (_, index) =>
    formatDateValue(addDays(monthGridStart, index)),
  );
}

export function toHomeCalendarDate(value: string): Date {
  const [year = '0', month = '1', day = '1'] = value.split('-');

  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function isPastDate(date: Date, today = new Date()): boolean {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

export function isWithinFutureDays(date: Date, days: number, today = new Date()): boolean {
  const diff = startOfDay(date).getTime() - startOfDay(today).getTime();

  return diff >= 0 && diff <= days * DAY_MS;
}

export function getHomeDateLabel(date: Date) {
  return formatCalendarDateLabel(date);
}

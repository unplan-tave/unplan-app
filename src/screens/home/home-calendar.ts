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

export function formatDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isSameDate(first: Date, second: Date): boolean {
  return formatDateValue(first) === formatDateValue(second);
}

export function isPastDate(date: Date, today = new Date()): boolean {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

export function isWithinFutureDays(date: Date, days: number, today = new Date()): boolean {
  const diff = startOfDay(date).getTime() - startOfDay(today).getTime();

  return diff >= 0 && diff <= days * DAY_MS;
}

export function getHomeDateLabel(date: Date) {
  const weekday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];

  return {
    year: String(date.getFullYear()),
    date: `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${weekday}`,
  };
}

function getWeekStart(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

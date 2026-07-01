import type { PinCardFormValues } from './model';

export interface DueDurationDraft {
  dueDate: string;
  durationHours: number;
  durationMinutes: number;
}

export function formatDueDateDisplay(dueDate: string): string {
  if (dueDate.trim().length === 0) {
    return '0000.00.00';
  }

  return dueDate.replace(/-/g, '.');
}

export function parseDueDateToDate(dueDate: string): Date | null {
  const parts = dueDate.replace(/-/g, '.').split('.');

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function formatDueDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function formatDueCountdown(dueDate: string, today = new Date()): string {
  const due = parseDueDateToDate(dueDate);

  if (due == null) {
    return 'D-0';
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'D-Day';
  }

  if (diffDays > 0) {
    return `D-${diffDays}`;
  }

  return `D+${Math.abs(diffDays)}`;
}

export function formatDurationDisplay(
  hours: number,
  minutes: number,
  options: { includeSuffix?: boolean; includePrefix?: boolean } = {},
): string {
  const { includeSuffix = true, includePrefix = true } = options;
  const prefix = includePrefix ? '약 ' : '';
  const suffix = includeSuffix ? ' 소요' : '';

  return `${prefix}${hours}시간 ${minutes}분${suffix}`;
}

export function hasQueueDuration(hours: number, minutes: number): boolean {
  return hours > 0 || minutes > 0;
}

export function hasDueDate(dueDate: string): boolean {
  return (dueDate ?? '').trim().length > 0;
}

export function isQueueFormComplete(
  values: Pick<PinCardFormValues, 'title' | 'dueDate' | 'durationHours' | 'durationMinutes'>,
): boolean {
  return (
    values.title.trim().length > 0 &&
    hasDueDate(values.dueDate) &&
    hasQueueDuration(values.durationHours, values.durationMinutes)
  );
}

export function isDueDateInPast(value: string, today = new Date()): boolean {
  const due = parseDueDateToDate(value);

  if (due == null || value.length === 0) {
    return false;
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return due.getTime() < todayStart.getTime();
}

export function compareDueDateValues(first: string, second: string): number {
  const firstDate = parseDueDateToDate(first);
  const secondDate = parseDueDateToDate(second);

  if (firstDate == null || secondDate == null) {
    return 0;
  }

  return firstDate.getTime() - secondDate.getTime();
}

export function getMockRecommendationLabel(): string {
  return '오늘 오후 2:00 ~ 6:30';
}

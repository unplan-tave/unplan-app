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

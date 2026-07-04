import { useMemo } from 'react';

/**
 * HH:MM 문자열 두 개를 받아 timeEnd > timeStart 인지 검사합니다.
 * 문자열 비교는 HH:MM 형식에서 숫자 비교와 동일합니다 (date-time-sheet 패턴과 일치).
 * 빈 문자열이 포함된 경우 검증 불가로 간주하여 true를 반환합니다.
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (startTime.length === 0 || endTime.length === 0) return true;
  return endTime > startTime;
}

export function useTimeRangeValidation(startTime: string, endTime: string): { isValid: boolean } {
  return useMemo(() => ({ isValid: isValidTimeRange(startTime, endTime) }), [startTime, endTime]);
}

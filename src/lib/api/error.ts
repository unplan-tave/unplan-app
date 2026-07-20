import { isAxiosError } from 'axios';

const SLEEP_CONDITION_OVERLAP_MESSAGE = '수면 시간대와 컨디션 시간이 겹칩니다.';

/** 수면·컨디션 기록이 같은 시간대에 저장됐을 때의 API 검증 오류인지 판별합니다. */
export function isSleepConditionOverlapError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;

  const data = error.response.data as { message?: unknown } | undefined;

  return data?.message === SLEEP_CONDITION_OVERLAP_MESSAGE;
}

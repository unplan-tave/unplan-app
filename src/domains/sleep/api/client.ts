/** 수면 기록의 generated endpoint 접근을 domain model로 감쌉니다. */
import { createSleep, deleteSleep, getSleep, updateSleep } from '@/lib/api/endpoints/sleep/sleep';

import { toSleepCreateRequest, toSleepRecord, toSleepUpdateRequest } from './mapper';

import type { SleepRecord, SleepRecordInput } from '../model';

/** 수면 기록을 생성합니다. */
export async function submitSleepRecord(input: SleepRecordInput): Promise<SleepRecord> {
  const response = await createSleep(toSleepCreateRequest(input));

  return toSleepRecord(response.data);
}

/** 수면 기록 하나를 조회합니다. */
export async function fetchSleepRecord(sleepId: number): Promise<SleepRecord> {
  const response = await getSleep(sleepId);

  return toSleepRecord(response.data);
}

/** 수면 기록을 수정합니다. */
export async function submitSleepRecordUpdate(
  sleepId: number,
  input: SleepRecordInput,
): Promise<SleepRecord> {
  const response = await updateSleep(sleepId, toSleepUpdateRequest(input));

  return toSleepRecord(response.data);
}

/** 수면 기록을 삭제합니다. */
export async function submitSleepRecordDelete(sleepId: number): Promise<void> {
  await deleteSleep(sleepId);
}

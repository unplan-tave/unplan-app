/**
 * condition 기록 API의 도메인 경계입니다.
 * 화면은 create/update endpoint를 직접 선택하지 않고, id 유무에 따라 저장 동작을 이 파일에 위임합니다.
 */
import {
  createCondition,
  deleteCondition,
  getCondition,
  updateCondition,
} from '@/lib/api/endpoints/condition/condition';
import { isSleepConditionOverlapError } from '@/lib/api/error';

import {
  toConditionCreateRequest,
  toConditionRecordEntryFromResponse,
  toConditionUpdateRequest,
} from './mapper';

import type { ConditionRecordEntry, ConditionRecordInput } from '../model';

export async function submitConditionRecord(
  input: ConditionRecordInput,
): Promise<ConditionRecordEntry> {
  if (input.id == null) {
    const response = await createCondition(toConditionCreateRequest(input));

    return toConditionRecordEntryFromResponse(response.data);
  }

  const response = await updateCondition(input.id, toConditionUpdateRequest(input));

  return toConditionRecordEntryFromResponse(response.data);
}

/** 수면 기록과 같은 시간대에 컨디션을 저장할 때 사용자에게 보여줄 문구입니다. */
export function getConditionSubmissionErrorMessage(error: unknown): string {
  if (isSleepConditionOverlapError(error)) {
    return '수면 시간대와 컨디션 시간이 겹칩니다.';
  }

  return '저장하지 못했어요. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
}

/** 단일 컨디션 기록을 domain model로 조회합니다. */
export async function fetchConditionRecord(conditionId: number): Promise<ConditionRecordEntry> {
  const response = await getCondition(conditionId);

  return toConditionRecordEntryFromResponse(response.data);
}

/** 단일 컨디션 기록을 삭제합니다. */
export async function submitConditionRecordDelete(conditionId: number): Promise<void> {
  await deleteCondition(conditionId);
}

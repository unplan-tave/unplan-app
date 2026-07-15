/**
 * condition 기록 API의 도메인 경계입니다.
 * 화면은 create/update endpoint를 직접 선택하지 않고, id 유무에 따라 저장 동작을 이 파일에 위임합니다.
 */
import { createCondition, updateCondition } from '@/lib/api/endpoints/condition/condition';

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

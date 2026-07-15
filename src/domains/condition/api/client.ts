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

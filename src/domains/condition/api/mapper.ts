/**
 * condition 기록 DTO와 화면 입력 모델 사이의 변환을 담당합니다.
 * 서버는 0~6 원점수와 percent 값을 섞어 내려주므로 화면에서 쓰는 값은 여기서 보정합니다.
 */
import type { ConditionRecordEntry, ConditionRecordInput } from '../model';
import type {
  ConditionCreate,
  ConditionRecord,
  ConditionResponse,
  ConditionUpdate,
} from '@/lib/api/model';

export function toConditionRecordEntry(record: ConditionRecord): ConditionRecordEntry {
  return {
    id: record.condition_id ?? 0,
    bodyScore: record.body_score ?? 0,
    mindScore: record.mind_score ?? 0,
    bodyScorePercent: record.body_score_percent ?? 0,
    mindScorePercent: record.mind_score_percent ?? 0,
    dateTime: record.date_time ?? '',
  };
}

export function toConditionRecordEntryFromResponse(
  response: ConditionResponse | undefined,
): ConditionRecordEntry {
  return {
    id: response?.conditionId ?? 0,
    bodyScore: response?.bodyScore ?? 0,
    mindScore: response?.mindScore ?? 0,
    bodyScorePercent: toScorePercent(response?.bodyScore),
    mindScorePercent: toScorePercent(response?.mindScore),
    dateTime: response?.dateTime ?? '',
  };
}

export function toConditionCreateRequest(input: ConditionRecordInput): ConditionCreate {
  return {
    body_score: input.bodyScore,
    mind_score: input.mindScore,
    date_time: input.dateTime,
  };
}

export function toConditionUpdateRequest(input: ConditionRecordInput): ConditionUpdate {
  return {
    body_score: input.bodyScore,
    mind_score: input.mindScore,
    date_time: input.dateTime,
  };
}

function toScorePercent(score: number | undefined): number {
  if (score == null || Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((score / 6) * 100)));
}

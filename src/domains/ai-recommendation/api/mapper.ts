/**
 * ai-recommendation API DTO를 화면에서 쓰는 도메인 모델로 변환합니다.
 * 서버 필드명과 추천 source_type 같은 계약 차이는 이 파일에서 흡수해
 * condition 화면과 settings 화면이 generated DTO 구조에 의존하지 않게 합니다.
 */
import { formatDurationCaption } from '@/domains/condition/recommendation';

import { parseClockToMinutes, toClockTime } from '../model';

import type {
  MinuteRange,
  QueueTimeRecommendationResult,
  RecommendationCriteriaSettings,
  ScheduleRecommendation,
} from '../model';
import type {
  ConditionFreeSlot,
  ConditionRecommendation,
  QueueConditionRecommendation,
  RecoveryConditionRecommendation,
} from '@/domains/condition/model';
import type { ConditionTagId } from '@/domains/schedule/model';
import type {
  ConditionRecommendationResponse,
  EmptyTime,
  EmptyTimeSettingRequestDto,
  EmptyTimeSettingResponseDto,
  RecommendBanTime,
  RecommendationAcceptRequest,
  RecommendationItem,
} from '@/lib/api/model';

function toMinuteRange(banTime: RecommendBanTime): MinuteRange {
  return {
    startMinutes: parseClockToMinutes(banTime.start_time ?? '00:00'),
    endMinutes: parseClockToMinutes(banTime.end_time ?? '00:00'),
  };
}

function toRecommendBanTime(range: MinuteRange): RecommendBanTime {
  return {
    start_time: toClockTime(range.startMinutes),
    end_time: toClockTime(range.endMinutes),
  };
}

export function toRecommendationCriteriaSettings(
  response: EmptyTimeSettingResponseDto | undefined,
): RecommendationCriteriaSettings {
  return {
    isRecommendOn: response?.is_empty_time_recommend_on ?? true,
    minFreeMinutes: response?.empty_time_criteria_minutes ?? 0,
    excludeEnabled: response?.is_recommend_ban_time_on ?? false,
    excludeRanges: (response?.recommend_ban_times ?? []).map(toMinuteRange),
  };
}

export function toEmptyTimeSettingRequest(
  settings: RecommendationCriteriaSettings,
): EmptyTimeSettingRequestDto {
  return {
    is_empty_time_recommend_on: settings.isRecommendOn,
    empty_time_criteria_minutes: settings.minFreeMinutes,
    is_recommend_ban_time_on: settings.excludeEnabled,
    recommend_ban_times: settings.excludeRanges.map(toRecommendBanTime),
  };
}

export function toConditionRecommendationViewModel(
  response: ConditionRecommendationResponse | undefined,
): {
  freeSlot: ConditionFreeSlot | null;
  summaryMessage: string | null;
  recommendations: ConditionRecommendation[];
} {
  return {
    freeSlot: toConditionFreeSlot(response?.empty_time),
    summaryMessage: response?.summary_message ?? null,
    recommendations: (response?.recommendations ?? []).flatMap(toConditionRecommendation),
  };
}

export function toRecommendationAcceptRequest(input: {
  keepQueueCard?: boolean;
  recoveryMean?: string;
}): RecommendationAcceptRequest {
  return {
    keep_queue_card: input.keepQueueCard,
    recovery_mean: input.recoveryMean,
  };
}

/** 일반 추천 목록 DTO를 화면 독립 추천 모델로 변환합니다. */
export function toScheduleRecommendations(response?: { recommendations?: RecommendationItem[] }) {
  return (response?.recommendations ?? []).flatMap(toScheduleRecommendation);
}

/** 불완전한 큐 시간 추천 응답을 검증한 값만 domain model로 노출합니다. */
export function toQueueTimeRecommendationResult(response: unknown): QueueTimeRecommendationResult {
  const value = isRecord(response) ? response : {};
  const items = Array.isArray(value.recommendations) ? value.recommendations : [];

  return {
    candidates: items.flatMap((item) =>
      isRecord(item) ? toScheduleRecommendation(item as RecommendationItem) : [],
    ),
    canExtendTo14Days: value.canExtendTo14Days === true,
    mustChangeDuration: value.mustChangeDuration === true,
  };
}

function toScheduleRecommendation(item: RecommendationItem): ScheduleRecommendation[] {
  if (item.recommend_id == null || !item.title || !item.start_time || !item.end_time) return [];

  return [
    {
      recommendId: item.recommend_id,
      title: item.title,
      date: item.deadline ?? '',
      startTime: item.start_time,
      endTime: item.end_time,
      estimatedMinutes: item.estimated_time ?? null,
      deadline: item.deadline ?? null,
    },
  ];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toConditionFreeSlot(emptyTime: EmptyTime | undefined): ConditionFreeSlot | null {
  if (
    emptyTime?.start_time == null ||
    emptyTime.end_time == null ||
    emptyTime.duration_minutes == null
  ) {
    return null;
  }

  return {
    startTime: emptyTime.start_time,
    endTime: emptyTime.end_time,
    durationMinutes: emptyTime.duration_minutes,
  };
}

function toConditionRecommendation(item: RecommendationItem): ConditionRecommendation[] {
  const sourceType = item.source_type?.toUpperCase();

  if (sourceType === 'RECOVERY') {
    return [toRecoveryRecommendation(item)];
  }

  return [toQueueRecommendation(item)];
}

function toQueueRecommendation(item: RecommendationItem): QueueConditionRecommendation {
  const estimatedMinutes = item.estimated_time ?? 0;

  return {
    kind: 'queue',
    id: String(item.recommend_id ?? item.display_order ?? item.title ?? ''),
    recommendId: item.recommend_id,
    title: item.title ?? '',
    conditionTagId: toConditionTagId(item.condition_tag),
    reason: item.match_tier ?? '',
    dueLabel: item.deadline == null || item.deadline.length === 0 ? null : `마감 ${item.deadline}`,
    durationLabel:
      estimatedMinutes > 0 ? formatDurationCaption(estimatedMinutes) : '소요 시간 미정',
  };
}

function toRecoveryRecommendation(item: RecommendationItem): RecoveryConditionRecommendation {
  const options = (item.recovery_means ?? []).map((label) => ({
    id: label,
    label,
  }));

  return {
    kind: 'recovery',
    id: String(item.recommend_id ?? item.display_order ?? 'recovery'),
    recommendId: item.recommend_id,
    reason: item.title ?? item.match_tier ?? '',
    durationLabel:
      item.estimated_time != null && item.estimated_time > 0
        ? formatDurationCaption(item.estimated_time)
        : '약 30분 소요',
    options,
  };
}

function toConditionTagId(value: string | undefined): ConditionTagId {
  switch (value) {
    case 'URGENT':
      return 'urgent';
    case 'CORE_TASK':
      return 'core';
    case 'BRAIN_WORK':
      return 'brain';
    case 'DAILY_TASK':
      return 'daily';
    case 'SIMPLE_TASK':
      return 'labor';
    case 'RECOVERY':
      return 'rest';
    default:
      return 'daily';
  }
}

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

/**
 * 서버에 이미 추가됐지만 현재 Orval 산출물에는 아직 반영되지 않은 추천 후보 필드입니다.
 * generated 모델을 수정하지 않고 API boundary에서만 확장 계약을 흡수합니다.
 */
interface ConditionRecommendationItem extends RecommendationItem {
  condition_tag_label?: string;
  suitability_message?: string;
  time_margin_message?: string;
}

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
  conditionTagId: ConditionTagId | null;
  conditionTagLabel: string | null;
  freeSlot: ConditionFreeSlot | null;
  summaryMessage: string | null;
  recommendations: ConditionRecommendation[];
} {
  return {
    conditionTagId: response?.condition_tag ? toConditionTagId(response.condition_tag) : null,
    conditionTagLabel: response?.condition_tag_label ?? null,
    freeSlot: toConditionFreeSlot(response?.empty_time),
    summaryMessage: response?.summary_message ?? null,
    recommendations: [...(response?.recommendations ?? [])]
      .sort(
        (first, second) => (first.display_order ?? Infinity) - (second.display_order ?? Infinity),
      )
      .flatMap(toConditionRecommendation),
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

function toConditionRecommendation(item: ConditionRecommendationItem): ConditionRecommendation[] {
  const sourceType = item.source_type?.toUpperCase();

  if (sourceType === 'RECOVERY') {
    return [toRecoveryRecommendation(item)];
  }

  return [toQueueRecommendation(item)];
}

function toQueueRecommendation(item: ConditionRecommendationItem): QueueConditionRecommendation {
  const estimatedMinutes = item.estimated_time ?? 0;

  return {
    kind: 'queue',
    id: String(item.recommend_id ?? item.display_order ?? item.title ?? ''),
    recommendId: item.recommend_id,
    title: item.title ?? '',
    conditionTagId: toConditionTagId(item.condition_tag),
    conditionTagLabel: item.condition_tag_label,
    reasonMessages: [item.suitability_message, item.time_margin_message].filter(
      (message): message is string => message != null && message.length > 0,
    ),
    dueLabel: item.deadline == null || item.deadline.length === 0 ? null : `마감 ${item.deadline}`,
    durationLabel:
      estimatedMinutes > 0 ? formatDurationCaption(estimatedMinutes) : '소요 시간 미정',
  };
}

function toRecoveryRecommendation(
  item: ConditionRecommendationItem,
): RecoveryConditionRecommendation {
  const options = (item.recovery_means ?? []).map((label) => ({
    id: label,
    label,
  }));

  return {
    kind: 'recovery',
    id: String(item.recommend_id ?? item.display_order ?? 'recovery'),
    recommendId: item.recommend_id,
    reasonMessages: [item.suitability_message, item.time_margin_message].filter(
      (message): message is string => message != null && message.length > 0,
    ),
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

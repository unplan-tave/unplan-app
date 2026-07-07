import { parseClockToMinutes, toClockTime } from '../model';

import type { MinuteRange, RecommendationCriteriaSettings } from '../model';
import type {
  EmptyTimeSettingRequestDto,
  EmptyTimeSettingResponseDto,
  RecommendBanTime,
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

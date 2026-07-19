/**
 * ai-recommendation 도메인의 서버 API 경계입니다.
 * 화면은 generated endpoint를 직접 호출하지 않고 이 파일의 함수만 통해
 * 추천 기준 설정, 컨디션 기반 추천 조회, 추천 수락 요청을 수행합니다.
 */
import {
  acceptRecommendation,
  getConditionRecommendations,
  getQueueCardRecommendations,
  getRecommendations,
} from '@/lib/api/endpoints/recommendation/recommendation';
import {
  getEmptyTimeRecommendSetting as getRecommendationCriteriaSetting,
  updateEmptyTimeRecommendSetting as updateRecommendationCriteriaSetting,
} from '@/lib/api/endpoints/setting-controller/setting-controller';

import {
  toConditionRecommendationViewModel,
  toEmptyTimeSettingRequest,
  toRecommendationAcceptRequest,
  toRecommendationCriteriaSettings,
  toQueueTimeRecommendationResult,
  toScheduleRecommendations,
} from './mapper';

import type {
  AcceptConditionRecommendationInput,
  QueueTimeRecommendationResult,
  RecommendationCriteriaSettings,
  ScheduleRecommendation,
} from '../model';
import type { ConditionFreeSlot, ConditionRecommendation } from '@/domains/condition/model';
import type { ConditionTagId } from '@/domains/schedule/model';

export interface ConditionRecommendationResult {
  conditionTagId: ConditionTagId | null;
  conditionTagLabel: string | null;
  freeSlot: ConditionFreeSlot | null;
  summaryMessage: string | null;
  recommendations: ConditionRecommendation[];
}

export async function fetchRecommendationCriteriaSettings(): Promise<RecommendationCriteriaSettings> {
  const response = await getRecommendationCriteriaSetting();

  return toRecommendationCriteriaSettings(response.data);
}

export async function submitRecommendationCriteriaSettings(
  settings: RecommendationCriteriaSettings,
): Promise<void> {
  await updateRecommendationCriteriaSetting(toEmptyTimeSettingRequest(settings));
}

export async function fetchConditionRecommendations(
  date: string,
): Promise<ConditionRecommendationResult> {
  const response = await getConditionRecommendations({ date });

  return toConditionRecommendationViewModel(response.data);
}

export async function submitAcceptConditionRecommendation(
  input: AcceptConditionRecommendationInput,
): Promise<void> {
  await acceptRecommendation(
    input.recommendId,
    toRecommendationAcceptRequest({
      keepQueueCard: input.keepQueueCard,
      recoveryMean: input.recoveryMean,
    }),
  );
}

/** 특정 날짜의 일반 큐 카드 추천을 조회합니다. */
export async function fetchScheduleRecommendations(
  date: string,
): Promise<ScheduleRecommendation[]> {
  return toScheduleRecommendations(await getRecommendations({ date }));
}

/** 특정 큐 카드의 추천 시간대를 조회합니다. */
export async function fetchQueueTimeRecommendations(
  scheduleId: number,
  days = 7,
): Promise<QueueTimeRecommendationResult> {
  return toQueueTimeRecommendationResult(await getQueueCardRecommendations(scheduleId, { days }));
}

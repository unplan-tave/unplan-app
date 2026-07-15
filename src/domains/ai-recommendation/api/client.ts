import {
  acceptRecommendation,
  getConditionRecommendations,
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
} from './mapper';

import type { AcceptConditionRecommendationInput, RecommendationCriteriaSettings } from '../model';
import type { ConditionFreeSlot, ConditionRecommendation } from '@/domains/condition/model';

export interface ConditionRecommendationResult {
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

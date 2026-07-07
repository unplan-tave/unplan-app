import {
  getEmptyTimeRecommendSetting,
  updateEmptyTimeRecommendSetting,
} from '@/lib/api/endpoints/setting-controller/setting-controller';

import { toEmptyTimeSettingRequest, toRecommendationCriteriaSettings } from './mapper';

import type { RecommendationCriteriaSettings } from '../model';

export async function fetchRecommendationCriteriaSettings(): Promise<RecommendationCriteriaSettings> {
  const response = await getEmptyTimeRecommendSetting();

  return toRecommendationCriteriaSettings(response.data);
}

export async function submitRecommendationCriteriaSettings(
  settings: RecommendationCriteriaSettings,
): Promise<void> {
  await updateEmptyTimeRecommendSetting(toEmptyTimeSettingRequest(settings));
}

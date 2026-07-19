/** 추천 조건 화면의 설정 상태와 헤더 이동 이벤트를 조합합니다. */
import { useRouter } from 'expo-router';

import { formatDurationLabel } from '@/domains/ai-recommendation/model';

import { useRecommendationCriteria } from './use-recommendation-criteria';

/** 추천 조건 화면에 필요한 상태와 이벤트를 반환합니다. */
export function useRecommendationCriteriaScreen() {
  const router = useRouter();
  const criteria = useRecommendationCriteria();
  const minFreeTimeLabel = formatDurationLabel(criteria.criteria.minFreeMinutes);

  /** 이전 설정 화면으로 돌아갑니다. */
  const handleBack = () => router.back();

  return { ...criteria, minFreeTimeLabel, handleBack };
}

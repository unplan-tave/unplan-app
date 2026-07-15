/**
 * ai-recommendation 관련 query key factory입니다.
 * 추천 실행 결과와 추천 기준 설정은 갱신 주기가 다르므로 서로 다른 root key로 분리합니다.
 */
export const aiRecommendationQueryKeys = {
  all: ['ai-recommendation'] as const,
  condition: (date: string) => [...aiRecommendationQueryKeys.all, 'condition', date] as const,
};

export const recommendationCriteriaQueryKeys = {
  all: ['recommendation-criteria'] as const,
  settings: () => [...recommendationCriteriaQueryKeys.all, 'settings'] as const,
};

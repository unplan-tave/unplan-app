export const aiRecommendationQueryKeys = {
  all: ['ai-recommendation'] as const,
  condition: (date: string) => [...aiRecommendationQueryKeys.all, 'condition', date] as const,
};

export const recommendationCriteriaQueryKeys = {
  all: ['recommendation-criteria'] as const,
  settings: () => [...recommendationCriteriaQueryKeys.all, 'settings'] as const,
};

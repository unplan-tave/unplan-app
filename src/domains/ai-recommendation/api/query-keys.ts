export const recommendationCriteriaQueryKeys = {
  all: ['recommendation-criteria'] as const,
  settings: () => [...recommendationCriteriaQueryKeys.all, 'settings'] as const,
};

/**
 * onboarding query key factory입니다.
 * 설정 종류별 캐시를 분리해 각 settings edit 화면의 저장 후 갱신 범위를 좁힙니다.
 */
export const onboardingQueryKeys = {
  all: ['onboarding'] as const,
  recoveryMethods: () => [...onboardingQueryKeys.all, 'recovery-methods'] as const,
  sleepCondition: () => [...onboardingQueryKeys.all, 'sleep-condition'] as const,
  activityPattern: () => [...onboardingQueryKeys.all, 'activity-pattern'] as const,
  transport: () => [...onboardingQueryKeys.all, 'transport'] as const,
};

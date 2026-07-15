/**
 * onboarding settings query key factory입니다.
 * 설정 종류별 캐시를 분리해 각 settings edit 화면의 저장 후 갱신 범위를 좁힙니다.
 */
export const onboardingSettingsQueryKeys = {
  all: ['onboarding-settings'] as const,
  recoveryMethods: () => [...onboardingSettingsQueryKeys.all, 'recovery-methods'] as const,
  sleepCondition: () => [...onboardingSettingsQueryKeys.all, 'sleep-condition'] as const,
  activityPattern: () => [...onboardingSettingsQueryKeys.all, 'activity-pattern'] as const,
  transport: () => [...onboardingSettingsQueryKeys.all, 'transport'] as const,
};

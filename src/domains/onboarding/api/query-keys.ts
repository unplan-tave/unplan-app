export const onboardingSettingsQueryKeys = {
  all: ['onboarding-settings'] as const,
  recoveryMethods: () => [...onboardingSettingsQueryKeys.all, 'recovery-methods'] as const,
  sleepCondition: () => [...onboardingSettingsQueryKeys.all, 'sleep-condition'] as const,
  activityPattern: () => [...onboardingSettingsQueryKeys.all, 'activity-pattern'] as const,
  transport: () => [...onboardingSettingsQueryKeys.all, 'transport'] as const,
};

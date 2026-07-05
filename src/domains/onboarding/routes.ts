import { type Href } from 'expo-router';

export const onboardingRoutes = {
  intro: '/onboarding/intro',
  recovery: '/onboarding/recovery',
  sleep: '/onboarding/sleep',
  activity: '/onboarding/activity',
  transport: '/onboarding/transport',
} as const satisfies Record<string, Href>;

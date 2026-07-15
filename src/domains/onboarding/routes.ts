/**
 * onboarding flow의 route 경로 정의입니다.
 * 화면 이동 순서를 store와 screen이 문자열 중복 없이 공유하도록 합니다.
 */
import { type Href } from 'expo-router';

export const onboardingRoutes = {
  intro: '/onboarding/intro',
  recovery: '/onboarding/recovery',
  sleep: '/onboarding/sleep',
  activity: '/onboarding/activity',
  transport: '/onboarding/transport',
} as const satisfies Record<string, Href>;

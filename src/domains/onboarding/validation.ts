/**
 * onboarding 제출 전 선호값을 검증하는 순수 로직입니다.
 * 화면은 반환된 translation key만 사용하고, 필수 입력 판단은 이 파일에 모읍니다.
 */
import type { OnboardingPreferences } from './model';
import type { TranslationKey } from '@/translations/ko';

export function validateOnboardingPreferences(
  preferences: OnboardingPreferences,
): TranslationKey | null {
  const hasRecoveryMethod =
    preferences.recoveryOptionIds.some((optionId) => optionId !== 'custom') ||
    Boolean(preferences.customRecoveryLabel?.trim());

  if (!hasRecoveryMethod) {
    return 'onboarding.error.recoveryRequired';
  }

  if (preferences.sleepTimeRanges.length === 0) {
    return 'onboarding.error.sleepTimeRequired';
  }

  return null;
}

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

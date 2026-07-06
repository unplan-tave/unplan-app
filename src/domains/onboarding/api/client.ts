import { isAxiosError } from 'axios';

import { saveOnboarding } from '@/lib/api/endpoints/onboarding/onboarding';
import { t } from '@/lib/i18n';

import { toOnboardingRequest } from './mapper';

import type { OnboardingPreferences } from '../model';

export function getOnboardingSubmissionErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof responseData.message === 'string'
    ) {
      return responseData.message;
    }

    return t('onboarding.error.network');
  }

  return error instanceof Error ? error.message : t('onboarding.error.saveFailed');
}

export async function submitOnboarding(preferences: OnboardingPreferences): Promise<void> {
  const response = await saveOnboarding(toOnboardingRequest(preferences));

  if (!response || response.success !== true) {
    throw new Error(response?.message ?? t('onboarding.error.saveFailed'));
  }
}

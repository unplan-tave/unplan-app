import { isAxiosError } from 'axios';

import { saveOnboarding } from '@/lib/api/endpoints/onboarding/onboarding';
import {
  getBiorhythm,
  getRecoveryMethods,
  getSleepConditions,
  getTransport,
  updateBiorhythm,
  updateRecoveryMethods,
  updateSleepConditions,
  updateTransport,
} from '@/lib/api/endpoints/setting-onboarding/setting-onboarding';
import { t } from '@/lib/i18n';

import {
  toActivityPatternSettings,
  toBiorhythmRequest,
  toOnboardingRequest,
  toRecoveryMethodsSettings,
  toSleepConditionSettings,
  toTransportOptionIds,
  toTransportRequest,
  toUpdateConditionsRequest,
  toUpdateMethodsRequest,
} from './mapper';

import type {
  ActivityPatternSettings,
  OnboardingPreferences,
  RecoveryMethodsSettings,
  SleepConditionSettings,
  TransportOptionId,
} from '../model';

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

export async function fetchRecoveryMethodsSettings(): Promise<RecoveryMethodsSettings> {
  const response = await getRecoveryMethods();

  return toRecoveryMethodsSettings(response.data);
}

export async function submitRecoveryMethodsSettings(
  settings: RecoveryMethodsSettings,
): Promise<void> {
  await updateRecoveryMethods(toUpdateMethodsRequest(settings));
}

export async function fetchSleepConditionSettings(): Promise<SleepConditionSettings> {
  const response = await getSleepConditions();

  return toSleepConditionSettings(response.data);
}

export async function submitSleepConditionSettings(
  settings: SleepConditionSettings,
): Promise<void> {
  await updateSleepConditions(toUpdateConditionsRequest(settings));
}

export async function fetchActivityPatternSettings(): Promise<ActivityPatternSettings> {
  const response = await getBiorhythm();

  return toActivityPatternSettings(response.data);
}

export async function submitActivityPatternSettings(
  settings: ActivityPatternSettings,
): Promise<void> {
  await updateBiorhythm(toBiorhythmRequest(settings));
}

export async function fetchTransportSettings(): Promise<TransportOptionId[]> {
  const response = await getTransport();

  return toTransportOptionIds(response.data);
}

export async function submitTransportSettings(optionIds: TransportOptionId[]): Promise<void> {
  await updateTransport(toTransportRequest(optionIds));
}

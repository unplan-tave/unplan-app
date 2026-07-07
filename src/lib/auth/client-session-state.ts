import { useRecommendationCriteriaStore } from '@/domains/ai-recommendation/use-recommendation-criteria-store';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { queryClient } from '@/lib/api/query-client';
import { mmkvStorage } from '@/lib/storage/mmkv-storage';

const LEGACY_CLIENT_STATE_KEYS = [
  'card-store',
  'onboarding.completed',
  'ai-recommendation.criteria',
] as const;

export function clearClientSessionState() {
  queryClient.clear();
  useScheduleStore.getState().resetClientState();
  useOnboardingStore.getState().resetOnboarding();
  useRecommendationCriteriaStore.getState().resetClientState();

  LEGACY_CLIENT_STATE_KEYS.forEach((key) => {
    mmkvStorage.remove(key);
  });
}

import { produce } from 'immer';
import { create } from 'zustand';

import { DEFAULT_EXCLUDE_RANGE, DEFAULT_RECOMMENDATION_CRITERIA, sortMinuteRanges } from './model';

import type { MinuteRange, RecommendationCriteria } from './model';

interface RecommendationCriteriaState {
  criteria: RecommendationCriteria;
  setMinFreeMinutes: (minutes: number) => void;
  setExcludeEnabled: (enabled: boolean) => void;
  addExcludeRange: (range: MinuteRange) => void;
  updateExcludeRange: (index: number, range: MinuteRange) => void;
  removeExcludeRange: (index: number) => void;
  setPushEnabled: (enabled: boolean) => void;
  resetClientState: () => void;
}

export const useRecommendationCriteriaStore = create<RecommendationCriteriaState>()((set) => {
  const update = (recipe: (criteria: RecommendationCriteria) => void) =>
    set(
      produce((state: RecommendationCriteriaState) => {
        recipe(state.criteria);
      }),
    );

  return {
    criteria: DEFAULT_RECOMMENDATION_CRITERIA,

    setMinFreeMinutes: (minutes) =>
      update((criteria) => {
        criteria.minFreeMinutes = Math.max(0, minutes);
      }),

    setExcludeEnabled: (enabled) =>
      update((criteria) => {
        criteria.excludeEnabled = enabled;

        // Figma: 토글을 켰을 때 시간대가 비어 있으면 기본 시간대 하나가 자동으로 추가됩니다.
        if (enabled && criteria.excludeRanges.length === 0) {
          criteria.excludeRanges = [DEFAULT_EXCLUDE_RANGE];
        }
      }),

    addExcludeRange: (range) =>
      update((criteria) => {
        criteria.excludeRanges = sortMinuteRanges([...criteria.excludeRanges, range]);
      }),

    updateExcludeRange: (index, range) =>
      update((criteria) => {
        if (criteria.excludeRanges[index]) {
          criteria.excludeRanges[index] = range;
          criteria.excludeRanges = sortMinuteRanges(criteria.excludeRanges);
        }
      }),

    removeExcludeRange: (index) =>
      update((criteria) => {
        criteria.excludeRanges = criteria.excludeRanges.filter((_, i) => i !== index);
      }),

    setPushEnabled: (enabled) =>
      update((criteria) => {
        criteria.pushEnabled = enabled;
      }),

    resetClientState: () => {
      set({ criteria: DEFAULT_RECOMMENDATION_CRITERIA });
    },
  };
});

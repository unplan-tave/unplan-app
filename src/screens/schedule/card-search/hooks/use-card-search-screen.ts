import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { canSubmitCardSearch, normalizeCardSearchQuery } from '@/domains/schedule/search';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

export function useCardSearchScreen() {
  const recentSearches = useScheduleStore((store) => store.cardRecentSearches);
  const addRecentSearch = useScheduleStore((store) => store.addCardRecentSearch);
  const deleteRecentSearch = useScheduleStore((store) => store.deleteCardRecentSearch);
  const deleteAllRecentSearches = useScheduleStore((store) => store.deleteAllCardRecentSearches);
  const [query, setQuery] = useState('');

  const submitSearch = useCallback(
    (value: string) => {
      if (!canSubmitCardSearch(value)) {
        return;
      }

      const normalized = normalizeCardSearchQuery(value);

      addRecentSearch(normalized);
      router.navigate({ pathname: '/schedule', params: { q: normalized } });
    },
    [addRecentSearch],
  );

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return {
    query,
    setQuery,
    recentSearches,
    submitSearch,
    deleteRecentSearch,
    deleteAllRecentSearches,
    handleBack,
  };
}

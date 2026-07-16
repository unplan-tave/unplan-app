import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useScheduleSearchQuery } from '@/domains/schedule/api/queries';
import { toCardItemsFromScheduleList } from '@/domains/schedule/card-mapper';
import {
  createDefaultCardListFilters,
  groupCardsByMonth,
  hasActiveCardListFilter,
  toggleCardListFilterValue,
  type CardListFilters,
  type CardListMultiFilterKey,
} from '@/domains/schedule/list';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';
import { useTabNavigation } from '@/hooks/use-tab-navigation';

import type { CardProgressStatus } from '@/domains/schedule/model';

const API_STATUS_BY_PROGRESS: Record<CardProgressStatus, string> = {
  incomplete: 'TODO',
  in_progress: 'IN_PROGRESS',
  complete: 'DONE',
};

const API_CONDITION_BY_TAG_ID: Record<CardListFilters['conditionTagIds'][number], string> = {
  urgent: 'URGENT',
  core: 'CORE_TASK',
  brain: 'BRAIN_WORK',
  daily: 'DAILY_TASK',
  labor: 'SIMPLE_TASK',
  rest: 'RECOVERY',
};
const CARD_LIST_SEARCH_SORT_BY = 'CREATED_AT_DESC';

export function useCardListScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const personalTags = useScheduleStore((store) => store.personalTags);
  const [filters, setFilters] = useState<CardListFilters>(() => createDefaultCardListFilters());
  const [expandedFilter, setExpandedFilter] = useState<CardListMultiFilterKey | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);

      return () => setIsScreenFocused(false);
    }, []),
  );

  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery: q ?? '' }));
  }, [q]);

  const searchInput = useMemo(
    () => ({
      keyword: filters.searchQuery,
      isQueue: filters.cardType === 'all' ? undefined : filters.cardType === 'queue' ? true : false,
      status:
        filters.progressStatuses[0] == null
          ? undefined
          : API_STATUS_BY_PROGRESS[filters.progressStatuses[0]],
      conditionTags: filters.conditionTagIds.map((tagId) => API_CONDITION_BY_TAG_ID[tagId]),
      personalTags: personalTags
        .filter((tag) => filters.personalTagIds.includes(tag.id))
        .map((tag) => tag.label),
      sortBy: CARD_LIST_SEARCH_SORT_BY,
    }),
    [
      filters.cardType,
      filters.conditionTagIds,
      filters.personalTagIds,
      filters.progressStatuses,
      filters.searchQuery,
      personalTags,
    ],
  );
  const scheduleSearchQuery = useScheduleSearchQuery(searchInput, {
    enabled: isScreenFocused,
  });
  const cards = useMemo(
    () => toCardItemsFromScheduleList(scheduleSearchQuery.data ?? [], personalTags),
    [personalTags, scheduleSearchQuery.data],
  );
  const filteredCards = cards;
  const sections = useMemo(() => groupCardsByMonth(filteredCards), [filteredCards]);
  const hasActiveFilter = useMemo(() => hasActiveCardListFilter(filters), [filters]);

  const handleCardPress = useCallback((cardId: string) => {
    router.push(`/card/view?cardId=${cardId}`);
  }, []);

  const handleCreateCard = useCallback(() => {
    router.push('/card/card-detail');
  }, []);

  const handleSearchPress = useCallback(() => {
    router.push('/card/search');
  }, []);

  const handleSearchClear = useCallback(() => {
    router.setParams({ q: '' });
  }, []);

  const handleNavItemPress = useTabNavigation();

  const handleChangeCardType = useCallback((cardType: CardListFilters['cardType']) => {
    setFilters((prev) => ({ ...prev, cardType }));
  }, []);

  const toggleProgressStatus = useCallback((status: CardProgressStatus) => {
    setFilters((prev) => ({
      ...prev,
      progressStatuses: toggleCardListFilterValue(prev.progressStatuses, status),
    }));
  }, []);

  const toggleConditionTag = useCallback((tagId: CardListFilters['conditionTagIds'][number]) => {
    setFilters((prev) => ({
      ...prev,
      conditionTagIds: toggleCardListFilterValue(prev.conditionTagIds, tagId),
    }));
  }, []);

  const togglePersonalTag = useCallback((tagId: string) => {
    setFilters((prev) => ({
      ...prev,
      personalTagIds: toggleCardListFilterValue(prev.personalTagIds, tagId),
    }));
  }, []);

  const toggleExpandedFilter = useCallback((key: CardListMultiFilterKey) => {
    setExpandedFilter((prev) => (prev === key ? null : key));
  }, []);

  return {
    filters,
    expandedFilter,
    personalTags,
    filteredCards,
    sections,
    hasActiveFilter,
    isLoading: scheduleSearchQuery.isLoading,
    isError: scheduleSearchQuery.isError,
    handleCardPress,
    handleCreateCard,
    handleSearchPress,
    handleSearchClear,
    handleNavItemPress,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
  };
}

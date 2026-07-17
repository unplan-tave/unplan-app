import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScheduleSearchQuery } from '@/domains/schedule/api/queries';
import { toCardItemsFromScheduleList } from '@/domains/schedule/card-mapper';
import {
  groupCardsByMonth,
  hasActiveCardListFilter,
  progressStatusToScheduleStatus,
} from '@/domains/schedule/list';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import { useCardListFilters } from './use-card-list-filters';

/** 카드 목록 화면의 조회·필터·이동 이벤트를 조합합니다. */
export function useCardListScreen() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const personalTags = useScheduleStore((store) => store.personalTags);
  const {
    filters,
    expandedFilter,
    handleChangeCardType,
    toggleConditionTag,
    toggleExpandedFilter,
    togglePersonalTag,
    toggleProgressStatus,
  } = useCardListFilters(q);
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);

      return () => setIsScreenFocused(false);
    }, []),
  );

  const searchInput = useMemo(
    () => ({
      keyword: filters.searchQuery,
      isQueue: filters.cardType === 'all' ? undefined : filters.cardType === 'queue' ? true : false,
      status: filters.progressStatuses.map(progressStatusToScheduleStatus),
      conditionTagIds: filters.conditionTagIds,
      personalTags: personalTags
        .filter((tag) => filters.personalTagIds.includes(tag.id))
        .map((tag) => tag.label),
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

  const handleSearchPress = useCallback(() => {
    router.push('/card/search');
  }, []);

  const handleSearchClear = useCallback(() => {
    router.setParams({ q: '' });
  }, []);

  return {
    insets,
    filters,
    expandedFilter,
    personalTags,
    filteredCards,
    sections,
    hasActiveFilter,
    isLoading: scheduleSearchQuery.isLoading,
    isError: scheduleSearchQuery.isError,
    handleCardPress,
    handleSearchPress,
    handleSearchClear,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
  };
}

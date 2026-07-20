import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  useInfiniteScheduleSearchQuery,
  usePersonalTagsQuery,
} from '@/domains/schedule/api/queries';
import { toCardItemsFromScheduleList } from '@/domains/schedule/card-mapper';
import {
  formatCardListPeriodLabel,
  groupCardsByMonth,
  hasActiveCardListFilter,
  progressStatusToScheduleStatus,
} from '@/domains/schedule/list';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import { useCardListFilters } from './use-card-list-filters';
import { useCardListInfiniteScroll } from './use-card-list-infinite-scroll';

/** 카드 목록 화면의 조회·필터·이동 이벤트를 조합합니다. */
export function useCardListScreen() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const storedPersonalTags = useScheduleStore((store) => store.personalTags);
  const setPersonalTags = useScheduleStore((store) => store.setPersonalTags);
  const {
    filters,
    expandedFilter,
    handleChangeCardType,
    toggleConditionTag,
    toggleExpandedFilter,
    togglePersonalTag,
    toggleProgressStatus,
    isDateRangeSheetVisible,
    openDateRangeSheet,
    closeDateRangeSheet,
    applyDateRange,
  } = useCardListFilters(q);
  const personalTagsQuery = usePersonalTagsQuery({
    enabled: expandedFilter === 'personal',
  });
  const personalTags = personalTagsQuery.data ?? storedPersonalTags;
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  useEffect(() => {
    if (personalTagsQuery.data != null) {
      setPersonalTags(personalTagsQuery.data);
    }
  }, [personalTagsQuery.data, setPersonalTags]);

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
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    [
      filters.cardType,
      filters.conditionTagIds,
      filters.personalTagIds,
      filters.progressStatuses,
      filters.searchQuery,
      filters.startDate,
      filters.endDate,
      personalTags,
    ],
  );
  const scheduleSearchQuery = useInfiniteScheduleSearchQuery(searchInput, {
    enabled: isScreenFocused,
  });
  const schedules = useMemo(
    () => scheduleSearchQuery.data?.pages.flatMap((page) => page.schedules) ?? [],
    [scheduleSearchQuery.data],
  );
  const cards = useMemo(
    () => toCardItemsFromScheduleList(schedules, personalTags),
    [personalTags, schedules],
  );
  const filteredCards = cards;
  const sections = useMemo(() => groupCardsByMonth(filteredCards), [filteredCards]);
  const hasActiveFilter = useMemo(() => hasActiveCardListFilter(filters), [filters]);

  const handleCardPress = useCallback((cardId: string) => {
    router.push(`/card/view?cardId=${cardId}&returnTo=card-list`);
  }, []);

  const handleSearchPress = useCallback(() => {
    router.push('/card/search');
  }, []);

  const handleSearchClear = useCallback(() => {
    router.setParams({ q: '' });
  }, []);
  const handleScroll = useCardListInfiniteScroll({
    hasNextPage: scheduleSearchQuery.hasNextPage,
    isFetchingNextPage: scheduleSearchQuery.isFetchingNextPage,
    fetchNextPage: scheduleSearchQuery.fetchNextPage,
  });

  return {
    insets,
    filters,
    expandedFilter,
    personalTags,
    filteredCards,
    sections,
    hasActiveFilter,
    totalCards: scheduleSearchQuery.data?.pages[0]?.totalElements ?? 0,
    periodLabel: formatCardListPeriodLabel(filters.startDate, filters.endDate),
    isLoading: scheduleSearchQuery.isLoading,
    isError: scheduleSearchQuery.isError,
    isFetchingNextPage: scheduleSearchQuery.isFetchingNextPage,
    handleScroll,
    handleCardPress,
    handleSearchPress,
    handleSearchClear,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
    isDateRangeSheetVisible,
    openDateRangeSheet,
    closeDateRangeSheet,
    applyDateRange,
    isPersonalTagsLoading: expandedFilter === 'personal' && personalTagsQuery.isLoading,
    isPersonalTagsError: expandedFilter === 'personal' && personalTagsQuery.isError,
  };
}

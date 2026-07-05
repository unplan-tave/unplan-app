import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createDefaultCardListFilters,
  filterCardsForList,
  groupCardsByMonth,
  hasActiveCardListFilter,
  toggleCardListFilterValue,
  type CardListFilters,
  type CardListMultiFilterKey,
} from '@/domains/schedule/list';
import { useScheduleStore } from '@/domains/schedule/use-schedule-store';

import type { CardProgressStatus } from '@/domains/schedule/model';

export function useCardListScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const cards = useScheduleStore((store) => store.cards);
  const personalTags = useScheduleStore((store) => store.personalTags);
  const [filters, setFilters] = useState<CardListFilters>(() => createDefaultCardListFilters());
  const [expandedFilter, setExpandedFilter] = useState<CardListMultiFilterKey | null>(null);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, searchQuery: q ?? '' }));
  }, [q]);

  const filteredCards = useMemo(() => filterCardsForList(cards, filters), [cards, filters]);
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

  const handleNavItemPress = useCallback((value: string) => {
    if (value === 'home') {
      router.navigate('/(tabs)');
      return;
    }

    if (value === 'setting') {
      router.navigate('/settings');
      return;
    }

    router.navigate('/schedule');
  }, []);

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

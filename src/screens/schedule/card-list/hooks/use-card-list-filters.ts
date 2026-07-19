import { useCallback, useEffect, useState } from 'react';

import {
  createDefaultCardListFilters,
  toggleCardListFilterValue,
  type CardListFilters,
  type CardListMultiFilterKey,
} from '@/domains/schedule/list';

import type { CardProgressStatus } from '@/domains/schedule/model';

/** 카드 목록의 필터 선택 상태와 토글 이벤트를 관리합니다. */
export function useCardListFilters(searchQuery: string | undefined) {
  const [filters, setFilters] = useState<CardListFilters>(() => createDefaultCardListFilters());
  const [expandedFilter, setExpandedFilter] = useState<CardListMultiFilterKey | null>(null);

  useEffect(() => {
    setFilters((previous) => ({ ...previous, searchQuery: searchQuery ?? '' }));
  }, [searchQuery]);

  const handleChangeCardType = useCallback((cardType: CardListFilters['cardType']) => {
    setFilters((previous) => ({ ...previous, cardType }));
  }, []);
  const toggleExpandedFilter = useCallback((key: CardListMultiFilterKey) => {
    setExpandedFilter((previous) => (previous === key ? null : key));
  }, []);
  const toggleProgressStatus = useCallback((status: CardProgressStatus) => {
    setFilters((previous) => ({
      ...previous,
      progressStatuses: toggleCardListFilterValue(previous.progressStatuses, status),
    }));
  }, []);
  const toggleConditionTag = useCallback((tagId: CardListFilters['conditionTagIds'][number]) => {
    setFilters((previous) => ({
      ...previous,
      conditionTagIds: toggleCardListFilterValue(previous.conditionTagIds, tagId),
    }));
  }, []);
  const togglePersonalTag = useCallback((tagId: string) => {
    setFilters((previous) => ({
      ...previous,
      personalTagIds: toggleCardListFilterValue(previous.personalTagIds, tagId),
    }));
  }, []);

  return {
    filters,
    expandedFilter,
    handleChangeCardType,
    toggleExpandedFilter,
    toggleProgressStatus,
    toggleConditionTag,
    togglePersonalTag,
  };
}

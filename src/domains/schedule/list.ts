/**
 * schedule list/card 표시용 파생 값을 만드는 순수 로직입니다.
 * 일정 기간, due date, condition tag label 등 리스트 UI에 필요한 계산을 제공합니다.
 */
import { getConditionTagById } from './model';
import {
  formatDurationDisplay,
  hasDueDate,
  hasQueueDurationOrUnknown,
  UNKNOWN_DURATION_LABEL,
} from './queue';

import type {
  CardItem,
  CardProgressStatus,
  CardTab,
  ConditionTagId,
  PersonalTagOption,
  ScheduleStatus,
} from './model';

export type CardTypeFilter = 'all' | CardTab;
export type CardListMultiFilterKey = 'cardType' | 'progress' | 'condition' | 'personal';

export interface CardListTagItem {
  label: string;
  variant: 'condition' | 'personal';
  condition?: ConditionTagId;
}

export interface CardListFilters {
  cardType: CardTypeFilter;
  progressStatuses: CardProgressStatus[];
  conditionTagIds: ConditionTagId[];
  personalTagIds: string[];
  searchQuery: string;
}

export interface CardListMonthSection {
  monthKey: string;
  monthLabel: string;
  cards: CardItem[];
}

const ALL_PROGRESS_STATUSES: CardProgressStatus[] = ['incomplete', 'in_progress', 'complete'];

export function getCardProgressStatus(card: CardItem): CardProgressStatus {
  return card.progressStatus ?? 'in_progress';
}

const PROGRESS_STATUS_TO_SCHEDULE_STATUS: Record<CardProgressStatus, ScheduleStatus> = {
  incomplete: 'todo',
  in_progress: 'inProgress',
  complete: 'done',
};

/** 홈 진행도 세그먼트(시작전/진행중/완료) 선택 값을 일정 수정 API 상태로 변환합니다. */
export function progressStatusToScheduleStatus(status: CardProgressStatus): ScheduleStatus {
  return PROGRESS_STATUS_TO_SCHEDULE_STATUS[status];
}

export function getCardSortDate(card: CardItem): string {
  if (card.cardType === 'queue') {
    return hasDueDate(card.dueDate) ? card.dueDate : '9999.12.31';
  }

  if (card.dateMode === 'range' && card.dateStart.length > 0) {
    return card.dateStart;
  }

  if (card.dateMode === 'single' && card.dateStart.length > 0) {
    return card.dateStart;
  }

  return '9999.12.31';
}

export function getCardMonthKey(card: CardItem): string {
  const sortDate = getCardSortDate(card);
  const parts = sortDate.split('.');

  if (parts.length < 2) {
    return sortDate;
  }

  return `${parts[0]}.${parts[1]}`;
}

export function formatCardListMonthLabel(monthKey: string): string {
  if (monthKey.startsWith('9999')) {
    return '기한 없음';
  }

  return monthKey;
}

export function formatShortDateLabel(dateValue: string): string {
  const parts = dateValue.split('.');

  if (parts.length < 3) {
    return dateValue;
  }

  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!Number.isFinite(month) || !Number.isFinite(day)) {
    return dateValue;
  }

  return `${month}/${day}`;
}

export function formatPinDateMeta(card: CardItem): { primary: string; secondary: string | null } {
  if (card.dateMode === 'range' && card.dateStart.length > 0 && card.dateEnd.length > 0) {
    return {
      primary: `${formatShortDateLabel(card.dateStart)} - ${formatShortDateLabel(card.dateEnd)}`,
      secondary:
        card.timeFilled && card.timeStart.length > 0 && card.timeEnd.length > 0
          ? `${card.timeStart} - ${card.timeEnd}`
          : null,
    };
  }

  if (card.dateStart.length > 0) {
    return {
      primary: formatShortDateLabel(card.dateStart),
      secondary:
        card.timeFilled && card.timeStart.length > 0 && card.timeEnd.length > 0
          ? `${card.timeStart} - ${card.timeEnd}`
          : null,
    };
  }

  return { primary: '-', secondary: null };
}

export function formatQueueDateMeta(card: CardItem): { primary: string; secondary: string | null } {
  const dueLabel = hasDueDate(card.dueDate) ? `~ ${formatShortDateLabel(card.dueDate)}` : null;

  let durationLabel: string | null = null;

  if (card.durationUnknown) {
    durationLabel = UNKNOWN_DURATION_LABEL;
  } else if (hasQueueDurationOrUnknown(card.durationHours, card.durationMinutes, false)) {
    durationLabel = formatDurationDisplay(card.durationHours, card.durationMinutes);
  }

  if (dueLabel == null && durationLabel == null) {
    return { primary: '-', secondary: null };
  }

  if (dueLabel != null && durationLabel != null) {
    return { primary: dueLabel, secondary: durationLabel };
  }

  return { primary: dueLabel ?? durationLabel ?? '-', secondary: null };
}

export function sortCardsForList(cards: CardItem[]): CardItem[] {
  return [...cards].sort((first, second) => {
    const dateCompare = getCardSortDate(first).localeCompare(getCardSortDate(second));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return first.title.localeCompare(second.title, 'ko');
  });
}

export function filterCardsForList(cards: CardItem[], filters: CardListFilters): CardItem[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();
  const activeProgress =
    filters.progressStatuses.length === 0 ||
    filters.progressStatuses.length === ALL_PROGRESS_STATUSES.length
      ? null
      : new Set(filters.progressStatuses);

  return cards.filter((card) => {
    if (filters.cardType !== 'all' && card.cardType !== filters.cardType) {
      return false;
    }

    if (activeProgress != null && !activeProgress.has(getCardProgressStatus(card))) {
      return false;
    }

    if (
      filters.conditionTagIds.length > 0 &&
      !filters.conditionTagIds.includes(card.conditionTagId)
    ) {
      return false;
    }

    if (
      filters.personalTagIds.length > 0 &&
      !card.personalTagIds.some((tagId) => filters.personalTagIds.includes(tagId))
    ) {
      return false;
    }

    if (normalizedQuery.length > 0 && !card.title.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    return true;
  });
}

export function groupCardsByMonth(cards: CardItem[]): CardListMonthSection[] {
  const sortedCards = sortCardsForList(cards);
  const sections: CardListMonthSection[] = [];

  sortedCards.forEach((card) => {
    const monthKey = getCardMonthKey(card);
    const existingSection = sections.find((section) => section.monthKey === monthKey);

    if (existingSection != null) {
      existingSection.cards.push(card);
      return;
    }

    sections.push({
      monthKey,
      monthLabel: formatCardListMonthLabel(monthKey),
      cards: [card],
    });
  });

  return sections;
}

export function createDefaultCardListFilters(): CardListFilters {
  return {
    cardType: 'all',
    progressStatuses: [],
    conditionTagIds: [],
    personalTagIds: [],
    searchQuery: '',
  };
}

export function hasActiveCardListFilter(filters: CardListFilters): boolean {
  return (
    filters.cardType !== 'all' ||
    filters.progressStatuses.length > 0 ||
    filters.conditionTagIds.length > 0 ||
    filters.personalTagIds.length > 0 ||
    filters.searchQuery.trim().length > 0
  );
}

export function buildCardListTags(
  card: CardItem,
  personalTags: PersonalTagOption[],
): CardListTagItem[] {
  const conditionTag = getConditionTagById(card.conditionTagId);
  const cardPersonalTagLabels = getCardPersonalTagLabels(card, personalTags);

  return [
    {
      label: conditionTag.label,
      variant: 'condition',
      condition: card.conditionTagId,
    },
    ...cardPersonalTagLabels.map((label) => ({
      label,
      variant: 'personal' as const,
    })),
  ];
}

export function getCardPersonalTagLabels(card: CardItem, personalTags: PersonalTagOption[]) {
  const selectedLabels = personalTags
    .filter((tag) => card.personalTagIds.includes(tag.id))
    .map((tag) => tag.label);

  return [...new Set([...card.personalTagLabels, ...selectedLabels])];
}

export function toggleCardListFilterValue<T extends string>(values: T[], value: T): T[] {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}

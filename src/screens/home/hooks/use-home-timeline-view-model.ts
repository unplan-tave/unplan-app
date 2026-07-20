import { useMemo } from 'react';

import { parseTimeToMinutes } from '@/domains/schedule/time';
import { isSameDate } from '@/lib/utils/date';

import {
  formatHomeCurrentTime,
  toHomeRecommendationTimelineCardViewModel,
  toHomeTimelineCardViewModel,
} from '../home-screen-logic';

import type { ScheduleRecommendation } from '@/domains/ai-recommendation/model';
import type { CardItem, PersonalTagOption } from '@/domains/schedule/model';

const HOME_TIMELINE_TOP_PLACEHOLDER_COUNT = 2;
const HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO = 1.1;

type TimelineItem =
  | { kind: 'schedule'; card: CardItem }
  | { kind: 'recommendation'; recommendation: ScheduleRecommendation };

interface TimelineTimeRange {
  cardId: string;
  startMinutes: number;
  endMinutes: number;
}

function getTimelineTimeRange(item: TimelineItem): TimelineTimeRange | null {
  const startTime = item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime;
  const endTime = item.kind === 'schedule' ? item.card.timeEnd : item.recommendation.endTime;
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return null;
  }

  return {
    cardId:
      item.kind === 'schedule' ? item.card.id : `recommendation-${item.recommendation.recommendId}`,
    startMinutes,
    endMinutes,
  };
}

/** 타임라인 카드 props와 현재 시각 marker 위치를 조합합니다. */
export function useHomeTimelineViewModel({
  timelineCards,
  visibleRecommendations,
  personalTags,
  selectedDate,
  now,
  onCardPress,
  onAddRecommendation,
  onDismissRecommendation,
  onOpenAddSheet,
}: {
  timelineCards: CardItem[];
  visibleRecommendations: ScheduleRecommendation[];
  personalTags: PersonalTagOption[];
  selectedDate: Date;
  now: Date;
  onCardPress: (card: CardItem) => void;
  onAddRecommendation: (recommendId: number) => void;
  onDismissRecommendation: (recommendId: number) => void;
  onOpenAddSheet: () => void;
}) {
  const timelineItems = useMemo(
    () =>
      [
        ...timelineCards.map((card) => ({ kind: 'schedule' as const, card })),
        ...visibleRecommendations.map((recommendation) => ({
          kind: 'recommendation' as const,
          recommendation,
        })),
      ].sort((first, second) => {
        const firstStartTime =
          first.kind === 'schedule' ? first.card.timeStart : first.recommendation.startTime;
        const secondStartTime =
          second.kind === 'schedule' ? second.card.timeStart : second.recommendation.startTime;

        return firstStartTime.localeCompare(secondStartTime);
      }),
    [timelineCards, visibleRecommendations],
  );

  /** 타임라인 렌더링에 필요한 카드 props와 이벤트를 조합합니다. */
  const timelineCardsForView = useMemo(() => {
    const cards = timelineItems.map((item) => {
      if (item.kind === 'recommendation') {
        return {
          ...toHomeRecommendationTimelineCardViewModel(item.recommendation),
          helperText: '잠깐 쉬는 게 어떨까요?',
          onAddPress: () => onAddRecommendation(item.recommendation.recommendId),
          onDismissPress:
            item.recommendation.conditionTagId === 'rest'
              ? undefined
              : () => onDismissRecommendation(item.recommendation.recommendId),
        };
      }

      return {
        ...toHomeTimelineCardViewModel(item.card, personalTags, false),
        onPress: () => onCardPress(item.card),
      };
    });

    const placeholders = Array.from(
      { length: HOME_TIMELINE_TOP_PLACEHOLDER_COUNT },
      (_, index) => ({
        id: `placeholder-${index}`,
        kind: 'placeholder' as const,
        time: '00:00',
        title: '',
        range: '',
      }),
    );

    const addCard =
      cards.length === 0
        ? [
            {
              id: 'add-schedule',
              kind: 'add' as const,
              time: '00:00',
              title: '일정을 추가해 볼까요?',
              range: '00:00 - 00:00',
              tags: [
                {
                  label: '일상 작업',
                  variant: 'condition' as const,
                  condition: 'daily' as const,
                },
              ],
              onPress: onOpenAddSheet,
            },
          ]
        : [];

    return [...placeholders, ...cards, ...addCard];
  }, [
    onAddRecommendation,
    onCardPress,
    onDismissRecommendation,
    onOpenAddSheet,
    personalTags,
    timelineItems,
  ]);

  const currentTimeMarker = useMemo(() => {
    if (!isSameDate(selectedDate, now)) return null;

    if (timelineItems.length === 0) {
      return {
        startCardId: 'add-schedule',
        endCardId: 'add-schedule',
        offsetRatio: HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO,
      };
    }

    const currentMinutes = parseTimeToMinutes(formatHomeCurrentTime(now));
    if (currentMinutes == null) return null;

    const timeRanges = timelineItems
      .map(getTimelineTimeRange)
      .filter((timeRange): timeRange is TimelineTimeRange => timeRange != null);
    const activeRange = timeRanges.findLast(
      (timeRange) =>
        timeRange.startMinutes <= currentMinutes && currentMinutes < timeRange.endMinutes,
    );

    if (activeRange != null) {
      return {
        startCardId: activeRange.cardId,
        endCardId: activeRange.cardId,
        offsetRatio:
          (currentMinutes - activeRange.startMinutes) /
          (activeRange.endMinutes - activeRange.startMinutes),
      };
    }

    const previousRange = timeRanges.findLast(
      (timeRange) => timeRange.endMinutes <= currentMinutes,
    );
    const nextRange = timeRanges.find((timeRange) => timeRange.startMinutes > currentMinutes);

    if (previousRange != null && nextRange != null) {
      return {
        startCardId: previousRange.cardId,
        endCardId: nextRange.cardId,
        // 일정에 속하지 않는 시간은 기존 카드 간격의 가운데에만 표시합니다.
        offsetRatio: 0.5,
      };
    }

    if (previousRange != null) {
      return { startCardId: previousRange.cardId, endCardId: previousRange.cardId, offsetRatio: 1 };
    }

    if (nextRange != null) {
      return { startCardId: nextRange.cardId, endCardId: nextRange.cardId, offsetRatio: 0 };
    }

    return {
      startCardId: 'add-schedule',
      endCardId: 'add-schedule',
      offsetRatio: HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO,
    };
  }, [now, selectedDate, timelineItems]);

  return { timelineCardsForView, currentTimeMarker };
}

import { useMemo } from 'react';

import { isSameDate } from '@/lib/utils/date';

import {
  formatHomeCurrentTime,
  toHomeRecommendationTimelineCardViewModel,
  toHomeTimelineCardViewModel,
} from '../home-screen-logic';

import type { ScheduleRecommendation } from '@/domains/ai-recommendation/model';
import type { CardItem, PersonalTagOption } from '@/domains/schedule/model';

const HOME_TIMELINE_TOP_PLACEHOLDER_COUNT = 2;
const HOME_TIMELINE_TOP_HALF_PLACEHOLDER_HEIGHT = 54;
const HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO = 1.1;

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
          onDismissPress: () => onDismissRecommendation(item.recommendation.recommendId),
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
        placeholderHeight:
          cards.length > 0 && index === HOME_TIMELINE_TOP_PLACEHOLDER_COUNT - 1
            ? HOME_TIMELINE_TOP_HALF_PLACEHOLDER_HEIGHT
            : undefined,
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
      return { cardId: 'add-schedule', offsetRatio: HOME_TIMELINE_EMPTY_ADD_MARKER_OFFSET_RATIO };
    }

    const currentTime = formatHomeCurrentTime(now);
    const currentItemIndex = timelineItems.findIndex((item) => {
      const startTime =
        item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime;
      const endTime = item.kind === 'schedule' ? item.card.timeEnd : item.recommendation.endTime;

      return startTime <= currentTime && currentTime < endTime;
    });

    if (currentItemIndex >= 0) {
      const item = timelineItems[currentItemIndex];
      const startTime =
        item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime;
      const endTime = item.kind === 'schedule' ? item.card.timeEnd : item.recommendation.endTime;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const currentMinutes = currentHour * 60 + currentMinute;

      return {
        cardId:
          item.kind === 'schedule'
            ? item.card.id
            : `recommendation-${item.recommendation.recommendId}`,
        offsetRatio:
          endMinutes - startMinutes > 0
            ? (currentMinutes - startMinutes) / (endMinutes - startMinutes)
            : 0,
      };
    }

    const passedScheduleCount = timelineItems.filter(
      (item) =>
        (item.kind === 'schedule' ? item.card.timeStart : item.recommendation.startTime) <=
        currentTime,
    ).length;

    const previousItem = timelineItems[passedScheduleCount - 1] ?? timelineItems[0];

    return {
      cardId:
        previousItem.kind === 'schedule'
          ? previousItem.card.id
          : `recommendation-${previousItem.recommendation.recommendId}`,
      offsetRatio: passedScheduleCount === 0 ? 0 : 1,
    };
  }, [now, selectedDate, timelineItems]);

  return { timelineCardsForView, currentTimeMarker };
}

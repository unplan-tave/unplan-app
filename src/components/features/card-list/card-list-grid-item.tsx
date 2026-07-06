import { useCallback, useMemo } from 'react';

import { buildCardListTags } from '@/domains/schedule/list';

import { CardListPinItem } from './card-list-pin-item';
import { CardListQueueItem } from './card-list-queue-item';

import type { CardItem, PersonalTagOption } from '@/domains/schedule/model';

export function CardListGridItem({
  card,
  personalTags,
  onPress,
}: {
  card: CardItem;
  personalTags: PersonalTagOption[];
  onPress: (cardId: string) => void;
}) {
  const tags = useMemo(() => buildCardListTags(card, personalTags), [card, personalTags]);
  const handlePress = useCallback(() => {
    onPress(card.id);
  }, [card.id, onPress]);

  if (card.cardType === 'queue') {
    return <CardListQueueItem card={card} tags={tags} onPress={handlePress} />;
  }

  return <CardListPinItem card={card} tags={tags} onPress={handlePress} />;
}

import { useMemo } from 'react';

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
  onPress: () => void;
}) {
  const tags = useMemo(() => buildCardListTags(card, personalTags), [card, personalTags]);

  if (card.cardType === 'queue') {
    return <CardListQueueItem card={card} tags={tags} onPress={onPress} />;
  }

  return <CardListPinItem card={card} tags={tags} onPress={onPress} />;
}

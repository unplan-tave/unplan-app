import { StyleSheet, View } from 'react-native';

import { Card, CardTagList, type CardTagItem } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { formatPinDateMeta, getCardProgressStatus } from '@/domains/card/list';

import { CardListMetaRow } from './card-list-meta-row';
import { CARD_TITLE_LINE_HEIGHT } from './card-list-typography';

import type { CardItem } from '@/domains/card/model';

export function CardListPinItem({
  card,
  tags,
  onPress,
}: {
  card: CardItem;
  tags: CardTagItem[];
  onPress?: () => void;
}) {
  const isComplete = getCardProgressStatus(card) === 'complete';
  const dateMeta = formatPinDateMeta(card);
  const titleColor = isComplete ? colors.gray[500] : colors.gray[800];

  return (
    <Card
      variant="glass"
      accessibilityLabel={`${card.title} 핀 카드`}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.titleBlock}>
          <Typography
            variant="titleS"
            color={titleColor}
            numberOfLines={2}
            style={[styles.title, isComplete && styles.completedTitle]}
          >
            {card.title}
          </Typography>
          <CardListMetaRow
            primary={dateMeta.primary}
            secondary={dateMeta.secondary}
            color={colors.gray[500]}
            dividerColor={colors.gray[300]}
          />
        </View>
        <CardTagList tags={tags} maxVisible={2} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  content: {
    gap: spacing[2] - 2,
  },
  titleBlock: {
    gap: spacing[0] + 2,
  },
  title: {
    lineHeight: CARD_TITLE_LINE_HEIGHT,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});

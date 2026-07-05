import { StyleSheet, View } from 'react-native';

import { CardListMetaRow } from '@/components/features/card/list/card-list-meta-row';
import { CARD_TITLE_LINE_HEIGHT } from '@/components/features/card/list/card-list-typography';
import { Card, CardTagList, type CardTagItem } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { formatQueueDateMeta, getCardProgressStatus } from '@/state/card/list';

import type { CardItem } from '@/state/card/model';

export function CardListQueueItem({
  card,
  tags,
  onPress,
}: {
  card: CardItem;
  tags: CardTagItem[];
  onPress?: () => void;
}) {
  const isComplete = getCardProgressStatus(card) === 'complete';
  const dateMeta = formatQueueDateMeta(card);
  const titleColor = isComplete ? colors.gray[500] : colors.gray[800];

  return (
    <Card
      variant="glass"
      accessibilityLabel={`${card.title} 큐 카드`}
      style={[styles.card, styles.queueCard]}
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
            color={colors.gray[600]}
            dividerColor={colors.gray[400]}
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
  queueCard: {
    borderRadius: radius.md,
    borderColor: colors.gray.white,
    backgroundColor: colors.alpha.white20,
    shadowOpacity: 0,
    elevation: 0,
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

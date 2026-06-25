import { StyleSheet, View } from 'react-native';

import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type CardTagItem, type CardTagListProps } from './card.types';

export function CardTagList({ tags = [], maxVisible = 3, style, moreTextStyle }: CardTagListProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(tags.length - visibleTags.length, 0);

  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {visibleTags.map((tag, index) => renderTag(tag, index))}
      {hiddenCount > 0 ? (
        <Typography variant="tag" color={colors.gray[500]} style={moreTextStyle}>
          +{hiddenCount}
        </Typography>
      ) : null}
    </View>
  );
}

function renderTag(tag: CardTagItem, index: number) {
  const key = `${tag.label}-${index}`;

  if (tag.variant === 'condition' && tag.condition) {
    return <Tag key={key} variant="condition" condition={tag.condition} label={tag.label} />;
  }

  return <Tag key={key} variant="personal" label={tag.label} />;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
});

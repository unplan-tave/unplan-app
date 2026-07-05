import { StyleSheet, View } from 'react-native';

import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { type ConditionTagOption, type PersonalTagOption } from '@/domains/card/model';

export function CardViewHeader({
  title,
  conditionTag,
  personalTags,
}: {
  title: string;
  conditionTag: ConditionTagOption;
  personalTags: PersonalTagOption[];
}) {
  return (
    <View style={styles.head}>
      <Typography variant="display" color={colors.gray[900]}>
        {title}
      </Typography>
      <View style={styles.tagRow}>
        <Tag variant="condition" condition={conditionTag.id} label={conditionTag.label} />
        {personalTags.map((tag) => (
          <Tag key={tag.id} variant="personal" label={tag.label} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    width: '100%',
    gap: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    flexWrap: 'wrap',
  },
});

import { StyleSheet, View } from 'react-native';

import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { type ConditionTagOption } from '@/domains/schedule/model';

export function CardViewHeader({
  title,
  conditionTag,
  personalTagLabels,
}: {
  title: string;
  conditionTag: ConditionTagOption;
  personalTagLabels: string[];
}) {
  return (
    <View style={styles.head}>
      <Typography variant="display" color={colors.gray[900]}>
        {title}
      </Typography>
      <View style={styles.tagRow}>
        <Tag variant="condition" condition={conditionTag.id} label={conditionTag.label} />
        {personalTagLabels.map((label) => (
          <Tag key={label} variant="personal" label={label} />
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

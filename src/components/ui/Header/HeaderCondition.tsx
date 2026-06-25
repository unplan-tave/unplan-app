import { StyleSheet, View } from 'react-native';

import { Tag } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type HeaderConditionProps } from './header.types';

export function HeaderCondition({ title, condition, style }: HeaderConditionProps) {
  return (
    <View style={[styles.container, style]}>
      <Typography variant="titleS" color={colors.gray[800]} numberOfLines={1}>
        {title}
      </Typography>
      <Tag variant="condition" condition={condition} label="컨디션" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
});

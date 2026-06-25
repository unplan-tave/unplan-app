import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import { type RecommendCardProps } from './recommendCard.types';

export function RecommendCard({
  title,
  description,
  caption,
  iconName = 'done',
  selected = false,
  disabled = false,
  style,
  ...props
}: RecommendCardProps) {
  return (
    <Card
      selected={selected}
      disabled={disabled}
      variant="glass"
      style={[styles.card, style]}
      {...props}
    >
      <View style={styles.iconBox}>
        <Icon name={iconName} color={selected ? colors.primary : colors.gray[500]} />
      </View>
      <View style={styles.text}>
        <Typography variant="titleS" color={colors.gray[800]} numberOfLines={1}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="bodyS" color={colors.gray[500]} numberOfLines={2}>
            {description}
          </Typography>
        ) : null}
        {caption ? (
          <Typography variant="caption" color={colors.gray[400]} numberOfLines={1}>
            {caption}
          </Typography>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.gray[50],
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Tag, type ConditionType } from '@/components/ui/Tag';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type ConditionCardProps } from './conditionCard.types';

export function ConditionCard({
  title,
  description,
  condition,
  selected = false,
  disabled = false,
  style,
  ...props
}: ConditionCardProps) {
  return (
    <Card
      selected={selected}
      disabled={disabled}
      variant="glass"
      style={[styles.card, style]}
      {...props}
    >
      <View style={styles.header}>
        <Typography variant="titleS" color={colors.gray[800]} numberOfLines={1}>
          {title}
        </Typography>
        <Tag variant="condition" condition={condition} label={getConditionLabel(condition)} />
      </View>
      {description ? (
        <Typography variant="bodyS" color={colors.gray[500]} numberOfLines={2}>
          {description}
        </Typography>
      ) : null}
    </Card>
  );
}

function getConditionLabel(condition: ConditionType) {
  const labels: Record<ConditionType, string> = {
    brain: '두뇌',
    labor: '노동',
    daily: '일상',
    urgent: '긴급',
    rest: '회복',
    core: '핵심',
  };

  return labels[condition];
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
});

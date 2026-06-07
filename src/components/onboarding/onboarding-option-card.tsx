import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

interface OnboardingOptionCardProps {
  label: string;
  icon: string;
  isCustom?: boolean;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const ONBOARDING_OPTION_CARD_WIDTH = 128;
const ONBOARDING_OPTION_CARD_HEIGHT = 140;

export function OnboardingOptionCard({
  label,
  icon,
  isCustom = false,
  selected,
  disabled = false,
  onPress,
}: OnboardingOptionCardProps) {
  return (
    <Card
      accessibilityLabel={label}
      disabled={disabled}
      selected={selected}
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        {isCustom ? (
          <Icon name="plus" size={56} color={selected ? colors.primary : colors.gray[200]} />
        ) : (
          <Typography style={styles.emoji} align="center">
            {icon}
          </Typography>
        )}
      </View>
      <Typography
        variant="titleS"
        color={disabled ? colors.gray[400] : selected ? colors.primary : colors.gray[700]}
        align="center"
      >
        {label}
      </Typography>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ONBOARDING_OPTION_CARD_WIDTH,
    height: ONBOARDING_OPTION_CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
    gap: 12,
  },
  iconBox: {
    width: 89,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    lineHeight: 57,
  },
});

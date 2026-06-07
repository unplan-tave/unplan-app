import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

interface OnboardingOptionCardProps {
  label: string;
  icon: string;
  selected: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function OnboardingOptionCard({
  label,
  icon,
  selected,
  disabled = false,
  onPress,
}: OnboardingOptionCardProps) {
  const isCustom = icon === 'plus';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selectedCard,
        disabled && styles.disabledCard,
        pressed && !disabled && styles.pressed,
      ]}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 128,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 18,
    gap: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(36,141,254,0.1)',
  },
  disabledCard: {
    backgroundColor: colors.alpha.white20,
    borderColor: colors.gray[200],
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
  pressed: {
    opacity: 0.72,
  },
});

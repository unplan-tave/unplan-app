import { useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';
import { fontFamilyWeight } from '@/constants/typography';

interface OnboardingOptionCardProps {
  label: string;
  icon: string;
  isCustom?: boolean;
  selected: boolean;
  disabled?: boolean;
  editing?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onInputSubmit?: () => void;
  onPress: () => void;
}

export const ONBOARDING_OPTION_CARD_WIDTH = 128;
const ONBOARDING_OPTION_CARD_HEIGHT = 140;
const CUSTOM_LABEL_DISPLAY_LENGTH = 6;

export function OnboardingOptionCard({
  label,
  icon,
  isCustom = false,
  selected,
  disabled = false,
  editing = false,
  inputValue = '',
  onInputChange,
  onInputSubmit,
  onPress,
}: OnboardingOptionCardProps) {
  const inputRef = useRef<TextInput>(null);
  const hasCustomValue = isCustom && inputValue.trim().length > 0;
  const displayedLabel =
    isCustom && inputValue ? inputValue.slice(0, CUSTOM_LABEL_DISPLAY_LENGTH) : label;

  useEffect(() => {
    if (editing) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [editing]);

  return (
    <Card
      accessibilityLabel={label}
      disabled={disabled}
      selected={selected}
      style={styles.card}
      onPress={editing ? () => undefined : onPress}
    >
      <View style={styles.iconBox}>
        {hasCustomValue && !editing ? (
          <Typography style={styles.emoji} align="center">
            🧢
          </Typography>
        ) : isCustom ? (
          <Icon name="plus" size={56} color={selected ? colors.primary : colors.gray[200]} />
        ) : (
          <Typography style={styles.emoji} align="center">
            {icon}
          </Typography>
        )}
      </View>
      {isCustom && editing ? (
        <TextInput
          ref={inputRef}
          accessibilityLabel="직접 입력할 회복 방법"
          enablesReturnKeyAutomatically
          maxLength={255}
          returnKeyType="done"
          selectionColor={colors.primary}
          style={styles.customInput}
          value={inputValue}
          onChangeText={onInputChange}
          onEndEditing={onInputSubmit}
        />
      ) : (
        <Typography
          variant="titleS"
          color={disabled ? colors.gray[400] : selected ? colors.primary : colors.gray[700]}
          align="center"
          numberOfLines={1}
          style={isCustom && inputValue ? styles.customLabel : undefined}
        >
          {displayedLabel}
        </Typography>
      )}
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
  customInput: {
    width: 108,
    padding: 0,
    color: colors.gray[700],
    fontFamily: fontFamilyWeight.semiBold,
    fontSize: 18,
    lineHeight: 28.8,
    letterSpacing: -0.36,
    textAlign: 'center',
  },
  customLabel: {
    textDecorationLine: 'underline',
  },
});

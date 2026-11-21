import { StyleSheet, View } from 'react-native';

import { ONBOARDING_OPTION_CARD_WIDTH, OnboardingOptionCard } from './onboarding-option-card';

import type { StyleProp, ViewStyle } from 'react-native';

interface OnboardingOption {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
  disabled?: boolean;
}

interface OnboardingOptionGridProps<TOptionId extends string> {
  options: ReadonlyArray<OnboardingOption & { id: TOptionId }>;
  selectedIds: readonly TOptionId[];
  onToggle: (optionId: TOptionId) => void;
  customEditing?: boolean;
  customInputValue?: string;
  onCustomInputChange?: (value: string) => void;
  onCustomInputSubmit?: () => void;
  style?: StyleProp<ViewStyle>;
}

const GRID_COLUMNS = 2;
const GRID_GAP = 16;
const GRID_WIDTH = ONBOARDING_OPTION_CARD_WIDTH * GRID_COLUMNS + GRID_GAP;

export function OnboardingOptionGrid<TOptionId extends string>({
  options,
  selectedIds,
  onToggle,
  customEditing = false,
  customInputValue = '',
  onCustomInputChange,
  onCustomInputSubmit,
  style,
}: OnboardingOptionGridProps<TOptionId>) {
  return (
    <View style={[styles.grid, style]}>
      {options.map((option) => (
        <OnboardingOptionCard
          key={option.id}
          label={option.label}
          icon={option.icon}
          isCustom={option.isCustom}
          selected={selectedIds.includes(option.id) && !(option.isCustom && customEditing)}
          disabled={option.disabled}
          editing={option.isCustom && customEditing}
          inputValue={option.isCustom ? customInputValue : undefined}
          onInputChange={option.isCustom ? onCustomInputChange : undefined}
          onInputSubmit={option.isCustom ? onCustomInputSubmit : undefined}
          onPress={() => onToggle(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: GRID_WIDTH,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
});

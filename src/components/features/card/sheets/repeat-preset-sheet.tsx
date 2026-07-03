import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { type RecurrencePreset, type RecurrenceValue } from '@/state/card/recurrence';

const PRESET_OPTIONS: ReadonlyArray<{
  preset: Exclude<RecurrencePreset, 'custom'>;
  label: string;
}> = [
  { preset: 'daily', label: '매일' },
  { preset: 'weekly', label: '매주' },
  { preset: 'monthly', label: '매월' },
  { preset: 'yearly', label: '매년' },
];

interface RepeatPresetBottomSheetProps {
  visible: boolean;
  value: RecurrenceValue | null;
  onClose: () => void;
  onOpenCustom: () => void;
  onDone: (preset: Exclude<RecurrencePreset, 'custom'>) => void;
}

export function RepeatPresetSheet({
  visible,
  value,
  onClose,
  onOpenCustom,
  onDone,
}: RepeatPresetBottomSheetProps) {
  const [selectedPreset, setSelectedPreset] = useState<Exclude<RecurrencePreset, 'custom'> | null>(
    null,
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (value != null && value.preset !== 'custom') {
      setSelectedPreset(value.preset);
      return;
    }

    setSelectedPreset(null);
  }, [value, visible]);

  const canDone = selectedPreset != null;

  const handleDone = () => {
    if (selectedPreset == null) {
      return;
    }

    onDone(selectedPreset);
  };

  return (
    <BottomSheet visible={visible} contentStyle={styles.sheet} onClose={onClose}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="반복 설정 취소"
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={onClose}
        >
          <Typography variant="bodyM" color={colors.primary}>
            취소
          </Typography>
        </Pressable>
        <Typography
          pointerEvents="none"
          variant="bodyM"
          color={colors.gray[900]}
          align="center"
          style={styles.headerTitle}
        >
          반복
        </Typography>
        <Pressable
          accessibilityLabel="반복 설정 완료"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canDone }}
          disabled={!canDone}
          hitSlop={8}
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={handleDone}
        >
          <Typography variant="bodyM" color={canDone ? colors.primary : colors.gray[400]}>
            완료
          </Typography>
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.presetGrid}>
          {PRESET_OPTIONS.map((option) => {
            const selected = selectedPreset === option.preset;

            return (
              <Pressable
                key={option.preset}
                accessibilityLabel={`${option.label} 반복 선택`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={({ pressed }) => [
                  styles.presetButton,
                  selected && styles.presetButtonSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedPreset(option.preset)}
              >
                <Typography variant="bodyM" color={colors.gray[900]} align="center">
                  {option.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityLabel="사용자 설정 반복 열기"
          accessibilityRole="button"
          style={({ pressed }) => [styles.customButton, pressed && styles.pressed]}
          onPress={onOpenCustom}
        >
          <Typography variant="bodyM" color={colors.gray[900]} align="center">
            사용자 설정...
          </Typography>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: spacing[4],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[15],
  },
  header: {
    width: '100%',
    maxWidth: 369,
    minHeight: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
  },
  headerAction: {
    zIndex: 2,
    minWidth: 33,
    minHeight: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  content: {
    width: '100%',
    gap: spacing[4],
  },
  presetGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  presetButton: {
    width: '49%',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 1,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  presetButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.alpha.primary20,
  },
  customButton: {
    width: '100%',
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 1,
    backgroundColor: colors.alpha.white50,
    borderWidth: 1,
    borderColor: colors.gray.white,
  },
  pressed: {
    opacity: 0.72,
  },
});

import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius } from '@/constants/theme';

import {
  type ProgressSegmentOption,
  type ProgressSegmentProps,
  type ProgressSegmentValue,
} from './progressSegment.types';

const DEFAULT_OPTIONS: ProgressSegmentOption[] = [
  { label: '미완료', value: 'todo' },
  { label: '진행중', value: 'ongoing' },
  { label: '완료', value: 'done' },
];

const SEGMENT_WIDTH = 62;

export function ProgressSegment({
  value,
  options = DEFAULT_OPTIONS,
  onChange,
  style,
}: ProgressSegmentProps) {
  const selectedIndex = options.findIndex((option) => option.value === value);

  return (
    <View style={[styles.container, style]}>
      {selectedIndex >= 0 ? (
        <View style={[styles.highlighter, { left: selectedIndex * SEGMENT_WIDTH }]} />
      ) : null}

      <View style={styles.textRow}>
        {options.map((option, index) => {
          const selected = option.value === value;
          const showDivider =
            index > 0 &&
            (selectedIndex < 0 || (index !== selectedIndex && index !== selectedIndex + 1));

          return (
            <View key={option.value} style={styles.optionWrap}>
              {showDivider ? <View style={styles.divider} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={styles.option}
                onPress={() => onChange?.(option.value)}
              >
                <Typography
                  variant="bodyS"
                  color={getOptionColor(option.value, value)}
                  align="center"
                  numberOfLines={1}
                  style={styles.label}
                >
                  {option.label}
                </Typography>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getOptionColor(optionValue: ProgressSegmentValue, selectedValue?: ProgressSegmentValue) {
  if (!selectedValue) {
    return colors.gray[400];
  }

  if (optionValue === selectedValue) {
    return colors.gray[600];
  }

  if (selectedValue === 'done') {
    return colors.gray[500];
  }

  return colors.gray[400];
}

const styles = StyleSheet.create({
  container: {
    width: 186,
    height: 36,
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: colors.gray[200],
  },
  highlighter: {
    position: 'absolute',
    top: 0,
    width: SEGMENT_WIDTH,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.gray[50],
    shadowColor: colors.gray[400],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionWrap: {
    position: 'relative',
    width: SEGMENT_WIDTH,
    height: 36,
    justifyContent: 'center',
  },
  option: {
    width: SEGMENT_WIDTH,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  label: {
    width: SEGMENT_WIDTH,
  },
  divider: {
    position: 'absolute',
    left: 0,
    top: 9.423,
    width: 1,
    height: 17.153,
    backgroundColor: colors.gray[400],
  },
});

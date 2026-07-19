import { Pressable, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

/** 기록 내역 화면 상단의 Body/Mind · Sleep 세그먼트 토글입니다. */
export type RecordHistoryTab = 'bodyMind' | 'sleep';

interface RecordHistoryTabsProps {
  value: RecordHistoryTab;
  onChange: (tab: RecordHistoryTab) => void;
}

const TABS: { key: RecordHistoryTab; label: string }[] = [
  { key: 'bodyMind', label: 'Body/Mind' },
  { key: 'sleep', label: 'Sleep' },
];

export function RecordHistoryTabs({ value, onChange }: RecordHistoryTabsProps) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const selected = tab.key === value;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={({ pressed }) => [
              styles.tab,
              selected && styles.tabSelected,
              pressed && !selected && styles.pressed,
            ]}
            onPress={() => onChange(tab.key)}
          >
            <Typography
              variant="bodyM"
              align="center"
              color={selected ? colors.gray[800] : colors.gray[600]}
            >
              {tab.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 36,
    padding: spacing[1],
    borderRadius: radius.lg,
    backgroundColor: colors.alpha.white50,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius['2xs'],
  },
  tabSelected: {
    backgroundColor: colors.alpha.white80,
  },
  pressed: {
    opacity: 0.72,
  },
});

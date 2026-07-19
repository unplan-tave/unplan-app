import { useEffect, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';

export interface SleepDateItem {
  /** 'YYYY-MM-DD' — 선택 콜백과 key로 사용합니다. */
  id: string;
  day: string;
  weekday: string;
  selected: boolean;
  /** 내일 이후 날짜는 선택할 수 없습니다. */
  disabled: boolean;
  isToday: boolean;
}

interface SleepDateRailProps {
  items: SleepDateItem[];
  onSelect: (id: string) => void;
}

/** 기록 내역 화면의 가로 스크롤 날짜 레일입니다. */
export function SleepDateRail({ items, onSelect }: SleepDateRailProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const selectedIndex = useMemo(() => items.findIndex((item) => item.selected), [items]);

  useEffect(() => {
    if (viewportWidth === 0 || selectedIndex < 0) return;

    const itemOffset = selectedIndex * (CARD_WIDTH + RAIL_GAP);
    const centeredOffset = Math.max(0, itemOffset - (viewportWidth - CARD_WIDTH) / 2);

    scrollRef.current?.scrollTo({ x: centeredOffset, animated: false });
  }, [selectedIndex, viewportWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setViewportWidth(event.nativeEvent.layout.width);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={handleLayout}
      style={styles.scroll}
      contentContainerStyle={styles.rail}
    >
      {items.map((item) => {
        const dayColor = item.selected
          ? colors.gray.white
          : item.disabled
            ? colors.gray[300]
            : colors.gray[900];
        const weekdayColor = item.selected
          ? colors.alpha.white70
          : item.disabled
            ? colors.gray[300]
            : colors.gray[400];

        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: item.selected, disabled: item.disabled }}
            disabled={item.disabled}
            style={({ pressed }) => [
              styles.card,
              item.selected && styles.cardSelected,
              pressed && !item.disabled && !item.selected && styles.pressed,
            ]}
            onPress={() => onSelect(item.id)}
          >
            <Typography variant="titleS" align="center" color={dayColor}>
              {item.day}
            </Typography>
            <Typography variant="caption" align="center" color={weekdayColor}>
              {item.weekday}
            </Typography>
            <View
              style={[
                styles.dot,
                item.isToday && {
                  backgroundColor: item.selected ? colors.gray.white : colors.primary,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const CARD_WIDTH = 40;
const CARD_HEIGHT = 52;
const RAIL_GAP = spacing[3];

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
    alignSelf: 'center',
  },
  rail: {
    gap: RAIL_GAP,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radius.md,
    backgroundColor: colors.alpha.white70,
  },
  cardSelected: {
    backgroundColor: colors.primary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: radius.full,
    backgroundColor: colors.alpha.transparent,
  },
  pressed: {
    opacity: 0.72,
  },
});

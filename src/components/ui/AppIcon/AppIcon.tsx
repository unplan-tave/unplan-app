import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

import { type AppIconProps } from './appIcon.types';

export function AppIcon({
  size = 203,
  accessibilityLabel = 'Unplan 앱 아이콘',
  color = colors.gray[900],
  backgroundColor = colors.appIconBackground,
  style,
}: AppIconProps) {
  const unit = size / 203;
  const block = 28 * unit;
  const smallBlock = 19 * unit;
  const gap = 8 * unit;
  const shadowOffset = 4 * unit;
  const blocks = [
    { width: block, height: block, left: 0, top: 0 },
    { width: block, height: block, left: block + gap, top: 0 },
    { width: block, height: block, left: 0, top: block + gap },
    { width: block, height: block, left: block + gap, top: block + gap },
    { width: block, height: block, left: block * 2 + gap * 2, top: block + gap },
    { width: block, height: block, left: block + gap, top: block * 2 + gap * 2 },
    {
      width: smallBlock,
      height: smallBlock,
      left: block * 3 + gap * 2.8,
      top: block * 2 + gap * 2.4,
    },
  ];

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: Math.min(size * 0.2, 41),
          backgroundColor,
        },
        style,
      ]}
    >
      <View style={[styles.symbol, { width: block * 4 + gap * 2, height: block * 3 + gap * 2 }]}>
        {blocks.flatMap((blockStyle, index) => [
          <View
            key={`shadow-${index}`}
            style={[
              styles.block,
              blockStyle,
              {
                left: blockStyle.left + shadowOffset,
                top: blockStyle.top + shadowOffset,
                backgroundColor: colors.primary,
              },
            ]}
          />,
          <View
            key={`block-${index}`}
            style={[styles.block, blockStyle, { backgroundColor: color }]}
          />,
        ])}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  symbol: {
    position: 'relative',
  },
  block: {
    position: 'absolute',
    borderRadius: radius.xs,
  },
});

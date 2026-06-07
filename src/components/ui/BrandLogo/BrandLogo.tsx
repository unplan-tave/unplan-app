import { StyleSheet, View } from 'react-native';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';

import { type BrandLogoProps } from './brandLogo.types';

export function BrandLogo({ color = colors.gray.white, size = 'large', style }: BrandLogoProps) {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, style]}>
      <Svg
        width={isLarge ? 36 : 28}
        height={isLarge ? 36 : 28}
        viewBox="0 0 36 36"
        accessibilityLabel="Unplan 심볼"
      >
        <G fill={color}>
          <Rect x={14} y={2} width={8} height={8} rx={2} />
          <Rect x={24} y={10} width={8} height={8} rx={2} />
          <Rect x={14} y={18} width={8} height={8} rx={2} />
          <Rect x={4} y={10} width={8} height={8} rx={2} />
          <Path d="M14 10H22V18H14z" />
        </G>
      </Svg>
      <Typography
        variant="display"
        color={color}
        align="center"
        style={[styles.wordmark, isLarge ? styles.largeWordmark : styles.mediumWordmark]}
      >
        Unplan
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wordmark: {
    marginTop: -2,
  },
  largeWordmark: {
    fontSize: 58,
    lineHeight: 64,
    letterSpacing: -1.16,
  },
  mediumWordmark: {
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -0.96,
  },
});

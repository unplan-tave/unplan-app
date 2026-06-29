import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/constants/theme';

export function HomeBackground() {
  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="homeBackground" x1="0" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={colors.gradient.blue} stopOpacity={1} />
          <Stop offset="0.48" stopColor={colors.gradient.sky} stopOpacity={0.66} />
          <Stop offset="1" stopColor={colors.onboardingMutedBackground} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#homeBackground)" />
    </Svg>
  );
}

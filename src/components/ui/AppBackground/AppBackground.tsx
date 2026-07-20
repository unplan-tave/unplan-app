import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/constants/theme';

/** 홈·카드 리스트·컨디션 탭이 공유하는 전면 그라디언트 배경. */
export function AppBackground({
  imageSource,
  imageTintColor,
  variant = 'default',
}: {
  imageSource?: ImageSourcePropType;
  imageTintColor?: string;
  variant?: 'default' | 'reversed';
}) {
  if (imageSource != null) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          source={imageSource}
          resizeMode="cover"
          style={[StyleSheet.absoluteFill, variant === 'reversed' && styles.reversed]}
        />
        {imageTintColor != null ? (
          <Svg
            style={StyleSheet.absoluteFill}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient id="reversedImageOverlay" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={imageTintColor} stopOpacity={0.86} />
                <Stop offset="1" stopColor={imageTintColor} stopOpacity={0.16} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#reversedImageOverlay)" />
          </Svg>
        ) : null}
      </View>
    );
  }

  const isReversed = variant === 'reversed';

  return (
    <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="appBackground" x1="0" y1="0" x2="0.8" y2="1">
          <Stop
            offset="0"
            stopColor={isReversed ? colors.conditionBackground.mutedTop : colors.gradient.blue}
            stopOpacity={1}
          />
          <Stop offset="0.48" stopColor={colors.gradient.sky} stopOpacity={0.66} />
          <Stop
            offset="1"
            stopColor={isReversed ? colors.gradient.blue : colors.onboardingMutedBackground}
            stopOpacity={1}
          />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#appBackground)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  reversed: {
    transform: [{ scaleY: -1 }],
  },
});

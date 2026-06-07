import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { HomeIndicator } from '@/components/ui/Footer';
import { colors } from '@/constants/theme';

interface SplashScreenProps {
  onFinish?: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    if (!onFinish) {
      return undefined;
    }

    const timer = setTimeout(onFinish, 900);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="splashGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.gray.white} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#splashGradient)" />
      </Svg>
      <BrandLogo style={styles.logo} />
      <View style={styles.footer}>
        <HomeIndicator />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: 48,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

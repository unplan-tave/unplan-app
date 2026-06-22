import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BottomCTA } from '@/components/ui/BottomCTA';
import { HomeIndicator } from '@/components/ui/Footer';
import { HeaderProgress } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

interface OnboardingStepLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  note?: string;
  progress: number;
  ctaDisabled?: boolean;
  ctaCaption?: string | null;
  contentRaised?: boolean;
  onConfirm: () => void;
}

export function OnboardingStepLayout({
  children,
  title,
  subtitle,
  note,
  progress,
  ctaDisabled = false,
  ctaCaption = t('common.skip'),
  contentRaised = false,
  onConfirm,
}: OnboardingStepLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const raisedProgress = useRef(new Animated.Value(contentRaised ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(raisedProgress, {
      toValue: contentRaised ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [contentRaised, raisedProgress]);

  const contentTransform = {
    transform: [
      {
        translateY: raisedProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -264],
        }),
      },
    ],
  };
  return (
    <ScreenLayout
      backgroundColor={colors.onboardingBackground}
      header={
        <View style={styles.headerLayer}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.headerOverlay,
              {
                top: -insets.top,
                opacity: raisedProgress,
              },
            ]}
          >
            <View style={[styles.safeAreaOverlay, { height: insets.top }]} />
            <Svg
              preserveAspectRatio="none"
              style={styles.headerOverlayFill}
              viewBox="0 0 393 115.31"
            >
              <Defs>
                <LinearGradient id="onboardingHeaderOverlay" x1="0" y1="0.82" x2="0" y2="1">
                  <Stop offset="0" stopColor="#F2F5F7" />
                  <Stop offset="1" stopColor="#F2F5F7" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect width="393" height="115.31" fill="url(#onboardingHeaderOverlay)" />
            </Svg>
          </Animated.View>
          <HeaderProgress progress={progress} onBackPress={router.back} style={styles.header} />
        </View>
      }
      footer={
        <View style={styles.footer}>
          <BottomCTA
            label={t('common.confirm')}
            caption={ctaCaption}
            disabled={ctaDisabled}
            variant="primary"
            onPress={onConfirm}
          />
          <HomeIndicator />
        </View>
      }
      contentStyle={styles.content}
    >
      <Animated.View style={[styles.body, contentTransform]}>
        <View style={styles.head}>
          <Typography variant="titleL" align="center" color={colors.gray[900]} style={styles.title}>
            {title}
          </Typography>
          {typeof subtitle === 'string' ? (
            <Typography variant="bodyM" align="center" color={colors.gray[700]}>
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )}
          {note ? (
            <Typography variant="bodyS" align="center" color={colors.secondary} style={styles.note}>
              {note}
            </Typography>
          ) : null}
        </View>
        {children}
      </Animated.View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing[3],
  },
  headerLayer: {
    position: 'relative',
    zIndex: 10,
    elevation: 10,
  },
  headerOverlay: {
    position: 'absolute',
    right: 0,
    left: 0,
  },
  safeAreaOverlay: {
    width: '100%',
    backgroundColor: '#F2F5F7',
  },
  headerOverlayFill: {
    width: '100%',
    height: 115.31,
  },
  content: {
    zIndex: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  body: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  head: {
    width: '100%',
    alignItems: 'center',
    marginTop: 35,
    gap: spacing[1],
  },
  title: {
    minHeight: 68,
  },
  note: {
    marginTop: spacing[2],
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[1],
  },
});

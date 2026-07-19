import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderBack } from '@/components/ui/Header';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useTermsScreen } from './hooks/use-terms-screen';

const termsBackground = require('../../../assets/onboarding/intro-welcome.png');

export function TermsScreen() {
  const { copy, handleBack } = useTermsScreen();

  return (
    <ImageBackground
      source={termsBackground}
      resizeMode="cover"
      style={styles.root}
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <HeaderBack style={styles.headerIconButton} onPress={handleBack} />
          <View pointerEvents="none" style={styles.titleWrapper}>
            <Typography variant="bodyM" color={colors.gray[600]} align="center" numberOfLines={1}>
              {t(copy.title)}
            </Typography>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.bodyBox}>
            <ScrollView
              style={styles.bodyScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.bodyScrollContent}
            >
              <Typography variant="caption" color={colors.gray[700]} style={styles.bodyText}>
                {t(copy.body)}
              </Typography>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.onboardingBackground,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  header: {
    height: spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
  },
  headerIconButton: {
    width: 24,
    height: 24,
  },
  titleWrapper: {
    position: 'absolute',
    right: 88,
    left: 88,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[5],
  },
  bodyBox: {
    flex: 1,
    width: '100%',
    borderRadius: radius.md,
    padding: spacing[4],
    alignItems: 'center',
  },
  bodyScroll: {
    width: '100%',
  },
  bodyScrollContent: {
    alignItems: 'center',
    paddingBottom: spacing[4],
  },
  bodyText: {
    width: '100%',
    maxWidth: 299,
  },
});

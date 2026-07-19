import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

import { BottomCTA } from '@/components/ui/BottomCTA';
import { HomeIndicator } from '@/components/ui/Footer';
import { HeaderProgress } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';
import { type TranslationKey } from '@/translations/ko';

import { useIntroScreen } from './hooks/use-intro-screen';

const INTRO_STEPS = [
  {
    image: require('../../../assets/onboarding/intro-welcome.png'),
    titleKey: 'onboarding.intro.welcome.title',
    subtitleKey: 'onboarding.intro.welcome.subtitle',
  },
  {
    image: require('../../../assets/onboarding/intro-queue.png'),
    titleKey: 'onboarding.intro.todo.title',
    subtitleKey: 'onboarding.intro.todo.subtitle',
  },
  {
    image: require('../../../assets/onboarding/intro-pin.png'),
    titleKey: 'onboarding.intro.pin.title',
    subtitleKey: 'onboarding.intro.pin.subtitle',
  },
  {
    image: require('../../../assets/onboarding/intro-start.png'),
    titleKey: 'onboarding.intro.start.title',
    subtitleKey: 'onboarding.intro.start.subtitle',
  },
] as const satisfies ReadonlyArray<{
  image: number;
  titleKey: TranslationKey;
  subtitleKey: TranslationKey;
}>;

export function IntroScreen() {
  const {
    stepIndex,
    progressDots,
    isFirstStep,
    isLastStep,
    handleBack,
    handleNext,
    handleStepSelect,
  } = useIntroScreen();
  const activeStep = INTRO_STEPS[stepIndex];

  return (
    <ImageBackground
      source={activeStep.image}
      resizeMode="cover"
      style={styles.screen}
      imageStyle={styles.backgroundImage}
    >
      <ScreenLayout
        backgroundColor={colors.alpha.transparent}
        contentStyle={[styles.content, !isFirstStep && styles.contentWithHeader]}
        header={
          isFirstStep ? undefined : (
            <HeaderProgress showProgress={false} onBackPress={handleBack} style={styles.header} />
          )
        }
        footer={
          <View style={styles.footer}>
            <View
              style={styles.dots}
              accessibilityLabel={t('onboarding.intro.progressAccessibilityLabel')}
            >
              {progressDots.map((dotIndex) => (
                <Pressable
                  key={dotIndex}
                  accessibilityLabel={t('onboarding.intro.stepAccessibilityLabel').replace(
                    '{step}',
                    String(dotIndex + 1),
                  )}
                  accessibilityRole="button"
                  accessibilityState={{ selected: dotIndex === stepIndex }}
                  hitSlop={8}
                  style={[styles.dot, dotIndex === stepIndex && styles.activeDot]}
                  onPress={() => handleStepSelect(dotIndex)}
                />
              ))}
            </View>
            <BottomCTA
              label={isLastStep ? t('onboarding.intro.start.cta') : t('common.next')}
              caption={null}
              variant="primary"
              onPress={handleNext}
            />
            <HomeIndicator />
          </View>
        }
      >
        <View style={styles.copy}>
          <Typography variant="display" color={colors.gray[900]} align="left">
            {t(activeStep.titleKey)}
          </Typography>
          <Typography variant="titleM" color={colors.gray[700]} align="left">
            {t(activeStep.subtitleKey)}
          </Typography>
        </View>
      </ScreenLayout>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.onboardingBackground,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    marginTop: spacing[3],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[12],
  },
  contentWithHeader: {
    paddingTop: spacing[4],
  },
  copy: {
    width: '100%',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing[7],
    gap: spacing[2],
  },
  dot: {
    width: spacing[2],
    height: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.gray[200],
  },
  activeDot: {
    backgroundColor: colors.primary,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    gap: spacing[1],
  },
});

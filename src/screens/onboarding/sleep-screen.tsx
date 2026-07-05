import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingStepLayout } from '@/components/features/onboarding/onboarding-step-layout';
import { SleepConditionCircle } from '@/components/features/onboarding/sleep-condition-circle';
import { Typography } from '@/components/ui/Typography';
import { colors } from '@/constants/theme';
import { onboardingRoutes } from '@/domains/onboarding/routes';
import { useOnboardingStore } from '@/domains/onboarding/use-onboarding-store';
import { t } from '@/lib/i18n';

export function SleepScreen() {
  const router = useRouter();
  const preferences = useOnboardingStore((state) => state.preferences);
  const setTargetSleepMinutes = useOnboardingStore((state) => state.setTargetSleepMinutes);
  const setSleepConditionThresholds = useOnboardingStore(
    (state) => state.setSleepConditionThresholds,
  );

  return (
    <OnboardingStepLayout
      title={t('onboarding.sleep.title')}
      subtitle={
        <View style={styles.description}>
          <Typography variant="bodyM" align="center" color={colors.gray[700]}>
            {t('onboarding.sleep.subtitle')}
          </Typography>
          <Typography variant="caption" align="center" color={colors.gray[400]}>
            {t('onboarding.sleep.note')}
          </Typography>
        </View>
      }
      progress={0.38}
      ctaCaption={null}
      backgroundColor={colors.onboardingMutedBackground}
      titleMinHeight={34}
      onConfirm={() => router.push(onboardingRoutes.activity)}
    >
      <SleepConditionCircle
        targetSleepMinutes={preferences.targetSleepMinutes}
        dangerThresholdMinutes={preferences.sleepDangerThresholdMinutes}
        lackThresholdMinutes={preferences.sleepLackThresholdMinutes}
        optimalThresholdMinutes={preferences.sleepOptimalThresholdMinutes}
        onTargetSleepMinutesChange={setTargetSleepMinutes}
        onThresholdsChange={setSleepConditionThresholds}
      />
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  description: {
    alignItems: 'center',
  },
});

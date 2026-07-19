import { StyleSheet, View } from 'react-native';

import { SleepConditionCircle } from '@/components/features/onboarding/sleep-condition-circle';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useSleepConditionEditScreen } from './hooks/use-sleep-condition-edit-screen';

export function SleepConditionEditScreen() {
  const {
    settings,
    isSubmitting,
    handleTargetSleepMinutesChange,
    handleThresholdsChange,
    handleConfirm,
    handleCancel,
  } = useSleepConditionEditScreen();

  return (
    <ScreenLayout backgroundColor={colors.onboardingMutedBackground} contentStyle={styles.screen}>
      <Header
        title={t('settings.sleepCondition.title')}
        left={
          <HeaderCancel label={t('common.cancel')} color={colors.primary} onPress={handleCancel} />
        }
        right={
          <HeaderCancel
            label={isSubmitting ? t('common.saving') : t('common.done')}
            color={colors.primary}
            disabled={isSubmitting}
            onPress={handleConfirm}
          />
        }
        style={styles.header}
      />
      <View style={styles.content}>
        <View style={styles.head}>
          <Typography variant="titleL" align="center" color={colors.gray[900]}>
            {t('onboarding.sleep.title')}
          </Typography>
          <View style={styles.description}>
            <Typography variant="bodyM" align="center" color={colors.gray[700]}>
              {t('onboarding.sleep.subtitle')}
            </Typography>
            <Typography variant="caption" align="center" color={colors.gray[400]}>
              {t('onboarding.sleep.note')}
            </Typography>
          </View>
        </View>
        <SleepConditionCircle
          targetSleepMinutes={settings.targetSleepMinutes}
          dangerThresholdMinutes={settings.dangerThresholdMinutes}
          lackThresholdMinutes={settings.lackThresholdMinutes}
          optimalThresholdMinutes={settings.optimalThresholdMinutes}
          onTargetSleepMinutesChange={handleTargetSleepMinutesChange}
          onThresholdsChange={handleThresholdsChange}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  header: {
    paddingHorizontal: spacing[4],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[8],
  },
  head: {
    alignItems: 'center',
    gap: spacing[1],
    marginBottom: spacing[6],
  },
  description: {
    alignItems: 'center',
  },
});

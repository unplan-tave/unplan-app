import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { SleepConditionCircle } from '@/components/features/onboarding/sleep-condition-circle';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { useUpdateSleepConditionSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useSleepConditionSettingsQuery } from '@/domains/onboarding/api/queries';
import { DEFAULT_SLEEP_CONDITION_THRESHOLDS } from '@/domains/onboarding/sleep-condition';
import { t } from '@/lib/i18n';

import type { SleepConditionSettings } from '@/domains/onboarding/model';

const FALLBACK_SETTINGS: SleepConditionSettings = {
  targetSleepMinutes: 450,
  dangerThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.dangerMinutes,
  lackThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.lackMinutes,
  optimalThresholdMinutes: DEFAULT_SLEEP_CONDITION_THRESHOLDS.optimalMinutes,
};

export function SleepConditionEditScreen() {
  const router = useRouter();
  const settingsQuery = useSleepConditionSettingsQuery();
  const updateMutation = useUpdateSleepConditionSettingsMutation();
  const [draft, setDraft] = useState<SleepConditionSettings | null>(null);
  const settings = draft ?? settingsQuery.data ?? FALLBACK_SETTINGS;

  const handleConfirm = () => {
    if (updateMutation.isPending) {
      return;
    }

    updateMutation.mutate(settings, {
      onSuccess: () => router.back(),
      onError: () => Alert.alert(t('settings.updateError')),
    });
  };

  return (
    <ScreenLayout backgroundColor={colors.onboardingMutedBackground} contentStyle={styles.screen}>
      <Header
        title={t('settings.sleepCondition.title')}
        left={
          <HeaderCancel label={t('common.cancel')} color={colors.primary} onPress={router.back} />
        }
        right={
          <HeaderCancel
            label={updateMutation.isPending ? t('common.saving') : t('common.done')}
            color={colors.primary}
            disabled={updateMutation.isPending}
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
          onTargetSleepMinutesChange={(minutes) =>
            setDraft({ ...settings, targetSleepMinutes: minutes })
          }
          onThresholdsChange={(thresholds) =>
            setDraft({
              ...settings,
              dangerThresholdMinutes: thresholds.dangerMinutes,
              lackThresholdMinutes: thresholds.lackMinutes,
              optimalThresholdMinutes: thresholds.optimalMinutes,
            })
          }
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

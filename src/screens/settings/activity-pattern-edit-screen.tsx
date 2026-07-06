import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActivityTimeRail } from '@/components/features/onboarding/activity-time-rail';
import { Header, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import {
  toggleActivityHourRange,
  toggleContinuousSleepRange,
} from '@/domains/onboarding/activity-time-ranges';
import { useUpdateActivityPatternSettingsMutation } from '@/domains/onboarding/api/mutations';
import { useActivityPatternSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { ActivityPatternSettings } from '@/domains/onboarding/model';

const EMPTY_SETTINGS: ActivityPatternSettings = {
  focusTimeRanges: [],
  sleepyTimeRanges: [],
  sleepTimeRanges: [],
};

export function ActivityPatternEditScreen() {
  const router = useRouter();
  const settingsQuery = useActivityPatternSettingsQuery();
  const updateMutation = useUpdateActivityPatternSettingsMutation();
  const [draft, setDraft] = useState<ActivityPatternSettings | null>(null);
  const settings = draft ?? settingsQuery.data ?? EMPTY_SETTINGS;
  const hasSleepTime = settings.sleepTimeRanges.length > 0;

  const handleToggleHour = (rangeKey: keyof ActivityPatternSettings, hour: number) => {
    setDraft({
      ...settings,
      [rangeKey]:
        rangeKey === 'sleepTimeRanges'
          ? toggleContinuousSleepRange(settings[rangeKey], hour)
          : toggleActivityHourRange(settings[rangeKey], hour),
    });
  };

  const handleConfirm = () => {
    if (updateMutation.isPending || !hasSleepTime) {
      return;
    }

    updateMutation.mutate(settings, {
      onSuccess: () => router.back(),
    });
  };

  return (
    <ScreenLayout backgroundColor={colors.onboardingMutedBackground} contentStyle={styles.screen}>
      <Header
        title={t('settings.activityPattern')}
        left={
          <HeaderCancel label={t('common.cancel')} color={colors.primary} onPress={router.back} />
        }
        right={
          <HeaderCancel
            label={updateMutation.isPending ? t('common.saving') : t('common.done')}
            color={hasSleepTime ? colors.primary : colors.gray[300]}
            disabled={updateMutation.isPending || !hasSleepTime}
            onPress={handleConfirm}
          />
        }
        style={styles.header}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Typography variant="titleL" align="center" color={colors.gray[900]}>
            {t('settings.activityPattern.editTitle')}
          </Typography>
          <Typography variant="bodyM" align="center" color={colors.gray[700]}>
            {t('settings.activityPattern.editSubtitle')}
          </Typography>
        </View>
        <View style={styles.rails}>
          <ActivityTimeRail
            id="focus"
            label={t('onboarding.activity.focusTime')}
            ranges={settings.focusTimeRanges}
            onToggleHour={(hour) => handleToggleHour('focusTimeRanges', hour)}
          />
          <ActivityTimeRail
            id="sleepy"
            label={t('onboarding.activity.sleepyTime')}
            ranges={settings.sleepyTimeRanges}
            onToggleHour={(hour) => handleToggleHour('sleepyTimeRanges', hour)}
          />
          <ActivityTimeRail
            id="sleep"
            label={t('onboarding.activity.sleepTime')}
            required
            requiredLabel={t('onboarding.activity.required')}
            ranges={settings.sleepTimeRanges}
            onToggleHour={(hour) => handleToggleHour('sleepTimeRanges', hour)}
          />
        </View>
      </ScrollView>
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
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
  },
  head: {
    alignItems: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[5],
  },
  rails: {
    alignSelf: 'stretch',
    marginTop: 57,
    gap: 60,
  },
});

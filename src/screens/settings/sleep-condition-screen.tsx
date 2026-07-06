import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { useSleepConditionSettingsQuery } from '@/domains/onboarding/api/queries';
import { formatSleepDurationLabel } from '@/domains/onboarding/sleep-condition';
import { t } from '@/lib/i18n';

export function SleepConditionScreen() {
  const router = useRouter();
  const settingsQuery = useSleepConditionSettingsQuery();
  const settings = settingsQuery.data;

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.sleepCondition.title')}
        left={<HeaderBack onPress={router.back} />}
        right={
          <HeaderCancel
            label={t('settings.edit')}
            color={colors.primary}
            onPress={() => router.push('/settings/sleep-condition-edit')}
          />
        }
        style={styles.header}
      />
      <View style={styles.content}>
        {settings ? (
          <SettingsList
            rows={[
              {
                label: t('settings.sleepCondition.risk'),
                value: `${formatSleepDurationLabel(0)} ~ ${formatSleepDurationLabel(settings.dangerThresholdMinutes)}`,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.lack'),
                value: `${formatSleepDurationLabel(settings.dangerThresholdMinutes + 1)} ~ ${formatSleepDurationLabel(settings.lackThresholdMinutes)}`,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.optimal'),
                value: `${formatSleepDurationLabel(settings.lackThresholdMinutes + 1)} ~ ${formatSleepDurationLabel(settings.optimalThresholdMinutes)}`,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.excess'),
                value: `${formatSleepDurationLabel(settings.optimalThresholdMinutes + 1)} ~`,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.targetSleep'),
                value: formatSleepDurationLabel(settings.targetSleepMinutes),
                type: 'text',
                muted: true,
                dividerAbove: true,
              },
            ]}
          />
        ) : null}
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
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
});

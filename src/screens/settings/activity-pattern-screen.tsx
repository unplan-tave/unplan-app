import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import {
  formatActivityRangeLabel,
  toContiguousActivityRanges,
} from '@/domains/onboarding/activity-time-ranges';
import { useActivityPatternSettingsQuery } from '@/domains/onboarding/api/queries';
import { t } from '@/lib/i18n';

import type { TimeRange } from '@/domains/onboarding/model';

function toRangesValue(ranges: TimeRange[]): string {
  const contiguousRanges = toContiguousActivityRanges(ranges);

  if (contiguousRanges.length === 0) {
    return '-';
  }

  return contiguousRanges.map(formatActivityRangeLabel).join(', ');
}

export function ActivityPatternScreen() {
  const router = useRouter();
  const settingsQuery = useActivityPatternSettingsQuery();
  const settings = settingsQuery.data;

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.activityPattern')}
        left={<HeaderBack onPress={router.back} />}
        right={
          <HeaderCancel
            label={t('settings.edit')}
            color={colors.primary}
            onPress={() => router.push('/settings/activity-pattern-edit')}
          />
        }
        style={styles.header}
      />
      <View style={styles.content}>
        {settings ? (
          <SettingsList
            rows={[
              {
                label: t('onboarding.activity.focusTime'),
                value: toRangesValue(settings.focusTimeRanges),
                type: 'text',
                muted: true,
              },
              {
                label: t('onboarding.activity.sleepyTime'),
                value: toRangesValue(settings.sleepyTimeRanges),
                type: 'text',
                muted: true,
              },
              {
                label: t('onboarding.activity.sleepTime'),
                value: toRangesValue(settings.sleepTimeRanges),
                type: 'text',
                muted: true,
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

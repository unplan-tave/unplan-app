import { StyleSheet, View } from 'react-native';

import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useActivityPatternScreen } from './hooks/use-activity-pattern-screen';

export function ActivityPatternScreen() {
  const { values, handleBack, handleEdit } = useActivityPatternScreen();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.activityPattern')}
        left={<HeaderBack onPress={handleBack} />}
        right={
          <HeaderCancel label={t('settings.edit')} color={colors.primary} onPress={handleEdit} />
        }
        style={styles.header}
      />
      <View style={styles.content}>
        {values ? (
          <SettingsList
            rows={[
              {
                label: t('onboarding.activity.focusTime'),
                value: values.focus,
                type: 'text',
                muted: true,
              },
              {
                label: t('onboarding.activity.sleepyTime'),
                value: values.sleepy,
                type: 'text',
                muted: true,
              },
              {
                label: t('onboarding.activity.sleepTime'),
                value: values.sleep,
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

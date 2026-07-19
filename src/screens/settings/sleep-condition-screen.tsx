import { StyleSheet, View } from 'react-native';

import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack, HeaderCancel } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useSleepConditionScreen } from './hooks/use-sleep-condition-screen';

export function SleepConditionScreen() {
  const { values, handleBack, handleEdit } = useSleepConditionScreen();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.sleepCondition.title')}
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
                label: t('settings.sleepCondition.risk'),
                value: values.risk,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.lack'),
                value: values.lack,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.optimal'),
                value: values.optimal,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.excess'),
                value: values.excess,
                type: 'text',
                muted: true,
              },
              {
                label: t('settings.sleepCondition.targetSleep'),
                value: values.target,
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

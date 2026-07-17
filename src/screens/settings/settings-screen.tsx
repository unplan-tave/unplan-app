import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsList } from '@/components/features/settings/settings-list';
import { GNB } from '@/components/ui/GNB';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useSettingsScreen } from './hooks/use-settings-screen';

export function SettingsScreen() {
  const {
    profile,
    appVersion,
    alarmSettings,
    isAlarmSettingsDisabled,
    handleNavChange,
    handleAddCard,
    handleAccountPress,
    createSettingsNavigation,
    handleTermsPress,
  } = useSettingsScreen();

  return (
    <ScreenLayout
      backgroundColor={colors.gray[50]}
      contentStyle={styles.screen}
      footer={
        <View style={styles.footer}>
          <GNB value="setting" onChange={handleNavChange} onAddPress={handleAddCard} />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
          onPress={handleAccountPress}
        >
          <View style={styles.profileText}>
            <Typography variant="titleL" color={colors.gray[900]}>
              {profile.nickname}
            </Typography>
            <Typography variant="bodyM" color={colors.gray[500]}>
              {profile.email}
            </Typography>
          </View>
          <Icon name="arrowRight" size={24} color={colors.gray[300]} />
        </Pressable>
        <SettingsList
          title={t('settings.notificationSettings')}
          rows={[
            {
              label: t('settings.scheduleEndNotification'),
              type: 'switch',
              disabled: isAlarmSettingsDisabled,
              switchValue: alarmSettings.scheduleEndNotification,
              onSwitchChange: alarmSettings.setScheduleEndNotification,
            },
            {
              label: t('settings.conditionRecordNotification'),
              type: 'switch',
              disabled: isAlarmSettingsDisabled,
              switchValue: alarmSettings.conditionRecordNotification,
              onSwitchChange: alarmSettings.setConditionRecordNotification,
            },
            {
              label: t('settings.recommendationScheduleNotification'),
              type: 'switch',
              disabled: isAlarmSettingsDisabled,
              switchValue: alarmSettings.recommendationPushEnabled,
              onSwitchChange: alarmSettings.setRecommendationPushEnabled,
            },
          ]}
        />
        <SettingsList
          title={t('settings.recommendationSettings')}
          rows={[
            {
              label: t('settings.scheduleRecommendationCriteria'),
              onPress: createSettingsNavigation('/settings/recommendation'),
            },
            {
              label: t('settings.recoveryMethods'),
              onPress: createSettingsNavigation('/settings/recovery'),
            },
            {
              label: t('settings.sleepCondition'),
              onPress: createSettingsNavigation('/settings/sleep-condition'),
            },
            {
              label: t('settings.activityPattern'),
              onPress: createSettingsNavigation('/settings/activity-pattern'),
            },
            {
              label: t('settings.defaultTransport'),
              onPress: createSettingsNavigation('/settings/transport'),
            },
          ]}
        />
        <SettingsList
          title={t('settings.information')}
          rows={[
            {
              label: t('settings.appVersion'),
              value: appVersion,
              type: 'text',
            },
            {
              label: t('terms.service.title'),
              onPress: () => handleTermsPress('service'),
            },
            {
              label: t('terms.privacy.title'),
              onPress: () => handleTermsPress('privacy'),
            },
          ]}
        />
      </ScrollView>
      {alarmSettings.errorMessage ? (
        <CardToast message={alarmSettings.errorMessage} onClose={alarmSettings.dismissError} />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: 136,
    gap: spacing[5],
  },
  profileCard: {
    width: '100%',
    maxWidth: 353,
    minHeight: 89,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  profileText: {
    gap: 5,
  },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 34,
    left: 0,
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
  pressed: {
    opacity: 0.72,
  },
});

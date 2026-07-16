import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsList } from '@/components/features/settings/settings-list';
import { GNB } from '@/components/ui/GNB';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing } from '@/constants/theme';
import { useMemberProfileQuery } from '@/domains/member/api/queries';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { t } from '@/lib/i18n';

import { useAlarmSettings } from './hooks/use-alarm-settings';

export function SettingsScreen() {
  const router = useRouter();
  const profileQuery = useMemberProfileQuery();
  const {
    scheduleEndNotification,
    conditionRecordNotification,
    recommendationPushEnabled,
    setScheduleEndNotification,
    setConditionRecordNotification,
    setRecommendationPushEnabled,
    errorMessage,
    dismissError,
    isLoading: isAlarmSettingsLoading,
    isUpdating: isAlarmSettingsUpdating,
  } = useAlarmSettings();
  const isAlarmSettingsDisabled = isAlarmSettingsLoading || isAlarmSettingsUpdating;
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const profileNickname = profileQuery.isLoading
    ? ''
    : profileQuery.data?.nickname || t('settings.profileFallback.nickname');
  const profileEmail = profileQuery.isLoading
    ? ''
    : profileQuery.data?.email || t('settings.profileFallback.email');

  const handleNavChange = useTabNavigation();

  return (
    <ScreenLayout
      backgroundColor={colors.gray[50]}
      contentStyle={styles.screen}
      footer={
        <View style={styles.footer}>
          <GNB
            value="setting"
            onChange={handleNavChange}
            onAddPress={() => router.push('/card/new')}
          />
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.profileCard, pressed && styles.pressed]}
          onPress={() => router.push('/settings/account')}
        >
          <View style={styles.profileText}>
            <Typography variant="titleL" color={colors.gray[900]}>
              {profileNickname}
            </Typography>
            <Typography variant="bodyM" color={colors.gray[500]}>
              {profileEmail}
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
              switchValue: scheduleEndNotification,
              onSwitchChange: setScheduleEndNotification,
            },
            {
              label: t('settings.conditionRecordNotification'),
              type: 'switch',
              disabled: isAlarmSettingsDisabled,
              switchValue: conditionRecordNotification,
              onSwitchChange: setConditionRecordNotification,
            },
            {
              label: t('settings.recommendationScheduleNotification'),
              type: 'switch',
              disabled: isAlarmSettingsDisabled,
              switchValue: recommendationPushEnabled,
              onSwitchChange: setRecommendationPushEnabled,
            },
          ]}
        />
        <SettingsList
          title={t('settings.recommendationSettings')}
          rows={[
            {
              label: t('settings.scheduleRecommendationCriteria'),
              onPress: () => router.push('/settings/recommendation'),
            },
            {
              label: t('settings.recoveryMethods'),
              onPress: () => router.push('/settings/recovery'),
            },
            {
              label: t('settings.sleepCondition'),
              onPress: () => router.push('/settings/sleep-condition'),
            },
            {
              label: t('settings.activityPattern'),
              onPress: () => router.push('/settings/activity-pattern'),
            },
            {
              label: t('settings.defaultTransport'),
              onPress: () => router.push('/settings/transport'),
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
              onPress: () => router.push({ pathname: '/terms', params: { type: 'service' } }),
            },
            {
              label: t('terms.privacy.title'),
              onPress: () => router.push({ pathname: '/terms', params: { type: 'privacy' } }),
            },
          ]}
        />
      </ScrollView>
      {errorMessage ? <CardToast message={errorMessage} onClose={dismissError} /> : null}
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

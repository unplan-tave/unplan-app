import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SettingsConfirmModal } from '@/components/features/settings/settings-confirm-modal';
import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useSettingsAccount } from './hooks/use-settings-account';

const SETTINGS_PROFILE = {
  nickname: '중성마녀',
  email: 'unplan@naver.com',
} as const;

export function AccountScreen() {
  const router = useRouter();
  const account = useSettingsAccount();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.account.title')}
        left={<HeaderBack onPress={router.back} />}
        right={<View style={styles.headerSide} />}
        style={styles.header}
      />
      <View style={styles.content}>
        <SettingsList
          title={t('settings.account.loginInfo')}
          rows={[
            {
              label: t('settings.account.nickname'),
              value: SETTINGS_PROFILE.nickname,
              onPress: () => router.push('/settings/nickname'),
            },
            {
              label: t('settings.account.connectedAccount'),
              value: SETTINGS_PROFILE.email,
              type: 'text',
            },
          ]}
        />
        <SettingsList
          rows={[
            {
              label: account.isLoggingOut ? t('settings.loggingOut') : t('settings.account.logout'),
              onPress: account.openLogoutDialog,
            },
            {
              label: t('settings.account.deleteAccount'),
              onPress: account.openDeleteAccountDialog,
            },
          ]}
        />
      </View>
      <SettingsConfirmModal
        visible={account.activeDialog === 'logout'}
        title={t('settings.logoutModal.title')}
        confirmLabel={t('settings.account.logout')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => void account.confirmLogout()}
        onCancel={account.closeDialog}
      />
      <SettingsConfirmModal
        visible={account.activeDialog === 'deleteAccount'}
        title={t('settings.deleteAccountModal.title')}
        confirmLabel={t('settings.account.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={account.closeDialog}
        onCancel={account.closeDialog}
      />
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
  headerSide: {
    width: 44,
    height: 44,
  },
  content: {
    gap: spacing[5],
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
});

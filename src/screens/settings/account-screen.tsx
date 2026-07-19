import { StyleSheet, View } from 'react-native';

import { SettingsConfirmModal } from '@/components/features/settings/settings-confirm-modal';
import { SettingsList } from '@/components/features/settings/settings-list';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useAccountScreen } from './hooks/use-account-screen';

export function AccountScreen() {
  const { account, profile, handleBack, handleNicknamePress } = useAccountScreen();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.account.title')}
        left={<HeaderBack onPress={handleBack} />}
        right={<View style={styles.headerSide} />}
        style={styles.header}
      />
      <View style={styles.content}>
        <SettingsList
          title={t('settings.account.loginInfo')}
          rows={[
            {
              label: t('settings.account.nickname'),
              value: profile.nickname,
              onPress: handleNicknamePress,
            },
            {
              label: t('settings.account.connectedAccount'),
              value: profile.email,
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
              label: account.isDeletingAccount
                ? t('settings.deletingAccount')
                : t('settings.account.deleteAccount'),
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
        onConfirm={account.confirmDeleteAccount}
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

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsCheckboxRow } from '@/components/features/settings/settings-checkbox-row';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useTransportScreen } from './hooks/use-transport-screen';

export function TransportScreen() {
  const {
    selectedOptionIds,
    toggleOption,
    isLoading,
    isUpdating,
    errorMessage,
    dismissError,
    options,
    handleBack,
  } = useTransportScreen();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.defaultTransport')}
        left={<HeaderBack onPress={handleBack} />}
        right={<View style={styles.headerSide} />}
        style={styles.header}
      />
      <View style={styles.content}>
        <View style={styles.section}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            options.map((option) => (
              <SettingsCheckboxRow
                key={option.id}
                label={option.label}
                checked={selectedOptionIds.includes(option.id)}
                disabled={isUpdating}
                onToggle={() => toggleOption(option.id)}
              />
            ))
          )}
        </View>
      </View>
      {errorMessage ? <CardToast message={errorMessage} onClose={dismissError} /> : null}
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
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  section: {
    width: '100%',
    maxWidth: 353,
    alignSelf: 'center',
    gap: spacing[4],
    padding: spacing[4],
    borderRadius: radius.sm,
    backgroundColor: colors.gray.white,
  },
  loadingContainer: {
    minHeight: 152,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

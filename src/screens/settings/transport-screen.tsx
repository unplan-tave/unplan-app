import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsCheckboxRow } from '@/components/features/settings/settings-checkbox-row';
import { Header, HeaderBack } from '@/components/ui/Header';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { colors, radius, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useTransportSettings } from './hooks/use-transport-settings';

import type { TransportOptionId } from '@/domains/onboarding/model';
import type { TranslationKey } from '@/translations/ko';

const TRANSPORT_OPTION_DEFINITIONS = [
  { id: 'walk', labelKey: 'settings.transport.walk' },
  { id: 'bicycle', labelKey: 'settings.transport.bicycle' },
  { id: 'publicTransit', labelKey: 'settings.transport.publicTransit' },
  { id: 'car', labelKey: 'settings.transport.car' },
] satisfies ReadonlyArray<{ id: TransportOptionId; labelKey: TranslationKey }>;

export function TransportScreen() {
  const router = useRouter();
  const { selectedOptionIds, toggleOption, isLoading, isUpdating, errorMessage, dismissError } =
    useTransportSettings();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.defaultTransport')}
        left={<HeaderBack onPress={router.back} />}
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
            TRANSPORT_OPTION_DEFINITIONS.map((option) => (
              <SettingsCheckboxRow
                key={option.id}
                label={t(option.labelKey)}
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

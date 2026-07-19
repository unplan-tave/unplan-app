import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsCheckboxRow } from '@/components/features/settings/settings-checkbox-row';
import { Header, HeaderBack } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useRecoveryMethodsScreen } from './hooks/use-recovery-methods-screen';

export function RecoveryMethodsScreen() {
  const {
    settings,
    toggleDefaultOption,
    removeCustomMethod,
    customMethodMaxLength,
    isLoading,
    isUpdating,
    errorMessage,
    dismissError,
    isCustomEditing,
    customDraft,
    setCustomDraft,
    openCustomEditor,
    handleCustomSubmit,
    handleCustomBlur,
    handleBack,
    defaultOptions,
  } = useRecoveryMethodsScreen();

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.recoveryMethods')}
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
            <>
              {defaultOptions.map((option) => (
                <SettingsCheckboxRow
                  key={option.id}
                  label={option.label}
                  checked={settings.recoveryOptionIds.includes(option.id)}
                  disabled={isUpdating}
                  onToggle={() => toggleDefaultOption(option.id)}
                />
              ))}
              {settings.customMethods.map((method) => (
                <SettingsCheckboxRow
                  key={method}
                  label={method}
                  checked
                  disabled={isUpdating}
                  onToggle={() => removeCustomMethod(method)}
                />
              ))}
              <View style={styles.divider} />
              {isCustomEditing ? (
                <View style={styles.customInputRow}>
                  <View style={styles.customInputCheckbox} />
                  <TextInput
                    autoFocus
                    value={customDraft}
                    maxLength={customMethodMaxLength}
                    placeholder={t('settings.recovery.customPlaceholder')}
                    placeholderTextColor={colors.gray[300]}
                    returnKeyType="done"
                    style={styles.customInput}
                    onChangeText={setCustomDraft}
                    onSubmitEditing={handleCustomSubmit}
                    onBlur={handleCustomBlur}
                  />
                </View>
              ) : (
                <Pressable
                  accessibilityLabel={t('settings.recovery.customAdd')}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.customAddRow, pressed && styles.pressed]}
                  disabled={isUpdating}
                  onPress={openCustomEditor}
                >
                  <Icon name="plus" size={20} color={colors.gray[400]} />
                  <Typography variant="bodyM" color={colors.gray[400]}>
                    {t('settings.recovery.customAdd')}
                  </Typography>
                </Pressable>
              )}
            </>
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
    minHeight: 194,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  customAddRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  customInputCheckbox: {
    width: 24,
    height: 24,
    borderRadius: radius['2xs'],
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray.white,
  },
  customInput: {
    flex: 1,
    padding: 0,
    ...typography.bodyM,
    color: colors.gray[800],
  },
  pressed: {
    opacity: 0.72,
  },
});

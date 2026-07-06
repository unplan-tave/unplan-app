import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CardToast } from '@/components/domain/schedule/card-toast';
import { SettingsCheckboxRow } from '@/components/features/settings/settings-checkbox-row';
import { Header, HeaderBack } from '@/components/ui/Header';
import { Icon } from '@/components/ui/Icon';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Typography } from '@/components/ui/Typography';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useRecoveryMethods } from './hooks/use-recovery-methods';

import type { RecoveryOptionId } from '@/domains/onboarding/model';
import type { TranslationKey } from '@/translations/ko';

const DEFAULT_OPTION_DEFINITIONS = [
  { id: 'nap', labelKey: 'settings.recovery.nap' },
  { id: 'music', labelKey: 'settings.recovery.music' },
  { id: 'walk', labelKey: 'settings.recovery.walk' },
  { id: 'stretching', labelKey: 'settings.recovery.stretching' },
  { id: 'food', labelKey: 'settings.recovery.food' },
] satisfies ReadonlyArray<{ id: Exclude<RecoveryOptionId, 'custom'>; labelKey: TranslationKey }>;

export function RecoveryMethodsScreen() {
  const router = useRouter();
  const {
    settings,
    toggleDefaultOption,
    removeCustomMethod,
    addCustomMethod,
    customMethodMaxLength,
    errorMessage,
    dismissError,
  } = useRecoveryMethods();
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  const handleCustomSubmit = () => {
    const normalizedDraft = customDraft.trim();

    if (!normalizedDraft) {
      return;
    }

    addCustomMethod(normalizedDraft);
    setCustomDraft('');
    setIsCustomEditing(false);
    Keyboard.dismiss();
  };

  return (
    <ScreenLayout backgroundColor={colors.gray[50]} contentStyle={styles.screen}>
      <Header
        title={t('settings.recoveryMethods')}
        left={<HeaderBack onPress={router.back} />}
        right={<View style={styles.headerSide} />}
        style={styles.header}
      />
      <View style={styles.content}>
        <View style={styles.section}>
          {DEFAULT_OPTION_DEFINITIONS.map((option) => (
            <SettingsCheckboxRow
              key={option.id}
              label={t(option.labelKey)}
              checked={settings.recoveryOptionIds.includes(option.id)}
              onToggle={() => toggleDefaultOption(option.id)}
            />
          ))}
          {settings.customMethods.map((method) => (
            <SettingsCheckboxRow
              key={method}
              label={method}
              checked
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
                onBlur={() => {
                  if (!customDraft.trim()) {
                    setIsCustomEditing(false);
                    setCustomDraft('');
                  }
                }}
              />
            </View>
          ) : (
            <Pressable
              accessibilityLabel={t('settings.recovery.customAdd')}
              accessibilityRole="button"
              style={({ pressed }) => [styles.customAddRow, pressed && styles.pressed]}
              onPress={() => setIsCustomEditing(true)}
            >
              <Icon name="plus" size={20} color={colors.gray[400]} />
              <Typography variant="bodyM" color={colors.gray[400]}>
                {t('settings.recovery.customAdd')}
              </Typography>
            </Pressable>
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

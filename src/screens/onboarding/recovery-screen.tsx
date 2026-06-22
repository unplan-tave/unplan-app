import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet } from 'react-native';

import { OnboardingOptionGrid } from '@/components/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight } from '@/constants/theme';
import { t } from '@/lib/i18n';
import { type RecoveryOptionId } from '@/state/onboarding/model';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';
import { type TranslationKey } from '@/translations/ko';

const recoveryOptionDefinitions = [
  { id: 'nap', labelKey: 'onboarding.recovery.nap', icon: '😴' },
  { id: 'music', labelKey: 'onboarding.recovery.music', icon: '🎧' },
  { id: 'walk', labelKey: 'onboarding.recovery.walk', icon: '🚶' },
  { id: 'stretching', labelKey: 'onboarding.recovery.stretching', icon: '🧘' },
  { id: 'food', labelKey: 'onboarding.recovery.food', icon: '🍽️' },
  { id: 'custom', labelKey: 'onboarding.option.custom', icon: '', isCustom: true },
] satisfies ReadonlyArray<{
  id: RecoveryOptionId;
  labelKey: TranslationKey;
  icon: string;
  isCustom?: boolean;
}>;

export function RecoveryScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.recoveryOptionIds);
  const customRecoveryLabel = useOnboardingStore((state) => state.preferences.customRecoveryLabel);
  const toggleRecoveryOption = useOnboardingStore((state) => state.toggleRecoveryOption);
  const setCustomRecoveryLabel = useOnboardingStore((state) => state.setCustomRecoveryLabel);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const [customDraft, setCustomDraft] = useState(customRecoveryLabel ?? '');
  const recoveryOptions = recoveryOptionDefinitions.map((option) => ({
    id: option.id,
    icon: option.icon,
    isCustom: option.isCustom,
    label: t(option.labelKey),
  }));
  const hasSelection = selectedIds.length > 0;

  useEffect(() => {
    if (!isCustomEditing) {
      setCustomDraft(customRecoveryLabel ?? '');
    }
  }, [customRecoveryLabel, isCustomEditing]);

  const handleOptionPress = (optionId: RecoveryOptionId) => {
    if (optionId !== 'custom') {
      toggleRecoveryOption(optionId);
      return;
    }

    setCustomDraft(customRecoveryLabel ?? '');
    setIsCustomEditing(true);
  };

  const handleCustomSubmit = () => {
    const normalizedLabel = customDraft.trim();

    if (!normalizedLabel) {
      setCustomRecoveryLabel(null);

      if (selectedIds.includes('custom')) {
        toggleRecoveryOption('custom');
      }
    } else {
      setCustomRecoveryLabel(normalizedLabel);

      if (!selectedIds.includes('custom')) {
        toggleRecoveryOption('custom');
      }
    }

    setIsCustomEditing(false);
    Keyboard.dismiss();
  };

  return (
    <OnboardingStepLayout
      title={t('onboarding.recovery.title')}
      subtitle={
        <Typography variant="bodyM" align="center" color={colors.gray[700]}>
          {t('onboarding.recovery.subtitlePrefix')}
          <Typography style={styles.subtitleStrong}>
            {t('onboarding.recovery.subtitleHighlight')}
          </Typography>
          {t('onboarding.recovery.subtitleSuffix')}
        </Typography>
      }
      progress={0.04}
      ctaDisabled={!hasSelection}
      ctaCaption={null}
      contentRaised={isCustomEditing}
      onConfirm={() => router.push(onboardingRoutes.sleep)}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={false}
        bounces={false}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <OnboardingOptionGrid
          options={recoveryOptions}
          selectedIds={selectedIds}
          customEditing={isCustomEditing}
          customInputValue={customDraft}
          onCustomInputChange={setCustomDraft}
          onCustomInputSubmit={handleCustomSubmit}
          onToggle={handleOptionPress}
        />
      </ScrollView>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  subtitleStrong: {
    fontFamily: fontFamilyWeight.bold,
  },
  scroll: {
    width: '100%',
    marginTop: 24,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 16,
  },
});

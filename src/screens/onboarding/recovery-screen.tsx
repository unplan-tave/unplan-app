import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OnboardingOptionGrid } from '@/components/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
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
  { id: 'custom', labelKey: 'onboarding.option.custom', icon: 'plus' },
] satisfies ReadonlyArray<{ id: RecoveryOptionId; labelKey: TranslationKey; icon: string }>;

export function RecoveryScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.recoveryOptionIds);
  const toggleRecoveryOption = useOnboardingStore((state) => state.toggleRecoveryOption);
  const recoveryOptions = recoveryOptionDefinitions.map((option) => ({
    id: option.id,
    icon: option.icon,
    label: t(option.labelKey),
  }));

  return (
    <OnboardingStepLayout
      title={t('onboarding.recovery.title')}
      subtitle={t('onboarding.recovery.subtitle')}
      progress={0.04}
      ctaDisabled={selectedIds.length === 0}
      onConfirm={() => router.push(onboardingRoutes.sleep)}
    >
      <OnboardingOptionGrid
        options={recoveryOptions}
        selectedIds={selectedIds}
        onToggle={toggleRecoveryOption}
        style={styles.grid}
      />
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 28,
  },
});

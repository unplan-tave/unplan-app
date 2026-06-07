import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OnboardingOptionGrid } from '@/components/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { t } from '@/lib/i18n';
import { type RecoveryOptionId } from '@/state/onboarding/model';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

const recoveryOptions: ReadonlyArray<{ id: RecoveryOptionId; label: string; icon: string }> = [
  { id: 'nap', label: t('onboarding.recovery.nap'), icon: '😴' },
  { id: 'music', label: t('onboarding.recovery.music'), icon: '🎧' },
  { id: 'walk', label: t('onboarding.recovery.walk'), icon: '🚶' },
  { id: 'stretching', label: t('onboarding.recovery.stretching'), icon: '🧘' },
  { id: 'food', label: t('onboarding.recovery.food'), icon: '🍽️' },
  { id: 'custom', label: t('onboarding.option.custom'), icon: 'plus' },
];

export function RecoveryScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.recoveryOptionIds);
  const toggleRecoveryOption = useOnboardingStore((state) => state.toggleRecoveryOption);

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

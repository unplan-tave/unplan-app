import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { OnboardingOptionGrid } from '@/components/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { t } from '@/lib/i18n';
import { type TransportOptionId } from '@/state/onboarding/model';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';
import { type TranslationKey } from '@/translations/ko';

const transportOptionDefinitions = [
  { id: 'walk', labelKey: 'onboarding.transport.walk', icon: '🚶' },
  { id: 'bicycle', labelKey: 'onboarding.transport.bicycle', icon: '🚲' },
  { id: 'publicTransit', labelKey: 'onboarding.transport.publicTransit', icon: '🚆' },
  { id: 'car', labelKey: 'onboarding.transport.car', icon: '🚗' },
] satisfies ReadonlyArray<{ id: TransportOptionId; labelKey: TranslationKey; icon: string }>;

export function TransportScreen() {
  const router = useRouter();
  const selectedIds = useOnboardingStore((state) => state.preferences.transportOptionIds);
  const toggleTransportOption = useOnboardingStore((state) => state.toggleTransportOption);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const transportOptions = transportOptionDefinitions.map((option) => ({
    id: option.id,
    icon: option.icon,
    label: t(option.labelKey),
  }));

  const handleConfirm = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingStepLayout
      title={t('onboarding.transport.title')}
      subtitle={t('onboarding.transport.subtitle')}
      progress={0.96}
      ctaDisabled={selectedIds.length === 0}
      onConfirm={handleConfirm}
    >
      <OnboardingOptionGrid
        options={transportOptions}
        selectedIds={selectedIds}
        onToggle={toggleTransportOption}
        style={styles.grid}
      />
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    marginTop: 40,
  },
});

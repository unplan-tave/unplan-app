import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingOptionGrid } from '@/components/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
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
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const submissionError = useOnboardingStore((state) => state.submissionError);
  const transportOptions = transportOptionDefinitions.map((option) => ({
    id: option.id,
    icon: option.icon,
    label: t(option.labelKey),
  }));

  const handleConfirm = async () => {
    if (isSubmitting) {
      return;
    }

    const didComplete = await completeOnboarding();

    if (didComplete) {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = async () => {
    if (isSubmitting) {
      return;
    }

    const didComplete = await completeOnboarding({ skipTransport: true });

    if (didComplete) {
      router.replace('/(tabs)');
    }
  };

  return (
    <OnboardingStepLayout
      title={t('onboarding.transport.title')}
      subtitle={t('onboarding.transport.subtitle')}
      progress={0.96}
      ctaLabel={isSubmitting ? t('common.saving') : t('common.confirm')}
      ctaDisabled={selectedIds.length === 0 || isSubmitting}
      ctaCaption={t('common.skipTransport')}
      ctaCaptionDisabled={isSubmitting}
      onCtaCaptionPress={() => void handleSkip()}
      onConfirm={() => void handleConfirm()}
    >
      <View style={styles.content}>
        <OnboardingOptionGrid
          options={transportOptions}
          selectedIds={selectedIds}
          onToggle={toggleTransportOption}
          style={styles.grid}
        />
        {submissionError ? (
          <Typography
            variant="bodyS"
            color={colors.secondary}
            align="center"
            accessibilityLiveRegion="polite"
          >
            {submissionError}
            {'\n'}
            {t('onboarding.error.retry')}
          </Typography>
        ) : null}
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
    gap: spacing[5],
  },
  grid: {
    marginTop: 40,
  },
});

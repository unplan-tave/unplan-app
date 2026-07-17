import { StyleSheet, View } from 'react-native';

import { OnboardingOptionGrid } from '@/components/features/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/features/onboarding/onboarding-step-layout';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useTransportScreen } from './hooks/use-transport-screen';

export function TransportScreen() {
  const {
    selectedIds,
    toggleTransportOption,
    isSubmitting,
    submissionError,
    handleConfirm,
    handleSkip,
    transportOptions,
  } = useTransportScreen();

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

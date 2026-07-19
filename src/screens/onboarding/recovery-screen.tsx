import { ScrollView, StyleSheet } from 'react-native';

import { OnboardingOptionGrid } from '@/components/features/onboarding/onboarding-option-grid';
import { OnboardingStepLayout } from '@/components/features/onboarding/onboarding-step-layout';
import { Typography } from '@/components/ui/Typography';
import { colors, fontFamilyWeight } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useRecoveryScreen } from './hooks/use-recovery-screen';

export function RecoveryScreen() {
  const {
    selectedIds,
    recoveryOptions,
    isCustomEditing,
    customDraft,
    setCustomDraft,
    hasSelection,
    handleOptionPress,
    handleCustomSubmit,
    handleBack,
    handleConfirm,
  } = useRecoveryScreen();

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
      onBackPress={handleBack}
      onConfirm={handleConfirm}
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

import { useRouter } from 'expo-router';

import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { SleepConditionCircle } from '@/components/onboarding/sleep-condition-circle';
import { t } from '@/lib/i18n';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

export function SleepScreen() {
  const router = useRouter();
  const targetSleepMinutes = useOnboardingStore((state) => state.preferences.targetSleepMinutes);
  const setTargetSleepMinutes = useOnboardingStore((state) => state.setTargetSleepMinutes);

  return (
    <OnboardingStepLayout
      title={t('onboarding.sleep.title')}
      subtitle={t('onboarding.sleep.subtitle')}
      note={t('onboarding.sleep.note')}
      progress={0.38}
      ctaCaption={null}
      onConfirm={() => router.push(onboardingRoutes.activity)}
    >
      <SleepConditionCircle
        targetSleepMinutes={targetSleepMinutes}
        onTargetSleepMinutesChange={setTargetSleepMinutes}
      />
    </OnboardingStepLayout>
  );
}

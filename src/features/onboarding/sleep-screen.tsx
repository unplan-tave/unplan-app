import { useRouter } from 'expo-router';

import { t } from '@/lib/i18n';

import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { SleepConditionCircle } from './components/SleepConditionCircle';
import { onboardingRoutes } from './routes';
import { useOnboardingStore } from './use-onboarding-store';

export function SleepScreen() {
  const router = useRouter();
  const targetSleepMinutes = useOnboardingStore((state) => state.preferences.targetSleepMinutes);

  return (
    <OnboardingStepLayout
      title={t('onboarding.sleep.title')}
      subtitle={t('onboarding.sleep.subtitle')}
      progress={0.38}
      ctaCaption={null}
      onConfirm={() => router.push(onboardingRoutes.activity)}
    >
      <SleepConditionCircle targetSleepMinutes={targetSleepMinutes} />
    </OnboardingStepLayout>
  );
}

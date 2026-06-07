import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { t } from '@/lib/i18n';

import { ActivityTimeRail } from './components/ActivityTimeRail';
import { OnboardingStepLayout } from './components/OnboardingStepLayout';
import { onboardingRoutes } from './routes';
import { useOnboardingStore } from './use-onboarding-store';

export function ActivityScreen() {
  const router = useRouter();
  const preferences = useOnboardingStore((state) => state.preferences);
  const toggleActivityHour = useOnboardingStore((state) => state.toggleActivityHour);
  const hasSleepTime = preferences.sleepTimeRanges.length > 0;

  return (
    <OnboardingStepLayout
      title={t('onboarding.activity.title')}
      subtitle={t('onboarding.activity.subtitle')}
      progress={0.71}
      ctaDisabled={!hasSleepTime}
      onConfirm={() => router.push(onboardingRoutes.transport)}
    >
      <View style={styles.rails}>
        <ActivityTimeRail
          label={t('onboarding.activity.focusTime')}
          ranges={preferences.focusTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('focusTimeRanges', hour)}
        />
        <ActivityTimeRail
          label={t('onboarding.activity.sleepyTime')}
          ranges={preferences.sleepyTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('sleepyTimeRanges', hour)}
        />
        <ActivityTimeRail
          label={t('onboarding.activity.sleepTime')}
          required
          ranges={preferences.sleepTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('sleepTimeRanges', hour)}
        />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  rails: {
    width: '100%',
    marginTop: 57,
    gap: 60,
  },
});

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ActivityTimeRail } from '@/components/onboarding/activity-time-rail';
import { OnboardingStepLayout } from '@/components/onboarding/onboarding-step-layout';
import { t } from '@/lib/i18n';
import { onboardingRoutes } from '@/state/onboarding/routes';
import { useOnboardingStore } from '@/state/onboarding/use-onboarding-store';

const ACTIVITY_RAILS_MARGIN_TOP = 57;
const ACTIVITY_RAILS_GAP = 60;

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
    marginTop: ACTIVITY_RAILS_MARGIN_TOP,
    gap: ACTIVITY_RAILS_GAP,
  },
});

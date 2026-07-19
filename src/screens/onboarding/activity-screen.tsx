import { StyleSheet, View } from 'react-native';

import { ActivityTimeRail } from '@/components/features/onboarding/activity-time-rail';
import { OnboardingStepLayout } from '@/components/features/onboarding/onboarding-step-layout';
import { colors } from '@/constants/theme';
import { t } from '@/lib/i18n';

import { useActivityScreen } from './hooks/use-activity-screen';

const ACTIVITY_RAILS_MARGIN_TOP = 57;
const ACTIVITY_RAILS_GAP = 60;

export function ActivityScreen() {
  const { preferences, toggleActivityHour, hasSleepTime, handleConfirm } = useActivityScreen();

  return (
    <OnboardingStepLayout
      title={t('onboarding.activity.title')}
      subtitle={t('onboarding.activity.subtitle')}
      progress={0.71}
      backgroundColor={colors.onboardingMutedBackground}
      titleMinHeight={34}
      ctaDisabled={!hasSleepTime}
      ctaCaption={null}
      onConfirm={handleConfirm}
    >
      <View style={styles.rails}>
        <ActivityTimeRail
          id="focus"
          label={t('onboarding.activity.focusTime')}
          ranges={preferences.focusTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('focusTimeRanges', hour)}
        />
        <ActivityTimeRail
          id="sleepy"
          label={t('onboarding.activity.sleepyTime')}
          ranges={preferences.sleepyTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('sleepyTimeRanges', hour)}
        />
        <ActivityTimeRail
          id="sleep"
          label={t('onboarding.activity.sleepTime')}
          required
          requiredLabel={t('onboarding.activity.required')}
          ranges={preferences.sleepTimeRanges}
          onToggleHour={(hour) => toggleActivityHour('sleepTimeRanges', hour)}
        />
      </View>
    </OnboardingStepLayout>
  );
}

const styles = StyleSheet.create({
  rails: {
    alignSelf: 'stretch',
    marginTop: ACTIVITY_RAILS_MARGIN_TOP,
    gap: ACTIVITY_RAILS_GAP,
  },
});

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';

import { useUpdateAlarmSettingsMutation } from '@/domains/member/api/mutations';
import { useDepsChanged } from '@/hooks/use-deps-changed';
import { t } from '@/lib/i18n';

import type { AlarmSettings } from '@/domains/member/model';

export function useHomeNotification() {
  const params = useLocalSearchParams<{ onboardingNotification?: string }>();
  const [isVisible, setIsVisible] = useState(() => params.onboardingNotification === '1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mutation = useUpdateAlarmSettingsMutation();
  const isNotificationParamChanged = useDepsChanged([params.onboardingNotification]);
  if (isNotificationParamChanged && params.onboardingNotification === '1') setIsVisible(true);
  const close = useCallback(() => {
    setIsVisible(false);
    setErrorMessage(null);
    router.replace('/(tabs)');
  }, []);
  const update = useCallback(
    (enabled: boolean) => {
      if (mutation.isPending) return;
      const settings: AlarmSettings = {
        scheduleEndAlarmOn: enabled,
        conditionRecordAlarmOn: enabled,
        recommendAlarmOn: enabled,
      };
      setErrorMessage(null);
      mutation.mutate(settings, {
        onSuccess: close,
        onError: () => setErrorMessage(t('onboarding.notification.saveError')),
      });
    },
    [close, mutation],
  );
  return {
    isNotificationModalVisible: isVisible,
    notificationErrorMessage: errorMessage,
    isUpdatingNotification: mutation.isPending,
    updateNotificationSettings: update,
    closeNotificationModal: close,
  };
}

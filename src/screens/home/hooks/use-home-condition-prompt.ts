import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useDailyMeasurementQuery } from '@/domains/measurement/api/queries';
import { mmkvStorage } from '@/lib/storage/mmkv-storage';

const LAST_SHOWN_DATE_KEY = 'home-condition-prompt-last-shown-date';

/** 오늘의 Body/Mind·수면 입력 상태에 맞춰 하루 한 번만 안내 모달을 노출합니다. */
export function useHomeConditionPrompt(today: string, enabled = true) {
  const [isVisible, setIsVisible] = useState(false);
  const dailyMeasurementQuery = useDailyMeasurementQuery(today, { enabled });

  useEffect(() => {
    if (!enabled || dailyMeasurementQuery.data == null) return;

    const hasRecordedToday =
      dailyMeasurementQuery.data.isEnergyRecorded && dailyMeasurementQuery.data.isSleepRecorded;
    const lastShownDate = mmkvStorage.get(LAST_SHOWN_DATE_KEY);

    if (hasRecordedToday || lastShownDate === today) {
      if (hasRecordedToday && lastShownDate !== today) {
        mmkvStorage.set(LAST_SHOWN_DATE_KEY, today);
      }
      setIsVisible(false);
      return;
    }

    mmkvStorage.set(LAST_SHOWN_DATE_KEY, today);
    setIsVisible(true);
  }, [dailyMeasurementQuery.data, enabled, today]);

  const close = () => setIsVisible(false);
  const openConditionMeasure = () => {
    close();
    router.push('/energy/measure');
  };

  return {
    isVisible,
    close,
    openConditionMeasure,
  };
}

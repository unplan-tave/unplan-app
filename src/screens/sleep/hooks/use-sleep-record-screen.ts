/** 수면 기록 입력과 저장 mutation을 관리합니다. */
import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useCreateSleepRecordMutation } from '@/domains/sleep/api/mutations';

/** 수면 기록 화면이 사용할 form 상태와 이벤트를 반환합니다. */
export function useSleepRecordScreen() {
  const [bedTime, setBedTime] = useState('23:00');
  const [wakeUpTime, setWakeUpTime] = useState('07:00');
  const [isNap, setIsNap] = useState(false);
  const [isAllNight, setIsAllNight] = useState(false);
  const mutation = useCreateSleepRecordMutation();
  /** 낮잠 여부를 변경하고 밤샘 선택을 해제합니다. */
  const toggleNap = useCallback(() => {
    setIsNap((value) => !value);
    setIsAllNight(false);
  }, []);
  /** 밤샘 여부를 변경하고 낮잠 선택을 해제합니다. */
  const toggleAllNight = useCallback(() => {
    setIsAllNight((value) => !value);
    setIsNap(false);
  }, []);
  /** 입력한 수면 기록을 서버에 저장합니다. */
  const save = useCallback(() => {
    if (mutation.isPending) return;
    mutation.mutate({ bedTime, wakeUpTime, isNap, isAllNight }, { onSuccess: () => router.back() });
  }, [bedTime, isAllNight, isNap, mutation, wakeUpTime]);
  /** 이전 화면으로 이동합니다. */
  const goBack = useCallback(() => router.back(), []);

  return {
    bedTime,
    wakeUpTime,
    isNap,
    isAllNight,
    isSaving: mutation.isPending,
    error: mutation.isError,
    setBedTime,
    setWakeUpTime,
    toggleNap,
    toggleAllNight,
    save,
    goBack,
  };
}

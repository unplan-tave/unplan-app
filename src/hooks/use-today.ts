import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { isSameDate, startOfDay } from '@/lib/utils/date';

let cachedToday = startOfDay(new Date());

/** 날짜가 같으면 같은 Date 객체를 돌려줘 useSyncExternalStore가 불필요하게 다시 렌더링하지 않게 합니다. */
function getToday(): Date {
  const now = new Date();

  if (!isSameDate(now, cachedToday)) {
    cachedToday = startOfDay(now);
  }

  return cachedToday;
}

function subscribe(onStoreChange: () => void) {
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') onStoreChange();
  });

  return () => subscription.remove();
}

/**
 * 오늘 날짜(00:00)를 반환합니다. 렌더할 때마다 날짜를 다시 확인하고,
 * 앱이 foreground로 돌아왔을 때 날짜가 바뀌었으면 다시 렌더링합니다.
 * 반환값은 공유 객체이므로 직접 수정하지 않습니다.
 */
export function useToday(): Date {
  return useSyncExternalStore(subscribe, getToday);
}

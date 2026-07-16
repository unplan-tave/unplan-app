import { router } from 'expo-router';
import { useCallback } from 'react';

import type { Href } from 'expo-router';

/**
 * GNB 탭 이동을 한 곳에서 관리합니다.
 *
 * GNB primitive는 카드 목록 탭 value로 `list`를, HomeBottomNav는 `cardList`를 쓰기 때문에
 * 두 값을 모두 같은 라우트로 매핑합니다. 매핑에 없는 value는 이동하지 않습니다.
 */
const TAB_ROUTES: Record<string, Href> = {
  home: '/(tabs)',
  list: '/schedule',
  cardList: '/schedule',
  condition: '/condition',
  setting: '/settings',
};

export function useTabNavigation() {
  return useCallback((value: string) => {
    const href = TAB_ROUTES[value];

    if (href == null) {
      return;
    }

    router.navigate(href);
  }, []);
}

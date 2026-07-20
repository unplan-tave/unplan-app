import { router } from 'expo-router';
import { useCallback } from 'react';

import type { Href } from 'expo-router';

/** 이전 화면이 있으면 되돌아가고, 딥링크 진입 시에는 안전한 기본 화면으로 이동합니다. */
export function useGoBack(fallbackPath: Href = '/(tabs)') {
  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackPath);
  }, [fallbackPath]);
}

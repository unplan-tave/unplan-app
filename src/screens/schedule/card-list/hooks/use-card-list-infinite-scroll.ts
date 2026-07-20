import { useCallback } from 'react';

import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const LOAD_MORE_THRESHOLD = 160;

interface UseCardListInfiniteScrollParams {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/** 목록 끝에 가까워졌을 때 다음 서버 페이지를 요청합니다. */
export function useCardListInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseCardListInfiniteScrollParams) {
  return useCallback(
    ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const hasReachedEnd =
        layoutMeasurement.height + contentOffset.y >= contentSize.height - LOAD_MORE_THRESHOLD;

      if (hasReachedEnd && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );
}

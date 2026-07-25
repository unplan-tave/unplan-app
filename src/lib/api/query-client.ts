import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      // 서버 상태는 화면 재진입·앱 복귀 시 재검증합니다. 각 도메인의 명시적인
      // staleTime은 해당 데이터의 갱신 특성에 따라 별도로 유지합니다.
      staleTime: 0,
    },
  },
});

# 라우팅

[← 문서 목록](../README.md) · [폴더 구조](./folder-structure.md)

## 원칙

- Expo Router 기준으로 `src/app`은 route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain-or-area>/<screen-name>/*-screen.tsx`에 둡니다.
- route URL/segment가 `/card`여도 실제 screen 구현은 `src/screens/schedule/<screen-name>`에 둘 수 있습니다.
- route 파일은 가능하면 screen re-export만 합니다.
- route parameter 검증과 redirect는 route/screen 경계에서 명확히 처리합니다.

## 예시

```tsx
export { CardListScreen as default } from '@/screens/schedule/card-list/card-list-screen';
```

## Screen 책임

screen은 다음을 담당합니다.

- route parameter 검증
- React Query/Zustand 연결
- loading/error/empty 분기
- feature component 조립
- navigation action 연결

feature/domain/ui component는 router를 직접 만지지 않습니다. 필요한 action은 props callback으로 받습니다.

## Dev route

카탈로그, 디버그, 실험 화면은 production에서 접근을 막습니다.

```tsx
import { Redirect } from 'expo-router';

export default function DevRoute() {
  if (process.env.NODE_ENV === 'production') {
    return <Redirect href="/" />;
  }

  return <DevScreen />;
}
```

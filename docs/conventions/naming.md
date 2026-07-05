# 네이밍 컨벤션

[← 컨벤션](./README.md) · [코어 컨벤션](./core.md)

## 파일명

| 대상 | 규칙 | 예시 |
|------|------|------|
| route 파일 | Expo Router 규칙 | `index.tsx`, `[id].tsx`, `_layout.tsx` |
| screen 파일 | kebab-case + `-screen.tsx` | `card-list-screen.tsx` |
| component 파일 | kebab-case, 기존 `components/ui` 폴더 규칙은 유지 | `social-login-button.tsx` |
| hook 파일 | kebab-case, `use-` 접두사 | `use-card-sheets.ts` |
| store 파일 | kebab-case, `use-*-store.ts` | `use-schedule-store.ts` |
| domain model | `model.ts` | `domains/schedule/model.ts` |
| domain API | `api.ts` | `domains/schedule/api.ts` |
| validation | `validation.ts` | `domains/onboarding/validation.ts` |
| route 상수 | `routes.ts` | `domains/onboarding/routes.ts` |
| 테스트 | 대상 파일명 + `.test.ts(x)` | `validation.test.ts` |

## 코드 식별자

```ts
const cardList = [];
const isLoading = false;

function formatDate(date: Date): string {
  return '';
}

function CardListScreen() {
  return null;
}

type CardStatus = 'queue' | 'pin';

interface CardListItemProps {
  title: string;
}

const MAX_CARD_COUNT = 20;
```

- 변수/함수는 camelCase를 사용합니다.
- 컴포넌트, 타입, 인터페이스는 PascalCase를 사용합니다.
- 상수는 의미상 전역 불변값일 때 UPPER_SNAKE_CASE를 사용합니다.
- Boolean은 `is`, `has`, `can`, `should` 접두사를 우선합니다.

## 이벤트 핸들러

```ts
const handlePress = () => {};
const handleCardCreate = () => {};

interface Props {
  onPress: () => void;
  onCardCreate: () => void;
}
```

- 컴포넌트 내부 함수는 `handle` 접두사를 사용합니다.
- props callback은 `on` 접두사를 사용합니다.

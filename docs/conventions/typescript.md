# TypeScript 컨벤션

[← 컨벤션](./README.md) · [코어 컨벤션](./core.md)

## 기본 원칙

- `any`는 금지합니다. 외부 입력은 `unknown`으로 받은 뒤 타입 가드로 좁힙니다.
- 객체 형태의 props/API 응답은 `interface`를 우선합니다.
- union, intersection, tuple, utility type은 `type`을 사용합니다.
- non-null assertion(`!`)은 금지합니다. early return 또는 타입 가드로 처리합니다.

```ts
function getMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return '알 수 없는 오류가 발생했습니다.';
}
```

## DTO와 ViewModel 분리

서버 생성 타입을 화면에서 직접 쓰지 않습니다.

```ts
import type { ScheduleDetailResponse } from '@/lib/api/model';

export interface ScheduleViewModel {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  status: 'scheduled' | 'done' | 'skipped';
}

export function toScheduleViewModel(dto: ScheduleDetailResponse): ScheduleViewModel {
  return {
    id: dto.id,
    title: dto.title ?? '',
    startAt: new Date(dto.startAt),
    endAt: new Date(dto.endAt),
    status: dto.status,
  };
}
```

- Orval 생성 타입은 `src/lib/api/model`에 둡니다.
- 프론트 전용 타입은 `src/domains/<domain>/model.ts`에 둡니다.
- DTO -> ViewModel 변환은 `src/domains/<domain>/api/mapper.ts` 또는 도메인 순수 함수로 모읍니다.
- UI는 ViewModel만 바라보게 합니다.

## Optional과 기본값

```tsx
interface TagListProps {
  tags?: string[];
}

function TagList({ tags = [] }: TagListProps) {
  return null;
}
```

- optional 배열/객체 props는 안전 기본값을 둡니다.
- 빈 문자열, 0, false가 유효한 값이면 `||` 대신 `??`를 사용합니다.

## 고정 길이 데이터

```ts
type TabItem = {
  key: string;
  label: string;
};

const TABS: [TabItem, TabItem, TabItem, TabItem] = [
  { key: 'home', label: '홈' },
  { key: 'card', label: '카드' },
  { key: 'condition', label: '컨디션' },
  { key: 'setting', label: '설정' },
];
```

GNB처럼 길이가 고정된 데이터는 tuple 타입으로 누락을 컴파일 단계에서 잡습니다.

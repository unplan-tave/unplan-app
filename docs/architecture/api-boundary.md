# API Boundary

[← 문서 목록](../README.md) · [폴더 구조](./folder-structure.md)

## 원칙

서버 DTO와 화면 ViewModel 사이에 도메인 boundary를 둡니다.

```txt
OpenAPI spec
  -> Orval generated code (`src/lib/api`)
  -> domain API wrapper (`src/domains/<domain>/api.ts` or `src/domains/<domain>/api/client.ts`)
  -> mapper (`src/domains/<domain>/api/mapper.ts`)
  -> ViewModel (`src/domains/<domain>/model.ts`)
  -> screen / component props
```

## Orval 생성물

- `src/lib/api/endpoints/**`와 `src/lib/api/model/**`은 직접 수정하지 않습니다.
- OpenAPI 스펙 변경 시 `npm run api:generate`로 재생성합니다.
- 생성 타입을 화면 props나 UI state에 직접 사용하지 않습니다.

## DTO -> ViewModel

```ts
import { getSchedule } from '@/lib/api/endpoints/schedule-crud/schedule-crud';
import type { ScheduleViewModel } from '@/domains/schedule/model';

export async function fetchScheduleViewModel(id: string): Promise<ScheduleViewModel> {
  const response = await getSchedule(id);
  return toScheduleViewModel(response.data);
}
```

- unwrap, null 보정, enum/label 매핑은 domain API 또는 mapper에서 처리합니다.
- 화면은 ViewModel과 domain 함수만 사용합니다.
- DTO 필드명이 바뀌어도 화면 변경이 최소화되도록 mapper 경계를 유지합니다.

## 도메인 API 위치

API wrapper와 ViewModel mapper는 `src/domains/<domain>`에 둡니다. 작은 도메인은 현재처럼 `api.ts` 단일 파일을 허용하고, 도메인이 커지면 아래처럼 분리합니다.

```txt
src/domains/<domain>/api/
├── client.ts
├── mapper.ts
├── query-keys.ts
├── queries.ts
└── mutations.ts
```

- `queries.ts`는 TanStack Query `use*Query` hook을 둡니다.
- `mutations.ts`는 TanStack Query `use*Mutation` hook을 둡니다.
- query key factory는 `query-keys.ts`로 분리합니다.
- generated API/DTO는 이 경계 밖으로 직접 퍼뜨리지 않습니다.

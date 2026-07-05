# API Boundary

[← 문서 목록](../README.md) · [폴더 구조](./folder-structure.md)

## 원칙

서버 DTO와 화면 ViewModel 사이에 도메인 boundary를 둡니다.

```txt
OpenAPI spec
  -> Orval generated code (`src/lib/api`)
  -> domain API wrapper (`src/domains/<domain>/api.ts`)
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

API wrapper와 ViewModel mapper는 `src/domains/<domain>`에 둡니다.

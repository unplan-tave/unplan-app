# 의존 방향

[← 문서 목록](../README.md) · [폴더 구조](./folder-structure.md)

## 기본 방향

```txt
screens/* -> components/features/*
screens/* -> components/domain/*
screens/* -> components/ui/*
components/features/* -> components/domain/*
components/domain/* -> components/ui/*

screens/* -> domains/*
components/features/* -> domains/*
components/domain/* -> domains/*

domains/* -> components/* 금지
```

## 레이어별 책임

| 레이어 | 위치 | 참조 가능 | 금지 |
|--------|------|-----------|------|
| Route | `src/app` | `screens` | 화면 구현, API/store 직접 접근 |
| Screen | `src/screens` | `components`, `domains`, `hooks`, `lib` | route 파일에 구현 누수 |
| Feature UI | `src/components/features` | `components/domain`, `components/ui`, `domains` | API/store 직접 접근 |
| Domain UI | `src/components/domain` | `components/ui`, `domains` | 특정 화면 플로우 의존 |
| UI primitive | `src/components/ui` | `constants`, React Native primitive | domain 지식, routing, store |
| Domain logic | `src/domains` | `lib`, `constants` | `components` 참조 |
| Infra | `src/lib` | 외부 SDK, generated API | 특정 화면/feature 의존 |

## API Boundary

Orval generated code는 `src/lib/api`에 유지하고 generated endpoint/model 파일은 직접 수정하지 않습니다.

도메인에서 서버 API를 사용할 때는 `src/domains/<domain>/api` 아래에 경계를 둡니다.

- `api/client.ts`: generated endpoint를 감싸는 domain API wrapper
- `api/mapper.ts`: DTO ↔ domain model/ViewModel 변환
- `api/query-keys.ts`: query key factory. query가 있을 때만 생성
- `api/queries.ts`: `use*Query`. query가 있을 때만 생성
- `api/mutations.ts`: `use*Mutation`. mutation hook이 필요할 때만 생성

API가 없는 도메인에는 빈 `api/` 폴더를 만들지 않습니다. screen/components는 generated DTO가 아니라 domain model/ViewModel을 사용합니다.
Orval generated API 변화는 domain API boundary에서 흡수하고, screen/components가 generated endpoint/model 구조 변화에 직접 흔들리지 않게 합니다.

`src/lib/auth`는 SDK/token storage 같은 인프라 레이어이며, auth 도메인 정책과 flow 조합은 `src/domains/auth`에 둡니다.

## Feature끼리 import 금지

`components/features/create-card`가 `components/features/card-list`를 직접 import하지 않습니다.

같은 feature 폴더 내부의 보조 컴포넌트끼리는 상대 import로 참조할 수 있습니다. 금지 대상은 서로 다른 feature 폴더 사이의 직접 의존입니다.

공유가 필요하면 다음 중 하나로 이동합니다.

- 도메인 표현 컴포넌트라면 `components/domain/<domain>`
- 도메인 지식이 없다면 `components/ui`
- 순수 로직이라면 `domains/<domain>`

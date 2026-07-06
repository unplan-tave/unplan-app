# Domains 컨벤션

[← 컨벤션](./README.md) · [API boundary](../architecture/api-boundary.md)

## 이름

도메인 로직의 최상위 폴더명은 `domains`를 사용합니다.

- `state`는 store만 담기에는 적절하지만, 현재 역할보다 좁습니다.
- `model`은 store/api/validation까지 담기에는 좁으므로 최상위 폴더명으로 쓰지 않습니다.

도메인 로직은 `src/domains` 아래에 둡니다.

도메인 폴더는 화면명이나 UI flow명이 아니라 제품/백엔드 도메인 기준으로 정합니다. `card`는 최상위 domain이 아니며, pin card / queue card / card list / card view / queue-to-pin은 `schedule` 도메인의 하위 개념입니다.

확정 목표 도메인 목록:

- `auth`
- `member`
- `onboarding-settings`
- `schedule`
- `sleep`
- `condition`
- `daily-memo`
- `measurement`
- `ai-recommendation`

목표 도메인 목록은 문서에 명시하지만, 실제 repo에는 현재 코드가 있는 폴더만 둡니다. `member`, `sleep`, `daily-memo`, `measurement`, `ai-recommendation`처럼 아직 구현 파일이 없는 폴더를 `.gitkeep`만으로 미리 만들지 않습니다.

## 기본 파일

| 파일 | 역할 |
|------|------|
| `model.ts` | 프론트 도메인 타입, ViewModel, enum/union 타입 |
| `api/client.ts` | Orval generated endpoint를 감싸는 도메인 API wrapper |
| `api/mapper.ts` | DTO <-> ViewModel 변환 |
| `api/query-keys.ts` | query key factory |
| `api/queries.ts` | TanStack Query `use*Query` hook |
| `api/mutations.ts` | TanStack Query `use*Mutation` hook |
| `use-*-store.ts` | Zustand store |
| `validation.ts` | 도메인 검증 로직 |
| `routes.ts` | 해당 도메인의 route 상수 |
| `*.ts` | 날짜 계산, 라벨 매핑, 검색, 정렬 등 순수 로직 |

파일과 하위 폴더는 실제 책임이 생길 때만 만듭니다. API가 아직 없으면 `api/`를 만들지 않고, 클라이언트 상태가 없으면 `use-<domain>-store.ts`를 만들지 않으며, 도메인 공통 상수가 없으면 `constants.ts`를 만들지 않습니다.

`onboarding-settings`는 제품 도메인명입니다. 현재 코드에는 과도기적으로 `src/domains/onboarding` 폴더가 남아 있으며, 폴더명 변경은 별도 PR에서 처리합니다. 새 문서와 목표 구조에서는 `onboarding-settings`를 기준명으로 사용합니다.

## 참조 규칙

- `domains`는 어디서든 참조할 수 있습니다.
- `domains`는 `components`를 참조하면 안 됩니다.
- React component, JSX, StyleSheet를 두지 않습니다.
- 도메인 순수 로직은 React component나 UI hook에 의존하지 않습니다.
- 서버 DTO는 domain boundary에서 ViewModel로 변환합니다.
- generated API/DTO는 `domains/<domain>/api` 밖으로 직접 퍼뜨리지 않습니다.
- Zustand store는 클라이언트 상태만 담당합니다.
- 서버 상태 캐시와 요청 lifecycle은 TanStack Query가 담당합니다.

## 예시

Schedule 도메인의 장기 목표 구조는 capability 단위 분리를 허용합니다. 단, 실제 코드가 없는 폴더는 미리 만들지 않습니다.

```txt
src/domains/schedule/
├── model.ts
├── constants.ts
├── use-schedule-store.ts
├── pin-card/
│   ├── model.ts
│   └── mapper.ts
├── queue-card/
│   ├── model.ts
│   └── mapper.ts
├── recurrence/
│   └── model.ts
├── location/
│   └── model.ts
├── create/
│   ├── model.ts
│   ├── validation.ts
│   └── mapper.ts
├── list/
│   ├── filter.ts
│   ├── sort.ts
│   └── search.ts
├── detail/
│   ├── mapper.ts
│   └── display.ts
└── convert/
    ├── queue-to-pin.ts
    └── recommendation.ts
```

API가 있는 도메인은 API boundary를 아래처럼 둡니다. query/mutation 파일은 실제 사용할 때만 만듭니다.

```txt
src/domains/schedule/api/
├── client.ts
├── mapper.ts
├── query-keys.ts
├── queries.ts
└── mutations.ts
```

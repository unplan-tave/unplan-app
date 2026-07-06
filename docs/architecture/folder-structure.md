# 폴더 구조

> 폴더의 책임과 import 방향을 정의합니다.

[← 문서 목록](../README.md) · [의존 방향](./dependency-rules.md) · [라우팅](./routing.md) · [API boundary](./api-boundary.md)

---

## 목표 구조

```txt
src/
├── app/                  # Expo Router route/layout only
├── screens/              # 실제 화면 조립
├── domains/              # UI 없는 도메인 로직 레이어
├── components/
│   ├── ui/               # 도메인 지식 없는 primitive
│   ├── domain/           # 여러 화면에서 재사용되는 도메인 표현 UI
│   └── features/         # Figma 화면명/사용자 플로우 단위 UI 조합
├── hooks/                # 앱 전역 공용 hook
├── lib/                  # 앱 전역 인프라
├── constants/
└── translations/
```

`src/domains`는 도메인 로직의 기준 위치입니다. `src/lib`은 루트 `lib/`로 빼지 않고 유지합니다.

목표 구조는 문서에 명시하되, 실제 repo에는 현재 코드가 있는 폴더만 둡니다. 미래 도메인이나 미래 feature 폴더를 `.gitkeep`만으로 미리 만들지 않고, 해당 레이어에 실제 코드가 들어갈 때 폴더를 생성합니다.

## `src/app`

Expo Router route/layout 전용입니다.

```txt
src/app/
├── _layout.tsx
├── index.tsx
├── (auth)/
├── (tabs)/
├── onboarding/
├── card/
└── ...
```

- route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain-or-area>/<screen-name>/*-screen.tsx`에 둡니다.
- route 파일은 가능하면 screen을 re-export만 합니다.
- 화면 로직, API 호출, 상태 조합 로직을 두지 않습니다.
- dev/catalog/debug route는 production에서 `<Redirect />`로 막습니다.

## `src/screens`

라우팅 진입점에서 호출되는 실제 화면 조립 레이어입니다.

```txt
src/screens/
├── auth/
├── onboarding/
├── home/
├── schedule/
├── settings/
└── dev/
```

- route에서 진입하는 화면 단위 컴포넌트를 둡니다.
- feature/domain/ui 컴포넌트를 조립합니다.
- screen-level hook을 호출합니다.
- navigation을 처리합니다.
- 필요한 domain store/action/query hook을 연결합니다.
- 화면별 상태 조합은 각 screen 폴더의 `hooks`에 둘 수 있습니다.
- 화면 아래로는 resolved props를 내려보냅니다.
- 복잡한 JSX는 `components/features/<screen-or-flow>`로 분리합니다.
- 순수 계산/검증/매핑은 `domains/<domain>`으로 분리합니다.
- 서버 상태 query/mutation hook은 `domains/<domain>/api`에 둡니다.

## `src/domains`

UI가 아닌 로직 레이어입니다.

목표 도메인 목록:

```txt
src/domains/
├── auth/
├── member/
├── onboarding-settings/
├── schedule/
├── sleep/
├── condition/
├── daily-memo/
├── measurement/
└── ai-recommendation/
```

현재 repo에는 구현된 도메인 폴더만 존재합니다.

```txt
src/domains/
├── auth/
├── onboarding/
└── schedule/
```

도메인 로직은 `src/domains`를 기준으로 import합니다.

`domains`는 화면명이나 UI flow명이 아니라 제품/백엔드 도메인 기준입니다. `card`는 최상위 domain이 아니며, pin card / queue card / card list / card view / queue-to-pin은 `schedule` 도메인의 하위 개념입니다.

`schedule` 도메인은 장기적으로 capability 단위로 세분화할 수 있습니다. 아직 실제 코드가 없는 하위 폴더는 만들지 않습니다.

```txt
src/domains/schedule/
├── model.ts
├── constants.ts
├── use-schedule-store.ts
├── pin-card/
├── queue-card/
├── recurrence/
├── location/
├── create/
├── list/
├── detail/
├── convert/
└── api/
```

도메인 폴더의 기본 역할:

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

규칙:

- `domains`는 어디서든 참조할 수 있습니다.
- `domains`는 `components`를 참조하면 안 됩니다.
- React component, JSX, StyleSheet를 두지 않습니다.
- generated API/DTO는 domain API boundary 밖으로 직접 퍼뜨리지 않습니다.
- screen/components는 generated DTO가 아니라 domain ViewModel을 사용합니다.
- Zustand store는 클라이언트 상태만 담당하고, 서버 상태 캐시는 TanStack Query가 담당합니다.
- `model`을 최상위 폴더명으로 쓰지 않습니다. store/api/validation까지 담기에는 좁기 때문입니다.

## `src/lib`

앱 전역 인프라와 외부 시스템 adapter를 둡니다.

```txt
src/lib/
├── api/
│   ├── client.ts
│   ├── mutator/
│   ├── endpoints/
│   └── model/
├── auth/
├── device/
├── storage/
├── i18n/
└── utils/
```

- API client, mutator, generated code
- 외부 SDK wrapper
- storage adapter
- device adapter
- 특정 도메인에 속하지 않는 util

## `src/components`

```txt
src/components/
├── ui/
├── domain/
└── features/
```

의존 방향은 [dependency-rules.md](./dependency-rules.md)를 따릅니다.

### components/features

Figma 화면명 또는 사용자 플로우명 기준으로 나눕니다.

```txt
src/components/features/
├── create-card/
├── queue-to-pin/
├── card-list/
├── card-view/
├── card-search/
├── home/
├── auth/
└── onboarding/
```

특정 화면/플로우에 종속된 조합 컴포넌트를 둡니다. Schedule 하위 UI라도 feature 폴더명은 `create-card`, `card-list`, `card-view`, `card-search`, `queue-to-pin`처럼 Figma 화면명/사용자 flow 기준으로 둡니다.

### components/domain

여러 화면/feature에서 재사용되는 도메인 표현 컴포넌트만 둡니다.

```txt
src/components/domain/
├── condition/
└── schedule/
```

예: condition meter, schedule time label, sleep duration label.

### components/ui

도메인 지식 없는 전역 primitive만 둡니다.

```txt
src/components/ui/
├── Button/
├── Card/
├── Chip/
├── Header/
├── BottomCTA/
├── BottomSheet/
├── Modal/
└── Typography/
```

카드형 UI는 `Card`, 하단 주요 액션은 `BottomCTA`, 공통 화면 골격은 `ScreenLayout`, 진행 헤더는 `HeaderProgress`를 먼저 검토합니다.

# 폴더 구조

> 폴더의 책임과 import 방향을 정의합니다.

[← 문서 목록](../README.md) · [의존 방향](./dependency-rules.md) · [라우팅](./routing.md) · [API boundary](./api-boundary.md)

---

## 목표 구조

```txt
src/
├── app/
├── screens/
├── domains/
├── lib/
├── components/
├── hooks/
├── constants/
├── translations/
└── assets/
```

`src/domains`는 도메인 로직의 기준 위치입니다. `components/features` 재배치는 후속 PR에서 처리합니다.

## `src/app`

Expo Router route/layout 전용입니다.

```txt
src/app/
├── _layout.tsx
├── index.tsx
├── (auth)/
├── (onboarding)/
├── (tabs)/
├── card/
├── memo/
├── condition/
└── home/
```

- route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain>/*-screen.tsx`에 둡니다.
- route 파일은 가능하면 screen을 re-export만 합니다.
- dev/catalog/debug route는 production에서 `<Redirect />`로 막습니다.

## `src/screens`

라우팅, query/store 연결, loading/error/empty 분기, feature 조립을 담당합니다.

```txt
src/screens/
├── auth/
├── onboarding/
├── card/
├── home/
├── schedule/
├── memo/
└── condition/
```

- 화면별 상태 조합은 `screens/<domain>/hooks`에 둘 수 있습니다.
- 화면 아래로는 resolved props를 내려보냅니다.
- API, React Query, Zustand 접근은 screen 또는 screen hook에서 처리합니다.

## `src/domains`

UI가 아닌 로직 레이어입니다.

```txt
src/domains/
├── auth/
├── onboarding/
├── card/
├── member/
├── schedule/
├── sleep/
├── condition/
├── daily-memo/
├── measurement/
└── ai-recommendation/
```

도메인 로직은 `src/domains`를 기준으로 import합니다.

도메인 폴더의 기본 역할:

| 파일 | 역할 |
|------|------|
| `model.ts` | 프론트 도메인 타입, ViewModel, enum/union 타입 |
| `api.ts` | Orval 생성 API wrapper, DTO -> ViewModel 변환 |
| `use-*-store.ts` | Zustand store |
| `validation.ts` | 도메인 검증 로직 |
| `routes.ts` | 해당 도메인의 route 상수 |
| `*.ts` | 날짜 계산, 라벨 매핑, 검색, 정렬 등 순수 로직 |

규칙:

- `domains`는 어디서든 참조할 수 있습니다.
- `domains`는 `components`를 참조하면 안 됩니다.
- `model`을 최상위 폴더명으로 쓰지 않습니다. store/api/validation까지 담기에는 좁기 때문입니다.

## `src/lib`

앱 전역 인프라와 외부 시스템 adapter를 둡니다.

```txt
src/lib/
├── api/
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
├── add-pin-card/
├── add-queue-card/
├── queue-to-pin/
├── card-list/
├── card-view/
├── home-daily/
├── home-progress/
├── condition-main/
├── condition-detail/
├── onboarding/
└── setting/
```

특정 화면/플로우에 종속된 조합 컴포넌트를 둡니다. `components/features/card`처럼 도메인 전체를 크게 묶는 구조는 후속 PR에서 화면/플로우 단위로 나눕니다.

### components/domain

여러 화면/feature에서 재사용되는 도메인 표현 컴포넌트만 둡니다.

```txt
src/components/domain/
├── schedule/
├── condition/
├── sleep/
├── daily-memo/
├── measurement/
├── onboarding-settings/
├── auth/
├── member/
└── ai-recommendation/
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

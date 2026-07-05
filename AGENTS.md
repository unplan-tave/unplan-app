# Agent Guidelines

Expo SDK 56 기준으로 코드를 작성합니다. 공식 문서: https://docs.expo.dev/versions/v56.0.0/

## 프로젝트 문서

| 문서 | 용도 |
|------|------|
| [docs/conventions/core.md](./docs/conventions/core.md) | 컨벤션 진입점/색인 |
| [docs/architecture/folder-structure.md](./docs/architecture/folder-structure.md) | 폴더 책임과 목표 구조 |
| [docs/architecture/dependency-rules.md](./docs/architecture/dependency-rules.md) | 레이어별 의존 방향 |
| [docs/architecture/api-boundary.md](./docs/architecture/api-boundary.md) | Orval/API wrapper/ViewModel 경계 |
| [docs/frontend/component-decomposition.md](./docs/frontend/component-decomposition.md) | screen/component 분리 기준 |
| [docs/roadmap/development-checklist.md](./docs/roadmap/development-checklist.md) | 병행 개발 원칙 + PR 분리 계획 |

린트·포맷 규칙은 `eslint.config.js`, `.prettierrc`가 우선입니다.

## 구조 원칙

- Expo Router 공식 권장에 맞춰 `src/app`에는 route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain>/*-screen.tsx`에 둡니다.
- 재사용 컴포넌트는 `src/components` 아래에 둡니다.
  - 전역 primitive/base 컴포넌트는 `src/components/ui`에 둡니다.
  - 여러 화면/feature에서 재사용되는 도메인 표현 컴포넌트는 `src/components/domain`에 둡니다.
  - 특정 화면/플로우에 종속된 조합 컴포넌트는 `src/components/features/<screen-or-flow>`에 둡니다.
- 도메인 타입, store, API wrapper, validation, 순수 로직은 `src/domains/<domain>`에 둡니다.
  - 현재 코드의 `src/state`는 후속 PR에서 `src/domains`로 이동합니다. 이 PR에서는 코드 import를 바꾸지 않습니다.
- 앱 전역 hook은 `src/hooks`에 둡니다.

## 컴포넌트 구현 원칙

- 새 컴포넌트는 기존 `src/components/ui` primitive를 먼저 기반으로 구현합니다.
  - 카드형 UI는 `Card`를 기반으로 구현합니다.
  - 하단 주요 액션은 `BottomCTA`를 기반으로 구현합니다.
  - 공통 화면 골격은 `ScreenLayout`을 기반으로 구현합니다.
  - 진행 헤더는 `HeaderProgress`를 기반으로 구현합니다.
- primitive가 비어 있거나 요구사항을 충족하지 못하면, 도메인 컴포넌트에서 새로 중복 구현하지 말고 primitive를 먼저 확장합니다.
- 화면 고유 조합 컴포넌트는 `components/features/<screen-or-flow>`에 두되, 스타일/상태/접근성의 base 동작은 가능한 한 `components/ui`에서 가져옵니다.

## PR 전 자가 점검

리뷰에서 반복적으로 지적된 항목입니다. PR 올리기 전에 아래를 확인합니다.

- **디자인 토큰 사용** — 색상·radius·spacing에 리터럴(`'#EAF4FF'`, `'rgba(...)'`, `borderRadius: 13`)을 직접 쓰지 않습니다. `colors`/`radius`/`spacing` 토큰을 사용하고, 없으면 `constants`에 토큰을 먼저 추가합니다. (StyleSheet 외 동적 값만 인라인 허용)
- **primitive는 `variant`로 확장** — 기존 primitive의 base 스타일을 직접 바꾸면 모든 소비자에 파급됩니다. 새 모양이 필요하면 base를 수정하지 말고 `variant` prop으로 분기하고, 기본값은 기존 동작을 유지합니다.
- **반응형 폭** — 고정 px 폭(`width: 354`) 대신 `width: '100%'` + `maxWidth`를 사용해 좁은 기기에서 잘리지 않게 합니다.
- **dev 전용 라우트는 프로덕션 가드** — `src/app/dev/*` 등 카탈로그/디버그 화면은 `process.env.NODE_ENV === 'production'`일 때 접근을 막습니다(`<Redirect />`).
- **고정 길이 배열은 튜플 타입** — 길이가 고정된 입력(예: GNB 4탭)은 `[T, T, T, T]` 튜플로 타입을 강제해 누락을 컴파일 단계에서 잡습니다.
- **선택 props는 안전 기본값** — 옵셔널 배열/객체 prop은 기본값(`tags = []`)을 둬 `undefined` 런타임 에러를 방지합니다.
- **죽은 코드 제거** — 빈 스타일(`selected: {}`), 미사용 prop, 주석 처리된 코드는 남기지 않습니다.
- **순수 로직 테스트는 후순위** — 날짜 비교·라벨 매핑 등 순수 함수는 `domains/<domain>`에 두고, `*.test.ts`는 기능 작업이 끝난 뒤 한꺼번에 추가합니다. 기능·리팩터링 PR마다 테스트를 필수로 넣지 않습니다.

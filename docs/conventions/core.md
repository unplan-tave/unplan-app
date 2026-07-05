# 코어 컨벤션

> Unplan 앱 개발 규칙의 진입점입니다. 상세 규칙은 주제별 문서를 기준으로 합니다.

[← 문서 목록](../README.md) · [확장 컨벤션](./advanced.md) · [개발 체크리스트](../roadmap/development-checklist.md)

---

## 문서 색인

| 문서 | 다루는 범위 |
|------|-------------|
| [folder-structure.md](../architecture/folder-structure.md) | `src/app`, `screens`, `domains`, `lib`, `components` 구조 |
| [dependency-rules.md](../architecture/dependency-rules.md) | 레이어별 import 방향과 금지 의존성 |
| [routing.md](../architecture/routing.md) | Expo Router route 파일과 screen 연결 |
| [api-boundary.md](../architecture/api-boundary.md) | Orval 생성 타입, API wrapper, ViewModel 경계 |
| [component-decomposition.md](../frontend/component-decomposition.md) | 비대한 screen/component를 나누는 기준 |
| [naming.md](./naming.md) | 파일명, 타입명, 변수명, 이벤트 핸들러 네이밍 |
| [typescript.md](./typescript.md) | TypeScript, DTO/ViewModel 분리, null 처리 |
| [components.md](./components.md) | React component 작성 순서, props, primitive 확장 |
| [styling.md](./styling.md) | 디자인 토큰, StyleSheet, 반응형 폭 |
| [domains.md](./domains.md) | `domains`, Zustand store, validation, route 상수 |
| [hooks.md](./hooks.md) | 전역 hook과 screen hook 분리 |
| [api.md](./api.md) | API 호출, 에러, 환경변수 규칙 |
| [git.md](./git.md) | 브랜치, 커밋, PR, 리뷰 체크 |
| [testing.md](./testing.md) | 테스트 우선순위와 파일 위치 |
| [advanced.md](./advanced.md) | 접근성, 성능, 보안, CI/CD 등 확장 주제의 색인 |

---

## 핵심 원칙

- Expo SDK 56 기준으로 작성합니다.
- `eslint.config.js`, `.prettierrc`, `tsconfig.json`처럼 도구가 강제하는 규칙이 문서보다 우선합니다.
- `src/app`에는 Expo Router route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain>/*-screen.tsx`에 둡니다.
- UI가 아닌 도메인 로직은 `src/domains/<domain>`에 둡니다.
- 앱 전역 인프라와 외부 SDK wrapper는 `src/lib`에 둡니다.
- 컴포넌트는 `components/ui`, `components/domain`, `components/features`로 나눕니다.
- 새 컴포넌트는 기존 `components/ui` primitive를 먼저 기반으로 구현합니다.
- primitive가 부족하면 feature/domain 컴포넌트에서 중복 구현하지 말고 primitive를 `variant`로 확장합니다.
- 생성된 서버 타입은 화면에서 직접 쓰지 않고 `domains/<domain>`의 mapper/API wrapper를 통해 ViewModel로 변환합니다.

---

## 빠른 참조

| 항목 | 규칙 |
|------|------|
| route 파일 | Expo Router 규칙, 가능하면 screen re-export |
| screen 파일 | `src/screens/<domain>/*-screen.tsx` |
| domain logic | `src/domains/<domain>` |
| base UI | `src/components/ui` |
| domain UI | `src/components/domain/<domain>` |
| feature UI | `src/components/features/<screen-or-flow>` |
| 파일명 | kebab-case, 기존 `components/ui` 폴더 규칙은 유지 |
| 컴포넌트 | PascalCase, function declaration |
| Hook | `use-` 파일명, `useXxx` 함수명 |
| Store | `use-*-store.ts` |
| 서버 상태 | React Query |
| 클라이언트 상태 | Zustand |
| 서버 타입 | Orval 생성 타입을 직접 수정 금지 |
| 화면 타입 | ViewModel로 분리 |
| 스타일 | `colors`/`radius`/`spacing`/`typography` 토큰 우선 |
| 테스트 | 순수 로직은 기능 작업이 안정된 뒤 모아서 추가 |
| 커밋 | Conventional Commits |

---

## PR 전 체크

- 색상, radius, spacing 리터럴을 직접 쓰지 않았는가
- 새 UI 형태가 primitive base style 변경이 아니라 `variant` 추가로 처리됐는가
- 좁은 기기에서 고정 px 폭 때문에 잘리지 않는가
- dev 전용 route에 production guard가 있는가
- 고정 길이 배열을 tuple 타입으로 강제했는가
- optional 배열/객체 prop에 안전 기본값이 있는가
- 빈 style, 미사용 prop, 주석 처리된 죽은 코드가 남아 있지 않은가
- route 파일에 화면 구현이 들어가지 않았는가
- `domains`가 `components`를 import하지 않는가

# 컨벤션

코딩 규칙은 주제별 문서로 나뉩니다. 전체 진입점은 [core.md](./core.md)입니다.

## 문서 목록

| 문서 | 범위 |
|------|------|
| [core.md](./core.md) | 컨벤션 색인과 핵심 원칙 |
| [naming.md](./naming.md) | 파일명, 타입명, 변수명, 이벤트 핸들러 |
| [typescript.md](./typescript.md) | TypeScript, DTO/ViewModel 분리, optional 처리 |
| [components.md](./components.md) | 컴포넌트 작성 순서, props, primitive 확장 |
| [styling.md](./styling.md) | 디자인 토큰, StyleSheet, 반응형 폭 |
| [domains.md](./domains.md) | `domains` 폴더 역할과 도메인 파일 구성 |
| [hooks.md](./hooks.md) | 전역 hook, screen hook, 상태 분리 |
| [api.md](./api.md) | generated API, wrapper, 에러, 환경변수 |
| [git.md](./git.md) | 브랜치, 커밋, PR |
| [testing.md](./testing.md) | 테스트 우선순위와 파일 위치 |
| [advanced.md](./advanced.md) | 기존 확장 컨벤션 호환용 색인 |

## 관련 문서

| 영역 | 문서 |
|------|------|
| 폴더 구조 | [../architecture/folder-structure.md](../architecture/folder-structure.md) |
| 의존 방향 | [../architecture/dependency-rules.md](../architecture/dependency-rules.md) |
| 라우팅 | [../architecture/routing.md](../architecture/routing.md) |
| API boundary | [../architecture/api-boundary.md](../architecture/api-boundary.md) |
| 컴포넌트 분리 | [../frontend/component-decomposition.md](../frontend/component-decomposition.md) |
| 디자인 토큰 | [../frontend/design-tokens.md](../frontend/design-tokens.md) |
| 접근성 | [../frontend/accessibility.md](../frontend/accessibility.md) |

## 빠른 참조

| 항목 | 규칙 |
|------|------|
| route 파일 | Expo Router 규칙, 가능하면 screen re-export |
| screen | `src/screens/<domain>/*-screen.tsx` |
| domain logic | `src/domains/<domain>` |
| base UI | `src/components/ui` |
| feature UI | `src/components/features/<screen-or-flow>` |
| 서버 타입 | Orval 생성 타입을 직접 수정 금지 |
| 화면 타입 | ViewModel로 분리 |
| 스타일 | token 우선 |
| 커밋 | Conventional Commits |

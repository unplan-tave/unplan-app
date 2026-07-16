# unplan-app 문서

AI 스마트 스케줄러 앱 개발 문서 모음입니다.

## 문서 구조

| 영역 | 문서 | 설명 |
|------|------|------|
| 개요 | [overview.md](./overview.md) | 전체 구조·구현 현황·인프라 한눈에 |
| Architecture | [folder-structure.md](./architecture/folder-structure.md) | 앱 폴더 책임과 목표 구조 |
| Architecture | [dependency-rules.md](./architecture/dependency-rules.md) | 레이어별 import 방향 |
| Architecture | [routing.md](./architecture/routing.md) | Expo Router와 screen 경계 |
| Architecture | [api-boundary.md](./architecture/api-boundary.md) | Orval, API wrapper, ViewModel boundary |
| Conventions | [core.md](./conventions/core.md) | 컨벤션 진입점/색인 |
| Conventions | [README.md](./conventions/README.md) | 코딩 규칙 문서 목록 |
| Frontend | [component-decomposition.md](./frontend/component-decomposition.md) | screen/component 분리 기준 |
| Frontend | [design-tokens.md](./frontend/design-tokens.md) | 디자인 토큰 사용 원칙 |
| Frontend | [accessibility.md](./frontend/accessibility.md) | 접근성 기본 규칙 |
| Roadmap | [development-checklist.md](./roadmap/development-checklist.md) | 병행 개발 원칙과 PR 분리 계획 |

## 어떤 문서를 보면 되나요?

- **처음 합류 / 전체 그림** → [overview.md](./overview.md)
- **폴더 구조와 의존 방향** → [architecture/folder-structure.md](./architecture/folder-structure.md), [architecture/dependency-rules.md](./architecture/dependency-rules.md)
- **코딩할 때** → [conventions/core.md](./conventions/core.md)
- **컴포넌트가 커졌을 때** → [frontend/component-decomposition.md](./frontend/component-decomposition.md)
- **API와 ViewModel 경계** → [architecture/api-boundary.md](./architecture/api-boundary.md), [conventions/api.md](./conventions/api.md)
- **현재 어디까지 됐는지 / 다음 PR 범위** → [roadmap/development-checklist.md](./roadmap/development-checklist.md)
- **도구로 강제되는 규칙** → 레포 루트 `eslint.config.js`, `.prettierrc`, `.husky/pre-commit`

## AI 에이전트

Cursor/Claude/Codex 등 AI 도구는 루트 [AGENTS.md](../AGENTS.md)를 진입점으로 참조합니다.

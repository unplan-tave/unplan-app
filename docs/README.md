# unplan-app 문서

AI 스마트 스케줄러 앱 개발 문서 모음입니다.

## 문서 구조

| 문서 | 설명 |
|------|------|
| [코어 컨벤션](./conventions/core.md) | 프로젝트 구조, 네이밍, TS/React, 상태관리, Git 등 기본 규칙 |
| [확장 컨벤션](./conventions/advanced.md) | 접근성, 성능, CI/CD, 보안 등 심화 규칙 |
| [디자인 전 개발 체크리스트](./roadmap/pre-design-checklist.md) | ERD만 있을 때 프론트엔드 선행 작업 로드맵 |

## 어떤 문서를 보면 되나요?

- **코딩할 때** → [코어 컨벤션](./conventions/core.md) 먼저, 필요 시 [확장 컨벤션](./conventions/advanced.md)
- **다음에 뭘 할지** → [디자인 전 개발 체크리스트](./roadmap/pre-design-checklist.md)
- **도구로 강제되는 규칙** → 레포 루트 `eslint.config.js`, `.prettierrc`, `.husky/pre-commit`

## AI 에이전트

Cursor/Claude 등 AI 도구는 루트 [AGENTS.md](../AGENTS.md)를 진입점으로 참조합니다.

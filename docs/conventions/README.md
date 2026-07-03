# 컨벤션

코딩 규칙은 아래 문서로 나뉩니다.

| 문서 | 범위 |
|------|------|
| [core.md](./core.md) | 구조, 네이밍, TS, 컴포넌트, 스타일, 상태, API, Git, 테스트 |
| [component-decomposition.md](./component-decomposition.md) | `components/` 계층(ui/domain/feature) + 비대한 screen 정리 |
| [advanced.md](./advanced.md) | 접근성, 성능, 애니메이션, 보안, CI/CD, i18n, ADR 등 |

## 빠른 참조

| 항목 | 규칙 |
|------|------|
| 컴포넌트 | PascalCase, function declaration |
| 파일명 | 컴포넌트 PascalCase, 나머지 camelCase |
| 훅 | `use` 접두사, 반환값 객체 |
| 이벤트 핸들러 | `handle` (내부), `on` (Props) |
| Boolean | `is` / `has` / `can` / `should` 접두사 |
| `any` | 금지 |
| 서버 상태 | React Query |
| 전역 상태 | Zustand + immer |
| 커밋 | Conventional Commits |

자세한 내용은 [core.md](./core.md) 하단 **빠른 참조 카드**를 참고하세요.

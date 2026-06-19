# Agent Guidelines

Expo SDK 56 기준으로 코드를 작성합니다. 공식 문서: https://docs.expo.dev/versions/v56.0.0/

## 프로젝트 문서

| 문서 | 용도 |
|------|------|
| [docs/conventions/core.md](./docs/conventions/core.md) | 기본 코딩 컨벤션 |
| [docs/conventions/advanced.md](./docs/conventions/advanced.md) | 접근성, 성능, CI/CD 등 확장 규칙 |
| [docs/roadmap/development-checklist.md](./docs/roadmap/development-checklist.md) | 디자인·API·프론트 병행 개발 원칙 + 진행 상황 |

린트·포맷 규칙은 `eslint.config.js`, `.prettierrc`가 우선입니다.

## 구조 원칙

- Expo Router 공식 권장에 맞춰 `src/app`에는 route/layout 파일만 둡니다.
- 실제 화면 구현은 `src/screens/<domain>/*-screen.tsx`에 둡니다.
- 재사용 컴포넌트는 `src/components` 아래에 둡니다.
  - 전역 primitive/base 컴포넌트는 `src/components/ui`에 둡니다.
  - 특정 화면군에서 재사용되는 조합 컴포넌트는 `src/components/<domain>`에 둡니다.
- 앱 상태와 도메인 모델은 `src/state/<domain>`에 둡니다.
- 앱 전역 hook은 `src/hooks`에 둡니다.

## 컴포넌트 구현 원칙

- 새 컴포넌트는 기존 `src/components/ui` primitive를 먼저 기반으로 구현합니다.
  - 카드형 UI는 `Card`를 기반으로 구현합니다.
  - 하단 주요 액션은 `BottomCTA`를 기반으로 구현합니다.
  - 공통 화면 골격은 `ScreenLayout`을 기반으로 구현합니다.
  - 진행 헤더는 `HeaderProgress`를 기반으로 구현합니다.
- primitive가 비어 있거나 요구사항을 충족하지 못하면, 도메인 컴포넌트에서 새로 중복 구현하지 말고 primitive를 먼저 확장합니다.
- 화면 고유 조합 컴포넌트는 `components/<domain>`에 두되, 스타일/상태/접근성의 base 동작은 가능한 한 `components/ui`에서 가져옵니다.

# 개발 진행 체크리스트

> 디자인·API·프론트엔드가 동시에 진행되는 상황에서 PR 범위와 구조 변경 순서를 관리합니다.

[← 문서 목록](../README.md) · [폴더 구조](../architecture/folder-structure.md) · [API boundary](../architecture/api-boundary.md)

## 병행 개발 원칙

- OpenAPI/Swagger 스펙을 서버 타입의 단일 진실 원천으로 둡니다.
- Orval 생성 타입은 `src/lib/api`에서 관리하고 직접 수정하지 않습니다.
- 화면은 서버 DTO가 아니라 프론트 ViewModel을 사용합니다.
- DTO -> ViewModel 변환은 domain boundary에서 처리합니다.
- 화면은 mock/고정 데이터로 먼저 만들 수 있지만, 서버 연동 시 mapper 경계를 유지합니다.
- MMKV/SecureStore에 서버 DTO를 통째로 저장하지 않습니다.

## 구조 리팩터링 PR 순서

| 순서 | 범위 | 상태 | 비고 |
|------|------|------|------|
| 1 | docs IA 및 컨벤션 문서 분리 | 완료 | 코드 이동 없음 |
| 2 | `src/state` -> `src/domains` 이동 | 완료 | import 수정 포함 |
| 3 | `components/features` 화면명/플로우명 기준 재배치 | 완료 | 확실한 card-list/card-view/queue-to-pin 이동, 생성 공통 form은 보류 |
| 4 | `components/domain` 정리 및 잔재 제거 | 완료 | `ConditionMeter`는 domain/condition, `TimelineCard`는 features/home |
| 5 | 문서/AGENTS 최종 동기화 | 완료 | 실제 코드 구조와 문서 표현 재검증 |

## API boundary 정리

| 순서 | 범위 | 상태 | 비고 |
|------|------|------|------|
| 1 | `domains/schedule/api` (client, mapper, query-keys, queries, mutations) | 완료 | ViewModel은 `domains/schedule/model.ts`. 화면 mock/store 연동은 후속 PR |
| 2 | schedule 화면 mock/store → 서버 query 전환 | 대기 | `CardFormValues` ↔ API Input 브리지 포함 |

## 구조 리팩터링 원칙

- architecture 문서를 `docs/architecture`로 분리합니다.
- 네이밍, TypeScript, 컴포넌트, 스타일링, domains, hooks, api, git, testing 문서를 `docs/conventions`로 분리합니다.
- 컴포넌트 분해, 디자인 토큰, 접근성을 `docs/frontend`로 분리합니다.
- `state -> domains`, `src/lib 유지`, `features -> domain -> ui`, `domains는 components 참조 금지` 원칙을 문서에 명시합니다.

## 남은 구조 정리 후보

- `components/features/create-card` 구조와 schedule 하위 card flow 소유권 지속 점검
- 비어 있거나 실제 파일이 없는 문서 예시와 코드 구조의 지속 동기화
- 기능 구현 또는 화면 변경은 구조 리팩터링 PR과 분리

## 과거 로드맵

초기 Phase 기반의 긴 개발 계획은 [archive/initial-development-plan.md](./archive/initial-development-plan.md)에 보존합니다.

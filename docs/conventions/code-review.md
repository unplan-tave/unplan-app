# 코드 리뷰 가이드

[← 컨벤션](./README.md)

사람 리뷰어와 Codex 코드 리뷰가 함께 쓰는 리뷰 기준입니다. Codex는 `AGENTS.md`의 `## Code Review Rules` 섹션을 읽습니다. 그 섹션은 이 문서의 요약이므로, 기준을 바꾸면 두 곳을 함께 고칩니다.

## 원칙

- 모든 코멘트는 한국어로 씁니다. 코드 식별자, 에러 메시지, 라이브러리 이름은 원문을 유지합니다.
- 동작 회귀와 아키텍처 경계 위반을 적극적으로 짚고, 스타일 코멘트는 줄입니다.
- 변경의 영향까지 읽어야 보이는 문제에 집중합니다. 도구가 잡는 문제는 도구에 맡깁니다.
- 현재 diff와 관련 파일의 최신 내용을 기준으로 리뷰합니다. `return` 누락, import 경로 오류, 상태 필드 누락 같은 지적은 파일 전체를 확인한 뒤에 씁니다.
- 확실하지 않은 내용은 `Must Fix`가 아니라 `Questions`나 `Recommendations`에 씁니다.
- 제안 코드는 [core.md](./core.md)의 폴더 구조와 의존 방향을 따릅니다.

## 리뷰하지 않는 것

- `tsc`, lint, Prettier가 CI와 pre-push에서 잡는 타입·린트·포맷 문제
- Orval 생성물(`src/lib/api/endpoints`, `src/lib/api/model`)과 `package-lock.json`
- 이름, 줄바꿈 같은 취향 문제. 프로젝트 컨벤션 위반일 때만 `Recommendations`에 씁니다.
- 테스트 누락. 테스트는 기능이 안정된 뒤 도메인 단위로 모아서 추가합니다([testing.md](./testing.md)).

## 코멘트 구성

리뷰 요약은 아래 순서로 씁니다. 쓸 내용이 없는 섹션은 `없음`이라고 적습니다.

1. `Summary`
2. `Must Fix`
3. `Questions`
4. `Recommendations`
5. `Good Points`

### Summary

- 변경 의도와 영향 범위를 2~4문장으로 씁니다.
- 기능, 화면, 상태 관리, 라우팅, API 연동 중 무엇이 바뀌었는지 적습니다.
- 배포 영향을 한 줄로 적습니다. OTA로 나가는 변경인지, 네이티브 빌드가 필요한 변경인지 씁니다.

### Must Fix

머지 전에 반드시 고쳐야 하는 문제만 씁니다.

```text
[severity] 파일 경로:라인
문제:
왜 문제인지:
수정 방향:
예상 영향:
```

| severity | 기준 | Unplan 예 |
|----------|------|-----------|
| `critical` | 앱 실행 불가, 빌드 실패, 인증 실패, 데이터 유실, 비밀 값 노출 | 토큰이 로그나 MMKV에 남음, 네이티브 설정 변경이 OTA로만 배포됨 |
| `high` | 주요 사용자 흐름 실패, 잘못된 상태 저장, 라우팅 오류 | 로그아웃 후 이전 계정 캐시가 남음, 일정 수정·삭제 후 화면이 갱신되지 않음 |
| `medium` | 특정 조건에서 버그 가능성이 높음 | 에러·빈 응답에서 화면이 깨짐, KST 자정 근처 날짜 밀림 |
| `low` | 동작에는 문제없지만 고칠 가치가 있음 | 언마운트 시 정리되지 않는 타이머 |

### Questions

코드만으로 확정할 수 없는 설계 의도를 묻습니다. 서버 API 계약, Figma 수치, 타임존 정책, 플랫폼별 UX가 여기에 해당합니다.

### Recommendations

동작에는 문제가 없는 개선 제안입니다. 앞에 `[구조]`, `[타입]`, `[접근성]`, `[성능]`, `[플랫폼]` 중 하나를 붙입니다. "반드시 고쳐야 한다"처럼 쓰지 않습니다.

### Good Points

좋은 선택과 그 이유를 최대 2개까지 짧게 씁니다.

## 중점 확인 항목

### 동작 회귀

- 로그아웃·계정 전환 시 query cache, Zustand store, MMKV 값이 `clearClientSessionState`로 비워지는지
- 일정 생성·수정·삭제 mutation 뒤 카드 목록, 홈 타임라인, AI 추천 query가 invalidate되는지
- 낙관적 업데이트가 실패하면 롤백되는지
- 에러, 로딩, 빈 응답에서 화면이 깨지지 않는지

### 아키텍처 경계

- `src/app`에 화면 로직이나 데이터 조립이 들어오지 않는지
- 화면·컴포넌트가 Orval 생성 DTO를 직접 쓰지 않는지
- 서로 다른 feature 폴더가 직접 의존하지 않는지
- 순수 계산을 `use*` hook으로 만들지 않았는지, hook이 250줄을 넘거나 여러 책임을 가지면 분해를 검토했는지

### 비동기와 에러 처리

- `catch`에서 에러를 삼키지 않고 사용자에게 피드백하거나 기록하는지
- `console.error`에 axios 에러 객체를 통째로 넘겨 요청 헤더(Authorization)가 로그에 남지 않는지
- `void`로 띄운 Promise가 실패해도 괜찮은 호출인지

### 서버 상태

- query key를 도메인의 `*QueryKeys` 팩토리로만 만드는지
- invalidate 범위가 너무 좁거나 넓지 않은지
- `enabled` 조건이 빠져 빈 ID로 요청하지 않는지

### 날짜와 시간

- UTC와 로컬 시간이 섞이지 않는지. `toISOString()`은 UTC라서 KST 자정 근처에서 날짜가 하루 밀립니다.
- `end_date`, 일간·주간 경계, 분 단위 정렬이 맞는지

### 생명주기

- `setTimeout`, `AppState` 리스너, 구독이 언마운트될 때 정리되는지

### 보안

- 토큰은 SecureStore에만 두고 MMKV에 두지 않는지
- `EXPO_PUBLIC_*`에 비밀 값이 없는지

### UI 영향

- 공통 primitive의 base 스타일·기본 동작 변경이 기존 소비 화면에 영향을 주는지. 새 모양은 `variant`로 분기합니다.
- 고정 px 폭 때문에 좁은 기기에서 잘리지 않는지
- 디자인 토큰 위반은 화면이나 공통 컴포넌트에 영향이 있을 때만 짚습니다. 기계적 위반은 lint가 잡습니다.
- 새 `Pressable`에 `accessibilityRole`, `accessibilityLabel`이 있는지([accessibility.md](../frontend/accessibility.md))
- iOS와 Android 동작 차이(키보드, safe area, `Platform` 분기)

### 성능

- 길어질 수 있는 목록을 `ScrollView` 안에서 `.map`으로 그리지 않는지
- 메모이제이션은 측정 근거가 있을 때만 제안합니다.

### 배포 영향

- `app.config.*`, `app.json`, `eas.json`, `package.json`의 네이티브 의존성, `plugins/**` 변경이 `ci.yml`의 `detect-preview-changes` 필터에 걸려 네이티브 빌드로 가는지
- 워크플로에서 실패가 성공으로 처리되지 않는지(`continue-on-error`, `always()`, step outcome 판정, `|| true`)

## Codex 리뷰

구현은 Claude Code로 하고, 리뷰는 다른 모델인 Codex로 받습니다. 같은 모델이 놓치는 부분을 다른 모델로 보완하려는 목적입니다.

- 저장소 연결: ChatGPT의 Codex 설정에서 GitHub를 연결하고, 저장소 접근은 `unplan-tave/unplan-app`만 선택합니다.
- 자동 리뷰: Codex 설정의 Code review에서 Automatic review를 켭니다.
- 수동 요청: PR 댓글에 `@codex review`를 남깁니다.
- 리뷰 기준: `AGENTS.md`의 `## Code Review Rules`

Codex는 P0·P1 우선순위의 문제만 인라인으로 지적합니다. 이 문서의 섹션과는 아래처럼 맞춰 읽습니다.

| Codex 우선순위 | 이 문서의 섹션 |
|----------------|----------------|
| P0 | `Must Fix` (`critical`) |
| P1 | `Must Fix` (`high`) |

`medium` 이하와 `Recommendations`, `Good Points`는 사람 리뷰어가 씁니다.

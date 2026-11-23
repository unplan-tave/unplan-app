# Review instructions

Claude Code 리뷰 봇(`.github/workflows/claude-code-review.yml`)이 읽는 리뷰 설정입니다. 사람 리뷰어용 전체 기준과 중점 확인 항목은 [docs/conventions/code-review.md](./docs/conventions/code-review.md)에 있습니다. 봇은 이 파일을 먼저 따르고, 세부 확인 항목은 그 문서를 읽어 적용합니다.

봇은 PR이 아니라 **base 브랜치에 있는 이 파일**을 기준으로 리뷰합니다. 이 파일을 바꾼 PR은 머지된 뒤부터 반영됩니다.

## 언어와 톤

- 모든 코멘트는 한국어로 씁니다. 코드 식별자, 에러 메시지, 라이브러리 이름은 원문을 유지합니다.
- 짧고 구체적으로 씁니다. 칭찬, 인사, 사과, 맺음말은 쓰지 않습니다.
- 추측을 사실처럼 쓰지 않습니다. 코드로 확인한 것만 단정하고, 확인할 수 없으면 `Questions`에 씁니다.

## 리뷰 범위

- diff에서 바뀐 코드와, 그 변경이 영향을 주는 호출부·소비처를 봅니다. 지적하기 전에 관련 파일 전체를 읽어 확인합니다.
- 바뀌지 않은 코드의 기존 문제는 지적하지 않습니다. 이번 변경 때문에 새로 드러나는 경우만 예외입니다.

## 지적하지 않을 것

- `tsc`, oxlint·ESLint, Prettier가 CI와 pre-push에서 잡는 타입·린트·포맷·import 순서 문제
- Orval 생성물: `src/lib/api/endpoints/**`, `src/lib/api/model/**`
- `package-lock.json`, `ios/**` 아래 생성 파일, `dist/**`
- 이름, 줄바꿈, 주석 문체 같은 취향 문제
- 테스트 누락. 테스트는 기능이 안정된 뒤 도메인 단위로 모아서 추가합니다.
- lint disable 주석으로 사유를 적고 꺼 둔 규칙 위반
- 근거 없는 메모이제이션(`useMemo`, `useCallback`, `memo`) 제안

## 심각도

| 표시       | 기준                                                                                      | 어디에 쓰나           |
| ---------- | ----------------------------------------------------------------------------------------- | --------------------- |
| `critical` | 앱 실행 불가, 빌드 실패, 인증 실패, 데이터 유실, 비밀 값 노출                             | 인라인 + `Must Fix`   |
| `high`     | 주요 사용자 흐름 실패, 잘못된 상태 저장, 라우팅 오류, 네이티브 변경이 OTA로만 배포됨      | 인라인 + `Must Fix`   |
| `medium`   | 특정 조건에서 버그 가능성이 높음 (에러·빈 응답, KST 자정 근처 날짜, 정리되지 않는 리스너) | 인라인 + `Must Fix`   |
| `low`      | 동작에는 문제없지만 고칠 가치가 있음                                                      | `Recommendations`에만 |

- 인라인 코멘트는 `critical`, `high`, `medium`에만 답니다. 한 리뷰에 최대 10개까지 쓰고, 넘으면 심각한 순서로 고릅니다.
- 확신이 없으면 심각도를 올리지 말고 `Questions`로 보냅니다.

## 인라인 코멘트 형식

````markdown
**[high]** 한 줄 요약

- 문제: 무엇이 잘못됐는지
- 영향: 어떤 사용자 흐름·화면·배포에서 어떻게 드러나는지
- 수정 방향: 어떻게 고치면 되는지

```suggestion
(수정이 몇 줄 안에 끝나고, 그대로 커밋해도 문제가 완전히 해결될 때만)
```
````

## 요약 댓글 형식

리뷰마다 PR에 요약 댓글을 하나 남깁니다. 쓸 내용이 없는 섹션은 `없음`이라고 적습니다.

```markdown
## Claude 코드 리뷰

> 기준 커밋: `<head SHA 앞 7자리>`

### Summary

변경 의도와 영향 범위 2~4문장. 마지막 줄에 배포 영향(OTA / 네이티브 빌드 필요 / 배포 영향 없음).

### Must Fix

- **[high]** `파일:라인` 한 줄 요약 (인라인 코멘트와 같은 항목)

### Questions

- 코드만으로 확정할 수 없는 설계 의도 (서버 API 계약, Figma 수치, 타임존 정책, 플랫폼별 UX)

### Recommendations

- `[구조]`·`[타입]`·`[접근성]`·`[성능]`·`[플랫폼]` 중 하나를 붙인 개선 제안. 최대 3개.

### Good Points

- 좋은 선택과 이유. 최대 2개.
```

## 경로별 지침

### `src/app/**`

- route·layout 파일만 둡니다. 화면 로직, 데이터 조립, API 호출이 들어오면 `src/screens`로 옮기라고 짚습니다.
- `src/app/dev/**` 같은 카탈로그·디버그 라우트는 `process.env.NODE_ENV === 'production'`일 때 `<Redirect />`로 막아야 합니다.

### `src/screens/**`

- screen과 screen 전용 hook은 Orval 생성 DTO가 아니라 domain model·ViewModel을 씁니다.
- hook이 250줄을 넘거나 여러 책임을 가지면 분해를 권합니다(`low`).
- hook에서 UI 컴포넌트를 import하지 않습니다.
- 로딩·에러·빈 응답에서 화면이 깨지지 않는지 봅니다.

### `src/components/ui/**`

- primitive의 base 스타일·기본 동작을 바꾸면 모든 소비 화면에 영향이 갑니다. 기존 소비처를 찾아 영향을 확인하고, 새 모양은 `variant` prop으로 분기하도록 짚습니다.
- 고정 px 폭(`width: 354`) 대신 `width: '100%'` + `maxWidth`를 쓰는지 봅니다.
- 새 `Pressable`에 `accessibilityRole`, `accessibilityLabel`이 있는지 봅니다.

### `src/components/domain/**`, `src/components/features/**`

- 의존 방향: `components/domain`은 `components/features`를 import하지 않습니다. 한 feature 폴더가 다른 feature 폴더를 직접 import하지 않습니다.
- 옵셔널 배열·객체 prop에 안전 기본값(`tags = []`)이 있는지 봅니다.

### `src/domains/**`

- React component, JSX, StyleSheet가 들어오면 안 됩니다.
- Hook을 호출하지 않는 순수 계산을 `use*` 함수로 만들지 않습니다.
- `src/domains/<domain>/api/**`
  - generated endpoint·model import는 이 폴더에서만 허용합니다. DTO 변환은 `mapper.ts`에서 합니다.
  - query key는 도메인의 `*QueryKeys` 팩토리로만 만듭니다.
  - 일정 생성·수정·삭제 mutation 뒤 카드 목록, 홈 타임라인, AI 추천 query가 invalidate되는지 봅니다.
  - 낙관적 업데이트가 실패하면 롤백되는지 봅니다.
  - `enabled` 조건이 빠져 빈 ID로 요청하지 않는지 봅니다.
- 날짜·시간: `toISOString()`은 UTC라서 KST 자정 근처에서 날짜가 하루 밀립니다. 로컬 날짜 문자열이 필요한 곳에 쓰였는지 봅니다.

### `src/domains/auth/**`, `src/lib/auth/**`

- 토큰은 SecureStore에만 둡니다. MMKV, 로그, 에러 메시지에 남으면 `critical`입니다.
- 로그아웃·계정 전환·탈퇴 시 `clearClientSessionState`로 query cache, Zustand store, MMKV 값이 비워지는지 봅니다.
- `console.error`에 axios 에러 객체를 통째로 넘기면 Authorization 헤더가 로그에 남습니다.

### `src/lib/**` (생성물 제외)

- 외부 SDK wrapper, storage adapter 변경이 앱 전역에 주는 영향을 봅니다.
- `EXPO_PUBLIC_*` 환경변수에 비밀 값이 들어가지 않는지 봅니다.

### `app.config.*`, `app.json`, `eas.json`, `plugins/**`, `package.json`

- 네이티브 설정·네이티브 의존성 변경은 `.github/workflows/ci.yml`의 `detect-preview-changes` 필터에 걸려야 네이티브 빌드로 갑니다. 필터에 없는 경로라 OTA로만 나가면 `high`입니다.
- 새 config plugin이 `app.config.js`의 `plugins`에 등록됐는지 봅니다.

### `.github/workflows/**`, `.github/actions/**`

- 실패가 성공으로 처리되지 않는지 봅니다: `continue-on-error`, `always()`, `|| true`, step `outcome` 판정.
- secret 이름이 바뀌거나 로그에 출력되지 않는지 봅니다.
- `pull_request_target`, `issue_comment`처럼 외부 입력으로 도는 워크플로가 PR 코드를 실행하지 않는지 봅니다.

### `docs/**`, `*.md`

- 문서 내용이 코드·설정과 어긋나는 경우(없는 경로, 바뀐 명령, 틀린 설명)만 짚습니다. 문체는 지적하지 않습니다.

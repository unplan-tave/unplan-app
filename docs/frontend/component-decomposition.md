# 컴포넌트 배치 규칙

> [components.md](../conventions/components.md)는 **언제** 쪼갤지 정한다. 이 문서는 **어디에** 둘지 정한다.

[← 문서 목록](../README.md) · [컴포넌트 컨벤션](../conventions/components.md) · [의존 방향](../architecture/dependency-rules.md)

---

컴포넌트 분리 기준을 지켜도 screen이 비대해질 수 있다. 예: `screens/card/card-create-screen.tsx`는 useState ~17개, 핸들러 ~35개, 787줄.

원인은 보통 두 가지다.

1. 재사용 블록과 화면 전용 조합이 `components/` 아래에 섞여 있다.
2. API·store 접근과 JSX가 한 파일에 있다.

아래 **1절**은 폴더 배치, **2절**은 screen 내부 정리다.

---

## 1. components 계층

네 계층으로 나누고, **각 계층이 만질 수 있는 것**을 고정한다.

| 계층 | 위치 | 역할 | API / store |
|------|------|------|-------------|
| **UI** | `components/ui` | 도메인 모르는 primitive | ✗ |
| **도메인** | `components/domain` | 도메인 데이터 표시·가벼운 포맷 | ✗ |
| **기능** | `components/features/<feature>` | 특정 기능 UI 조합 | ✗ (로컬 UI 상태만) |
| **화면** | `screens/<domain>` (+ `hooks/`) | 라우팅·query·store·분기 | ✓ |

`app/<route>.tsx`는 `screens` re-export만 한다.

### 계층별 허용 / 금지

**UI** — props 렌더링, variant, 접근성, callback 전달. API·store·라우팅·도메인 가공 금지.
예: `Button`, `Card`, `BottomSheet`.

**도메인** — 도메인 props 표시, UI 조합, 가벼운 포맷. 데이터 출처·라우팅 금지.
예: `condition/condition-meter`.

**기능** — UI·도메인 조합, 기능 단위 레이아웃, `useState`/`useMemo`/`useCallback`으로 쓰는 UI 상태.
API·store 직접 접근은 지양. 하위가 공유하는 UI 상태만 기능 폴더 안에서 관리.
예: card `form/`·`view/`, `-sheet`, `-modal`.

**화면** — query·mutation·Zustand·라우팅·loading/error/empty 분기.
서버·전역 상태는 여기(또는 `screens/.../hooks/`)에서만 다루고, 아래로는 resolved props만 내린다.

### import 방향

```txt
화면 → 기능 → 도메인 → UI
```

위만 아래를 import한다. **기능끼리 import하지 않는다** — 공유가 필요하면 도메인으로 내린다.

### 어디에 둘지

- 앱 어디서나 쓴다(도메인 지식 없음) → **UI**
- 이 제품 도메인 안에서 여러 기능이 쓴다 → **도메인**
- 이 기능에서만 쓴다 → **기능**
- 애매하면 **기능**에 둔다. 도메인 승격은 두 번째 소비자가 생겼을 때만 한다.

### 폴더 예시

```txt
app/<route>.tsx
screens/<domain>/
  <name>-screen.tsx
  hooks/
    use-<name>-page-data.ts
    use-card-sheets.ts
components/
  ui/
  domain/
  features/<screen-or-flow>/
    add-pin-card/
    add-queue-card/
    card-list/
    card-view/
```

### 화면 데이터 훅

query·store 조합과 분기는 `screens/<domain>/hooks/`에 모은다. JSX는 분기 후 기능 컴포넌트에 props만 넘긴다.

```tsx
function HomeScreen() {
  const { user, briefing, isLoading, isError } = useHomePageData();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState />;

  return <HomeSection user={user} briefing={briefing} />;
}
```

---

## 2. screen이 커질 때

screen이 비대해지면 **상수 · 순수 로직 · 상태 · JSX**를 밖으로 뺀다.

### 상수

- 파일 안에서만 쓰면 파일 상단 (`SCREEN_MAX_WIDTH`, `CONTENT_TOP`).
- 도메인 공유면 `domains/<domain>` (`MEMO_MAX_LENGTH`, `DURATION_INCREMENT_BUTTONS`).
- 앱 전역이면 `constants/`.
- 색·radius·spacing 리터럴은 상수가 아니라 **토큰** (`AGENTS.md` 참고).

### 순수 함수

- props/state를 읽지 않는 함수는 `domains/<domain>/*`로 내린다.
- `getScheduleDate`, `isQueueFormComplete`, `hasDueDate` 같은 것은 screen 하단에 두지 않는다.
- `*.test.ts`는 기능 작업이 끝난 뒤 한꺼번에 추가한다. (리팩터링·기능 PR마다 필수는 아님)

### 상태

**(a) 묶이는 상태는 훅으로.** `screens/<domain>/hooks/`로 옮긴다.

```ts
// screens/card/hooks/use-card-sheets.ts
export function useCardSheets() {
  const [active, setActive] = useState<SheetKind>('none');
  const openDateTime = useCallback((focus: TimeFocus = 'start') => { ... }, []);
  const closeAll = useCallback(() => setActive('none'), []);
  return { active, openDateTime, closeAll };
}
```

**(b) 동시에 하나만 열리는 UI는 union 타입으로.** 시트를 boolean 여러 개로 두면 불가능한 조합이 생긴다.

```ts
// ❌ isDateTimeSheetVisible + isDueDurationSheetVisible + ...
// ✅
type SheetKind = 'none' | 'dateTime' | 'due' | 'location' | 'tag';
```

**(c) 파생값은 저장하지 않는다.** `isQueueFormComplete`를 useState에 복사해 두지 않는다. `watch`·`useMemo`·셀렉터로 계산한다.

**(d) 폼은 React Hook Form.** `watch` 값을 다시 useState로 미러링하지 않는다.

### JSX

- header, form body, toast처럼 구역이 나뉘면 `components/features/<feature>`로 분리. **props만** 받는다.
- pin/queue처럼 골격이 같으면 파일 복제 대신 공통 body + `variant` (`AGENTS.md`).

---

## 3. 기타

- **API·store는 화면(또는 화면 훅)에서만.** 기능·도메인에 `useQuery`·`usePinCardStore`가 들어가면 계층이 무너진다.
- **effect** — 범용은 `hooks/`, 화면 종속은 `screens/<domain>/hooks/`.
- **useCallback/useMemo** — memoized 자식·effect 의존성에만 쓴다. 핸들러 35개를 전부 감싸지 않는다. 훅으로 묶는 게 먼저다.
- **prop drilling 3단 이상** — 화면 스코프 Context 검토. 얕으면 props가 낫다.
- **store 셀렉터** — `useStore((s) => s.saveDraft)`처럼 낱개 구독. 객체로 한 번에 뽑지 않는다.
- **loading/error/empty** — 화면에서 분기. `LoadingState` 등은 UI 또는 도메인 컴포넌트.
- **분리는 수단이다.** 한 화면에서만 쓰는 20줄 조각을 파일로 쪼개면 추적만 어려워진다.

---

## 체크리스트

- [ ] UI / 도메인 / 기능 중 어디에 속하는지 판단했는가
- [ ] import가 `화면 → 기능 → 도메인 → UI` 한 방향인가
- [ ] API·store를 화면(또는 화면 훅)에서만 쓰는가
- [ ] screen 본문이 `훅 → 분기 → JSX`로 읽히는가
- [ ] useState 5개 넘으면 훅으로 묶었는가
- [ ] 상호배타 UI를 union 타입으로 합쳤는가
- [ ] 파생값을 useState에 저장하지 않는가
- [ ] 순수 함수를 `domains/<domain>`으로 내렸는가
- [ ] 색·spacing·radius에 토큰을 썼는가
- [ ] 죽은 코드(빈 스타일, 미사용 prop)를 지웠는가

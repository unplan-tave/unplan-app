# Hooks 컨벤션

[← 컨벤션](./README.md)

## 위치

| 위치 | 용도 |
|------|------|
| `src/hooks` | 앱 전역 hook |
| `src/screens/<domain-or-area>/<screen-name>/hooks` | 특정 화면에 종속된 page-data/sheet/form 조합 hook |
| `src/domains/<domain>` | React에 의존하지 않는 순수 로직 |
| `src/domains/<domain>/api/queries.ts` | 서버 상태 `use*Query` hook |
| `src/domains/<domain>/api/mutations.ts` | 서버 상태 `use*Mutation` hook |

## 이름

- 파일명은 `use-*.ts` 또는 `use-*.tsx`를 사용합니다.
- 함수명은 `useXxx`를 사용합니다.
- 반환값은 호출부 가독성을 위해 객체를 우선합니다.
- Hook 이름은 React Hook을 호출하거나 React state/effect/ref 같은 상태 관리 로직을 감쌀 때만 사용합니다.
- Hook을 호출하지 않는 순수 계산/매핑/검증 함수에는 `use`를 붙이지 않습니다.
- `useMount`, `useEffectOnce`처럼 생명주기만 감싸는 범용 Hook은 만들지 않습니다. 구체적인 사용 사례가 드러나는 이름을 사용합니다.

```ts
export function useCardSheets() {
  return {
    activeSheet,
    openDateTime,
    closeAll,
  };
}
```

## 사용하는 경우

Custom Hook은 컴포넌트 간 로직을 재사용하거나, screen/component에서 세부 구현을 숨기고 목적을 드러낼 때 사용합니다. Hook은 state 값 자체를 공유하는 장치가 아니라 state 관리 로직을 공유하는 함수입니다.

다음은 Hook으로 둡니다.

- `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef` 조합
- router/navigation side effect
- React Hook Form orchestration
- Zustand, TanStack Query 등 라이브러리 공식 hook 조합
- bottom sheet open/close, toast lifecycle, keyboard scroll 같은 screen interaction

다음은 일반 함수로 둡니다.

- 단순 boolean validation 계산
- form 값 → draft/ViewModel 변환
- tag 추천 필터링
- 날짜/시간 라벨 계산
- list/search filtering/sorting
- DTO/ViewModel mapping

React state/effect가 필요 없는 순수 로직은 `domains/<domain>`의 일반 함수로 둡니다.

## 상태 분리

- 서로 동시에 열릴 수 없는 UI 상태는 여러 boolean 대신 union으로 둡니다.
- props/state를 읽지 않는 순수 함수는 hook 안에 두지 말고 domain 파일로 분리합니다.
- React Query/Zustand를 조합하는 hook은 screen hook으로 둡니다.
- 앱 전역 session facade처럼 여러 도메인에서 쓰는 hook은 `src/hooks`에 둘 수 있으나, 내부 구현은 `domains`를 참조합니다.

## screen hook 분해

screen 전용 hook은 `src/screens/<domain-or-area>/<screen-name>/hooks`에 둡니다. 앱 전역에서 재사용되는 hook만 `src/hooks`에 둡니다. 서버 상태 query/mutation hook은 `src/domains/<domain>/api`에 둡니다.

Hook 하나는 하나의 screen concern만 담당합니다.

좋은 concern 예:

- form state orchestration
- draft sync
- validation derivation
- tag suggestion / tag selection
- sheet open/close orchestration
- submit/delete/navigation actions
- search query state
- detail screen interaction
- toast lifecycle
- keyboard scroll / focused field scroll

나쁜 예:

- form, validation, draft sync, tags, submit, scroll, toast를 한 hook에 모두 넣기
- 화면 전체의 모든 이벤트 핸들러를 한 hook에 몰아넣기
- 순수 계산 로직과 React state/effect를 섞기

줄 수는 기계적으로만 판단하지 않고 책임과 함께 봅니다.

| 기준 | 판단 |
|------|------|
| 150줄 이하 | 대체로 허용 |
| 150~250줄 | 책임이 2개 이상 섞였는지 검토 |
| 250줄 초과 | 분해를 우선 검토 |
| 350줄 초과 | 특별한 이유가 없으면 분해 |

반환 객체 key가 15개를 넘거나, form 값/validation/sheet state/submit handler/scroll handler/toast handler가 한 반환값에 섞이면 분해를 검토합니다. 반환값은 concern별 객체로 묶을 수 있습니다.

```ts
return {
  form,
  validation,
  sheets,
  actions,
};
```

큰 orchestrator hook이 작은 hook을 조합하는 것은 허용합니다. 단, orchestrator hook은 조합 역할에 집중하고 세부 상태 전환 로직은 concern별 hook이나 domain 함수로 내립니다.

screen hook은 UI 컴포넌트를 import하지 않습니다. 컴포넌트 props 조립은 가능하지만 JSX나 컴포넌트를 반환하지 않습니다.

## 외부 구독

React 바깥의 외부 store 또는 외부 시스템을 구독하는 hook은 단순 `useEffect + useState`로 시작하기 전에 `useSyncExternalStore` 또는 해당 라이브러리의 공식 hook을 우선 검토합니다.

적용 후보:

- network online/offline 상태
- app visibility / app state
- WebSocket 연결 상태
- 외부 store 구독
- 현재 snapshot과 subscribe가 모두 필요한 브라우저/native global subscription

적용하지 않는 대상:

- screen-local UI state
- form state
- bottom sheet open/close
- toast visibility
- React Hook Form, Zustand, TanStack Query처럼 전용 hook이 있는 라이브러리 상태

외부 상태 hook은 현재 snapshot을 읽는 함수와 변경을 구독하는 함수를 분리하고, 서버 렌더링 또는 초기 렌더링에서 잘못된 기본값을 가정하지 않습니다.

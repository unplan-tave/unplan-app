# Hooks 컨벤션

[← 컨벤션](./README.md)

## 위치

| 위치 | 용도 |
|------|------|
| `src/hooks` | 앱 전역 hook |
| `src/screens/<domain>/hooks` | 특정 화면군에 종속된 page-data/sheet/form 조합 hook |
| `src/domains/<domain>` | React에 의존하지 않는 순수 로직. hook을 두지 않습니다. |

## 이름

- 파일명은 `use-*.ts` 또는 `use-*.tsx`를 사용합니다.
- 함수명은 `useXxx`를 사용합니다.
- 반환값은 호출부 가독성을 위해 객체를 우선합니다.

```ts
export function useCardSheets() {
  return {
    activeSheet,
    openDateTime,
    closeAll,
  };
}
```

## 상태 분리

- 서로 동시에 열릴 수 없는 UI 상태는 여러 boolean 대신 union으로 둡니다.
- props/state를 읽지 않는 순수 함수는 hook 안에 두지 말고 domain 파일로 분리합니다.
- React Query/Zustand를 조합하는 hook은 screen hook으로 둡니다.

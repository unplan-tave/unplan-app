# 컴포넌트 컨벤션

[← 컨벤션](./README.md) · [코어 컨벤션](./core.md)

## 작성 순서

```tsx
interface ExampleProps {
  title: string;
  onPress: () => void;
}

export function Example({ title, onPress }: ExampleProps) {
  return null;
}
```

- props interface를 컴포넌트 바로 위에 둡니다.
- 컴포넌트는 function declaration을 우선합니다.
- 한 파일에 public component는 하나만 두는 것을 기본값으로 합니다.
- 파일 안에서만 쓰는 작은 보조 컴포넌트는 같은 파일 하단에 둘 수 있습니다.

## Primitive 우선

새 UI를 만들 때 기존 primitive를 먼저 확인합니다.

- 카드형 UI: `Card`
- 하단 주요 액션: `BottomCTA`
- 공통 화면 골격: `ScreenLayout`
- 진행 헤더: `HeaderProgress`
- 선택 UI: `Chip`, `ChipGroup`
- modal/sheet: `Modal`, `BottomSheet`

primitive가 요구사항을 충족하지 못하면 feature 컴포넌트에서 새로 중복 구현하지 말고 primitive에 `variant`를 추가합니다. 기본값은 기존 동작을 유지해야 합니다.

## Props 규칙

- callback props는 `on` 접두사를 사용합니다.
- optional 배열/객체 props에는 기본값을 둡니다.
- domain type이 필요한 컴포넌트는 `domains/<domain>`의 ViewModel을 받습니다.
- 서버 DTO를 props로 직접 넘기지 않습니다.

## 분리 기준

다음 중 둘 이상에 해당하면 분리를 검토합니다.

- 파일이 200줄을 넘습니다.
- 상태가 5개 이상입니다.
- 상호배타적인 boolean 상태가 여러 개 있습니다.
- JSX 구역이 header/body/footer/sheet/modal처럼 명확히 나뉩니다.
- 순수 계산 로직이 JSX와 섞여 있습니다.

분리 위치는 [component-decomposition.md](../frontend/component-decomposition.md)를 따릅니다.

## 죽은 코드

- 빈 style 객체를 남기지 않습니다.
- 미사용 prop을 남기지 않습니다.
- 주석 처리된 JSX/로직을 남기지 않습니다.
- 임시 TODO는 후속 PR에서 실제로 추적할 수 있는 문서나 이슈로 연결합니다.

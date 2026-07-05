# 스타일링 컨벤션

[← 컨벤션](./README.md) · [코어 컨벤션](./core.md)

## 디자인 토큰

색상, radius, spacing, typography는 constants token을 우선합니다.

```ts
import { colors, radius, spacing } from '@/constants';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing[4],
  },
});
```

- `'#EAF4FF'`, `'rgba(...)'`, `borderRadius: 13` 같은 리터럴을 직접 쓰지 않습니다.
- 토큰이 없으면 `constants`에 먼저 추가합니다.
- StyleSheet 밖의 동적 계산값만 인라인을 허용합니다.

## 반응형 폭

```ts
const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 390,
    alignSelf: 'center',
  },
});
```

- 고정 폭만 쓰지 않습니다.
- `width: '100%'`와 `maxWidth`를 함께 사용해 좁은 기기에서 잘리지 않게 합니다.
- 고정 포맷 UI는 `aspectRatio`, `minWidth`, `maxWidth` 등으로 레이아웃 흔들림을 막습니다.

## StyleSheet

- 스타일은 `StyleSheet.create`를 기본으로 합니다.
- 스타일 이름은 역할 기준으로 짓습니다. `blueBox`보다 `submitButton`이 낫습니다.
- 조건부 스타일은 배열 문법을 사용합니다.

```tsx
<View style={[styles.card, isSelected && styles.selectedCard]} />
```

## 접근 가능한 터치 영역

- 터치 가능한 요소는 최소 44x44pt를 확보합니다.
- 아이콘 버튼에는 `accessibilityLabel`과 `accessibilityRole="button"`을 제공합니다.

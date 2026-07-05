# 디자인 토큰

[← 문서 목록](../README.md) · [스타일링 컨벤션](../conventions/styling.md)

## 원칙

- 색상, radius, spacing, typography는 token을 우선합니다.
- token이 없으면 리터럴을 복제하지 말고 `src/constants`에 먼저 추가합니다.
- screen/feature별 임시 리터럴은 후속 정리 비용이 커지므로 피합니다.

## 금지 예시

```ts
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAF4FF',
    borderRadius: 13,
    padding: 18,
  },
});
```

## 권장 예시

```ts
import { colors, radius, spacing } from '@/constants';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: radius.lg,
    padding: spacing[16],
  },
});
```

## PR 체크

- 새 색상/spacing/radius가 token으로 표현되는가
- primitive base style을 직접 바꾸지 않고 `variant`로 확장했는가
- 좁은 기기에서 고정 폭 때문에 잘리지 않는가

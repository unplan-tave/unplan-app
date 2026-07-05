# 접근성

[← 문서 목록](../README.md)

## 터치 요소

모든 터치 가능 요소에는 접근성 정보를 제공합니다.

```tsx
<Pressable
  accessibilityLabel="일정 삭제"
  accessibilityRole="button"
  accessibilityHint="이 일정을 삭제합니다"
  onPress={handleDelete}
>
  <Icon name="trash" />
</Pressable>
```

## Role

| 컴포넌트 | role |
|----------|------|
| 버튼, Pressable | `button` |
| 링크 | `link` |
| 체크박스 | `checkbox` |
| 탭 | `tab` |
| 헤더 | `header` |
| 이미지 | `image` |

장식용 이미지는 screen reader에 노출하지 않습니다.

## 터치 영역

iOS 기준 최소 44x44pt를 확보합니다.

```ts
const styles = StyleSheet.create({
  touchTarget: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## 동적 상태

로딩, 성공, 오류처럼 화면 상태가 바뀌면 필요한 경우 `accessibilityLiveRegion`으로 알립니다.

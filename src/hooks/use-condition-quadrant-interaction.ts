import { useCallback, useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';

import { toConditionQuadrantValue } from '@/domains/condition/quadrant';

export function useConditionQuadrantInteraction(onSelect?: (x: number, y: number) => void) {
  const [size, setSize] = useState(0);
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setSize(event.nativeEvent.layout.width),
    [],
  );
  const onPress = useCallback(
    (event: GestureResponderEvent) => {
      if (onSelect == null || size === 0) return;

      const { locationX, locationY } = event.nativeEvent;
      onSelect(
        toConditionQuadrantValue(locationX, size),
        -toConditionQuadrantValue(locationY, size),
      );
    },
    [onSelect, size],
  );

  return { onLayout, onPress };
}

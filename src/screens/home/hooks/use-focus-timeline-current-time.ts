import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, type ScrollView } from 'react-native';

interface TimelineMarkerLayout {
  height: number;
  y: number;
}

interface TimelineMarkerPosition {
  startCardId: string;
  endCardId: string;
  offsetRatio: number;
}

/** 현재 시각이 타임라인 콘텐츠 안에서 차지하는 세로 위치를 계산합니다. */
export function useFocusTimelineCurrentTime(
  markerPosition: TimelineMarkerPosition | null,
  focusOffset: number,
) {
  const scrollRef = useRef<ScrollView>(null);
  const [cardLayouts, setCardLayouts] = useState<Record<string, TimelineMarkerLayout>>({});
  const [markerTop, setMarkerTop] = useState<number | null>(null);

  const handleCardLayout = useCallback((cardId: string, event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;

    setCardLayouts((previous) => {
      const current = previous[cardId];
      if (current?.height === height && current.y === y) return previous;

      return { ...previous, [cardId]: { height, y } };
    });
  }, []);

  useEffect(() => {
    if (markerPosition == null) {
      setMarkerTop(null);
      return;
    }

    const startLayout = cardLayouts[markerPosition.startCardId];
    const endLayout = cardLayouts[markerPosition.endCardId];
    if (startLayout == null || endLayout == null) {
      setMarkerTop(null);
      return;
    }

    const startY = startLayout.y + (startLayout === endLayout ? 0 : startLayout.height);
    const endY = endLayout.y + (startLayout === endLayout ? endLayout.height : 0);

    setMarkerTop(startY + (endY - startY) * markerPosition.offsetRatio);
  }, [cardLayouts, markerPosition]);

  useEffect(() => {
    if (markerTop == null) return;

    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(markerTop - focusOffset, 0),
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [focusOffset, markerTop]);

  return { handleCardLayout, markerTop, scrollRef };
}

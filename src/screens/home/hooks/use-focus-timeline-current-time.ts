import { useCallback, useEffect, useState } from 'react';
import { type LayoutChangeEvent } from 'react-native';

interface TimelineMarkerLayout {
  height: number;
  y: number;
}

/** 현재 시각이 타임라인 콘텐츠 안에서 차지하는 세로 위치를 계산합니다. */
export function useFocusTimelineCurrentTime(enabled: boolean, markerOffsetRatio: number | null) {
  const [markerLayout, setMarkerLayout] = useState<TimelineMarkerLayout | null>(null);
  const [markerTop, setMarkerTop] = useState<number | null>(null);

  const handleMarkerLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;

    setMarkerLayout({ height, y });
  }, []);

  useEffect(() => {
    if (!enabled || markerLayout == null || markerOffsetRatio == null) {
      setMarkerTop(null);
      return;
    }

    setMarkerTop(markerLayout.y + markerLayout.height * markerOffsetRatio);
  }, [enabled, markerLayout, markerOffsetRatio]);

  return { handleMarkerLayout, markerTop };
}

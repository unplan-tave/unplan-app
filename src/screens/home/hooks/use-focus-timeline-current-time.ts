import { useCallback, useEffect, useRef, useState } from 'react';
import { type LayoutChangeEvent, type ScrollView } from 'react-native';

interface TimelineMarkerLayout {
  height: number;
  y: number;
}

/** 현재 시간 마커가 타임라인 중앙에 보이도록 스크롤 위치를 맞춥니다. */
export function useFocusTimelineCurrentTime(enabled: boolean) {
  const timelineRef = useRef<ScrollView>(null);
  const [markerLayout, setMarkerLayout] = useState<TimelineMarkerLayout | null>(null);
  const [timelineHeight, setTimelineHeight] = useState(0);

  const handleTimelineLayout = useCallback((event: LayoutChangeEvent) => {
    setTimelineHeight(event.nativeEvent.layout.height);
  }, []);
  const handleMarkerLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, y } = event.nativeEvent.layout;

    setMarkerLayout({ height, y });
  }, []);

  useEffect(() => {
    if (!enabled || markerLayout == null || timelineHeight === 0) return;

    const markerCenter = markerLayout.y + markerLayout.height;
    const offset = Math.max(0, markerCenter - timelineHeight / 2);

    timelineRef.current?.scrollTo({ y: offset, animated: false });
  }, [enabled, markerLayout, timelineHeight]);

  return { handleMarkerLayout, handleTimelineLayout, timelineRef };
}

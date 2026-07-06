import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, Platform, type ScrollView } from 'react-native';

export function useCardCreateScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const isMemoFocusedRef = useRef(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const sub = Keyboard.addListener(showEvent, (e) => {
      if (!isMemoFocusedRef.current) return;
      const delay = Platform.OS === 'ios' ? (e.duration ?? 250) : 100;
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), delay);
    });

    return () => sub.remove();
  }, []);

  const scrollMemoIntoView = useCallback(() => {
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scroll);
    setTimeout(scroll, 100);
  }, []);

  const handleMemoFocus = useCallback(() => {
    isMemoFocusedRef.current = true;
    scrollMemoIntoView();
  }, [scrollMemoIntoView]);

  const handleMemoBlur = useCallback(() => {
    isMemoFocusedRef.current = false;
  }, []);

  return {
    scrollRef,
    handleMemoFocus,
    handleMemoBlur,
  };
}

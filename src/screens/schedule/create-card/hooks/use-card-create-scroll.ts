import { useCallback, useEffect, useRef } from 'react';
import { Keyboard, Platform, type ScrollView } from 'react-native';

export function useCardCreateScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const isMemoFocusedRef = useRef(false);
  const keyboardScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const memoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';

    const sub = Keyboard.addListener(showEvent, (e) => {
      if (!isMemoFocusedRef.current) return;
      const delay = Platform.OS === 'ios' ? (e.duration ?? 250) : 100;
      if (keyboardScrollTimeoutRef.current != null) {
        clearTimeout(keyboardScrollTimeoutRef.current);
      }
      keyboardScrollTimeoutRef.current = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
        keyboardScrollTimeoutRef.current = null;
      }, delay);
    });

    return () => {
      sub.remove();
      if (keyboardScrollTimeoutRef.current != null) {
        clearTimeout(keyboardScrollTimeoutRef.current);
      }
      if (memoScrollTimeoutRef.current != null) {
        clearTimeout(memoScrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollMemoIntoView = useCallback(() => {
    const scroll = () => scrollRef.current?.scrollToEnd({ animated: true });
    requestAnimationFrame(scroll);
    if (memoScrollTimeoutRef.current != null) {
      clearTimeout(memoScrollTimeoutRef.current);
    }
    memoScrollTimeoutRef.current = setTimeout(() => {
      scroll();
      memoScrollTimeoutRef.current = null;
    }, 100);
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

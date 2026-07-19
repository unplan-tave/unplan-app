import { useCallback, useEffect, useState } from 'react';

export type CardCreateToast = {
  message: string;
  variant: 'warning' | 'confirm';
} | null;

/** 카드 생성 화면의 toast 피드백 상태를 관리합니다. */
export function useCardCreateFeedback() {
  const [toast, setToast] = useState<CardCreateToast>(null);

  useEffect(() => {
    if (toast == null) {
      return;
    }

    const timeoutId = setTimeout(() => setToast(null), 3_000);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  const showToast = useCallback((nextToast: Exclude<CardCreateToast, null>) => {
    setToast(nextToast);
  }, []);
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
}

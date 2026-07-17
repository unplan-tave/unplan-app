/** 스플래시 노출 시간을 관리합니다. */
import { useEffect } from 'react';

/** 전달받은 완료 callback을 일정 시간 후 한 번 실행합니다. */
export function useSplashScreen(onFinish: (() => void) | undefined) {
  useEffect(() => {
    if (!onFinish) return undefined;

    const timer = setTimeout(onFinish, 900);

    return () => clearTimeout(timer);
  }, [onFinish]);
}

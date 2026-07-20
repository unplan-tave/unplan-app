import { useEffect, useState } from 'react';

/** 현재 시각을 분 단위로 갱신합니다. 시간 경계에 의존하는 화면 표시용입니다. */
export function useCurrentTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60_000);

    return () => clearInterval(intervalId);
  }, []);

  return now;
}

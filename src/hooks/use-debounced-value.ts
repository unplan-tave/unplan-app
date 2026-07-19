import { useEffect, useState } from 'react';

/** 값이 delayMs 동안 안정되면 반영합니다. 빠른 입력에서 파생 호출을 줄일 때 사용합니다. */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

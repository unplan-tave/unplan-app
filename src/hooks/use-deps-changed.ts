import { useState } from 'react';

/**
 * deps가 직전 렌더와 달라졌으면(첫 렌더 포함) true를 반환합니다.
 * props가 바뀔 때 로컬 state를 맞추는 일을 effect 대신 렌더 중에 처리할 때 씁니다.
 * deps 비교는 useEffect와 같은 Object.is 기준입니다.
 *
 * @example
 * const shouldReset = useDepsChanged([visible, value]);
 * if (shouldReset && visible) setDraft(value);
 */
export function useDepsChanged(deps: readonly unknown[]): boolean {
  const [prevDeps, setPrevDeps] = useState<readonly unknown[] | null>(null);
  const changed =
    prevDeps == null ||
    prevDeps.length !== deps.length ||
    deps.some((dep, index) => !Object.is(dep, prevDeps[index]));

  if (changed) {
    setPrevDeps(deps);
  }

  return changed;
}

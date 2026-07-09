const MINUTES_PER_DAY = 24 * 60;

/** "HH:MM" 문자열을 자정 기준 분으로 변환합니다. 형식이 잘못되면 null. */
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (match == null) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/** 자정 기준 분을 "HH:MM"으로 변환합니다. (24:00 이상은 다음 날로 넘어가지 않고 클램프) */
export function formatMinutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(totalMinutes, MINUTES_PER_DAY - 1));
  const hours = Math.floor(clamped / 60);
  const minutes = clamped % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** "HH:MM"에 분을 더한 "HH:MM"을 돌려줍니다. 파싱 실패 시 원본 반환. */
export function addMinutesToTime(time: string, minutes: number): string {
  const base = parseTimeToMinutes(time);
  if (base == null) {
    return time;
  }

  return formatMinutesToTime(base + minutes);
}

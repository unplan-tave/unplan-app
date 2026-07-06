import type { TimeRange } from './model';

const HOURS_PER_DAY = 24;

function normalizeHour(hour: number): number {
  return ((hour % HOURS_PER_DAY) + HOURS_PER_DAY) % HOURS_PER_DAY;
}

export function getSelectedActivityHours(ranges: TimeRange[]): Set<number> {
  const selectedHours = new Set<number>();

  ranges.forEach((range) => {
    const startHour = normalizeHour(range.startHour);
    const endHour = normalizeHour(range.endHour);
    let hour = startHour;

    selectedHours.add(hour);

    while ((hour + 1) % HOURS_PER_DAY !== endHour) {
      hour = (hour + 1) % HOURS_PER_DAY;
      selectedHours.add(hour);

      if (hour === startHour) {
        break;
      }
    }
  });

  return selectedHours;
}

function toSingleHourRanges(selectedHours: Set<number>): TimeRange[] {
  return [...selectedHours]
    .sort((first, second) => first - second)
    .map((hour) => ({
      startHour: hour,
      endHour: (hour + 1) % HOURS_PER_DAY,
    }));
}

export function toActivityTimeline(ranges: TimeRange[]): string {
  const selectedHours = getSelectedActivityHours(ranges);

  return Array.from({ length: HOURS_PER_DAY }, (_, hour) =>
    selectedHours.has(hour) ? '1' : '0',
  ).join('');
}

export function parseActivityTimeline(timeline: string | undefined): TimeRange[] {
  if (!timeline) {
    return [];
  }

  const selectedHours = new Set<number>();

  for (let hour = 0; hour < HOURS_PER_DAY; hour += 1) {
    if (timeline[hour] === '1') {
      selectedHours.add(hour);
    }
  }

  return toSingleHourRanges(selectedHours);
}

/**
 * 표시용 연속 구간 병합. 자정을 넘는 구간(예: 23시~7시)은 하나의 구간으로 합칩니다.
 */
export function toContiguousActivityRanges(ranges: TimeRange[]): TimeRange[] {
  const selectedHours = getSelectedActivityHours(ranges);

  if (selectedHours.size === 0) {
    return [];
  }

  if (selectedHours.size === HOURS_PER_DAY) {
    return [{ startHour: 0, endHour: 0 }];
  }

  const contiguousRanges: TimeRange[] = [];
  const sortedHours = [...selectedHours].sort((first, second) => first - second);
  let rangeStart = sortedHours[0];
  let previousHour = sortedHours[0];

  for (const hour of sortedHours.slice(1)) {
    if (hour !== previousHour + 1) {
      contiguousRanges.push({ startHour: rangeStart, endHour: (previousHour + 1) % HOURS_PER_DAY });
      rangeStart = hour;
    }

    previousHour = hour;
  }

  contiguousRanges.push({ startHour: rangeStart, endHour: (previousHour + 1) % HOURS_PER_DAY });

  // 자정을 걸치는 경우(0시에 시작하는 구간 + 24시에 끝나는 구간) 하나로 병합합니다.
  const firstRange = contiguousRanges[0];
  const lastRange = contiguousRanges[contiguousRanges.length - 1];

  if (contiguousRanges.length > 1 && firstRange.startHour === 0 && lastRange.endHour === 0) {
    contiguousRanges[0] = { startHour: lastRange.startHour, endHour: firstRange.endHour };
    contiguousRanges.pop();
  }

  return contiguousRanges;
}

/** 시간 구간 → "09시 00분 ~ 11시 00분" */
export function formatActivityRangeLabel(range: TimeRange): string {
  const toHourLabel = (hour: number) => `${String(normalizeHour(hour)).padStart(2, '0')}시 00분`;

  return `${toHourLabel(range.startHour)} ~ ${toHourLabel(range.endHour)}`;
}

export function toggleActivityHourRange(ranges: TimeRange[], hour: number): TimeRange[] {
  const normalizedHour = normalizeHour(hour);
  const selectedHours = getSelectedActivityHours(ranges);

  if (selectedHours.has(normalizedHour)) {
    selectedHours.delete(normalizedHour);
  } else {
    selectedHours.add(normalizedHour);
  }

  return toSingleHourRanges(selectedHours);
}

export function toggleContinuousSleepRange(ranges: TimeRange[], hour: number): TimeRange[] {
  const normalizedHour = normalizeHour(hour);
  const selectedHours = getSelectedActivityHours(ranges);

  if (selectedHours.size === 0) {
    return toSingleHourRanges(new Set([normalizedHour]));
  }

  const previousHour = (normalizedHour - 1 + HOURS_PER_DAY) % HOURS_PER_DAY;
  const nextHour = (normalizedHour + 1) % HOURS_PER_DAY;
  const hasPreviousHour = selectedHours.has(previousHour);
  const hasNextHour = selectedHours.has(nextHour);

  if (selectedHours.has(normalizedHour)) {
    if (
      selectedHours.size === 1 ||
      selectedHours.size === HOURS_PER_DAY ||
      !hasPreviousHour ||
      !hasNextHour
    ) {
      selectedHours.delete(normalizedHour);
    }

    return toSingleHourRanges(selectedHours);
  }

  if (hasPreviousHour || hasNextHour) {
    selectedHours.add(normalizedHour);
    return toSingleHourRanges(selectedHours);
  }

  return toSingleHourRanges(new Set([normalizedHour]));
}

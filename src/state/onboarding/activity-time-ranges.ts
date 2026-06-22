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
    if (selectedHours.size === 1 || !hasPreviousHour || !hasNextHour) {
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

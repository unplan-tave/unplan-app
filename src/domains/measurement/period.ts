const WEEK_LENGTH = 7;

export function getMeasurementWeekRange(date: Date) {
  const weekStart = getWeekStart(date);
  const weekEnd = addDays(weekStart, WEEK_LENGTH - 1);

  return {
    from: formatDateValue(weekStart),
    to: formatDateValue(weekEnd),
  };
}

export function getMeasurementMonthRange(date: Date) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    from: formatDateValue(monthStart),
    to: formatDateValue(monthEnd),
  };
}

export function isMeasurementRangeCurrent(from: string, to: string, today = new Date()) {
  const todayValue = formatDateValue(today);

  return todayValue >= from && todayValue <= to;
}

function getWeekStart(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());

  return start;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);

  return next;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

import { getScheduleDate } from './model';

describe('getScheduleDate', () => {
  it('returns dateStart for single mode', () => {
    expect(getScheduleDate('single', '2026.07.04')).toBe('2026.07.04');
  });

  it('returns dateStart for range mode', () => {
    expect(getScheduleDate('range', '2026.07.01')).toBe('2026.07.01');
  });

  it('returns today for empty mode', () => {
    const result = getScheduleDate('empty', '');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    expect(result).toBe(`${year}.${month}.${day}`);
  });
});

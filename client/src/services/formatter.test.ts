import dayjs from 'dayjs';
import {
  formatDate,
  formatShortDate,
  relativeDays,
  formatDateTime,
  formatTimezoneToUTC,
  formatTime,
  formatDateFriendly,
  formatMonth,
  formatMonthFriendly,
} from './formatter';

// Tests run with TZ=UTC (set in vitest config env), so format output is deterministic.

describe('formatter', () => {
  describe('formatDate', () => {
    it('formats an ISO date as YYYY-MM-DD', () => {
      expect(formatDate('2023-03-09T15:04:05Z')).toBe('2023-03-09');
    });
  });

  describe('formatShortDate', () => {
    it('formats as "MMM DD"', () => {
      expect(formatShortDate('2023-03-09T00:00:00Z')).toBe('Mar 09');
    });
  });

  describe('relativeDays', () => {
    beforeAll(() => vi.useFakeTimers().setSystemTime(new Date('2023-01-10T00:00:00Z')));
    afterAll(() => vi.useRealTimers());

    it('returns the number of days between now and a past date', () => {
      expect(relativeDays('2023-01-01T00:00:00Z')).toBe(9);
    });

    it('returns 0 for the same day', () => {
      expect(relativeDays('2023-01-10T00:00:00Z')).toBe(0);
    });

    it('returns a negative number for a future date', () => {
      expect(relativeDays('2023-01-12T00:00:00Z')).toBe(-2);
    });
  });

  describe('formatDateTime', () => {
    it('formats a string input as "YYYY-MM-DD HH:mm"', () => {
      expect(formatDateTime('2023-03-09T15:04:05Z')).toBe('2023-03-09 15:04');
    });

    it('formats a numeric (epoch ms) input', () => {
      const epoch = Date.UTC(2023, 2, 9, 15, 4, 0);
      expect(formatDateTime(epoch)).toBe('2023-03-09 15:04');
    });
  });

  describe('formatTimezoneToUTC', () => {
    it('keeps the local clock time and reinterprets it as UTC by default', () => {
      const result = formatTimezoneToUTC('2023-03-09T10:00:00');
      expect(result).toBe(dayjs('2023-03-09T10:00:00').tz('UTC', true).utc().format());
    });

    it('shifts wall-clock time from the given zone to UTC', () => {
      const result = formatTimezoneToUTC('2023-03-09T10:00:00', 'Europe/Warsaw');
      // 10:00 in Warsaw (UTC+1 in winter) => 09:00 UTC
      expect(result).toBe('2023-03-09T09:00:00Z');
    });
  });

  describe('formatTime', () => {
    it('formats time as "HH:mm:ssZ"', () => {
      expect(formatTime('2023-03-09T15:04:05Z')).toBe('15:04:05+00:00');
    });
  });

  describe('formatDateFriendly', () => {
    it('formats as "DD MMM YYYY"', () => {
      expect(formatDateFriendly('2023-03-09T00:00:00Z')).toBe('09 Mar 2023');
    });
  });

  describe('formatMonth', () => {
    it('formats as "YYYY-MM"', () => {
      expect(formatMonth('2023-03-09T00:00:00Z')).toBe('2023-03');
    });
  });

  describe('formatMonthFriendly', () => {
    it('formats as "MMM YYYY"', () => {
      expect(formatMonthFriendly('2023-03-09T00:00:00Z')).toBe('Mar 2023');
    });
  });
});

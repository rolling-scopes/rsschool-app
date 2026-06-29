import { describe, it, expect, vi, afterEach } from 'vitest';
import { buildICalendarLink, buildExportLink, setExportLink } from './helpers';

describe('AdditionalActions helpers', () => {
  describe('buildICalendarLink', () => {
    it('encodes the timezone into the iCalendar url', () => {
      expect(buildICalendarLink(7, 'tok', 'Europe/Warsaw')).toBe(
        '/api/v2/courses/7/icalendar/tok?timezone=Europe%2FWarsaw',
      );
    });

    it('falls back to an empty timezone when none is provided', () => {
      // `timezone || ''` → empty string when timezone is falsy.
      expect(buildICalendarLink(7, 'tok', '')).toBe('/api/v2/courses/7/icalendar/tok?timezone=');
    });
  });

  describe('buildExportLink', () => {
    it('builds the CSV export url with a slash-safe timezone', () => {
      expect(buildExportLink(3, 'Europe/Warsaw')).toBe('/api/v2/courses/3/schedule/csv/Europe_Warsaw');
    });
  });

  describe('setExportLink', () => {
    const originalLocation = window.location;

    afterEach(() => {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    });

    it('navigates the window to the given link', () => {
      // jsdom does not implement navigation, so observe the href assignment via a stub.
      const hrefSetter = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: {
          set href(v: string) {
            hrefSetter(v);
          },
        },
      });

      setExportLink('/api/v2/courses/1/schedule/csv/UTC');

      expect(hrefSetter).toHaveBeenCalledWith('/api/v2/courses/1/schedule/csv/UTC');
    });
  });
});

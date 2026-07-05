import { optionalQueryString } from './optionalQueryString';

describe('optionalQueryString', () => {
  it('returns undefined for undefined input', () => {
    expect(optionalQueryString(undefined)).toBeUndefined();
  });

  describe('string input', () => {
    it('trims a string value', () => {
      expect(optionalQueryString('  hello  ')).toBe('hello');
    });

    it('returns an empty string for a whitespace-only value', () => {
      expect(optionalQueryString('   ')).toBe('');
    });

    it('returns an empty string for an empty string', () => {
      expect(optionalQueryString('')).toBe('');
    });
  });

  describe('array input', () => {
    it('trims each element and joins with commas', () => {
      expect(optionalQueryString([' a ', 'b ', ' c'])).toBe('a,b,c');
    });

    it('returns undefined when the single element trims to empty', () => {
      expect(optionalQueryString(['   '])).toBeUndefined();
    });

    it('returns undefined for an empty array', () => {
      expect(optionalQueryString([])).toBeUndefined();
    });

    it('joins empty elements with commas when more than one is present', () => {
      // each '' trims to '' but join inserts a comma, so the result is non-empty
      expect(optionalQueryString(['', '   '])).toBe(',');
    });

    it('keeps empty positions when at least one element has content', () => {
      expect(optionalQueryString(['a', '', 'b'])).toBe('a,,b');
    });
  });
});

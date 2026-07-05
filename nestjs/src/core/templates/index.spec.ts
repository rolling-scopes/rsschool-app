import handlebars from 'handlebars';
// Importing the module registers the custom helpers on the shared handlebars instance.
import './index';

type HelperFn = (...args: unknown[]) => unknown;

const getHelper = (name: string): HelperFn => handlebars.helpers[name] as unknown as HelperFn;

describe('handlebars template helpers', () => {
  it('registers all expected helpers', () => {
    expect(typeof getHelper('truncate')).toBe('function');
    expect(typeof getHelper('capitalize')).toBe('function');
    expect(typeof getHelper('ifEquals')).toBe('function');
    expect(typeof getHelper('formatDateTime')).toBe('function');
  });

  describe('truncate', () => {
    // The helper reads `options.maxLength` directly (see latent-bug note below),
    // so tests pass the value at the top level of the options object.
    const truncate = (str: string, maxLength?: number) => getHelper('truncate')(str, { maxLength } as never);

    it('truncates and appends ellipsis when longer than maxLength', () => {
      const result = truncate('abcdefghij', 3);

      expect(result).toBe('abc...');
    });

    it('returns the string unchanged when shorter than maxLength', () => {
      const result = truncate('abc', 10);

      expect(result).toBe('abc');
    });

    it('returns the string unchanged when exactly at maxLength', () => {
      const result = truncate('abcde', 5);

      expect(result).toBe('abcde');
    });

    it('falls back to default maxLength of 50 when maxLength is undefined', () => {
      const long = 'x'.repeat(60);

      const result = truncate(long, undefined);

      expect(result).toBe(`${'x'.repeat(50)}...`);
    });

    it('returns short strings unchanged under the default maxLength', () => {
      const result = truncate('short', undefined);

      expect(result).toBe('short');
    });

    it('handles a missing options object via the `options || {}` fallback', () => {
      // Invoked without an options argument: options is undefined.
      const result = (getHelper('truncate') as HelperFn)('x'.repeat(60));

      expect(result).toBe(`${'x'.repeat(50)}...`);
    });

    it('LATENT BUG: ignores the handlebars hash arg and always defaults to 50', () => {
      // In a real template `{{truncate str maxLength=3}}`, handlebars places named
      // args under options.hash. The helper reads options.maxLength (not options.hash),
      // so the configured length is silently ignored and the default 50 is used.
      const result = getHelper('truncate')('y'.repeat(60), { hash: { maxLength: 3 } } as never);

      expect(result).toBe(`${'y'.repeat(50)}...`);
    });
  });

  describe('capitalize', () => {
    const capitalize = (str: string) => getHelper('capitalize')(str);

    it('uppercases the first character', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    it('leaves an already-capitalized string with its first char uppercased', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });

    it('handles a single character', () => {
      expect(capitalize('a')).toBe('A');
    });

    it('returns an empty string for empty input', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('ifEquals', () => {
    it('renders the truthy block when arguments are loosely equal', () => {
      const template = handlebars.compile('{{#ifEquals a b}}YES{{else}}NO{{/ifEquals}}');

      expect(template({ a: 1, b: 1 })).toBe('YES');
    });

    it('uses loose equality (== ) across types', () => {
      const template = handlebars.compile('{{#ifEquals a b}}YES{{else}}NO{{/ifEquals}}');

      // 1 == '1' is true under loose equality.
      expect(template({ a: 1, b: '1' })).toBe('YES');
    });

    it('renders the inverse block when arguments are not equal', () => {
      const template = handlebars.compile('{{#ifEquals a b}}YES{{else}}NO{{/ifEquals}}');

      expect(template({ a: 1, b: 2 })).toBe('NO');
    });
  });

  describe('formatDateTime', () => {
    const formatDateTime = (value: string) => getHelper('formatDateTime')(value);

    it('returns an empty string for falsy input', () => {
      expect(formatDateTime('')).toBe('');
    });

    it('formats an ISO date-time string in UTC', () => {
      expect(formatDateTime('2026-06-26T14:30:00Z')).toBe('2026-06-26 14:30');
    });

    it('formats a midnight UTC value', () => {
      expect(formatDateTime('2026-01-01T00:00:00Z')).toBe('2026-01-01 00:00');
    });
  });
});

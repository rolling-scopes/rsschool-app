import { describe, expect, it } from 'vitest';
import { aggregateResults } from './utils';

describe('aggregateResults', () => {
  it('returns an empty array for empty input', () => {
    expect(aggregateResults([])).toEqual([]);
  });

  it('groups results by status and counts occurrences', () => {
    const result = aggregateResults([
      { status: 'created', value: 1 },
      { status: 'created', value: 2 },
      { status: 'updated', value: 3 },
    ]);

    expect(result).toEqual([
      { status: 'created', count: 2, messages: undefined },
      { status: 'updated', count: 1, messages: undefined },
    ]);
  });

  it('collects messages only for "skipped" entries with string values', () => {
    const result = aggregateResults([
      { status: 'skipped', value: 'alice' },
      { status: 'skipped', value: 'bob' },
      { status: 'created', value: 1 },
    ]);

    const skipped = result.find(r => r.status === 'skipped');
    const created = result.find(r => r.status === 'created');

    expect(skipped).toEqual({ status: 'skipped', count: 2, messages: ['alice', 'bob'] });
    expect(created).toEqual({ status: 'created', count: 1, messages: undefined });
  });

  it('does not collect messages when "skipped" value is not a string', () => {
    const result = aggregateResults([
      { status: 'skipped', value: 42 },
      { status: 'skipped', value: 'charlie' },
    ]);

    expect(result).toEqual([{ status: 'skipped', count: 2, messages: ['charlie'] }]);
  });

  it('handles a mixed batch and preserves first-seen status order', () => {
    const result = aggregateResults([
      { status: 'updated', value: 1 },
      { status: 'created', value: 2 },
      { status: 'skipped', value: 'no-such-user' },
      { status: 'updated', value: 3 },
      { status: 'failed', value: 'boom' },
      { status: 'skipped', value: 'another-user' },
    ]);

    expect(result.map(r => r.status)).toEqual(['updated', 'created', 'skipped', 'failed']);
    expect(result.find(r => r.status === 'updated')?.count).toBe(2);
    expect(result.find(r => r.status === 'skipped')?.messages).toEqual(['no-such-user', 'another-user']);
    expect(result.find(r => r.status === 'failed')?.messages).toBeUndefined();
  });

  it('treats unknown statuses generically without collecting messages', () => {
    const result = aggregateResults([
      { status: 'mystery', value: 'whatever' },
      { status: 'mystery', value: 'else' },
    ]);

    expect(result).toEqual([{ status: 'mystery', count: 2, messages: undefined }]);
  });

  it('does not mutate the input array', () => {
    const input = [
      { status: 'created', value: 1 },
      { status: 'skipped', value: 'x' },
    ];
    const snapshot = JSON.parse(JSON.stringify(input));

    aggregateResults(input);

    expect(input).toEqual(snapshot);
  });
});

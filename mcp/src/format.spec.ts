import { describe, expect, it } from 'vitest';
import { toJsonBlock } from './format.js';

describe('toJsonBlock', () => {
  it('renders pretty JSON when under the limit', () => {
    expect(toJsonBlock({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it('truncates oversized payloads with a hint', () => {
    const big = { data: 'x'.repeat(10_000) };
    const text = toJsonBlock(big, 100);
    expect(text.length).toBeLessThan(300);
    expect(text).toContain('truncated');
  });

  it('handles undefined as null', () => {
    expect(toJsonBlock(undefined)).toBe('null');
  });
});

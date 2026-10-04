import { describe, it, expect } from 'vitest';
import { getCriteriaStatusColor } from './getCriteriaStatusColor';

describe('getCriteriaStatusColor', () => {
  it('returns the transparent background when maxScore is missing or zero', () => {
    expect(getCriteriaStatusColor(5)).toBe('colorBgContainer');
    expect(getCriteriaStatusColor(5, 0)).toBe('colorBgContainer');
  });

  it('returns red when the score is zero', () => {
    expect(getCriteriaStatusColor(0, 10)).toBe('red3');
  });

  it('returns yellow when the score is below the maximum', () => {
    expect(getCriteriaStatusColor(4, 10)).toBe('yellow3');
  });

  it('returns green when the score equals the maximum', () => {
    expect(getCriteriaStatusColor(10, 10)).toBe('green3');
  });

  it('returns the transparent background when the score exceeds the maximum', () => {
    // score > maxScore falls through every branch to the final transparent return.
    expect(getCriteriaStatusColor(12, 10)).toBe('colorBgContainer');
  });
});

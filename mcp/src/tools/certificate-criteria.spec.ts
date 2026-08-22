import { describe, expect, it } from 'vitest';
import { certificateCriteriaSchema } from './certificate-criteria.js';

describe('certificateCriteriaSchema', () => {
  it('accepts minTotalScore alone', () => {
    expect(certificateCriteriaSchema.safeParse({ minTotalScore: 100 }).success).toBe(true);
  });

  it('accepts courseTaskIds with minScore', () => {
    expect(certificateCriteriaSchema.safeParse({ minTotalScore: 100, courseTaskIds: [1], minScore: 50 }).success).toBe(
      true,
    );
  });

  it('rejects non-empty courseTaskIds without minScore', () => {
    const result = certificateCriteriaSchema.safeParse({ minTotalScore: 100, courseTaskIds: [1] });
    expect(result.success).toBe(false);
  });

  it('accepts empty courseTaskIds without minScore', () => {
    expect(certificateCriteriaSchema.safeParse({ minTotalScore: 100, courseTaskIds: [] }).success).toBe(true);
  });

  it('accepts per-task thresholds', () => {
    const result = certificateCriteriaSchema.safeParse({
      minTotalScore: 100,
      taskCriteria: [
        { courseTaskId: 1, minScore: 50 },
        { courseTaskId: 2, minScore: 80 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('does not require the flat minScore when taskCriteria carries the thresholds', () => {
    const result = certificateCriteriaSchema.safeParse({
      minTotalScore: 100,
      taskCriteria: [{ courseTaskId: 1, minScore: 50 }],
      courseTaskIds: [1],
    });
    expect(result.success).toBe(true);
  });

  it('rejects a taskCriteria entry missing its minScore', () => {
    const result = certificateCriteriaSchema.safeParse({ minTotalScore: 100, taskCriteria: [{ courseTaskId: 1 }] });
    expect(result.success).toBe(false);
  });

  it('rejects an empty taskCriteria array', () => {
    expect(certificateCriteriaSchema.safeParse({ minTotalScore: 100, taskCriteria: [] }).success).toBe(false);
  });
});

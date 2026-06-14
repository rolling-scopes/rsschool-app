import { describe, it, expect } from 'vitest';
import { QueryFailedError } from 'typeorm';
import { isUniqueViolation } from '../../utils';

describe('isUniqueViolation', () => {
  it('returns true for postgres unique_violation (23505)', () => {
    const err = new QueryFailedError('insert', [], { code: '23505' } as unknown as Error);
    expect(isUniqueViolation(err)).toBe(true);
  });

  it('returns false for a different postgres error (23502 not_null_violation)', () => {
    const err = new QueryFailedError('insert', [], { code: '23502' } as unknown as Error);
    expect(isUniqueViolation(err)).toBe(false);
  });

  it('returns false when driverError has no code', () => {
    const err = new QueryFailedError('insert', [], {} as Error);
    expect(isUniqueViolation(err)).toBe(false);
  });
});

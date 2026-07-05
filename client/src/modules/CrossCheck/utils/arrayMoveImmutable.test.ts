import { describe, it, expect } from 'vitest';
import { CriteriaDto } from '@client/api';
import { arrayMoveImmutable, arrayMoveMutable } from './arrayMoveImmutable';

const make = (...ids: string[]): CriteriaDto[] => ids.map(criteriaId => ({ criteriaId }) as CriteriaDto);

describe('arrayMoveImmutable', () => {
  it('moves an item forward without mutating the input array', () => {
    const input = make('a', 'b', 'c');
    const result = arrayMoveImmutable(input, 0, 2);

    expect(result.map(c => c.criteriaId)).toEqual(['b', 'c', 'a']);
    // Original untouched.
    expect(input.map(c => c.criteriaId)).toEqual(['a', 'b', 'c']);
  });

  it('moves an item backward', () => {
    const result = arrayMoveImmutable(make('a', 'b', 'c'), 2, 0);
    expect(result.map(c => c.criteriaId)).toEqual(['c', 'a', 'b']);
  });

  it('resolves a negative fromIndex from the end of the array', () => {
    // fromIndex -1 → last element ("c"); move it to the front.
    const result = arrayMoveImmutable(make('a', 'b', 'c'), -1, 0);
    expect(result.map(c => c.criteriaId)).toEqual(['c', 'a', 'b']);
  });

  it('resolves a negative toIndex from the end of the array', () => {
    // toIndex -1 → length-1 insertion point.
    const result = arrayMoveImmutable(make('a', 'b', 'c'), 0, -1);
    expect(result.map(c => c.criteriaId)).toEqual(['b', 'c', 'a']);
  });

  it('is a no-op when fromIndex is out of range', () => {
    const result = arrayMoveImmutable(make('a', 'b'), 5, 0);
    // startIndex 5 is >= length → the move is skipped, array unchanged.
    expect(result.map(c => c.criteriaId)).toEqual(['a', 'b']);
  });

  it('is a no-op when the resolved fromIndex is still negative', () => {
    // fromIndex -10 on a 2-item array → startIndex -8 (< 0) → skipped.
    const result = arrayMoveImmutable(make('a', 'b'), -10, 1);
    expect(result.map(c => c.criteriaId)).toEqual(['a', 'b']);
  });
});

describe('arrayMoveMutable', () => {
  it('mutates the array in place', () => {
    const arr = make('a', 'b', 'c');
    arrayMoveMutable(arr, 0, 2);
    expect(arr.map(c => c.criteriaId)).toEqual(['b', 'c', 'a']);
  });
});

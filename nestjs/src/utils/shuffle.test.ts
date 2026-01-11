import { isShuffledArrays, shuffleRec } from './shuffle';

describe('shuffle utils', () => {
  describe('isShuffledArrays', () => {
    test.each<{ a: (number | string)[]; b: (number | string)[]; expected: boolean }>([
      { a: [1, 2, 3], b: [1, 2, 3], expected: false },
      { a: [1, 2, 3], b: [3, 2, 1], expected: true },
      { a: [1, 2, 3], b: [1, 3, 2], expected: true },
      { a: [1, 2], b: [1, 2, 3], expected: false },
      { a: [], b: [], expected: false },
      { a: [1], b: [1], expected: false },
      { a: ['a', 'b'], b: ['b', 'a'], expected: true },
      { a: [1, 2, 3], b: [1, 2], expected: false },
    ])('isShuffledArrays($a, $b) should be $expected', ({ a, b, expected }) => {
      expect(isShuffledArrays(a, b)).toBe(expected);
    });
  });

  describe('shuffleRec', () => {
    test.each<number[][]>([[[]], [[1]], [[1, 1, 1]]])(
      'should return a copy of the array for %p when shuffle is not possible or result remains same',
      input => {
        const result = shuffleRec(input);
        expect(result).toEqual(input);
        expect(result).not.toBe(input);
      },
    );

    test.each<unknown[][]>([[[1, 2, 3]], [[1, 2, 3, 4, 5]], [['a', 'b', 'c', 'd']]])(
      'should return a shuffled version of %p',
      input => {
        const result = shuffleRec(input);

        expect(result).toHaveLength(input.length);
        expect([...result].sort()).toEqual([...input].sort());
        expect(isShuffledArrays(input, result)).toBe(true);
      },
    );

    test('should respect maxAttempts', () => {
      const input = [1, 2];
      const result = shuffleRec(input, 0);
      expect(result).toHaveLength(input.length);
      expect([...result].sort()).toEqual([...input].sort());
    });
  });
});

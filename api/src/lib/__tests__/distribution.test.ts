import { shuffleRec, isShuffledArrays } from '../distribution';

test('shuffle', () => {
  for (let j = 0; j < 100; j++) {
    const a = ['A', 'B', 'C', 'D', 'E'];
    const b = shuffleRec(a);
    expect(b).toEqual(expect.arrayContaining(a));
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < a.length; i++) {
      expect(b[i]).not.toEqual(a[i]);
    }
  }
});

test('isShuffledArrays', () => {
  expect(isShuffledArrays(['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C', 'D', 'E'])).toEqual(false);
  expect(isShuffledArrays(['A', 'B', 'C', 'D'], ['A', 'B', 'C', 'D', 'E'])).toEqual(false);
  expect(isShuffledArrays(['A', 'B', 'C', 'K'], ['A', 'B', 'C', 'D', 'E'])).toEqual(false);
  expect(isShuffledArrays(['B', 'A', 'D', 'C'], ['A', 'B', 'C', 'D', 'E'])).toEqual(true);
});

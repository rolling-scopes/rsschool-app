import { shuffle } from '../distribution';

test('shuffle', () => {
  const a = ['A', 'B', 'C', 'D', 'E'];
  const b = shuffle(a);
  expect(b).not.toStrictEqual(a);
});

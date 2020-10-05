import { createCrossCheckPairs } from '../crossCheck';
import { uniq } from 'lodash';

const persons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pairsCountPerPerson = 3;

describe('cross check distribution', () => {
  it('should return correct amount of pairs', () => {
    const result = createCrossCheckPairs(persons, pairsCountPerPerson);
    expect(result.length).toBe(persons.length * pairsCountPerPerson);
  });

  it('should return only uniq pairs', () => {
    const result = createCrossCheckPairs(persons, pairsCountPerPerson);
    const pairsAsStrings = result.map(it => `${it.checkerId}|${it.studentId}`);
    const hasDuplicates = uniq(pairsAsStrings).length !== result.length;
    expect(hasDuplicates).toBeFalsy();
  });
});

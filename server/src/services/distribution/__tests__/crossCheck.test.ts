import { CrossCheckDistributionService } from '../crossCheckDistribution.service';
import { uniq } from 'lodash';

const persons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pairsCountPerPerson = 3;

describe('cross check distribution', () => {
  it('should return correct amount of pairs', () => {
    const service = new CrossCheckDistributionService();
    const result = service.distribute(persons, pairsCountPerPerson);
    expect(result.length).toBe(persons.length * pairsCountPerPerson);
  });

  it('should return only uniq pairs', () => {
    const service = new CrossCheckDistributionService();
    const result = service.distribute(persons, pairsCountPerPerson);
    const pairsAsStrings = result.map(it => `${it.checkerId}|${it.studentId}`);
    const hasDuplicates = uniq(pairsAsStrings).length !== result.length;
    expect(hasDuplicates).toBeFalsy();
  });
});

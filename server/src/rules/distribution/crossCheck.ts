import { times } from 'lodash';
import { shuffleRec } from './shuffle';

type CrossCheckPair = {
  checkerId: number;
  studentId: number;
};

export function createCrossCheckPairs(students: number[], minPairsPerPerson = 3, tryNum = 0): CrossCheckPair[] {
  let allPersons: number[] = [];

  times(minPairsPerPerson, () => {
    allPersons = allPersons.concat(shuffleRec(students));
  });

  const randomStudents = shuffleRec(allPersons);
  const createPair = (pairs: CrossCheckPair[], checkerId: number): CrossCheckPair[] => {
    if (randomStudents.length > 0) {
      const randomStudentId = randomStudents.shift();
      const isInvalidPair =
        randomStudentId === checkerId ||
        pairs.find((p) => p.studentId === randomStudentId && p.checkerId === checkerId);
      if (isInvalidPair) {
        if (randomStudents.length > 0 && randomStudents.some((s) => s !== checkerId)) {
          randomStudents.push(randomStudentId!);
          return createPair(pairs, checkerId);
        }
        return pairs;
      }
      if (randomStudentId) {
        pairs.push({ checkerId, studentId: randomStudentId });
      }
      return pairs;
    }

    return pairs;
  };

  let pairs: CrossCheckPair[] = [];

  for (const studentId of students) {
    times(minPairsPerPerson, () => {
      pairs = createPair(pairs, studentId);
    });
  }

  if (pairs.length < students.length * minPairsPerPerson) {
    // not able to distribute all students. try again (3 attempts total);
    if (tryNum < 3) {
      return createCrossCheckPairs(students, minPairsPerPerson, tryNum + 1);
    }
  }
  return pairs;
}

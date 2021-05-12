type CrossCheckPair = {
  checkerId: number;
  studentId: number;
};

function randomInteger(min: number, max: number): number {
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
}

function shuffle<T>(array: T[]): T[] {
  const arrcopy = [...array];

  for (let i = arrcopy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrcopy[i], arrcopy[j]] = [arrcopy[j], arrcopy[i]];
  }
  return arrcopy;
}

function createShifts(numberOfShifts: number, maxShiftValue: number): number[] {
  const shifts = new Set<number>();

  while (shifts.size < numberOfShifts) {
    shifts.add(randomInteger(1, maxShiftValue));
  }
  return Array.from(shifts);
}

export function createCrossCheckPairs(
  studentIds: number[],
  checkersNumber: number,
): CrossCheckPair[] {
  const pairs: CrossCheckPair[] = [];
  const shuffledStudentsIds = shuffle(studentIds);
  const studentsNumber = studentIds.length;
  const shifts = createShifts(checkersNumber, Math.floor((studentsNumber - 1) / 2));

  shuffledStudentsIds.forEach((studentId, index) => {
    for (let i = 0; i < checkersNumber; i++) {
      const checkerId = shuffledStudentsIds[(index + studentsNumber + shifts[i]) % studentsNumber];
      pairs.push({ checkerId, studentId });
    }
  });
  return pairs;
}

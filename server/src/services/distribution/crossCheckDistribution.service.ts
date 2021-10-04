type CrossCheckPair = {
  checkerId: number;
  studentId: number;
};

export class CrossCheckDistributionService {
  constructor(private defaultCheckersNumber = 4) {}

  public distribute(studentIds: number[], checkersNumber = this.defaultCheckersNumber): CrossCheckPair[] {
    const pairs: CrossCheckPair[] = [];
    const shuffledStudentsIds = this.shuffle(studentIds);
    const studentsNumber = studentIds.length;
    const shifts = this.createShifts(checkersNumber, Math.floor((studentsNumber - 1) / 2));

    shuffledStudentsIds.forEach((studentId, index) => {
      for (let i = 0; i < checkersNumber; i++) {
        const checkerId = shuffledStudentsIds[(index + shifts[i]) % studentsNumber];
        pairs.push({ checkerId, studentId });
      }
    });
    return pairs;
  }

  private randomInteger(min: number, max: number): number {
    return Math.round(min - 0.5 + Math.random() * (max - min + 1));
  }

  private shuffle<T>(array: T[]): T[] {
    const arrcopy = [...array];

    for (let i = arrcopy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrcopy[i], arrcopy[j]] = [arrcopy[j], arrcopy[i]];
    }
    return arrcopy;
  }

  private createShifts(numberOfShifts: number, maxShiftValue: number): number[] {
    if (numberOfShifts > maxShiftValue) {
      throw new Error(
        `It is impossible to distribute crosscheckers. NumberOfShifts: ${numberOfShifts}. MaxShiftValue: ${maxShiftValue}`,
      );
    }

    const shifts = new Set<number>();

    while (shifts.size < numberOfShifts) {
      shifts.add(this.randomInteger(1, maxShiftValue));
    }
    return Array.from(shifts);
  }
}

import { shuffleRec } from './shuffle';

export type CrossMentor = { id: number; students: { id: number }[] | null };

export class CrossMentorDistributionService {
  constructor(private defaultMaxStudents = 1) {}

  public distribute(
    mentors: CrossMentor[],
    existingPairs: { studentId: number; mentorId: number }[],
    registeredStudentsIds?: number[],
  ) {
    let students = mentors
      .map(m => m.students ?? [])
      .reduce((acc, v) => acc.concat(v), [] as { id: number }[])
      .filter(v => !existingPairs.find(p => p.studentId === v.id))
      .filter(v => registeredStudentsIds?.includes(v.id) ?? true);

    // eslint-disable-next-line no-console
    console.info({ initialStudentsCount: students.length });

    const maxStudentsPerMentor = mentors.map(({ id, students }) => {
      const assignedCount = existingPairs.filter(p => p.mentorId === id).length;
      const maxStudentsCount = Math.max((students?.length ?? 0) - assignedCount, 0);
      return { id, maxStudents: maxStudentsCount };
    });

    const maxStudentsTotal = maxStudentsPerMentor.reduce((acc, m) => acc + m.maxStudents, 0);

    if (students.length < maxStudentsTotal && registeredStudentsIds) {
      students = students.concat(
        registeredStudentsIds
          .filter(id => !existingPairs.find(p => p.studentId === id) && !students.find(st => st.id === id))
          .slice(0, maxStudentsTotal - students.length)
          .map(id => ({ id })),
      );
    }

    const randomStudents = students.length > 1 ? shuffleRec(students) : students;

    // distribute students to mentors by round robin
    const maxStudentsMap = maxStudentsPerMentor.reduce((acc, m) => {
      acc[m.id] = m.maxStudents;
      return acc;
    }, {} as Record<number, number>);

    // eslint-disable-next-line no-console
    console.info({
      registeredCount: registeredStudentsIds?.length,
      randomStudentsCount: randomStudents.length,
      maxStudentsTotal: maxStudentsTotal,
    });
    if (registeredStudentsIds && randomStudents.length < maxStudentsTotal) {
      // nullify students for mentors
      for (const mentor of mentors) {
        mentor.students = [];
      }

      randomStudents.forEach((student, i) => {
        const filteredMentors = mentors.filter(m => (maxStudentsMap[m.id] ?? this.defaultMaxStudents) > 0);
        const mentor = filteredMentors[i % filteredMentors.length];
        const cycle = Math.floor(i / filteredMentors.length);
        const { maxStudents } = maxStudentsPerMentor.find(str => str.id === mentor.id) ?? {
          maxStudents: this.defaultMaxStudents,
        };
        if (cycle < maxStudents) {
          mentor.students = mentor.students ? mentor.students.concat([student]) : [student];
        }
      });
    } else {
      for (const mentor of mentors) {
        const maxStudents = maxStudentsMap[mentor.id] ?? this.defaultMaxStudents;
        const students = randomStudents.splice(0, maxStudents);
        mentor.students = students;
      }
    }

    return {
      mentors: [] as CrossMentor[], // mentors as CrossMentor[],
      unassignedStudents: randomStudents,
    };
  }
}

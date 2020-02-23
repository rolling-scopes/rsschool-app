import { shuffleRec } from './shuffle';

const defaultStudentRestrictions = { maxStudents: 1 };

export type CrossMentor = { id: number; students: { id: number }[] | null };

export function createCrossMentorPairs(mentors: CrossMentor[]) {
  const students = mentors.map(m => m.students).reduce((acc: any, v) => acc.concat(v ?? []), []);

  const randomStudents = shuffleRec(students);

  const maxStudentsPerMentor = mentors.map(({ id, students }) => ({ id, maxStudents: students?.length ?? 0 }));

  for (const mentor of mentors) {
    const { maxStudents } = maxStudentsPerMentor.find(str => str.id === mentor.id) ?? defaultStudentRestrictions;
    const students = randomStudents.splice(0, maxStudents);
    mentor.students = students;
  }

  return {
    mentors: mentors as CrossMentor[],
    unassignedStudents: randomStudents,
  };
}

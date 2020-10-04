import { shuffleRec } from './shuffle';

const defaultStudentRestrictions = { maxStudents: 1 };

export type CrossMentor = { id: number; students: { id: number }[] | null };

export function createCrossMentorPairs(
  mentors: CrossMentor[],
  existingPairs: { studentId: number; mentorId: number }[],
  registeredStudentsIds?: number[],
) {
  const students = mentors
    .map((m) => m.students ?? [])
    .reduce((acc, v) => acc.concat(v), [] as { id: number }[])
    .filter((v) => !existingPairs.find((p) => p.studentId === v.id))
    .filter((v) => registeredStudentsIds?.includes(v.id) ?? true);

  const randomStudents = shuffleRec(students);

  const maxStudentsPerMentor = mentors.map(({ id, students }) => {
    const assignedCount = existingPairs.filter((p) => p.mentorId === id).length;
    const maxStudentsCount = Math.max((students?.length ?? 0) - assignedCount, 0);
    return { id, maxStudents: maxStudentsCount };
  });

  for (const mentor of mentors) {
    const { maxStudents } = maxStudentsPerMentor.find((str) => str.id === mentor.id) ?? defaultStudentRestrictions;
    const students = randomStudents.splice(0, maxStudents);
    mentor.students = students;
  }

  return {
    mentors: mentors as CrossMentor[],
    unassignedStudents: randomStudents,
  };
}

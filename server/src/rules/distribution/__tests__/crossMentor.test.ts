import { createCrossMentorPairs, CrossMentor } from '../crossMentor';

const mentors: CrossMentor[] = [
  { id: 1, students: [] },
  { id: 2, students: [{ id: 99 }, { id: 98 }] },
  { id: 3, students: [{ id: 97 }, { id: 96 }] },
  { id: 4, students: [{ id: 95 }] },
  { id: 5, students: [{ id: 94 }, { id: 93 }, { id: 92 }, { id: 91 }] },
  { id: 6, students: [{ id: 90 }, { id: 89 }] },
  { id: 7, students: null } as any,
];

describe('cross check distribution', () => {
  it('should return correct amount of mentors', () => {
    const result = createCrossMentorPairs(mentors, []);
    expect(result.mentors.length).toBe(mentors.length);
  });

  it('should return 0 unassigned students', () => {
    const result = createCrossMentorPairs(mentors, []);
    const combineStudents = (acc: any[], m: CrossMentor) => acc.concat(m.students ?? []);
    const studentsBefore = mentors.reduce(combineStudents, []);
    const studentsAfter = result.mentors.reduce(combineStudents, []);
    expect(result.unassignedStudents.length).toBe(0);
    expect(studentsBefore.length).toBe(studentsAfter.length);
  });

  it('should assigned students to mentor if it has active students', () => {
    const result = createCrossMentorPairs(mentors, []);
    const hasMentorsWithoutStudents = mentors
      .filter((m) => m.students?.length ?? 0)
      .some((mentor) => (result.mentors.find((m) => m.id === mentor.id)?.students?.length ?? 0) > 0);
    expect(hasMentorsWithoutStudents).toBeTruthy();
  });
});

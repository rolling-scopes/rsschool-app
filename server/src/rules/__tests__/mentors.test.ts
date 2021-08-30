import { createMentorStudentPairs } from '../mentors';

const mentors = [
  { id: 1, maxStudentsLimit: 2, students: [] },
  { id: 2, maxStudentsLimit: 1, students: [{ id: 99 }] },
  { id: 3, maxStudentsLimit: 1, students: [] },
];

const students = [
  { id: 99, totalScore: 99, mentor: { id: 1 } },
  { id: 98, totalScore: 98, mentor: null },
  { id: 97, totalScore: 97, mentor: null },
  { id: 96, totalScore: 96, mentor: null },
];

describe('createMentorStudentPairs', () => {
  it('should create pairs right', () => {
    const result = createMentorStudentPairs(mentors, students);
    const mentor1 = result.filter(pair => pair.mentor.id === 1);
    const mentor2 = result.filter(pair => pair.mentor.id === 2);
    const mentor3 = result.filter(pair => pair.mentor.id === 3);

    expect(mentor1.length).toBe(2);
    expect(mentor2.length).toBe(1);
    expect(mentor3.length).toBe(1);

    expect(mentor2[0]).toMatchObject({ mentor: { id: 2 }, student: { id: 99 } });
  });
});

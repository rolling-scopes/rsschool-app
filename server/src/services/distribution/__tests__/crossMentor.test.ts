import { CrossMentorDistributionService, CrossMentor } from '../crossMentorDistribution.service';

const mentors: CrossMentor[] = [
  { id: 1, students: [] },
  { id: 2, students: [{ id: 99 }, { id: 98 }] },
  { id: 3, students: [{ id: 97 }, { id: 96 }] },
  { id: 4, students: [{ id: 95 }] },
  { id: 5, students: [{ id: 94 }, { id: 93 }, { id: 92 }, { id: 91 }] },
  { id: 6, students: [{ id: 90 }, { id: 89 }] },
  { id: 7, students: null } as any,
];

const tooManyMentors = [
  { id: 1, students: [{ id: 99 }, { id: 94 }] },
  { id: 2, students: [{ id: 98 }] },
  { id: 3, students: [{ id: 97 }, { id: 96 }] },
  { id: 4, students: [] },
  { id: 5, students: [{ id: 93 }, { id: 95 }] },
];

describe('cross mentor distribution', () => {
  let service: CrossMentorDistributionService;

  beforeEach(() => {
    service = new CrossMentorDistributionService();
  });

  it('should return correct amount of mentors', () => {
    const result = service.distribute(mentors, []);
    expect(result.mentors.length).toBe(mentors.length);
  });

  it('should return 0 unassigned students', () => {
    const result = service.distribute(mentors, []);
    const combineStudents = (acc: any[], m: CrossMentor) => acc.concat(m.students ?? []);
    const studentsBefore = mentors.reduce(combineStudents, []);
    const studentsAfter = result.mentors.reduce(combineStudents, []);
    expect(result.unassignedStudents.length).toBe(0);
    expect(studentsBefore.length).toBe(studentsAfter.length);
  });

  it('should assigned students to mentor if it has active students', () => {
    const result = service.distribute(mentors, []);
    const hasMentorsWithoutStudents = mentors
      .filter(m => m.students?.length ?? 0)
      .some(mentor => (result.mentors.find(m => m.id === mentor.id)?.students?.length ?? 0) > 0);
    expect(hasMentorsWithoutStudents).toBeTruthy();
  });

  describe('should distribute students among all mentors', () => {
    let mentors: CrossMentor[] = [];
    beforeAll(() => {
      service = new CrossMentorDistributionService();
      const result = service.distribute(tooManyMentors, [], [99, 98, 97, 96, 95, 94]);
      mentors = result.mentors;
    });

    const cases = [
      [0, 2],
      [1, 1],
      [2, 2],
      [3, 0],
      [4, 1],
    ];

    it.each(cases)('mentor index %s', (index, studentsCount) => {
      expect(mentors[index].students?.length).toEqual(studentsCount);
    });
  });
});

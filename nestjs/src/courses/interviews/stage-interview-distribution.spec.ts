import { MentorDetails } from '@common/models';
import { createInterviews, distributeStudentsRandomly, InterviewInfo } from './stage-interview-distribution';

// Make the otherwise-random distribution deterministic. `shuffle` becomes a no-op
// (preserves input order) and `random` always picks the first index, so the pairing
// produced by `distributeStudentsRandomly` is reproducible across runs.
vi.mock('lodash', async importOriginal => {
  const actual = await importOriginal<typeof import('lodash') & { default?: typeof import('lodash') }>();
  // lodash is CommonJS: its named functions live on the `default` export, so spread
  // both so every real helper stays available alongside our deterministic overrides.
  return {
    ...actual.default,
    ...actual,
    shuffle: <T>(arr: T[]): T[] => [...arr],
    random: () => 0,
  };
});

type StudentInput = Parameters<typeof createInterviews>[1][number];

const buildMentor = (data: Partial<MentorDetails> = {}): MentorDetails =>
  ({
    id: 1,
    githubId: 'mentor-1',
    name: 'Mentor One',
    isActive: true,
    cityName: 'Minsk',
    countryName: 'BY',
    maxStudentsLimit: 4,
    studentsPreference: 'any',
    students: [],
    ...data,
  }) as MentorDetails;

const buildStudent = (data: Partial<StudentInput> = {}): StudentInput =>
  ({
    id: 1,
    githubId: 'student-1',
    cityName: 'Minsk',
    countryName: 'BY',
    mentor: null,
    totalScore: 50,
    ...data,
  }) as StudentInput;

const buildInterview = (data: Partial<InterviewInfo> = {}): InterviewInfo =>
  ({
    id: 1,
    student: { id: 10, githubId: 'student-1' },
    interviewer: { id: 1, githubId: 'mentor-1' },
    ...data,
  }) as InterviewInfo;

describe('stage-interview-distribution', () => {
  describe('createInterviews', () => {
    it('returns an empty distribution when there are no mentors and no students', () => {
      expect(createInterviews([], [], [])).toEqual([]);
    });

    it('keeps pre-assigned mentor/student pairs from mentors that already have students', () => {
      const mentors = [buildMentor({ id: 1, students: [{ id: 100 }] })];

      const result = createInterviews(mentors, [], []);

      // The existing mentor->student relation is preserved as a distribution pair.
      expect(result).toContainEqual({ student: { id: 100 }, mentor: { id: 1 } });
    });

    it('drops a pre-assigned pair when an interview already exists for it', () => {
      const mentors = [buildMentor({ id: 1, students: [{ id: 100 }] })];
      const interviews = [
        buildInterview({ interviewer: { id: 1, githubId: 'mentor-1' }, student: { id: 100, githubId: 'gh-100' } }),
      ];

      const result = createInterviews(mentors, [], interviews);

      expect(result).not.toContainEqual({ student: { id: 100 }, mentor: { id: 1 } });
      expect(result).toEqual([]);
    });

    it('filters out students who already have an interview', () => {
      // Mentor with "any" preference, capacity available; one student already interviewed.
      const mentors = [buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 6, students: [] })];
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 }),
        buildStudent({ id: 2, githubId: 'gh-2', totalScore: 80 }),
      ];
      const interviews = [
        buildInterview({ id: 5, student: { id: 1, githubId: 'gh-1' }, interviewer: { id: 9, githubId: 'other' } }),
      ];

      const result = createInterviews(mentors, students, interviews);

      // Student gh-1 is excluded; only student id 2 can be paired.
      const studentIds = result.map(p => p.student.id);
      expect(studentIds).toContain(2);
      expect(studentIds).not.toContain(1);
    });

    it('assigns free students to an "any" mentor up to capacity, highest score first', () => {
      const mentors = [buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 6, students: [] })];
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', totalScore: 10 }),
        buildStudent({ id: 2, githubId: 'gh-2', totalScore: 90 }),
        buildStudent({ id: 3, githubId: 'gh-3', totalScore: 50 }),
      ];

      const result = createInterviews(mentors, students, []);

      // maxStudentsLimit 6 (>= MIN_INTERVIEW_COUNT) -> capacity 6 -> maxCapacity 6+2 = 8,
      // so all three students fit.
      expect(result).toHaveLength(3);
      expect(result.map(p => p.student.id).sort()).toEqual([1, 2, 3]);
    });

    it('prefers a city mentor for a same-city student over a country mentor', () => {
      const cityMentor = buildMentor({
        id: 1,
        githubId: 'city',
        studentsPreference: 'city',
        cityName: 'Minsk',
        maxStudentsLimit: 6,
      });
      const countryMentor = buildMentor({
        id: 2,
        githubId: 'country',
        studentsPreference: 'country',
        countryName: 'BY',
        maxStudentsLimit: 6,
      });
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', cityName: 'Minsk', countryName: 'BY', totalScore: 80 }),
      ];

      const result = createInterviews([cityMentor, countryMentor], students, []);

      const pair = result.find(p => p.student.id === 1);
      expect(pair?.mentor.id).toBe(1);
    });

    it('falls back to a country mentor when no city mentor matches', () => {
      const countryMentor = buildMentor({
        id: 2,
        githubId: 'country',
        studentsPreference: 'country',
        countryName: 'BY',
        maxStudentsLimit: 6,
      });
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', cityName: 'Brest', countryName: 'BY', totalScore: 80 }),
      ];

      const result = createInterviews([countryMentor], students, []);

      expect(result).toContainEqual({ student: { id: 1 }, mentor: { id: 2 } });
    });

    it('drops a fully-loaded high-limit mentor that has no remaining capacity (surplus students)', () => {
      // maxStudentsLimit (6) >= MIN_INTERVIEW_COUNT and equals studentsCount, so capacity 0 ->
      // maxCapacity 0 -> the mentor is filtered out and the surplus student gets no new pair.
      const assigned = Array.from({ length: 6 }, (_, i) => ({ id: 200 + i }));
      const mentor = buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 6, students: assigned });
      const students = [buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 })];

      const result = createInterviews([mentor], students, []);

      // Only the 6 pre-existing mentor->student pairs survive; student id 1 is unpaired.
      expect(result.map(p => p.student.id).sort((a, b) => a - b)).toEqual([200, 201, 202, 203, 204, 205]);
      expect(result.map(p => p.student.id)).not.toContain(1);
    });

    it('applies the MIN_INTERVIEW_COUNT floor: a low-limit mentor still gets capacity for surplus students', () => {
      // maxStudentsLimit (1) < MIN_INTERVIEW_COUNT and capacity 0 -> lowGrade, maxCapacity 4-1 = 3,
      // so a surplus student is still paired despite the mentor being "full".
      const mentor = buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 1, students: [{ id: 100 }] });
      const students = [buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 })];

      const result = createInterviews([mentor], students, []);

      expect(result).toContainEqual({ student: { id: 100 }, mentor: { id: 1 } });
      expect(result).toContainEqual({ mentor: { id: 1 }, student: { id: 1 } });
    });

    it('grants maxCapacity = capacity + 1 when a mentor has exactly one free slot', () => {
      // maxStudentsLimit 5, 4 assigned -> capacity 1 (>= MIN floor not triggered) -> maxCapacity 2.
      const assigned = Array.from({ length: 4 }, (_, i) => ({ id: 300 + i }));
      const mentor = buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 5, students: assigned });
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 }),
        buildStudent({ id: 2, githubId: 'gh-2', totalScore: 80 }),
        buildStudent({ id: 3, githubId: 'gh-3', totalScore: 70 }),
      ];

      const result = createInterviews([mentor], students, []);

      // 4 pre-existing pairs + up to maxCapacity (2) new pairs.
      const newStudentIds = result.map(p => p.student.id).filter(id => id < 100);
      expect(newStudentIds).toHaveLength(2);
    });

    it('reduces leftCapacity by the number of interviews the mentor already conducted', () => {
      // maxStudentsLimit 6 -> maxCapacity 8; one existing interview by this mentor -> leftCapacity 7.
      const mentor = buildMentor({
        id: 1,
        githubId: 'mentor-1',
        studentsPreference: 'any',
        maxStudentsLimit: 6,
        students: [],
      });
      const students = [buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 })];
      const interviews = [
        buildInterview({ id: 9, interviewer: { id: 1, githubId: 'mentor-1' }, student: { id: 50, githubId: 'done' } }),
      ];

      const result = createInterviews([mentor], students, interviews);

      // Still has capacity left, so the new student is paired.
      expect(result).toContainEqual({ mentor: { id: 1 }, student: { id: 1 } });
    });

    it('treats a low-limit mentor with free slots as non-lowGrade (capacity !== 0 under the floor)', () => {
      // maxStudentsLimit 2, 0 assigned -> capacity 2; 0 + 2 < MIN_INTERVIEW_COUNT but capacity != 0,
      // so lowGrade stays false while maxCapacity gets the MIN floor (4).
      const mentor = buildMentor({ id: 1, studentsPreference: 'any', maxStudentsLimit: 2, students: [] });
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', totalScore: 90 }),
        buildStudent({ id: 2, githubId: 'gh-2', totalScore: 80 }),
      ];

      const result = createInterviews([mentor], students, []);

      expect(result.map(p => p.student.id).sort((a, b) => a - b)).toEqual([1, 2]);
    });

    it('honours a mentor city preference and excludes students from other cities', () => {
      const cityMentor = buildMentor({
        id: 1,
        githubId: 'city',
        studentsPreference: 'city',
        cityName: 'Minsk',
        maxStudentsLimit: 6,
      });
      const students = [
        buildStudent({ id: 1, githubId: 'gh-1', cityName: 'Minsk', totalScore: 70 }),
        buildStudent({ id: 2, githubId: 'gh-2', cityName: 'Gomel', totalScore: 70 }),
      ];

      const result = createInterviews([cityMentor], students, []);

      const ids = result.map(p => p.student.id);
      expect(ids).toContain(1);
      expect(ids).not.toContain(2);
    });
  });

  describe('distributeStudentsRandomly', () => {
    const mentor = (id: number, capacity: number, lowGrade = false) =>
      ({ id, capacity, lowGrade, githubId: `m${id}`, cityName: null, countryName: 'BY' }) as never;
    const student = (id: number, totalScore: number) => ({ id, githubId: `s${id}`, totalScore }) as never;

    it('returns no pairs when there are no students', () => {
      expect(distributeStudentsRandomly([mentor(1, 3)], [])).toEqual([]);
    });

    it('returns no pairs when total mentor capacity is zero', () => {
      expect(distributeStudentsRandomly([mentor(1, 0)], [student(1, 50)])).toEqual([]);
    });

    it('pairs students with a single mentor up to its capacity', () => {
      const result = distributeStudentsRandomly([mentor(1, 2)], [student(1, 50), student(2, 60), student(3, 70)]);

      expect(result).toHaveLength(2);
      result.forEach(pair => expect(pair.mentor).toEqual({ id: 1 }));
    });

    it('caps the number of pairs at the number of students (capacity surplus)', () => {
      const result = distributeStudentsRandomly([mentor(1, 5)], [student(1, 50)]);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ mentor: { id: 1 }, student: { id: 1 } });
    });

    it('distributes across multiple mentors round-robin', () => {
      const result = distributeStudentsRandomly([mentor(1, 1), mentor(2, 1)], [student(1, 50), student(2, 60)]);

      expect(result).toHaveLength(2);
      expect(result.map(p => p.mentor.id).sort()).toEqual([1, 2]);
    });

    it('a lowGrade mentor selects the lowest-scoring student', () => {
      // shuffle is a no-op; lowGrade path scans for the minimum totalScore.
      const result = distributeStudentsRandomly([mentor(1, 1, true)], [student(1, 90), student(2, 10), student(3, 50)]);

      expect(result).toHaveLength(1);
      expect(result[0].student).toEqual({ id: 2 });
    });

    it('a lowGrade mentor with a single student picks that student (minScore stays 0 on first item)', () => {
      const result = distributeStudentsRandomly([mentor(1, 1, true)], [student(1, 0)]);

      expect(result).toEqual([{ mentor: { id: 1 }, student: { id: 1 } }]);
    });

    it('skips a zero-capacity mentor while a sibling mentor still has capacity', () => {
      // mentor 2 has capacity 0: the inner loop visits it but the capacity>0 guard skips it,
      // so only mentor 1 produces pairs.
      const result = distributeStudentsRandomly(
        [mentor(1, 2), mentor(2, 0)],
        [student(1, 50), student(2, 60), student(3, 70)],
      );

      expect(result).toHaveLength(2);
      result.forEach(pair => expect(pair.mentor).toEqual({ id: 1 }));
    });
  });
});

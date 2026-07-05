import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import {
  CourseStudentsService,
  convertToMentorBasic,
  createName,
  getInterviewRatings,
} from './course-students.service';

// Fluent QueryBuilder mock: chained builder methods return the qb, terminals resolve rows.
type Terminals = { getMany?: unknown[]; getOne?: unknown };
const createQb = (terminals: Terminals = {}) => {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of [
    'select',
    'addSelect',
    'innerJoin',
    'innerJoinAndSelect',
    'leftJoin',
    'leftJoinAndSelect',
    'where',
    'andWhere',
    'orderBy',
    'addOrderBy',
    'limit',
    'setParameters',
  ]) {
    qb[method] = vi.fn(() => qb);
  }
  qb.getMany = vi.fn(async () => terminals.getMany ?? []);
  qb.getOne = vi.fn(async () => terminals.getOne ?? null);
  return qb;
};

const studentRepository = {
  createQueryBuilder: vi.fn(),
  update: vi.fn(),
  save: vi.fn(),
  findOne: vi.fn(),
};
const mentorRepository = {
  createQueryBuilder: vi.fn(),
  findOne: vi.fn(),
};
const stageInterviewRepository = {
  createQueryBuilder: vi.fn(),
  update: vi.fn(),
};
const dataSource = {
  getRepository: vi.fn(() => stageInterviewRepository),
};

describe('CourseStudentsService', () => {
  let service: CourseStudentsService;

  beforeEach(async () => {
    [studentRepository, mentorRepository, stageInterviewRepository, dataSource].forEach(repo =>
      Object.values(repo).forEach(fn => (fn as ReturnType<typeof vi.fn>).mockReset()),
    );
    dataSource.getRepository.mockReturnValue(stageInterviewRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStudentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get(CourseStudentsService);
  });

  describe('getStudentsWithDetails', () => {
    it('maps full details: active mentor, interviews and assigned checks', async () => {
      const record = {
        id: 42,
        isExpelled: false,
        isFailed: false,
        totalScore: 100,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          githubId: 'john-doe',
          cityName: 'Warsaw',
          countryName: 'Poland',
          discord: { id: 'd1', username: 'john', discriminator: '0001' },
        },
        mentor: {
          id: 8,
          isExpelled: false,
          user: {
            firstName: 'Mentor',
            lastName: 'X',
            githubId: 'mentor-x',
            cityName: 'Berlin',
            countryName: 'Germany',
          },
        },
        stageInterviews: [{ id: 1, isCompleted: true }],
        taskChecker: [{ courseTask: { id: 7, task: { name: 'songbird' } } }],
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentsWithDetails(5, true);

      expect(qb.where).toHaveBeenCalledWith('course.id = :courseId AND student."isExpelled" = false', { courseId: 5 });
      expect(qb.orderBy).toHaveBeenCalledWith('student.totalScore', 'DESC');
      expect(result).toEqual([
        {
          name: 'John Doe',
          isActive: true,
          id: 42,
          githubId: 'john-doe',
          mentor: {
            isActive: true,
            name: 'Mentor X',
            id: 8,
            githubId: 'mentor-x',
            students: [],
            cityName: 'Berlin',
            countryName: 'Germany',
          },
          cityName: 'Warsaw',
          countryName: 'Poland',
          discord: { id: 'd1', username: 'john', discriminator: '0001' },
          totalScore: 100,
          interviews: [{ id: 1, isCompleted: true }],
          assignedChecks: [{ id: 7, name: 'songbird' }],
        },
      ]);
    });

    it('omits the active-only filter and handles a null mentor, empty interviews/checks and fallback locations', async () => {
      const record = {
        id: 43,
        isExpelled: true,
        isFailed: false,
        totalScore: 0,
        user: {
          firstName: 'No',
          lastName: 'Mentor',
          githubId: 'no-mentor',
          cityName: null,
          countryName: null,
          discord: null,
        },
        mentor: null,
        stageInterviews: undefined,
        taskChecker: undefined,
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentsWithDetails(5, false);

      expect(qb.where).toHaveBeenCalledWith('course.id = :courseId ', { courseId: 5 });
      expect(result[0]).toEqual({
        name: 'No Mentor',
        isActive: false, // isExpelled => not active
        id: 43,
        githubId: 'no-mentor',
        mentor: null,
        cityName: 'Other',
        countryName: 'Other',
        discord: null,
        totalScore: 0,
        interviews: [],
        assignedChecks: [],
      });
    });

    it('builds an empty mentor name and empty location when the mentor has no user', async () => {
      const record = {
        id: 44,
        isExpelled: false,
        isFailed: false,
        totalScore: 10,
        user: { firstName: 'A', lastName: 'B', githubId: 'a-b', cityName: 'X', countryName: 'Y', discord: null },
        mentor: { id: 9, isExpelled: true, user: null },
        stageInterviews: [],
        taskChecker: [],
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentsWithDetails(5, true);

      expect(result[0].mentor).toEqual({
        isActive: false, // mentor.isExpelled => inactive
        name: '',
        id: 9,
        githubId: undefined,
        students: [],
        cityName: '',
        countryName: '',
      });
    });
  });

  describe('getStudentsForCsv', () => {
    it('maps a student with a mentor to a flat csv row', async () => {
      const record = {
        id: 42,
        isExpelled: false,
        isFailed: false,
        totalScore: 100,
        user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe', cityName: 'Warsaw', countryName: 'Poland' },
        mentor: { user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } },
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const rows = await service.getStudentsForCsv(5, false);

      expect(qb.where).toHaveBeenCalledWith('course.id = :courseId ', { courseId: 5 });
      expect(rows).toEqual([
        {
          id: 42,
          githubId: 'john-doe',
          name: 'John Doe',
          isActive: true,
          mentorName: 'Mentor X',
          mentorGithubId: 'mentor-x',
          totalScore: 100,
          city: 'Warsaw',
          country: 'Poland',
        },
      ]);
    });

    it('uses the active-only filter and emits Unknown locations and null mentor fields', async () => {
      const record = {
        id: 43,
        isExpelled: true, // -> isActive false
        isFailed: false,
        totalScore: 5,
        user: { firstName: 'Jane', lastName: null, githubId: 'jane', cityName: null, countryName: null },
        mentor: null,
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const rows = await service.getStudentsForCsv(5, true);

      expect(qb.where).toHaveBeenCalledWith('course.id = :courseId AND student."isExpelled" = false', { courseId: 5 });
      expect(rows).toEqual([
        {
          id: 43,
          githubId: 'jane',
          name: 'Jane',
          isActive: false,
          mentorName: undefined,
          mentorGithubId: undefined,
          totalScore: 5,
          city: 'Unknown',
          country: 'Unknown',
        },
      ]);
    });

    it('treats a mentor without a user as null (no mentor data)', async () => {
      const record = {
        id: 44,
        isExpelled: false,
        isFailed: true, // -> isActive false
        totalScore: 1,
        user: { firstName: 'K', lastName: 'L', githubId: 'k-l', cityName: 'C', countryName: 'D' },
        mentor: { user: null },
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const rows = await service.getStudentsForCsv(5, false);

      expect(rows[0]).toMatchObject({ isActive: false, mentorName: undefined, mentorGithubId: undefined });
    });
  });

  describe('searchCourseStudents', () => {
    it('searches active students and includes the without-mentor filter, mapping the mentor', async () => {
      const record = {
        id: 42,
        user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe' },
        mentor: { id: 8, user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } },
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.searchCourseStudents(5, 'jo', true);

      expect(qb.where).toHaveBeenCalledWith('student.courseId = :courseId');
      expect(qb.andWhere).toHaveBeenCalledWith('student.isExpelled = false');
      expect(qb.andWhere).toHaveBeenCalledWith('mentor.id IS NULL');
      expect(qb.limit).toHaveBeenCalledWith(20);
      expect(result).toEqual([
        { id: 42, githubId: 'john-doe', name: 'John Doe', mentor: { id: 8, githubId: 'mentor-x', name: 'Mentor X' } },
      ]);
    });

    it('omits the without-mentor filter and maps a null mentor when the mentor has no user', async () => {
      const record = {
        id: 43,
        user: { firstName: 'Solo', lastName: 'Student', githubId: 'solo' },
        mentor: { id: 9, user: null },
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.searchCourseStudents(5, 'so', false);

      expect(qb.andWhere).not.toHaveBeenCalledWith('mentor.id IS NULL');
      expect(result).toEqual([{ id: 43, githubId: 'solo', name: 'Solo Student', mentor: null }]);
    });

    it('builds the name from the last name only when the first name is missing', async () => {
      const record = {
        id: 44,
        user: { firstName: null, lastName: 'Doe', githubId: 'doe' },
        mentor: null,
      };
      const qb = createQb({ getMany: [record] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.searchCourseStudents(5, 'do', false);

      expect(result[0].name).toBe('Doe');
    });
  });

  describe('setStudentMentor', () => {
    it('updates the student mentorId', async () => {
      await service.setStudentMentor(42, 9);
      expect(studentRepository.update).toHaveBeenCalledWith(42, { mentorId: 9 });
    });

    it('clears the mentor when passed null', async () => {
      await service.setStudentMentor(42, null);
      expect(studentRepository.update).toHaveBeenCalledWith(42, { mentorId: null });
    });
  });

  describe('getMenteeGithubIds', () => {
    it('returns the student user githubIds for the mentor', async () => {
      const qb = createQb({ getMany: [{ user: { githubId: 's1' } }, { user: { githubId: 's2' } }] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getMenteeGithubIds(5, 'mentor-x');

      expect(qb.where).toHaveBeenCalledWith('mUser.githubId = :githubId', { githubId: 'mentor-x' });
      expect(qb.andWhere).toHaveBeenCalledWith('student.isExpelled = false');
      expect(result).toEqual(['s1', 's2']);
    });

    it('returns an empty array when there are no mentees', async () => {
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

      const result = await service.getMenteeGithubIds(5, 'mentor-x');

      expect(result).toEqual([]);
    });
  });

  describe('getMentorBasicByGithubId', () => {
    it('returns null when no mentor record is found', async () => {
      mentorRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));

      const result = await service.getMentorBasicByGithubId(5, 'unknown');

      expect(result).toBeNull();
    });

    it('maps the mentor basic with active flag and fallback locations', async () => {
      const record = {
        id: 8,
        isExpelled: false,
        user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x', cityName: null, countryName: null },
      };
      mentorRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: record }));

      const result = await service.getMentorBasicByGithubId(5, 'mentor-x');

      expect(result).toEqual({
        isActive: true,
        name: 'Mentor X',
        id: 8,
        githubId: 'mentor-x',
        students: [],
        cityName: '',
        countryName: '',
      });
    });

    it('reports an expelled mentor as inactive and preserves locations', async () => {
      const record = {
        id: 8,
        isExpelled: true,
        user: { firstName: 'M', lastName: 'X', githubId: 'mx', cityName: 'Paris', countryName: 'France' },
      };
      mentorRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: record }));

      const result = await service.getMentorBasicByGithubId(5, 'mx');

      expect(result).toMatchObject({ isActive: false, cityName: 'Paris', countryName: 'France' });
    });
  });

  describe('getStudentWithMentor', () => {
    it('returns null when no student is found', async () => {
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));

      const result = await service.getStudentWithMentor(5, 'unknown');

      expect(result).toBeNull();
    });

    it('maps a student with a mentor', async () => {
      const record = {
        id: 42,
        isExpelled: false,
        isFailed: false,
        totalScore: 100,
        user: {
          firstName: 'John',
          lastName: 'Doe',
          githubId: 'john-doe',
          cityName: 'Warsaw',
          countryName: 'Poland',
          discord: null,
        },
        mentor: {
          id: 8,
          isExpelled: false,
          user: {
            firstName: 'Mentor',
            lastName: 'X',
            githubId: 'mentor-x',
            cityName: 'Berlin',
            countryName: 'Germany',
          },
        },
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: record }));

      const result = await service.getStudentWithMentor(5, 'john-doe');

      expect(result).toEqual({
        id: 42,
        name: 'John Doe',
        githubId: 'john-doe',
        cityName: 'Warsaw',
        countryName: 'Poland',
        isActive: true,
        discord: null,
        totalScore: 100,
        mentor: {
          id: 8,
          name: 'Mentor X',
          githubId: 'mentor-x',
          cityName: 'Berlin',
          countryName: 'Germany',
          isActive: true,
        },
      });
    });

    it('maps a student with no mentor, expelled, with fallback locations and undefined mentor locations', async () => {
      const record = {
        id: 43,
        isExpelled: true,
        isFailed: false,
        totalScore: 0,
        user: {
          firstName: 'Solo',
          lastName: 'Student',
          githubId: 'solo',
          cityName: null,
          countryName: null,
          discord: null,
        },
        mentor: null,
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: record }));

      const result = await service.getStudentWithMentor(5, 'solo');

      expect(result).toMatchObject({
        cityName: 'Unknown',
        countryName: 'Unknown',
        isActive: false,
        mentor: null,
      });
    });

    it('falls back mentor locations to undefined when absent', async () => {
      const record = {
        id: 44,
        isExpelled: false,
        isFailed: false,
        totalScore: 10,
        user: { firstName: 'A', lastName: 'B', githubId: 'a-b', cityName: 'C', countryName: 'D', discord: null },
        mentor: {
          id: 9,
          isExpelled: false,
          user: { firstName: 'M', lastName: 'N', githubId: 'm-n', cityName: null, countryName: null },
        },
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: record }));

      const result = await service.getStudentWithMentor(5, 'a-b');

      expect(result?.mentor).toEqual({
        id: 9,
        name: 'M N',
        githubId: 'm-n',
        cityName: undefined,
        countryName: undefined,
        isActive: true,
      });
    });
  });

  describe('canChangeStatus', () => {
    const session = { id: 1, githubId: 'viewer', isAdmin: false, courses: {} } as never;
    const adminSession = { id: 1, githubId: 'viewer', isAdmin: true, courses: {} } as never;

    it('denies when the student is not found', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue(null);

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: false, message: 'not valid student' });
    });

    it('allows power users immediately', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42, mentorId: 9 } as Student);

      const result = await service.canChangeStatus(adminSession, 5, 'john-doe');

      expect(result).toEqual({ allow: true });
    });

    it('denies when the requester is not a mentor of the course', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42, mentorId: 9 } as Student);
      stageInterviewRepository.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));
      mentorRepository.findOne.mockResolvedValue(null);

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: false, message: 'not valid mentor' });
    });

    it('denies a mentor unrelated to the student', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42, mentorId: 9 } as Student);
      stageInterviewRepository.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));
      mentorRepository.findOne.mockResolvedValue({ id: 8 });

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: false, message: 'incorrect mentor-student relation' });
    });

    it('allows the assigned mentor', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42, mentorId: 9 } as Student);
      stageInterviewRepository.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));
      mentorRepository.findOne.mockResolvedValue({ id: 9 });

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: true });
    });

    it('allows the stage interviewer even when not the assigned mentor', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42, mentorId: 9 } as Student);
      stageInterviewRepository.createQueryBuilder.mockReturnValue(
        createQb({ getMany: [{ mentor: { user: { githubId: 'viewer' } } }] }),
      );
      mentorRepository.findOne.mockResolvedValue({ id: 8 });

      const result = await service.canChangeStatus(session, 5, 'john-doe');

      expect(result).toEqual({ allow: true });
    });
  });

  describe('expelStudent', () => {
    it('does nothing when the student is not found', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue(null);

      await service.expelStudent(5, 'john-doe', 'reason');

      expect(studentRepository.update).not.toHaveBeenCalled();
      expect(stageInterviewRepository.update).not.toHaveBeenCalled();
    });

    it('expels the student and cancels incomplete interviews', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42 } as Student);

      await service.expelStudent(5, 'john-doe', 'reason');

      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        mentorId: null,
        isExpelled: true,
        expellingReason: 'reason',
        endDate: expect.any(Date),
      });
      expect(stageInterviewRepository.update).toHaveBeenCalledWith(
        { studentId: 42, isCompleted: false },
        { isCanceled: true },
      );
    });

    it('defaults the comment to an empty string', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42 } as Student);

      await service.expelStudent(5, 'john-doe');

      expect(studentRepository.update).toHaveBeenCalledWith(42, expect.objectContaining({ expellingReason: '' }));
    });
  });

  describe('setSelfStudy', () => {
    it('does nothing when the student is not found', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue(null);

      await service.setSelfStudy(5, 'john-doe', 'c');

      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('removes mentor and disables mentoring', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42 } as Student);

      await service.setSelfStudy(5, 'john-doe', 'c');

      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        mentorId: null,
        mentoring: false,
        expellingReason: 'c',
      });
    });

    it('defaults the comment to an empty string', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42 } as Student);

      await service.setSelfStudy(5, 'john-doe');

      expect(studentRepository.update).toHaveBeenCalledWith(42, expect.objectContaining({ expellingReason: '' }));
    });
  });

  describe('restoreStudent', () => {
    it('does nothing when the student is not found', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue(null);

      await service.restoreStudent(5, 'john-doe');

      expect(studentRepository.update).not.toHaveBeenCalled();
    });

    it('restores the student', async () => {
      vi.spyOn(service, 'getStudentByGithubId').mockResolvedValue({ id: 42 } as Student);

      await service.restoreStudent(5, 'john-doe');

      expect(studentRepository.update).toHaveBeenCalledWith(42, {
        isExpelled: false,
        expellingReason: '',
        endDate: null,
      });
    });
  });

  describe('updateMentoringAvailability', () => {
    it('updates the mentoring flag', async () => {
      await service.updateMentoringAvailability(42, true);
      expect(studentRepository.update).toHaveBeenCalledWith(42, { mentoring: true });
    });
  });

  describe('getStudentByGithubId', () => {
    it('returns the student record when found', async () => {
      const student = { id: 42 } as Student;
      studentRepository.findOne.mockResolvedValue(student);

      const result = await service.getStudentByGithubId(5, 'john-doe');

      expect(studentRepository.findOne).toHaveBeenCalledWith({
        where: { courseId: 5, user: { githubId: 'john-doe' } },
        relations: ['user'],
      });
      expect(result).toBe(student);
    });

    it('returns null when no record is found', async () => {
      studentRepository.findOne.mockResolvedValue(null);

      const result = await service.getStudentByGithubId(5, 'john-doe');

      expect(result).toBeNull();
    });
  });

  describe('getStudentScore', () => {
    it('returns null when no student is found', async () => {
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));

      const result = await service.getStudentScore(42);

      expect(result).toBeNull();
    });

    it('aggregates enabled task results and interview results, defaulting rank', async () => {
      const student = {
        totalScore: 50,
        rank: null,
        taskResults: [
          { courseTaskId: 1, score: 10, courseTask: { disabled: false } },
          { courseTaskId: 2, score: 99, courseTask: { disabled: true } },
        ],
        taskInterviewResults: [{ courseTaskId: 3, score: 7 }],
        stageInterviews: [],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      expect(result).toEqual({
        totalScore: 50,
        rank: 999999,
        results: [
          { courseTaskId: 1, score: 10 },
          { courseTaskId: 3, score: 7 },
        ],
      });
    });

    it('defaults missing scores to 0 via toTaskScore', async () => {
      const student = {
        totalScore: 0,
        rank: 5,
        taskResults: [{ courseTaskId: 1, courseTask: { disabled: false } }],
        taskInterviewResults: [],
        stageInterviews: [],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      expect(result?.results).toEqual([{ courseTaskId: 1, score: 0 }]);
      expect(result?.rank).toBe(5);
    });

    it('adds a stage-interview score using the precalculated score when the feedback has a version', async () => {
      const student = {
        totalScore: 0,
        rank: 1,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 14,
            isCompleted: true,
            score: 80,
            stageInterviewFeedbacks: [{ version: 2, json: '{}' }],
          },
        ],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      expect(result?.results).toEqual([{ score: 80, courseTaskId: 14 }]);
    });

    it('adds a stage-interview score computed from feedback rating when there is no version', async () => {
      const feedbackJson = JSON.stringify({
        skills: { htmlCss: { level: 8 }, common: { a: 6, b: 8 }, dataStructures: { c: 4, d: 6 } },
        programmingTask: { codeWritingLevel: 6 },
      });
      const student = {
        totalScore: 0,
        rank: 1,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 14,
            isCompleted: true,
            score: null,
            stageInterviewFeedbacks: [{ version: undefined, json: feedbackJson, updatedDate: '2024-01-03' }],
          },
        ],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      // rating (8+7+5+6)/4*10 = 65 -> floor 65
      expect(result?.results).toEqual([{ score: 65, courseTaskId: 14 }]);
    });

    it('uses the latest feedback by date when computing the interview rating from multiple feedbacks', async () => {
      const lowJson = JSON.stringify({
        skills: { htmlCss: { level: 2 }, common: { a: 2 }, dataStructures: { b: 2 } },
        programmingTask: { codeWritingLevel: 2 },
        resume: { score: 10 },
      });
      const highJson = JSON.stringify({
        skills: { htmlCss: { level: 9 }, common: { a: 9 }, dataStructures: { b: 9 } },
        programmingTask: { codeWritingLevel: 9 },
        resume: { score: 90 },
      });
      const student = {
        totalScore: 0,
        rank: 1,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 14,
            isCompleted: true,
            score: null,
            stageInterviewFeedbacks: [
              { version: undefined, json: lowJson, updatedDate: '2024-01-01' },
              { version: undefined, json: highJson, updatedDate: '2024-02-01' },
            ],
          },
        ],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      // latest feedback (2024-02-01) resume.score 90 wins over the older one -> floor 90
      expect(result?.results).toEqual([{ score: 90, courseTaskId: 14 }]);
    });

    it('falls back to a zero interview score when no completed interview rating is available', async () => {
      const student = {
        totalScore: 0,
        rank: 1,
        taskResults: [],
        taskInterviewResults: [],
        stageInterviews: [
          {
            courseTaskId: 14,
            isCompleted: false, // not completed -> getStageInterviewRating yields null -> 0
            score: null,
            stageInterviewFeedbacks: [],
          },
        ],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      expect(result?.results).toEqual([{ score: 0, courseTaskId: 14 }]);
    });

    it('does not add a stage-interview score when a result already exists for the courseTaskId', async () => {
      const student = {
        totalScore: 0,
        rank: 1,
        taskResults: [{ courseTaskId: 14, score: 30, courseTask: { disabled: false } }],
        taskInterviewResults: [],
        stageInterviews: [
          { courseTaskId: 14, isCompleted: true, score: 80, stageInterviewFeedbacks: [{ version: 2 }] },
        ],
      };
      studentRepository.createQueryBuilder.mockReturnValue(createQb({ getOne: student }));

      const result = await service.getStudentScore(42);

      expect(result?.results).toEqual([{ courseTaskId: 14, score: 30 }]);
    });
  });

  describe('getMentorWithContacts', () => {
    it('throws NotFoundException when the mentor is missing', async () => {
      mentorRepository.findOne.mockResolvedValue(null);

      await expect(service.getMentorWithContacts(8)).rejects.toThrow(NotFoundException);
    });

    it('returns the mentor basic enriched with contacts', async () => {
      const record = {
        id: 8,
        isExpelled: false,
        user: {
          firstName: 'Mentor',
          lastName: 'X',
          githubId: 'mentor-x',
          cityName: 'Berlin',
          countryName: 'Germany',
          contactsEmail: 'm@e.com',
          contactsSkype: 'm-skype',
          contactsWhatsApp: 'm-wa',
          contactsTelegram: 'm-tg',
          contactsNotes: 'note',
        },
        students: [
          { id: 1, isExpelled: false, isFailed: false },
          { id: 2, isExpelled: true, isFailed: false },
        ],
      };
      mentorRepository.findOne.mockResolvedValue(record);

      const result = await service.getMentorWithContacts(8);

      expect(result).toEqual({
        isActive: true,
        name: 'Mentor X',
        id: 8,
        githubId: 'mentor-x',
        students: [{ id: 1 }],
        cityName: 'Berlin',
        countryName: 'Germany',
        contactsEmail: 'm@e.com',
        contactsSkype: 'm-skype',
        contactsWhatsApp: 'm-wa',
        contactsTelegram: 'm-tg',
        contactsNotes: 'note',
        contactsPhone: null,
      });
    });
  });

  describe('expelStudents', () => {
    const baseDto = (overrides = {}) => ({
      criteria: {},
      options: {},
      expellingReason: 'mass expel',
      ...overrides,
    });

    it('expels students with the simplest criteria and removes the mentor by default', async () => {
      const students = [
        { id: 1, mentorId: 11 },
        { id: 2, mentorId: null },
      ];
      const qb = createQb({ getMany: students });
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      studentRepository.save.mockResolvedValue(undefined);

      const result = await service.expelStudents({ courseId: 5, expelStatusDto: baseDto() as never });

      expect(qb.where).toHaveBeenCalledWith('student.courseId = :courseId', { courseId: 5 });
      expect(qb.andWhere).toHaveBeenCalledWith('student.isExpelled = false');
      expect(studentRepository.save).toHaveBeenCalledWith([
        { id: 1, isExpelled: true, endDate: expect.any(Date), expellingReason: 'mass expel', mentorId: null },
        { id: 2, isExpelled: true, endDate: expect.any(Date), expellingReason: 'mass expel', mentorId: null },
      ]);
      expect(result).toBe(students);
    });

    it('applies course-task join, minScore, keepWithMentor filters and preserves the mentor when requested', async () => {
      const students = [{ id: 1, mentorId: 11 }];
      const qb = createQb({ getMany: students });
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      studentRepository.save.mockResolvedValue(undefined);

      await service.expelStudents({
        courseId: 5,
        expelStatusDto: baseDto({
          criteria: { courseTaskIds: [101, 102], minScore: 50 },
          options: { keepWithMentor: true, saveAssigningToMentor: true },
        }) as never,
      });

      expect(qb.leftJoin).toHaveBeenCalledWith(
        'student.taskResults',
        'tr',
        'tr.studentId = student.id AND tr.score > 0 AND tr.courseTaskId IN (:...requiredCourseTaskIds)',
        { requiredCourseTaskIds: [101, 102] },
      );
      expect(qb.andWhere).toHaveBeenCalledWith('student.mentorId IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith('student.totalScore < :minScore', { minScore: 50 });
      expect(qb.andWhere).toHaveBeenCalledWith('tr.id IS NULL');
      expect(studentRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, mentorId: 11 }), // mentor preserved
      ]);
    });

    it('treats an empty courseTaskIds list as no task filter', async () => {
      const qb = createQb({ getMany: [] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      studentRepository.save.mockResolvedValue(undefined);

      await service.expelStudents({
        courseId: 5,
        expelStatusDto: baseDto({ criteria: { courseTaskIds: [] } }) as never,
      });

      expect(qb.leftJoin).not.toHaveBeenCalled();
      expect(qb.andWhere).not.toHaveBeenCalledWith('tr.id IS NULL');
    });

    it('omits the minScore filter when minScore is null', async () => {
      const qb = createQb({ getMany: [] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);
      studentRepository.save.mockResolvedValue(undefined);

      await service.expelStudents({
        courseId: 5,
        expelStatusDto: baseDto({ criteria: { minScore: null } }) as never,
      });

      expect(qb.andWhere).not.toHaveBeenCalledWith('student.totalScore < :minScore', expect.anything());
    });
  });
});

describe('getInterviewRatings', () => {
  it('returns the resume score directly when present', () => {
    const result = getInterviewRatings({
      skills: { htmlCss: { level: 5 }, common: { a: 4 }, dataStructures: { b: 6 } },
      programmingTask: { codeWritingLevel: 5 },
      resume: { score: 42 },
    } as never);

    expect(result.rating).toBe(42);
    expect(result.htmlCss).toBe(5);
  });

  it('computes the rating from four skill ratings when all are present', () => {
    const result = getInterviewRatings({
      skills: { htmlCss: { level: 8 }, common: { a: 6, b: 8 }, dataStructures: { c: 4, d: 6 } },
      programmingTask: { codeWritingLevel: 6 },
    } as never);

    // (8 + 7 + 5 + 6) / 4 * 10 = 65
    expect(result.rating).toBe(65);
    expect(result).toMatchObject({ htmlCss: 8, common: 7, dataStructures: 5 });
  });

  it('returns a zero rating when fewer than four ratings are available', () => {
    const result = getInterviewRatings({
      skills: { htmlCss: { level: 8 }, common: {}, dataStructures: {} },
      programmingTask: { codeWritingLevel: 0 },
    } as never);

    expect(result.rating).toBe(0);
  });

  it('defaults missing skill groups to empty objects', () => {
    const result = getInterviewRatings({
      skills: { htmlCss: { level: 8 } },
      programmingTask: { codeWritingLevel: 6 },
    } as never);

    // common/dataStructures averages are NaN (empty), so fewer than 4 valid ratings -> rating 0
    expect(result.rating).toBe(0);
    expect(Number.isNaN(result.common)).toBe(true);
    expect(Number.isNaN(result.dataStructures)).toBe(true);
  });
});

describe('convertToMentorBasic', () => {
  it('maps an active mentor and filters out expelled/failed students', () => {
    const mentor = {
      id: 8,
      isExpelled: false,
      user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x', cityName: 'Berlin', countryName: 'Germany' },
      students: [
        { id: 1, isExpelled: false, isFailed: false },
        { id: 2, isExpelled: true, isFailed: false },
        { id: 3, isExpelled: false, isFailed: true },
      ],
    } as never as Mentor;

    expect(convertToMentorBasic(mentor)).toEqual({
      isActive: true,
      name: 'Mentor X',
      id: 8,
      githubId: 'mentor-x',
      students: [{ id: 1 }],
      cityName: 'Berlin',
      countryName: 'Germany',
    });
  });

  it('returns an empty students list and fallback locations when students are undefined', () => {
    const mentor = {
      id: 9,
      isExpelled: true,
      user: { firstName: 'M', lastName: 'N', githubId: 'm-n', cityName: null, countryName: null },
      students: undefined,
    } as never as Mentor;

    expect(convertToMentorBasic(mentor)).toEqual({
      isActive: false,
      name: 'M N',
      id: 9,
      githubId: 'm-n',
      students: [],
      cityName: '',
      countryName: '',
    });
  });
});

describe('createName', () => {
  it('joins and trims both names', () => {
    expect(createName({ firstName: ' John ', lastName: ' Doe ' })).toBe('John Doe');
  });

  it('uses only the first name when the last name is empty', () => {
    expect(createName({ firstName: 'John', lastName: '' })).toBe('John');
  });

  it('uses only the last name when the first name is empty', () => {
    expect(createName({ firstName: '', lastName: 'Doe' })).toBe('Doe');
  });

  it('returns an empty string when both names are empty', () => {
    expect(createName({ firstName: '', lastName: '' })).toBe('');
  });
});

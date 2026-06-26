import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { Mentor } from '@entities/mentor';
import { StageInterview } from '@entities/stageInterview';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { Student } from '@entities/student';
import { StageInterviewsService } from './stage-interviews.service';

// Fixtures mirrored from server/src/routes/course/__test__/stageInterviews.test.ts and the legacy
// StageInterviewRepository to prove business-logic equivalence
const repos = {
  stageInterview: { createQueryBuilder: vi.fn(), findOneBy: vi.fn(), update: vi.fn(), save: vi.fn() },
  stageInterviewStudent: { createQueryBuilder: vi.fn() },
  courseTask: { findOne: vi.fn(), find: vi.fn() },
  student: { createQueryBuilder: vi.fn() },
  mentor: { createQueryBuilder: vi.fn() },
};

const createGetOneQb = (result: unknown) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

// Fluent query-builder mock whose getMany resolves the given rows. Covers every chained
// method used by findMany/findByInterviewer and the private student/mentor list queries.
const createGetManyQb = (rows: unknown[]) => {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of ['innerJoin', 'leftJoin', 'leftJoinAndSelect', 'addSelect', 'where', 'andWhere', 'orderBy']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getMany = vi.fn(async () => rows);
  return qb;
};

const mentorRecord = { id: 8, user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' } };
const studentRecord = { id: 42, user: { id: 100, firstName: 'John', lastName: 'Doe', githubId: 'john-doe' } };

describe('StageInterviewsService', () => {
  let service: StageInterviewsService;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mentorRecord));
    repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(studentRecord));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StageInterviewsService,
        { provide: getRepositoryToken(StageInterview), useValue: repos.stageInterview },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: repos.stageInterviewStudent },
        { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
        { provide: getRepositoryToken(Student), useValue: repos.student },
        { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
      ],
    }).compile();
    service = module.get(StageInterviewsService);
  });

  it('creates a single pair against the active stage interview task', async () => {
    repos.courseTask.findOne.mockResolvedValue({ id: 7 });
    repos.stageInterview.save.mockResolvedValue({ id: 99 });

    const result = await service.create(5, 'john-doe', 'mentor-x');

    expect(repos.courseTask.findOne).toHaveBeenCalledWith({
      where: { courseId: 5, type: 'stage-interview', disabled: false },
    });
    expect(repos.stageInterview.save).toHaveBeenCalledWith({
      courseId: 5,
      mentorId: 8,
      studentId: 42,
      courseTaskId: 7,
    });
    expect(result).toEqual({ id: 99 });
  });

  it('returns null when task, student or interviewer is missing', async () => {
    repos.courseTask.findOne.mockResolvedValue(null);

    const result = await service.create(5, 'john-doe', 'mentor-x');

    expect(result).toBeNull();
    expect(repos.stageInterview.save).not.toHaveBeenCalled();
  });

  it('updates the interviewer only when interview and mentor exist', async () => {
    repos.stageInterview.findOneBy.mockResolvedValue({ id: 33, courseId: 5 });

    await service.updateInterviewer(33, 'mentor-x');

    expect(repos.stageInterview.update).toHaveBeenCalledWith(33, { mentorId: 8 });

    repos.stageInterview.update.mockReset();
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(null));
    await service.updateInterviewer(33, 'unknown');
    expect(repos.stageInterview.update).not.toHaveBeenCalled();
  });

  it('does nothing when the interview does not exist', async () => {
    repos.stageInterview.findOneBy.mockResolvedValue(null);

    await service.updateInterviewer(33, 'mentor-x');

    expect(repos.mentor.createQueryBuilder).not.toHaveBeenCalled();
    expect(repos.stageInterview.update).not.toHaveBeenCalled();
  });

  it('cancels a pair by marking it canceled', async () => {
    repos.stageInterview.update.mockResolvedValue({ affected: 1 });

    await service.cancel(33);

    expect(repos.stageInterview.update).toHaveBeenCalledWith(33, { isCanceled: true });
  });

  it('rejects automatic distribution with more than one stage interview task', async () => {
    repos.courseTask.find.mockResolvedValue([{ id: 7 }, { id: 8 }]);

    await expect(service.createAutomatically(5, false)).rejects.toThrow('More than one stage interview task');
  });

  it('returns empty result when there is no stage interview task', async () => {
    repos.courseTask.find.mockResolvedValue([]);

    expect(await service.createAutomatically(5, false)).toEqual([]);
  });

  it('distributes registered students and saves the pairs', async () => {
    repos.courseTask.find.mockResolvedValue([{ id: 7 }]);
    repos.stageInterview.save.mockResolvedValue([{ mentorId: 8, studentId: 42 }]);
    (vi.spyOn(service as never, 'getMentorsWithStudents' as never) as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    const findRegistered = (
      vi.spyOn(service as never, 'findRegisteredStudents' as never) as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    const getActive = (
      vi.spyOn(service as never, 'getActiveStudents' as never) as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    vi.spyOn(service, 'findMany').mockResolvedValue([] as never);

    await service.createAutomatically(5, false);
    expect(findRegistered).toHaveBeenCalledWith(5);
    expect(getActive).not.toHaveBeenCalled();

    await service.createAutomatically(5, true);
    expect(getActive).toHaveBeenCalledWith(5);
    expect(repos.stageInterview.save).toHaveBeenCalled();
  });

  describe('findMany', () => {
    const baseRow = {
      id: 1,
      isCompleted: false,
      isCanceled: false,
      decision: null,
      courseTask: {
        studentStartDate: '2024-01-01',
        studentEndDate: '2024-01-10',
        task: { name: 'Stage Interview' },
      },
      student: {
        id: 42,
        totalScore: 100,
        user: { cityName: 'Minsk', countryName: 'Belarus', githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
      },
      mentor: {
        id: 8,
        studentsPreference: 'city',
        user: { cityName: 'Berlin', countryName: 'Germany', githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' },
      },
    };

    it('maps a not-completed, not-canceled interview to NotCompleted status with full details', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([baseRow]));

      const [result] = await service.findMany(5);

      expect(result).toEqual({
        id: 1,
        name: 'Stage Interview',
        startDate: '2024-01-01',
        endDate: '2024-01-10',
        completed: false,
        result: null,
        status: 0, // InterviewStatus.NotCompleted
        student: {
          id: 42,
          totalScore: 100,
          cityName: 'Minsk',
          countryName: 'Belarus',
          githubId: 'john-doe',
          name: 'John Doe',
        },
        interviewer: {
          id: 8,
          cityName: 'Berlin',
          countryName: 'Germany',
          githubId: 'mentor-x',
          name: 'Mentor X',
          preference: 'city',
        },
      });
    });

    it('maps a completed interview to Completed status', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([{ ...baseRow, isCompleted: true }]));

      const [result] = await service.findMany(5);

      expect(result.completed).toBe(true);
      expect(result.status).toBe(1); // InterviewStatus.Completed
    });

    it('maps a canceled (not completed) interview to Canceled status', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(
        createGetManyQb([{ ...baseRow, isCompleted: false, isCanceled: true }]),
      );

      const [result] = await service.findMany(5);

      expect(result.status).toBe(2); // InterviewStatus.Canceled
    });

    it('falls back to undefined city/country and "any" preference when fields are null', async () => {
      const row = {
        ...baseRow,
        student: { ...baseRow.student, user: { ...baseRow.student.user, cityName: null, countryName: null } },
        mentor: {
          ...baseRow.mentor,
          studentsPreference: null,
          user: { ...baseRow.mentor.user, cityName: null, countryName: null },
        },
      };
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([row]));

      const [result] = await service.findMany(5);

      expect(result.student.cityName).toBeUndefined();
      expect(result.student.countryName).toBeUndefined();
      expect(result.interviewer.cityName).toBeUndefined();
      expect(result.interviewer.countryName).toBeUndefined();
      expect(result.interviewer.preference).toBe('any');
    });

    it('returns an empty array when there are no interviews', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([]));

      expect(await service.findMany(5)).toEqual([]);
    });

    it('builds the name from only the present name parts (firstName missing / lastName missing)', async () => {
      const onlyLast = {
        ...baseRow,
        id: 2,
        student: { ...baseRow.student, user: { ...baseRow.student.user, firstName: null } },
        mentor: { ...baseRow.mentor, user: { ...baseRow.mentor.user, lastName: null } },
      };
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([onlyLast]));

      const [result] = await service.findMany(5);

      expect(result.student.name).toBe('Doe'); // firstName null -> only lastName
      expect(result.interviewer.name).toBe('Mentor'); // lastName null -> only firstName
    });
  });

  describe('findByInterviewer', () => {
    const baseRow = {
      id: 3,
      isCompleted: false,
      isCanceled: false,
      decision: null,
      courseTask: {
        studentStartDate: '2024-02-01',
        studentEndDate: '2024-02-10',
        task: { name: 'Stage Interview', descriptionUrl: 'http://task' },
      },
      student: { id: 42, user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } },
      mentor: { id: 8, user: { githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' } },
    };

    it('maps a not-completed interview with null decision to NotCompleted and null result', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([baseRow]));

      const [result] = await service.findByInterviewer(5, 'mentor-x');

      expect(result).toEqual({
        id: 3,
        name: 'Stage Interview',
        completed: false,
        status: 0, // NotCompleted
        descriptionUrl: 'http://task',
        startDate: '2024-02-01',
        endDate: '2024-02-10',
        result: null,
        interviewer: { githubId: 'mentor-x', name: 'Mentor X' },
        decision: null,
        student: { id: 42, githubId: 'john-doe', name: 'John Doe' },
      });
    });

    it('maps a completed interview with a decision to Completed status and surfaces the decision as result', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(
        createGetManyQb([{ ...baseRow, isCompleted: true, decision: 'yes' }]),
      );

      const [result] = await service.findByInterviewer(5, 'mentor-x');

      expect(result.status).toBe(1); // Completed
      expect(result.result).toBe('yes');
      expect(result.decision).toBe('yes');
    });

    it('maps a canceled interview to Canceled status', async () => {
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([{ ...baseRow, isCanceled: true }]));

      const [result] = await service.findByInterviewer(5, 'mentor-x');

      expect(result.status).toBe(2); // Canceled
    });
  });

  describe('queryMentorByGithubId', () => {
    it('returns mapped mentor when found', async () => {
      repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mentorRecord));

      expect(await service.queryMentorByGithubId(5, 'mentor-x')).toEqual({
        id: 8,
        name: 'Mentor X',
        githubId: 'mentor-x',
      });
    });

    it('returns null when not found', async () => {
      repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(null));

      expect(await service.queryMentorByGithubId(5, 'unknown')).toBeNull();
    });
  });

  describe('queryMentorById', () => {
    it('returns mapped mentor when found', async () => {
      repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mentorRecord));

      expect(await service.queryMentorById(5, 8)).toEqual({ id: 8, name: 'Mentor X', githubId: 'mentor-x' });
    });

    it('returns null when not found', async () => {
      repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(null));

      expect(await service.queryMentorById(5, 999)).toBeNull();
    });
  });

  describe('queryStudentByGithubId', () => {
    it('returns mapped student (with userId) when found', async () => {
      repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(studentRecord));

      expect(await service.queryStudentByGithubId(5, 'john-doe')).toEqual({
        id: 42,
        name: 'John Doe',
        githubId: 'john-doe',
        userId: 100,
      });
    });

    it('returns null when not found', async () => {
      repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(null));

      expect(await service.queryStudentByGithubId(5, 'unknown')).toBeNull();
    });
  });

  describe('queryStudentById', () => {
    it('returns mapped student (with userId) when found', async () => {
      repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(studentRecord));

      expect(await service.queryStudentById(5, 42)).toEqual({
        id: 42,
        name: 'John Doe',
        githubId: 'john-doe',
        userId: 100,
      });
    });

    it('returns null when not found', async () => {
      repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(null));

      expect(await service.queryStudentById(5, 999)).toBeNull();
    });
  });

  describe('createAutomatically (private collaborators exercised end-to-end)', () => {
    // Drives the real getMentorsWithStudents / findRegisteredStudents / getActiveStudents /
    // findMany query builders (no spies) so their mapping branches are covered.
    const mentorListRow = {
      id: 8,
      isExpelled: false,
      maxStudentsLimit: 4,
      studentsPreference: 'any',
      students: [{ id: 42 }],
      user: { firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x', cityName: 'Berlin', countryName: 'Germany' },
    };

    it('maps mentors-with-students and registered students, then saves the distribution (noRegistration=false)', async () => {
      repos.courseTask.find.mockResolvedValue([{ id: 7 }]);
      // getMentorsWithStudents
      repos.mentor.createQueryBuilder.mockReturnValue(createGetManyQb([mentorListRow]));
      // findRegisteredStudents: one with mentorId (truthy branch), one without (null branch),
      // and null city/country so the 'Other' fallback is exercised.
      repos.stageInterviewStudent.createQueryBuilder.mockReturnValue(
        createGetManyQb([
          {
            student: {
              id: 42,
              totalScore: 50,
              mentorId: 8,
              user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe', cityName: null, countryName: null },
            },
          },
          {
            student: {
              id: 43,
              totalScore: 40,
              mentorId: null,
              user: {
                firstName: 'Jane',
                lastName: 'Roe',
                githubId: 'jane-roe',
                cityName: 'Lviv',
                countryName: 'Ukraine',
              },
            },
          },
        ]),
      );
      // findMany (existing interviews) - none
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([]));
      repos.stageInterview.save.mockResolvedValue([{ id: 1 }]);

      const result = await service.createAutomatically(5, false);

      expect(repos.stageInterviewStudent.createQueryBuilder).toHaveBeenCalled();
      expect(repos.stageInterview.save).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });

    it('maps active students (noRegistration=true) including mentor relation and Other fallbacks', async () => {
      repos.courseTask.find.mockResolvedValue([{ id: 7 }]);
      // getMentorsWithStudents: a mentor with null students -> students defaults to [];
      // null city/country exercises the '' fallbacks.
      repos.mentor.createQueryBuilder.mockReturnValue(
        createGetManyQb([
          {
            ...mentorListRow,
            students: null,
            studentsPreference: null,
            user: { ...mentorListRow.user, cityName: null, countryName: null },
          },
        ]),
      );
      // getActiveStudents: one with a mentor, one without; null city/country -> 'Other'
      repos.student.createQueryBuilder.mockReturnValue(
        createGetManyQb([
          {
            id: 42,
            totalScore: 80,
            mentor: { id: 8 },
            user: { firstName: 'John', lastName: 'Doe', githubId: 'john-doe', cityName: null, countryName: null },
          },
          {
            id: 43,
            totalScore: 70,
            mentor: null,
            user: {
              firstName: 'Jane',
              lastName: 'Roe',
              githubId: 'jane-roe',
              cityName: 'Lviv',
              countryName: 'Ukraine',
            },
          },
        ]),
      );
      repos.stageInterview.createQueryBuilder.mockReturnValue(createGetManyQb([]));
      repos.stageInterview.save.mockResolvedValue([]);

      const result = await service.createAutomatically(5, true);

      expect(repos.student.createQueryBuilder).toHaveBeenCalled();
      expect(repos.stageInterview.save).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

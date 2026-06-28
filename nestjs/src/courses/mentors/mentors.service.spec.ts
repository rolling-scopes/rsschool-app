import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { addWeeks } from 'date-fns';
import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { TaskSolution } from '@entities/taskSolution';
import { TaskChecker } from '@entities/index';
import { Checker } from '@entities/courseTask';
import { PreferredStudentsLocation } from '@entities/mentorRegistry';
import { MentorsService } from './mentors.service';
import { SolutionItemStatus } from './dto/mentor-dashboard.dto';

// Fluent query-builder mock: every chainable method returns the builder, and the
// terminal method (getMany / getRawMany / getOneOrFail) resolves the given rows.
function createQueryBuilderMock(terminal: { method: string; value: unknown }) {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of [
    'leftJoin',
    'leftJoinAndSelect',
    'innerJoin',
    'innerJoinAndSelect',
    'select',
    'addSelect',
    'where',
    'andWhere',
    'orWhere',
    'orderBy',
  ]) {
    qb[m] = vi.fn(() => qb);
  }
  qb[terminal.method] = vi.fn(async () => terminal.value);
  return qb;
}

// A fully-populated mentor entity as loaded with the user/students/stageInterviews relations.
const mockMentor = {
  id: 7,
  isExpelled: false,
  maxStudentsLimit: 5,
  studentsPreference: PreferredStudentsLocation.CITY,
  user: {
    githubId: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    cityName: 'Minsk',
    countryName: 'Belarus',
  },
  students: [
    { id: 1, isExpelled: false, isFailed: false },
    { id: 2, isExpelled: true, isFailed: false },
    { id: 3, isExpelled: false, isFailed: true },
  ],
  stageInterviews: [{ id: 10 }, { id: 11 }],
} as Partial<Mentor> as Mentor;

describe('MentorsService', () => {
  let service: MentorsService;
  let mentorsRepository: Mocked<Repository<Mentor>>;
  let studentRepository: Mocked<Repository<Student>>;
  let taskSolutionRepository: Mocked<Repository<TaskSolution>>;
  let taskCheckerRepository: Mocked<Repository<TaskChecker>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorsService,
        {
          provide: getRepositoryToken(Mentor),
          useValue: { findOne: vi.fn(), createQueryBuilder: vi.fn() },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: { count: vi.fn(), createQueryBuilder: vi.fn() },
        },
        {
          provide: getRepositoryToken(TaskSolution),
          useValue: { createQueryBuilder: vi.fn() },
        },
        {
          provide: getRepositoryToken(TaskChecker),
          useValue: { insert: vi.fn() },
        },
      ],
    }).compile();

    service = module.get(MentorsService);
    mentorsRepository = module.get(getRepositoryToken(Mentor));
    studentRepository = module.get(getRepositoryToken(Student));
    taskSolutionRepository = module.get(getRepositoryToken(TaskSolution));
    taskCheckerRepository = module.get(getRepositoryToken(TaskChecker));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertMentorToMentorBasic', () => {
    it('maps user + active students (excludes expelled and failed)', () => {
      const result = MentorsService.convertMentorToMentorBasic(mockMentor);

      expect(result).toEqual({
        id: 7,
        name: 'John Doe',
        githubId: 'john-doe',
        cityName: 'Minsk',
        countryName: 'Belarus',
        isActive: true,
        students: [{ id: 1 }],
      });
    });

    it('marks expelled mentor as inactive', () => {
      const result = MentorsService.convertMentorToMentorBasic({
        ...mockMentor,
        isExpelled: true,
      } as Mentor);

      expect(result.isActive).toBe(false);
    });

    it('falls back to empty strings/array for null user fields and missing students', () => {
      const result = MentorsService.convertMentorToMentorBasic({
        id: 8,
        isExpelled: false,
        user: { githubId: 'no-name', firstName: null, lastName: null, cityName: null, countryName: null },
      } as Partial<Mentor> as Mentor);

      expect(result).toMatchObject({
        name: '(Empty)',
        cityName: '',
        countryName: '',
        students: [],
      });
    });
  });

  describe('convertMentorToMentorDetails', () => {
    it('extends basic with details and keeps all students (not filtered)', () => {
      const result = MentorsService.convertMentorToMentorDetails(mockMentor);

      expect(result).toMatchObject({
        id: 7,
        maxStudentsLimit: 5,
        studentsPreference: PreferredStudentsLocation.CITY,
        cityName: 'Minsk',
        countryName: 'Belarus',
        studentsCount: 3,
        screenings: { total: 2 },
      });
      // details keeps the raw students array (all three), unlike the basic projection
      expect(result.students).toHaveLength(3);
    });

    it('defaults studentsPreference to ANY and counts to 0 when relations are absent', () => {
      const result = MentorsService.convertMentorToMentorDetails({
        id: 9,
        isExpelled: false,
        maxStudentsLimit: 2,
        user: { githubId: 'x', firstName: 'A', lastName: 'B', cityName: null, countryName: null },
      } as Partial<Mentor> as Mentor);

      expect(result).toMatchObject({
        studentsPreference: PreferredStudentsLocation.ANY,
        studentsCount: 0,
        students: [],
        screenings: { total: 0 },
      });
    });
  });

  describe('getById', () => {
    it('finds a mentor by id', async () => {
      mentorsRepository.findOne.mockResolvedValue(mockMentor);

      const result = await service.getById(7);

      expect(mentorsRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(result).toBe(mockMentor);
    });
  });

  describe('getByUserId', () => {
    it('finds a mentor by courseId + userId', async () => {
      mentorsRepository.findOne.mockResolvedValue(mockMentor);

      const result = await service.getByUserId(5, 100);

      expect(mentorsRepository.findOne).toHaveBeenCalledWith({ where: { courseId: 5, userId: 100 } });
      expect(result).toBe(mockMentor);
    });
  });

  describe('getStudents', () => {
    it('builds the students query scoped to the mentor and joins the author feedback', async () => {
      const rows = [{ id: 1 }];
      const qb = createQueryBuilderMock({ method: 'getMany', value: rows });
      studentRepository.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.getStudents(7, 100);

      expect(studentRepository.createQueryBuilder).toHaveBeenCalledWith('student');
      expect(qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'student.feedbacks',
        'feedback',
        'feedback.auhtorId = :userId',
        { userId: 100 },
      );
      expect(qb.where).toHaveBeenCalledWith('student.mentorId = :mentorId', { mentorId: 7 });
      expect(result).toBe(rows);
    });
  });

  describe('getCourseStudentsCount', () => {
    it('counts students of the mentor in the course', async () => {
      studentRepository.count.mockResolvedValue(4);

      const result = await service.getCourseStudentsCount(7, 5);

      expect(studentRepository.count).toHaveBeenCalledWith({ where: { mentorId: 7, courseId: 5 } });
      expect(result).toBe(4);
    });
  });

  describe('getStudentsTasks', () => {
    const baseRow = {
      t_name: 'Task A',
      ct_id: 50,
      ct_maxScore: 100,
      ct_studentEndDate: '2024-01-01T00:00:00.000Z',
      tr_score: 80,
      ts_url: 'http://solution',
      t_descriptionUrl: 'http://desc',
      s_mentorId: 7,
      s_id: 1,
      u_firstName: 'Jane',
      u_lastName: 'Roe',
      u_githubId: 'jane-roe',
    };

    it('maps raw solution rows into dashboard DTOs with computed endDate (+2 weeks) and Done status', async () => {
      const qb = createQueryBuilderMock({ method: 'getRawMany', value: [baseRow] });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.getStudentsTasks(7, 5);

      // query is correctly scoped
      expect(qb.where).toHaveBeenCalledWith('s."courseId" = :courseId', { courseId: 5 });
      expect(qb.andWhere).toHaveBeenCalledWith('ct.checker = :checker', { checker: Checker.Mentor });
      expect(qb.andWhere).toHaveBeenCalledWith('s."mentorId" = :mentorId', { mentorId: 7 });
      expect(qb.orWhere).toHaveBeenCalledWith('tc."mentorId" = :mentorId', { mentorId: 7 });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        taskName: 'Task A',
        courseTaskId: 50,
        maxScore: 100,
        resultScore: 80,
        solutionUrl: 'http://solution',
        taskDescriptionUrl: 'http://desc',
        status: SolutionItemStatus.Done,
        studentName: 'Jane Roe',
        studentGithubId: 'jane-roe',
        endDate: addWeeks(new Date(baseRow.ct_studentEndDate), 2).toISOString(),
      });
    });

    it('returns InReview when the task is assigned to the mentor but unscored', async () => {
      const qb = createQueryBuilderMock({
        method: 'getRawMany',
        value: [{ ...baseRow, s_mentorId: 7, tr_score: null }],
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const [dto] = await service.getStudentsTasks(7, 5);

      expect(dto.status).toBe(SolutionItemStatus.InReview);
      expect(dto.resultScore).toBeNull();
    });

    it('returns RandomTask when no mentor is assigned and there is no score', async () => {
      const qb = createQueryBuilderMock({
        method: 'getRawMany',
        value: [{ ...baseRow, s_mentorId: null, tr_score: null }],
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const [dto] = await service.getStudentsTasks(7, 5);

      expect(dto.status).toBe(SolutionItemStatus.RandomTask);
    });

    it('treats a zero score as Done (0 is a real result, not "no score")', async () => {
      const qb = createQueryBuilderMock({
        method: 'getRawMany',
        value: [{ ...baseRow, s_mentorId: null, tr_score: 0 }],
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const [dto] = await service.getStudentsTasks(7, 5);

      expect(dto.status).toBe(SolutionItemStatus.Done);
      expect(dto.resultScore).toBe(0);
    });

    it('returns an empty list when there are no solutions', async () => {
      const qb = createQueryBuilderMock({ method: 'getRawMany', value: [] });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      const result = await service.getStudentsTasks(7, 5);

      expect(result).toEqual([]);
    });
  });

  describe('getRandomTask', () => {
    it('inserts a task checker for the random solution and returns the insert result', async () => {
      const qb = createQueryBuilderMock({
        method: 'getOneOrFail',
        value: { courseTaskId: 50, studentId: 1 },
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);
      const insertResult = { identifiers: [{ id: 99 }] };
      taskCheckerRepository.insert.mockResolvedValue(insertResult as never);

      const result = await service.getRandomTask(7, 5);

      // random-solution query is scoped to unassigned, unscored, mentor-checked tasks
      expect(qb.where).toHaveBeenCalledWith('s."courseId" = :courseId', { courseId: 5 });
      expect(qb.andWhere).toHaveBeenCalledWith('s."mentorId" IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith('tr."score" IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith('tc."id" IS NULL');
      expect(qb.andWhere).toHaveBeenCalledWith('ct.checker = :checker', { checker: Checker.Mentor });

      expect(taskCheckerRepository.insert).toHaveBeenCalledWith({
        courseTaskId: 50,
        studentId: 1,
        mentorId: 7,
      });
      expect(result).toBe(insertResult);
    });

    it('throws NotFoundException when the random solution has a falsy courseTaskId/studentId', async () => {
      const qb = createQueryBuilderMock({
        method: 'getOneOrFail',
        value: { courseTaskId: 0, studentId: 0 },
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      await expect(service.getRandomTask(7, 5)).rejects.toThrow(NotFoundException);
      expect(taskCheckerRepository.insert).not.toHaveBeenCalled();
    });

    it('propagates the getOneOrFail rejection when there is no candidate solution', async () => {
      const failure = new Error('no rows');
      const qb = createQueryBuilderMock({ method: 'getOneOrFail', value: undefined });
      qb.getOneOrFail = vi.fn(async () => {
        throw failure;
      });
      taskSolutionRepository.createQueryBuilder.mockReturnValue(qb as never);

      await expect(service.getRandomTask(7, 5)).rejects.toThrow(failure);
      expect(taskCheckerRepository.insert).not.toHaveBeenCalled();
    });
  });

  describe('getMentorOptions', () => {
    it('loads a mentor with students + their user githubId selection', async () => {
      const mentorWithOptions = { id: 7, students: [{ id: 1, user: { githubId: 'jane-roe' } }] };
      mentorsRepository.findOne.mockResolvedValue(mentorWithOptions as never);

      const result = await service.getMentorOptions(7);

      expect(mentorsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 7 },
        select: { students: { id: true, user: { githubId: true } } },
        relations: { students: { user: true } },
      });
      expect(result).toBe(mentorWithOptions);
    });
  });
});

import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Student } from '@entities/student';
import { CourseTask, Mentor, StageInterview, TaskInterviewResult, TaskResult } from '@entities/index';
import { TaskType } from '@entities/task';
import { CourseStatsService } from './course-stats.service';
import { CourseTasksService } from '../course-tasks';
import { CourseTaskDto } from '../course-tasks/dto';

// Fluent QueryBuilder mock: every chainable method returns the same builder,
// while the terminal methods (getRawOne/getRawMany) resolve the rows captured
// at construction time. This mirrors the helper used in
// score-recalculation.service.spec.ts.
function createQueryBuilderMock(terminals: { getRawOne?: unknown; getRawMany?: unknown }) {
  const qb: Record<string, unknown> = {};
  const chainable = [
    'leftJoinAndSelect',
    'leftJoin',
    'innerJoin',
    'select',
    'addSelect',
    'where',
    'andWhere',
    'groupBy',
    'orderBy',
  ];
  for (const m of chainable) {
    qb[m] = vi.fn(() => qb);
  }
  qb.getRawOne = vi.fn(async () => terminals.getRawOne);
  qb.getRawMany = vi.fn(async () => terminals.getRawMany);
  return qb;
}

// A course task entity sufficient for CourseTaskDto construction.
const mockCourseTaskEntity = {
  id: 10,
  taskId: 20,
  type: TaskType.JSTask,
  maxScore: 100,
  scoreWeight: 1,
  checker: 'auto',
  crossCheckStatus: 'initial',
  crossCheckEndDate: null,
  pairsCount: null,
  submitText: null,
  taskOwner: null,
  validations: null,
  taskSolutions: null,
  studentStartDate: null,
  studentEndDate: null,
  studentRegistrationStartDate: null,
  task: { name: 'Task name', descriptionUrl: 'http://example.com', type: TaskType.JSTask },
} as Partial<CourseTask> as CourseTask;

describe('CourseStatsService', () => {
  let service: CourseStatsService;
  let taskService: Mocked<CourseTasksService>;

  // Repository handles whose createQueryBuilder / count / findOneOrFail are
  // reconfigured per-test.
  const studentRepository = {
    createQueryBuilder: vi.fn(),
    count: vi.fn(),
  };
  const mentorRepository = {
    createQueryBuilder: vi.fn(),
  };
  const courseTaskRepository = {
    findOneOrFail: vi.fn(),
  };
  const taskResultRepository = {
    createQueryBuilder: vi.fn(),
  };
  const taskInterviewResultRepository = {
    createQueryBuilder: vi.fn(),
  };
  const stageInterviewRepository = {
    createQueryBuilder: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStatsService,
        { provide: CourseTasksService, useValue: { getAll: vi.fn() } },
        { provide: getRepositoryToken(Student), useValue: studentRepository },
        { provide: getRepositoryToken(Mentor), useValue: mentorRepository },
        { provide: getRepositoryToken(CourseTask), useValue: courseTaskRepository },
        { provide: getRepositoryToken(TaskResult), useValue: taskResultRepository },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: taskInterviewResultRepository },
        { provide: getRepositoryToken(StageInterview), useValue: stageInterviewRepository },
      ],
    }).compile();

    service = module.get<CourseStatsService>(CourseStatsService);
    taskService = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStudents', () => {
    it('queries max score then aggregates and coerces every count to a number', async () => {
      const maxScoreQb = createQueryBuilderMock({ getRawOne: { maxScore: '50' } });
      const aggregateQb = createQueryBuilderMock({
        getRawOne: {
          total_students: '10',
          active_students: '8',
          students_with_mentor: '6',
          students_with_certificate: '4',
          eligible_for_certification: '2',
        },
      });
      studentRepository.createQueryBuilder.mockReturnValueOnce(maxScoreQb).mockReturnValueOnce(aggregateQb);

      const result = await service.getStudents(99);

      expect(maxScoreQb.where).toHaveBeenCalledWith('student.courseId = :courseId', { courseId: 99 });
      expect(aggregateQb.where).toHaveBeenCalledWith('student.courseId = :courseId', { courseId: 99 });
      // The computed maxScore (50) must be inlined into the eligibility expression.
      const eligibleSelect = (aggregateQb.addSelect as ReturnType<typeof vi.fn>).mock.calls.find(
        call => call[1] === 'eligible_for_certification',
      );
      expect(eligibleSelect?.[0]).toContain('50 * course.certificateThreshold / 100');
      expect(result).toEqual({
        totalStudents: 10,
        activeStudentsCount: 8,
        studentsWithMentorCount: 6,
        certifiedStudentsCount: 4,
        eligibleForCertificationCount: 2,
      });
    });

    it('coerces null/undefined raw counts to NaN-free zero where the value is numeric-ish', async () => {
      // maxScore null -> Number(null) === 0 -> still a valid number inlined.
      const maxScoreQb = createQueryBuilderMock({ getRawOne: { maxScore: null } });
      const aggregateQb = createQueryBuilderMock({
        getRawOne: {
          total_students: '0',
          active_students: '0',
          students_with_mentor: '0',
          students_with_certificate: '0',
          eligible_for_certification: '0',
        },
      });
      studentRepository.createQueryBuilder.mockReturnValueOnce(maxScoreQb).mockReturnValueOnce(aggregateQb);

      const result = await service.getStudents(1);

      expect(result).toEqual({
        totalStudents: 0,
        activeStudentsCount: 0,
        studentsWithMentorCount: 0,
        certifiedStudentsCount: 0,
        eligibleForCertificationCount: 0,
      });
    });
  });

  describe('getMentors', () => {
    it('aggregates mentor counts and coerces to numbers', async () => {
      const qb = createQueryBuilderMock({
        getRawOne: { total_mentors: '12', active_mentors: '9', mentors_with_email: '3' },
      });
      mentorRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getMentors(5);

      expect(qb.where).toHaveBeenCalledWith('mentor.courseId = :courseId', { courseId: 5 });
      expect(result).toEqual({
        mentorsTotalCount: 12,
        mentorsActiveCount: 9,
        epamMentorsCount: 3,
      });
    });

    it('returns zeros when there are no mentors', async () => {
      const qb = createQueryBuilderMock({
        getRawOne: { total_mentors: '0', active_mentors: '0', mentors_with_email: '0' },
      });
      mentorRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getMentors(7);

      expect(result).toEqual({ mentorsTotalCount: 0, mentorsActiveCount: 0, epamMentorsCount: 0 });
    });
  });

  describe('getStudentCounts', () => {
    it('returns both total and active counts using two count queries', async () => {
      studentRepository.count.mockResolvedValueOnce(20).mockResolvedValueOnce(15);

      const result = await service.getStudentCounts(3);

      expect(studentRepository.count).toHaveBeenNthCalledWith(1, { where: { courseId: 3 } });
      expect(studentRepository.count).toHaveBeenNthCalledWith(2, {
        where: { courseId: 3, isExpelled: false, isFailed: false },
      });
      expect(result).toEqual({ activeStudentsCount: 15, totalStudents: 20 });
    });

    it('handles zero counts', async () => {
      studentRepository.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

      const result = await service.getStudentCounts(3);

      expect(result).toEqual({ activeStudentsCount: 0, totalStudents: 0 });
    });
  });

  describe('getMentorCountries', () => {
    it('groups mentor countries (non-empty rows) and coerces counts', async () => {
      const qb = createQueryBuilderMock({
        getRawMany: [
          { countryName: 'Poland', count: '5' },
          { countryName: 'Georgia', count: '2' },
        ],
      });
      mentorRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getMentorCountries(8);

      expect(qb.where).toHaveBeenCalledWith('role.courseId = :courseId', { courseId: 8 });
      expect(qb.andWhere).toHaveBeenCalledWith('role.isExpelled = false');
      expect(result).toEqual({
        countries: [
          { countryName: 'Poland', count: 5 },
          { countryName: 'Georgia', count: 2 },
        ],
      });
    });

    it('returns an empty countries array when there are no rows', async () => {
      const qb = createQueryBuilderMock({ getRawMany: [] });
      mentorRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getMentorCountries(8);

      expect(result).toEqual({ countries: [] });
    });
  });

  describe('getStudentCountries', () => {
    it('groups student countries and coerces counts', async () => {
      const qb = createQueryBuilderMock({
        getRawMany: [{ countryName: 'Poland', count: '7' }],
      });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentCountries(8);

      expect(qb.where).toHaveBeenCalledWith('role.courseId = :courseId', { courseId: 8 });
      expect(result).toEqual({ countries: [{ countryName: 'Poland', count: 7 }] });
    });
  });

  describe('getStudentsWithCertificatesCountries', () => {
    it('groups certified-student countries with a certificate filter and coerces counts', async () => {
      const qb = createQueryBuilderMock({
        getRawMany: [
          { countryName: 'Poland', count: '4' },
          { countryName: 'Ukraine', count: '1' },
        ],
      });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentsWithCertificatesCountries(8);

      expect(qb.where).toHaveBeenCalledWith('student.courseId = :courseId', { courseId: 8 });
      expect(qb.andWhere).toHaveBeenCalledWith('certificate.publicId IS NOT NULL');
      expect(result).toEqual({
        countries: [
          { countryName: 'Poland', count: 4 },
          { countryName: 'Ukraine', count: 1 },
        ],
      });
    });

    it('returns an empty array when no certified students exist', async () => {
      const qb = createQueryBuilderMock({ getRawMany: [] });
      studentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getStudentsWithCertificatesCountries(8);

      expect(result).toEqual({ countries: [] });
    });
  });

  describe('getTaskPerformance', () => {
    it('uses the task-result repository for a regular task and coerces every bucket', async () => {
      courseTaskRepository.findOneOrFail.mockResolvedValue({
        id: 1,
        maxScore: 100,
        task: { type: TaskType.JSTask },
      });
      const qb = createQueryBuilderMock({
        getRawOne: {
          totalAchievement: '50',
          minimalAchievement: '5',
          lowAchievement: '10',
          moderateAchievement: '15',
          highAchievement: '12',
          exceptionalAchievement: '8',
          perfectScores: '3',
        },
      });
      taskResultRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskPerformance(1);

      expect(courseTaskRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['task'],
      });
      expect(taskResultRepository.createQueryBuilder).toHaveBeenCalled();
      expect(qb.where).toHaveBeenCalledWith('result.courseTaskId = :courseTaskId', { courseTaskId: 1 });
      // perfectScores select must inline the course task maxScore.
      const perfectSelect = (qb.addSelect as ReturnType<typeof vi.fn>).mock.calls.find(
        call => call[1] === 'perfectScores',
      );
      expect(perfectSelect?.[0]).toContain('result.score = 100');
      // five achievement ranges + perfectScores -> six addSelect calls.
      expect(qb.addSelect).toHaveBeenCalledTimes(6);
      expect(result).toEqual({
        totalAchievement: 50,
        minimalAchievement: 5,
        lowAchievement: 10,
        moderateAchievement: 15,
        highAchievement: 12,
        exceptionalAchievement: 8,
        perfectScores: 3,
      });
    });

    it('uses the interview-result repository for an interview task', async () => {
      courseTaskRepository.findOneOrFail.mockResolvedValue({
        id: 2,
        maxScore: 10,
        task: { type: TaskType.Interview },
      });
      const qb = createQueryBuilderMock({
        getRawOne: {
          totalAchievement: '1',
          minimalAchievement: '0',
          lowAchievement: '0',
          moderateAchievement: '0',
          highAchievement: '0',
          exceptionalAchievement: '1',
          perfectScores: '0',
        },
      });
      taskInterviewResultRepository.createQueryBuilder.mockReturnValue(qb);

      await service.getTaskPerformance(2);

      expect(taskInterviewResultRepository.createQueryBuilder).toHaveBeenCalled();
      expect(taskResultRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(stageInterviewRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('uses the stage-interview repository for a stage-interview task', async () => {
      courseTaskRepository.findOneOrFail.mockResolvedValue({
        id: 3,
        maxScore: 20,
        task: { type: TaskType.StageInterview },
      });
      const qb = createQueryBuilderMock({
        getRawOne: {
          totalAchievement: '2',
          minimalAchievement: '0',
          lowAchievement: '1',
          moderateAchievement: '0',
          highAchievement: '1',
          exceptionalAchievement: '0',
          perfectScores: '0',
        },
      });
      stageInterviewRepository.createQueryBuilder.mockReturnValue(qb);

      await service.getTaskPerformance(3);

      expect(stageInterviewRepository.createQueryBuilder).toHaveBeenCalled();
      expect(taskResultRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(taskInterviewResultRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('coerces all buckets to zero when the task has no results', async () => {
      courseTaskRepository.findOneOrFail.mockResolvedValue({
        id: 4,
        maxScore: 100,
        task: { type: TaskType.HtmlTask },
      });
      const qb = createQueryBuilderMock({
        getRawOne: {
          totalAchievement: '0',
          minimalAchievement: '0',
          lowAchievement: '0',
          moderateAchievement: '0',
          highAchievement: '0',
          exceptionalAchievement: '0',
          perfectScores: '0',
        },
      });
      taskResultRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTaskPerformance(4);

      expect(result).toEqual({
        totalAchievement: 0,
        minimalAchievement: 0,
        lowAchievement: 0,
        moderateAchievement: 0,
        highAchievement: 0,
        exceptionalAchievement: 0,
        perfectScores: 0,
      });
    });

    it('propagates the rejection when the course task is not found', async () => {
      const error = new Error('EntityNotFound');
      courseTaskRepository.findOneOrFail.mockRejectedValue(error);

      await expect(service.getTaskPerformance(999)).rejects.toThrow('EntityNotFound');
      expect(taskResultRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('getCoursesStats', () => {
    function stubAllStatQueries(options: {
      maxScore?: unknown;
      studentsAggregate?: unknown;
      mentorsAggregate?: unknown;
      studentCountries?: unknown[];
      mentorCountries?: unknown[];
    }) {
      const {
        maxScore = { maxScore: '0' },
        studentsAggregate = {
          total_students: '1',
          active_students: '1',
          students_with_mentor: '1',
          students_with_certificate: '1',
          eligible_for_certification: '1',
        },
        mentorsAggregate = { total_mentors: '1', active_mentors: '1', mentors_with_email: '1' },
        studentCountries = [{ countryName: 'Poland', count: '1' }],
        mentorCountries = [{ countryName: 'Poland', count: '1' }],
      } = options;

      // getStudents calls createQueryBuilder twice (maxScore then aggregate) and
      // getStudentCountries / getStudentsWithCertificatesCountries each once, all
      // concurrently via Promise.all. Rather than rely on call ordering, hand back
      // a builder whose getRawOne serves both the maxScore and aggregate shapes
      // (merged) and whose getRawMany serves the country rows. The certified
      // countries reuse the same getRawMany, so they mirror studentCountries.
      studentRepository.createQueryBuilder.mockImplementation(() =>
        createQueryBuilderMock({
          getRawOne: { ...(maxScore as object), ...(studentsAggregate as object) },
          getRawMany: studentCountries,
        }),
      );
      mentorRepository.createQueryBuilder.mockImplementation(() =>
        createQueryBuilderMock({
          getRawOne: mentorsAggregate,
          getRawMany: mentorCountries,
        }),
      );
    }

    it('returns empty merged structures and no course tasks when ids is empty (default arg)', async () => {
      const result = await service.getCoursesStats();

      expect(taskService.getAll).not.toHaveBeenCalled();
      expect(result).toEqual({
        studentsCountries: { countries: [] },
        studentsStats: {},
        mentorsCountries: { countries: [] },
        mentorsStats: {},
        courseTasks: [],
        studentsCertificatesCountries: { countries: [] },
      });
    });

    it('aggregates across a single course id and maps course tasks to DTOs', async () => {
      stubAllStatQueries({});
      taskService.getAll.mockResolvedValue([mockCourseTaskEntity]);

      const result = await service.getCoursesStats([1]);

      expect(taskService.getAll).toHaveBeenCalledWith(1, undefined, false);
      expect(result.studentsStats).toEqual({
        totalStudents: 1,
        activeStudentsCount: 1,
        studentsWithMentorCount: 1,
        certifiedStudentsCount: 1,
        eligibleForCertificationCount: 1,
      });
      expect(result.mentorsStats).toEqual({
        mentorsTotalCount: 1,
        mentorsActiveCount: 1,
        epamMentorsCount: 1,
      });
      expect(result.courseTasks).toHaveLength(1);
      expect(result.courseTasks[0]).toBeInstanceOf(CourseTaskDto);
      expect(result.courseTasks[0].id).toBe(10);
    });

    it('merges stats and countries across multiple course ids by summing matching keys', async () => {
      stubAllStatQueries({
        studentsAggregate: {
          total_students: '2',
          active_students: '2',
          students_with_mentor: '1',
          students_with_certificate: '1',
          eligible_for_certification: '1',
        },
        mentorsAggregate: { total_mentors: '3', active_mentors: '2', mentors_with_email: '1' },
        studentCountries: [{ countryName: 'Poland', count: '4' }],
        mentorCountries: [{ countryName: 'Poland', count: '2' }],
      });
      taskService.getAll.mockResolvedValue([]);

      const result = await service.getCoursesStats([1, 2]);

      expect(taskService.getAll).toHaveBeenCalledTimes(2);
      // Two courses summed: students aggregate keys doubled.
      expect(result.studentsStats).toEqual({
        totalStudents: 4,
        activeStudentsCount: 4,
        studentsWithMentorCount: 2,
        certifiedStudentsCount: 2,
        eligibleForCertificationCount: 2,
      });
      expect(result.mentorsStats).toEqual({
        mentorsTotalCount: 6,
        mentorsActiveCount: 4,
        epamMentorsCount: 2,
      });
      // Country counts for the same country summed across both courses.
      expect(result.studentsCountries.countries).toEqual([{ countryName: 'Poland', count: 8 }]);
      expect(result.mentorsCountries.countries).toEqual([{ countryName: 'Poland', count: 4 }]);
      expect(result.courseTasks).toEqual([]);
    });

    it('filters out country rows whose countryName is empty when merging', async () => {
      stubAllStatQueries({
        studentCountries: [
          { countryName: 'Poland', count: '3' },
          { countryName: null, count: '5' },
          { countryName: '', count: '7' },
        ],
        mentorCountries: [],
      });
      taskService.getAll.mockResolvedValue([]);

      const result = await service.getCoursesStats([1]);

      // null and '' country names are dropped by mergeCountries.
      expect(result.studentsCountries.countries).toEqual([{ countryName: 'Poland', count: 3 }]);
    });

    it('preserves a zero count through mergeCountries (|| 0 fallback)', async () => {
      stubAllStatQueries({
        studentCountries: [{ countryName: 'Poland', count: '0' }],
        mentorCountries: [],
      });
      taskService.getAll.mockResolvedValue([]);

      const result = await service.getCoursesStats([1]);

      // A single country with a zero count exercises the `count[key] || 0`
      // fallback in mergeCountries (acc[country] is never truthy, so the else
      // branch assigns 0 and the output normalizes it back to 0).
      expect(result.studentsCountries.countries).toEqual([{ countryName: 'Poland', count: 0 }]);
    });

    it('keeps zero values when merging stats (el[key] || 0 fallback, falsy accumulator branch)', async () => {
      // A single course whose aggregate mixes zero and non-zero values. Each key
      // is seen for the first time, so the falsy-accumulator (else) branch of the
      // acc[key] ternary runs, and the zero-valued keys exercise el[key] || 0.
      stubAllStatQueries({
        studentsAggregate: {
          total_students: '0',
          active_students: '0',
          students_with_mentor: '3',
          students_with_certificate: '0',
          eligible_for_certification: '1',
        },
        mentorsAggregate: { total_mentors: '0', active_mentors: '0', mentors_with_email: '0' },
        studentCountries: [],
        mentorCountries: [],
      });
      taskService.getAll.mockResolvedValue([]);

      const result = await service.getCoursesStats([1]);

      expect(result.studentsStats).toEqual({
        totalStudents: 0,
        activeStudentsCount: 0,
        studentsWithMentorCount: 3,
        certifiedStudentsCount: 0,
        eligibleForCertificationCount: 1,
      });
      expect(result.mentorsStats).toEqual({
        mentorsTotalCount: 0,
        mentorsActiveCount: 0,
        epamMentorsCount: 0,
      });
    });

    it('merges certified-student countries alongside the other merged structures', async () => {
      stubAllStatQueries({
        studentCountries: [{ countryName: 'Poland', count: '2' }],
        mentorCountries: [{ countryName: 'Poland', count: '1' }],
      });
      taskService.getAll.mockResolvedValue([]);

      const result = await service.getCoursesStats([1]);

      // getStudentsWithCertificatesCountries also reads studentRepository's
      // getRawMany, so the certificate countries mirror the student countries.
      expect(result.studentsCertificatesCountries.countries).toEqual([{ countryName: 'Poland', count: 2 }]);
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { StageInterview } from '@entities/stageInterview';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewStatus } from '@common/models';
import { TaskType } from '@entities/task';
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// A chained QueryBuilder mock: every builder method returns the builder; the
// chosen terminal (getMany/getOne/getRawMany/getRawAndEntities) resolves rows.
function createQb(terminals: Record<string, unknown>) {
  const qb: Record<string, unknown> = {};
  const chained = [
    'innerJoin',
    'innerJoinAndSelect',
    'leftJoin',
    'leftJoinAndSelect',
    'addSelect',
    'select',
    'where',
    'andWhere',
    'orWhere',
    'orderBy',
  ];
  for (const m of chained) {
    qb[m] = vi.fn(() => qb);
  }
  for (const [name, value] of Object.entries(terminals)) {
    qb[name] = vi.fn(async () => value);
  }
  return qb;
}

const repos = {
  courseTask: { find: vi.fn(), findOne: vi.fn(), createQueryBuilder: vi.fn() },
  taskInterviewStudent: { createQueryBuilder: vi.fn(), find: vi.fn(), findOne: vi.fn(), save: vi.fn() },
  taskChecker: { createQueryBuilder: vi.fn(), find: vi.fn(), delete: vi.fn(), save: vi.fn() },
  taskInterviewResult: { createQueryBuilder: vi.fn() },
  student: { createQueryBuilder: vi.fn(), findOne: vi.fn(), findOneOrFail: vi.fn() },
  stageInterviewStudent: { findOne: vi.fn(), insert: vi.fn(), findOneByOrFail: vi.fn() },
  mentor: { createQueryBuilder: vi.fn(), findOne: vi.fn() },
  stageInterview: { createQueryBuilder: vi.fn() },
};

const crossMentorService = { distribute: vi.fn() };
const userNotificationsService = { sendEventNotification: vi.fn() };

async function buildService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      InterviewsService,
      { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
      { provide: getRepositoryToken(TaskInterviewStudent), useValue: repos.taskInterviewStudent },
      { provide: getRepositoryToken(TaskChecker), useValue: repos.taskChecker },
      { provide: getRepositoryToken(TaskInterviewResult), useValue: repos.taskInterviewResult },
      { provide: getRepositoryToken(Student), useValue: repos.student },
      { provide: getRepositoryToken(StageInterviewStudent), useValue: repos.stageInterviewStudent },
      { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
      { provide: getRepositoryToken(StageInterview), useValue: repos.stageInterview },
      { provide: getRepositoryToken(User), useValue: {} },
      { provide: CrossMentorDistributionService, useValue: crossMentorService },
      { provide: UserNotificationsService, useValue: userNotificationsService },
    ],
  }).compile();
  return module.get(InterviewsService);
}

describe('InterviewsService (distribution, lookups, registration)', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    crossMentorService.distribute.mockReset();
    userNotificationsService.sendEventNotification.mockReset().mockResolvedValue(undefined);
    service = await buildService();
  });

  describe('getAll', () => {
    it('applies the default filter (interview type, not disabled)', async () => {
      repos.courseTask.find.mockResolvedValue([{ id: 1 }]);

      const result = await service.getAll(5, {});

      const arg = repos.courseTask.find.mock.calls[0][0];
      expect(arg.where).toMatchObject({ courseId: 5, disabled: false });
      // In([TaskType.Interview]) wraps the type value
      expect(arg.where.type._value).toEqual([TaskType.Interview]);
      expect(arg.relations).toEqual(['task']);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('honours explicit disabled flag and custom types', async () => {
      repos.courseTask.find.mockResolvedValue([]);

      await service.getAll(5, { disabled: true, types: [TaskType.StageInterview] });

      const arg = repos.courseTask.find.mock.calls[0][0];
      expect(arg.where.disabled).toBe(true);
      expect(arg.where.type._value).toEqual([TaskType.StageInterview]);
    });
  });

  describe('getById', () => {
    it('finds a course task by id with its task relation', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });

      const result = await service.getById(7);

      expect(repos.courseTask.findOne).toHaveBeenCalledWith({ where: { id: 7 }, relations: ['task'] });
      expect(result).toEqual({ id: 7 });
    });
  });

  describe('getInterviewRegisteredStudents', () => {
    it('maps registered students without an assigned checker', async () => {
      const records = [
        {
          createdDate: '2024-01-02',
          student: {
            id: 42,
            totalScore: 100,
            user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe', cityName: 'Minsk', countryName: 'BY' },
          },
        },
      ];
      repos.taskInterviewStudent.createQueryBuilder.mockReturnValue(createQb({ getMany: records }));

      const result = await service.getInterviewRegisteredStudents(5, 7);

      expect(result).toEqual([
        {
          id: 42,
          name: 'John Doe',
          githubId: 'john-doe',
          cityName: 'Minsk',
          countryName: 'BY',
          totalScore: 100,
          registeredDate: '2024-01-02',
        },
      ]);
    });

    it('returns an empty list when no students are registered', async () => {
      repos.taskInterviewStudent.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

      expect(await service.getInterviewRegisteredStudents(5, 7)).toEqual([]);
    });
  });

  describe('getInterviewPairs', () => {
    const rawRecord = (score: number | null) => ({
      tc_id: 1,
      tir_score: score,
      mentorUser_id: 200,
      mentorUser_githubId: 'mentor-x',
      mentorUser_firstName: 'Mentor',
      mentorUser_lastName: 'X',
      studentUser_id: 100,
      studentUser_githubId: 'john-doe',
      studentUser_firstName: 'John',
      studentUser_lastName: 'Doe',
    });

    it('marks pairs with a numeric score as completed (including a zero score)', async () => {
      repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getRawMany: [rawRecord(0)] }));

      const [pair] = await service.getInterviewPairs(7);

      expect(pair).toEqual({
        id: 1,
        result: 0,
        status: InterviewStatus.Completed,
        interviewer: { id: 200, githubId: 'mentor-x', name: 'Mentor X' },
        student: { id: 100, githubId: 'john-doe', name: 'John Doe' },
      });
    });

    it('marks pairs without a score as not completed', async () => {
      repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getRawMany: [rawRecord(null)] }));

      const [pair] = await service.getInterviewPairs(7);

      expect(pair.status).toBe(InterviewStatus.NotCompleted);
      expect(pair.result).toBeNull();
    });

    it('builds names from a single name part when the other is missing', async () => {
      const record = { ...rawRecord(5), mentorUser_lastName: null, studentUser_firstName: null };
      repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getRawMany: [record] }));

      const [pair] = await service.getInterviewPairs(7);

      expect(pair.interviewer.name).toBe('Mentor');
      expect(pair.student.name).toBe('Doe');
    });
  });

  describe('getStageInterviewAvailableStudents', () => {
    const baseStudent = (overrides: Record<string, unknown> = {}) => ({
      id: 42,
      totalScore: 50,
      user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe', cityName: 'Minsk', countryName: 'BY' },
      stageInterviews: [],
      ...overrides,
    });

    it('includes a student with no stage interviews and reflects registration date', async () => {
      const entities = [baseStudent()];
      const raw = [{ student_id: 42, sis_createdDate: '2024-03-03' }];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw } }));

      const result = await service.getStageInterviewAvailableStudents(5);

      expect(result).toEqual([
        {
          id: 42,
          totalScore: 50,
          githubId: 'john-doe',
          name: 'John Doe',
          cityName: 'Minsk',
          countryName: 'BY',
          isGoodCandidate: false,
          rating: undefined,
          maxScore: undefined,
          feedbackVersion: undefined,
          registeredDate: '2024-03-03',
        },
      ]);
    });

    it('includes a student whose stageInterviews collection is undefined', async () => {
      const entities = [{ id: 42, totalScore: 50, user: baseStudent().user, stageInterviews: undefined }];
      const raw = [{ student_id: 42, sis_createdDate: '2024-03-03' }];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw } }));

      const result = await service.getStageInterviewAvailableStudents(5);

      expect(result).toHaveLength(1);
      expect(result[0].isGoodCandidate).toBe(false);
    });

    it('includes a student whose interviews are all canceled', async () => {
      const entities = [baseStudent({ stageInterviews: [{ isCanceled: true, isCompleted: false }] })];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw: [] } }));

      const result = await service.getStageInterviewAvailableStudents(5);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(42);
    });

    it('excludes a student with an active (non-canceled, non-completed) interview', async () => {
      const entities = [baseStudent({ stageInterviews: [{ isCanceled: false, isCompleted: false, decision: 'yes' }] })];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw: [] } }));

      expect(await service.getStageInterviewAvailableStudents(5)).toEqual([]);
    });

    it('excludes a student with a completed interview that is still in draft', async () => {
      const entities = [
        baseStudent({ stageInterviews: [{ isCanceled: false, isCompleted: true, decision: 'draft' }] }),
      ];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw: [] } }));

      expect(await service.getStageInterviewAvailableStudents(5)).toEqual([]);
    });

    it('derives rating, maxScore, version and isGoodCandidate from the last completed interview', async () => {
      const entities = [
        baseStudent({
          stageInterviews: [
            {
              isCanceled: false,
              isCompleted: true,
              decision: 'no',
              isGoodCandidate: true,
              score: 88,
              courseTask: { maxScore: 100 },
              stageInterviewFeedbacks: [{ updatedDate: '2024-05-05', version: 3, json: '{}' }],
            },
          ],
        }),
      ];
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getRawAndEntities: { entities, raw: [] } }));

      const [student] = await service.getStageInterviewAvailableStudents(5);

      expect(student.isGoodCandidate).toBe(true);
      expect(student.rating).toBe(88);
      expect(student.maxScore).toBe(100);
      expect(student.feedbackVersion).toBe(3);
    });
  });

  // NOTE: getLastStageInterview destructures `[lastInterview]` from the sorted, flattened
  // feedback list, so it returns the single newest feedback object (or `undefined` when empty),
  // not an array.
  describe('getLastStageInterview (static)', () => {
    it('returns undefined when no interviews are completed', () => {
      const result = InterviewsService.getLastStageInterview([
        { isCompleted: false, stageInterviewFeedbacks: [] } as never,
      ]);
      expect(result).toBeUndefined();
    });

    it('uses the entity score when present and returns the newest feedback after sorting by date', () => {
      const interviews = [
        {
          isCompleted: true,
          score: 70,
          courseTask: { maxScore: 100 },
          stageInterviewFeedbacks: [
            { updatedDate: '2024-01-01', version: 1, json: '{}' },
            { updatedDate: '2024-06-06', version: 2, json: '{}' },
          ],
        },
      ] as never;

      const result = InterviewsService.getLastStageInterview(interviews);

      // newest feedback wins; score short-circuits so getInterviewRatings is never invoked
      expect(result).toMatchObject({ date: '2024-06-06', rating: 70, version: 2, maxScore: 100 });
    });

    it('falls back to a computed rating from the resume score when the entity score is missing', () => {
      const json = JSON.stringify({
        resume: { score: 55 },
        skills: { htmlCss: { level: 5 }, common: {}, dataStructures: {} },
        programmingTask: {},
      });
      const interviews = [
        {
          isCompleted: true,
          score: null,
          courseTask: { maxScore: 100 },
          stageInterviewFeedbacks: [{ updatedDate: '2024-02-02', version: 4, json }],
        },
      ] as never;

      const last = InterviewsService.getLastStageInterview(interviews);

      expect(last?.rating).toBe(55);
    });

    it('computes a rating from the four skill levels when no resume score is present', () => {
      const json = JSON.stringify({
        skills: {
          htmlCss: { level: 5 },
          common: { a: 4, b: 4 },
          dataStructures: { x: 3, y: 3 },
        },
        programmingTask: { codeWritingLevel: 4 },
      });
      const interviews = [
        {
          isCompleted: true,
          score: null,
          courseTask: { maxScore: 50 },
          stageInterviewFeedbacks: [{ updatedDate: '2024-02-02', version: 1, json }],
        },
      ] as never;

      const last = InterviewsService.getLastStageInterview(interviews);

      // (5 + 4 + 3 + 4) / 4 * 10 = 40
      expect(last?.rating).toBe(40);
    });

    it('yields a zero rating when fewer than four skill ratings are available', () => {
      const json = JSON.stringify({
        skills: { htmlCss: { level: 5 }, common: {}, dataStructures: {} },
        programmingTask: { codeWritingLevel: null },
      });
      const interviews = [
        {
          isCompleted: true,
          score: null,
          courseTask: { maxScore: 50 },
          stageInterviewFeedbacks: [{ updatedDate: '2024-02-02', version: 1, json }],
        },
      ] as never;

      const last = InterviewsService.getLastStageInterview(interviews);

      expect(last?.rating).toBe(0);
    });

    // LATENT BUG: getInterviewRatings reads `skills?.htmlCss.level`, which only guards `skills`
    // being nullish, not `htmlCss`. A completed feedback whose json has no `skills.htmlCss`
    // throws while computing the rating (it is evaluated before the resume-score early return).
    it('throws when skills.htmlCss is absent and the entity score is missing (latent bug)', () => {
      const json = JSON.stringify({ resume: { score: 55 }, skills: {}, programmingTask: {} });
      const interviews = [
        {
          isCompleted: true,
          score: null,
          courseTask: { maxScore: 100 },
          stageInterviewFeedbacks: [{ updatedDate: '2024-02-02', version: 4, json }],
        },
      ] as never;

      expect(() => InterviewsService.getLastStageInterview(interviews)).toThrow(TypeError);
    });
  });

  describe('registerStudentToStageInterview', () => {
    it('inserts a new registration and returns the persisted record', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: false });
      repos.stageInterviewStudent.findOne.mockResolvedValue(null);
      repos.stageInterviewStudent.insert.mockResolvedValue({});
      repos.stageInterviewStudent.findOneByOrFail.mockResolvedValue({ id: 99 });

      const result = await service.registerStudentToStageInterview(5, 'john-doe');

      expect(repos.stageInterviewStudent.insert).toHaveBeenCalledWith({ courseId: 5, studentId: 42 });
      expect(result).toEqual({ id: 99 });
    });

    it('throws when the student is expelled', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: true });

      await expect(service.registerStudentToStageInterview(5, 'john-doe')).rejects.toThrow(BadRequestException);
      expect(repos.stageInterviewStudent.insert).not.toHaveBeenCalled();
    });

    it('throws when the student is already registered', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: false });
      repos.stageInterviewStudent.findOne.mockResolvedValue({ id: 99 });

      await expect(service.registerStudentToStageInterview(5, 'john-doe')).rejects.toThrow(
        'Student is already registered',
      );
      expect(repos.stageInterviewStudent.insert).not.toHaveBeenCalled();
    });
  });

  describe('registerStudentToInterview', () => {
    it('saves and returns a new task interview student', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: false });
      repos.taskInterviewStudent.findOne.mockResolvedValue(null);
      repos.taskInterviewStudent.save.mockResolvedValue({ id: 11, courseId: 5, studentId: 42, courseTaskId: 7 });

      const result = await service.registerStudentToInterview(5, 7, 'john-doe');

      expect(repos.taskInterviewStudent.save).toHaveBeenCalledWith({ courseId: 5, studentId: 42, courseTaskId: 7 });
      expect(result).toEqual({ id: 11, courseId: 5, studentId: 42, courseTaskId: 7 });
    });

    it('throws when the student is expelled', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: true });

      await expect(service.registerStudentToInterview(5, 7, 'john-doe')).rejects.toThrow('Student is expelled');
    });

    it('throws when the student is already registered for this interview', async () => {
      repos.student.findOneOrFail.mockResolvedValue({ id: 42, isExpelled: false });
      repos.taskInterviewStudent.findOne.mockResolvedValue({ id: 11 });

      await expect(service.registerStudentToInterview(5, 7, 'john-doe')).rejects.toThrow(
        'Student is already registered',
      );
      expect(repos.taskInterviewStudent.save).not.toHaveBeenCalled();
    });
  });

  describe('addInterviewPair', () => {
    it('returns null when the interviewer or student cannot be found', async () => {
      repos.mentor.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
      repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: { id: 42, user: { id: 100 } } }));

      const result = await service.addInterviewPair(5, 7, 'mentor-x', 'john-doe');

      expect(result).toBeNull();
    });
  });

  describe('cancelInterviewPair', () => {
    it('deletes the task checker by pair id', async () => {
      repos.taskChecker.delete.mockResolvedValue({ affected: 1 });

      const result = await service.cancelInterviewPair(99);

      expect(repos.taskChecker.delete).toHaveBeenCalledWith(99);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('isInterviewStarted', () => {
    it('returns true when the start date is in the past', async () => {
      repos.courseTask.findOne.mockResolvedValue({ studentStartDate: new Date(Date.now() - 1000) });
      expect(await service.isInterviewStarted(7)).toBe(true);
    });

    it('returns false when the start date is in the future', async () => {
      repos.courseTask.findOne.mockResolvedValue({ studentStartDate: new Date(Date.now() + 100000) });
      expect(await service.isInterviewStarted(7)).toBe(false);
    });

    it('returns false when there is no start date or no course task', async () => {
      repos.courseTask.findOne.mockResolvedValue({ studentStartDate: null });
      expect(await service.isInterviewStarted(7)).toBe(false);

      repos.courseTask.findOne.mockResolvedValue(null);
      expect(await service.isInterviewStarted(7)).toBe(false);
    });
  });

  describe('distributeInterviewPairs', () => {
    const mentors = [{ id: 8, user: { id: 200, githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' } }];

    function mockMentorsQuery(rows: unknown[]) {
      repos.mentor.createQueryBuilder.mockReturnValue(createQb({ getMany: rows }));
    }

    it('returns null when the course task does not exist', async () => {
      repos.courseTask.findOne.mockResolvedValue(null);

      const result = await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: false });

      expect(result).toBeNull();
      expect(repos.mentor.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('returns an empty array when there are no mentors', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery([]);

      const result = await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: false });

      expect(result).toEqual([]);
      expect(crossMentorService.distribute).not.toHaveBeenCalled();
    });

    it('cleans existing checkers and distributes without registration, saving pairs and notifying students', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery(mentors);
      repos.taskChecker.delete.mockResolvedValue({});
      crossMentorService.distribute.mockReturnValue({ mentors: [{ id: 8, students: [{ id: 42 }] }] });
      repos.taskChecker.save.mockResolvedValue([]);
      repos.student.findOne.mockResolvedValue({ id: 42, user: { id: 100, githubId: 'john-doe' } });
      repos.mentor.findOne.mockResolvedValue({
        id: 8,
        user: { id: 200, githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' },
      });

      const result = await service.distributeInterviewPairs(5, 7, { clean: true, registrationEnabled: false });

      expect(repos.taskChecker.delete).toHaveBeenCalledWith({ courseTaskId: 7 });
      // clean=true -> existing pairs are passed as an empty array, registeredStudentsIds undefined
      expect(crossMentorService.distribute).toHaveBeenCalledWith(mentors, [], undefined);
      expect(repos.taskChecker.save).toHaveBeenCalledWith([{ courseTaskId: 7, mentorId: 8, studentId: 42 }]);
      expect(userNotificationsService.sendEventNotification).toHaveBeenCalledWith({
        userId: 100,
        notificationId: 'interviewerAssigned',
        data: { interviewer: { id: 8, githubId: 'mentor-x', name: 'Mentor X' } },
      });
      expect(result).toEqual([{ courseTaskId: 7, mentorId: 8, studentId: 42 }]);
    });

    it('loads registered student ids and existing pairs when not cleaning with registration enabled', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery(mentors);
      repos.taskInterviewStudent.find.mockResolvedValue([{ studentId: 42 }, { studentId: 43 }]);
      repos.taskChecker.find.mockResolvedValue([{ studentId: 99, mentorId: 8 }]);
      crossMentorService.distribute.mockReturnValue({ mentors: [{ id: 8, students: [] }] });

      const result = await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: true });

      expect(repos.taskChecker.delete).not.toHaveBeenCalled();
      expect(crossMentorService.distribute).toHaveBeenCalledWith(mentors, [{ studentId: 99, mentorId: 8 }], [42, 43]);
      // no pairs produced -> nothing saved, empty result
      expect(repos.taskChecker.save).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('builds an empty interviewer name when the mentor has no first or last name', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery(mentors);
      crossMentorService.distribute.mockReturnValue({ mentors: [{ id: 8, students: [{ id: 42 }] }] });
      repos.taskChecker.save.mockResolvedValue([]);
      repos.student.findOne.mockResolvedValue({ id: 42, user: { id: 100, githubId: 'john-doe' } });
      repos.mentor.findOne.mockResolvedValue({
        id: 8,
        user: { id: 200, githubId: 'mentor-x', firstName: null, lastName: null },
      });

      await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: false });

      expect(userNotificationsService.sendEventNotification).toHaveBeenCalledWith({
        userId: 100,
        notificationId: 'interviewerAssigned',
        data: { interviewer: { id: 8, githubId: 'mentor-x', name: '' } },
      });
    });

    it('skips notification when the student or mentor cannot be loaded', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery(mentors);
      crossMentorService.distribute.mockReturnValue({ mentors: [{ id: 8, students: [{ id: 42 }] }] });
      repos.taskChecker.save.mockResolvedValue([]);
      repos.student.findOne.mockResolvedValue(null);
      repos.mentor.findOne.mockResolvedValue(null);

      await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: false });

      expect(repos.taskChecker.save).toHaveBeenCalled();
      expect(userNotificationsService.sendEventNotification).not.toHaveBeenCalled();
    });

    it('handles a mentor with no students assigned (null students)', async () => {
      repos.courseTask.findOne.mockResolvedValue({ id: 7 });
      mockMentorsQuery(mentors);
      repos.taskChecker.find.mockResolvedValue([]);
      crossMentorService.distribute.mockReturnValue({ mentors: [{ id: 8, students: null }] });

      const result = await service.distributeInterviewPairs(5, 7, { clean: false, registrationEnabled: false });

      expect(repos.taskChecker.save).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

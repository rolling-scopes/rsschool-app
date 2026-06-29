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
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// Chained QueryBuilder mock with a configurable terminal. When `where` receives a TypeORM
// `Brackets` instance, its `whereFactory` is executed against a sub-builder so the orWhere
// loop inside getRegularInterviewDetails is genuinely exercised.
function createQb(terminals: Record<string, unknown>) {
  const qb: Record<string, unknown> = {};
  const subQb: Record<string, unknown> = { orWhere: vi.fn(() => subQb) };
  for (const m of ['innerJoin', 'leftJoin', 'addSelect', 'andWhere']) {
    qb[m] = vi.fn(() => qb);
  }
  qb.where = vi.fn((arg: unknown) => {
    if (arg && typeof (arg as { whereFactory?: unknown }).whereFactory === 'function') {
      (arg as { whereFactory: (q: unknown) => void }).whereFactory(subQb);
    }
    return qb;
  });
  for (const [name, value] of Object.entries(terminals)) {
    qb[name] = vi.fn(async () => value);
  }
  return qb;
}

const repos = {
  courseTask: {},
  taskInterviewStudent: {},
  taskChecker: { createQueryBuilder: vi.fn() },
  taskInterviewResult: { createQueryBuilder: vi.fn() },
  student: { createQueryBuilder: vi.fn() },
  mentor: { createQueryBuilder: vi.fn() },
  stageInterview: { createQueryBuilder: vi.fn() },
};

async function buildService() {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      InterviewsService,
      { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
      { provide: getRepositoryToken(TaskInterviewStudent), useValue: repos.taskInterviewStudent },
      { provide: getRepositoryToken(TaskChecker), useValue: repos.taskChecker },
      { provide: getRepositoryToken(TaskInterviewResult), useValue: repos.taskInterviewResult },
      { provide: getRepositoryToken(Student), useValue: repos.student },
      { provide: getRepositoryToken(StageInterviewStudent), useValue: {} },
      { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
      { provide: getRepositoryToken(StageInterview), useValue: repos.stageInterview },
      { provide: getRepositoryToken(User), useValue: {} },
      { provide: CrossMentorDistributionService, useValue: {} },
      { provide: UserNotificationsService, useValue: {} },
    ],
  }).compile();
  return module.get(InterviewsService);
}

const regularInterview = {
  courseTaskId: 7,
  courseTask: {
    id: 7,
    studentStartDate: '2024-01-01',
    studentEndDate: '2024-01-02',
    task: { name: 'tech', descriptionUrl: 'url' },
  },
  mentor: { id: 8, user: { githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' } },
  student: { id: 42, user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } },
};

const stageInterview = {
  id: 33,
  isCompleted: true,
  isCanceled: false,
  decision: 'yes',
  courseTask: {
    studentStartDate: '2024-02-01',
    studentEndDate: '2024-02-02',
    task: { name: 'stage', descriptionUrl: 'stage-url' },
  },
  mentor: { id: 8, user: { githubId: 'mentor-x', firstName: 'Mentor', lastName: 'X' } },
  student: { id: 42, user: { githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } },
};

describe('InterviewsService.getUserInterviewDetails (real private methods)', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    [repos.taskChecker, repos.taskInterviewResult, repos.student, repos.mentor, repos.stageInterview].forEach(repo =>
      Object.values(repo).forEach(fn => fn.mockReset()),
    );
    service = await buildService();
  });

  it('returns an empty regular list when the person (student/mentor) is not found', async () => {
    repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

    const result = await service.getUserInterviewDetails(5, 'john-doe', 'student');

    expect(result).toEqual([]);
  });

  it('returns an empty regular list when the person has no task-checker interviews', async () => {
    repos.mentor.createQueryBuilder.mockReturnValue(createQb({ getOne: { id: 8 } }));
    repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

    const result = await service.getUserInterviewDetails(5, 'mentor-x', 'mentor');

    expect(result).toEqual([]);
    // task results are never queried when there are no interviews
    expect(repos.taskInterviewResult.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('maps a completed regular interview (with a result) for a student', async () => {
    repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: { id: 42 } }));
    repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getMany: [regularInterview] }));
    repos.taskInterviewResult.createQueryBuilder.mockReturnValue(
      createQb({ getMany: [{ courseTaskId: 7, studentId: 42, score: 9 }] }),
    );
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

    const result = await service.getUserInterviewDetails(5, 'john-doe', 'student');

    expect(result).toEqual([
      {
        id: 7,
        name: 'tech',
        descriptionUrl: 'url',
        startDate: '2024-01-01',
        endDate: '2024-01-02',
        completed: true,
        status: InterviewStatus.Completed,
        interviewer: { githubId: 'mentor-x', name: 'Mentor X' },
        student: { id: 42, githubId: 'john-doe', name: 'John Doe' },
        result: '9',
      },
    ]);
  });

  it('maps a not-completed regular interview (no matching result) for a mentor', async () => {
    repos.mentor.createQueryBuilder.mockReturnValue(createQb({ getOne: { id: 8 } }));
    repos.taskChecker.createQueryBuilder.mockReturnValue(createQb({ getMany: [regularInterview] }));
    repos.taskInterviewResult.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [] }));

    const result = await service.getUserInterviewDetails(5, 'mentor-x', 'mentor');

    expect(result[0]).toMatchObject({
      completed: false,
      status: InterviewStatus.NotCompleted,
      result: null,
    });
  });

  it('maps a completed stage interview ahead of regular interviews', async () => {
    repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [stageInterview] }));

    const result = await service.getUserInterviewDetails(5, 'john-doe', 'student');

    expect(result).toEqual([
      {
        id: 33,
        name: 'stage',
        completed: true,
        status: InterviewStatus.Completed,
        descriptionUrl: 'stage-url',
        startDate: '2024-02-01',
        endDate: '2024-02-02',
        result: 'yes',
        interviewer: { githubId: 'mentor-x', name: 'Mentor X' },
        decision: 'yes',
        student: { id: 42, githubId: 'john-doe', name: 'John Doe' },
      },
    ]);
  });

  it('reports a canceled stage interview status when not completed but canceled', async () => {
    const canceled = { ...stageInterview, isCompleted: false, isCanceled: true, decision: null };
    repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [canceled] }));

    const [details] = await service.getUserInterviewDetails(5, 'john-doe', 'student');

    expect(details.status).toBe(InterviewStatus.Canceled);
    expect(details.result).toBeNull();
  });

  it('builds interviewer/student names from a single present name part', async () => {
    const partial = {
      ...stageInterview,
      mentor: { id: 8, user: { githubId: 'mentor-x', firstName: 'Mentor', lastName: null } },
      student: { id: 42, user: { githubId: 'john-doe', firstName: null, lastName: 'Doe' } },
    };
    repos.student.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [partial] }));

    const [details] = await service.getUserInterviewDetails(5, 'john-doe', 'student');

    expect(details.interviewer.name).toBe('Mentor');
    expect(details.student.name).toBe('Doe');
  });

  it('reports a not-completed stage interview status when neither completed nor canceled', async () => {
    const pending = { ...stageInterview, isCompleted: false, isCanceled: false, decision: 'didNotDecideYet' };
    repos.mentor.createQueryBuilder.mockReturnValue(createQb({ getOne: null }));
    repos.stageInterview.createQueryBuilder.mockReturnValue(createQb({ getMany: [pending] }));

    const [details] = await service.getUserInterviewDetails(5, 'mentor-x', 'mentor');

    expect(details.status).toBe(InterviewStatus.NotCompleted);
  });
});

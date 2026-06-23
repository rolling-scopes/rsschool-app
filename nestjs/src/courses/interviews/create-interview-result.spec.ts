import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewsService } from './interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';

// Fixtures mirrored from server/src/routes/course/__test__/interviewResult.test.ts to prove business-logic equivalence
const mockStudent = { id: 42 };
const mockMentor = { id: 8 };
const mockCourseTask = { id: 7 };
const formAnswers = [{ questionId: '1', questionText: 'Q', answer: 'A' }];

const createGetOneQb = (result: unknown) => {
  const qb = {
    innerJoin: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

const repos = {
  courseTask: { createQueryBuilder: vi.fn() },
  taskInterviewResult: { createQueryBuilder: vi.fn(), update: vi.fn(), insert: vi.fn() },
  student: { createQueryBuilder: vi.fn() },
  mentor: { createQueryBuilder: vi.fn() },
};

describe('InterviewsService.createInterviewResult', () => {
  let service: InterviewsService;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(mockStudent));
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mockMentor));
    repos.courseTask.createQueryBuilder.mockReturnValue(createGetOneQb(mockCourseTask));
    repos.taskInterviewResult.createQueryBuilder.mockReturnValue(createGetOneQb(null));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
        { provide: getRepositoryToken(TaskInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: repos.taskInterviewResult },
        { provide: getRepositoryToken(Student), useValue: repos.student },
        { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskChecker), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();
    service = module.get(InterviewsService);
  });

  it('rejects without score, unknown student/mentor or course task', async () => {
    expect(await service.createInterviewResult(5, 7, 'john-doe', 1, {} as never)).toEqual({
      ok: false,
      message: 'no score',
    });

    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(null));
    expect(await service.createInterviewResult(5, 7, 'john-doe', 1, { score: 5 })).toEqual({
      ok: false,
      message: 'not valid student or mentor',
    });

    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mockMentor));
    repos.courseTask.createQueryBuilder.mockReturnValue(createGetOneQb(null));
    expect(await service.createInterviewResult(5, 7, 'john-doe', 1, { score: 5 })).toEqual({
      ok: false,
      message: 'not valid course task',
    });
  });

  it('updates the existing mentor interview result', async () => {
    repos.taskInterviewResult.createQueryBuilder.mockReturnValue(createGetOneQb({ id: 99 }));

    const result = await service.createInterviewResult(5, 7, 'john-doe', 1, {
      score: '8.6',
      comment: 'ok',
      formAnswers,
    });

    expect(repos.taskInterviewResult.update).toHaveBeenCalledWith(99, { formAnswers, score: 9, comment: 'ok' });
    expect(repos.taskInterviewResult.insert).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });

  it('inserts a new interview result with rounded score and defaulted comment', async () => {
    const result = await service.createInterviewResult(5, 7, 'john-doe', 1, { score: 8.2, formAnswers });

    expect(repos.taskInterviewResult.insert).toHaveBeenCalledWith({
      mentorId: 8,
      studentId: 42,
      formAnswers,
      score: 8,
      comment: '',
      courseTaskId: 7,
    });
    expect(result).toEqual({ ok: true });
  });
});

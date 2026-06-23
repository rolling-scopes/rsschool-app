import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskSolutionChecker } from '@entities/taskSolutionChecker';
import { TaskSolution } from '@entities/taskSolution';
import { TaskSolutionResult } from '@entities/taskSolutionResult';
import { CourseTask } from '@entities/courseTask';
import { Task } from '@entities/task';
import { Student } from '@entities/student';
import { User } from '@entities/user';
import { CourseCrossCheckService } from './course-cross-checks.service';

// Fixtures mirrored from server/src/services/__test__/check.service.test.ts to prove business-logic equivalence
const maxScoreRows = [
  {
    taskName: 'songbird',
    checkerGithubId: 'checker-1',
    studentGithubId: 'student-1',
    studentAverageScoreExcludeChecker: '85.5',
    checkerScore: 100,
  },
];

const badCommentRows = [
  {
    taskName: 'songbird',
    checkerGithubId: 'checker-2',
    studentGithubId: 'student-2',
    checkerScore: 50,
    comment: 'ok',
  },
];

const createQbMock = (rows: unknown[]) => {
  const qb = {
    select: vi.fn(),
    addSelect: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    orderBy: vi.fn(),
    getRawMany: vi.fn().mockResolvedValue(rows),
  };
  qb.select.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.innerJoin.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.orderBy.mockReturnValue(qb);
  return qb;
};

describe('CourseCrossCheckService checkers queries', () => {
  let service: CourseCrossCheckService;
  const mockCreateQueryBuilder = vi.fn();

  beforeEach(async () => {
    mockCreateQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseCrossCheckService,
        { provide: getRepositoryToken(TaskSolutionChecker), useValue: {} },
        { provide: getRepositoryToken(TaskSolution), useValue: {} },
        { provide: getRepositoryToken(TaskSolutionResult), useValue: { createQueryBuilder: mockCreateQueryBuilder } },
        { provide: getRepositoryToken(CourseTask), useValue: {} },
      ],
    }).compile();

    service = module.get(CourseCrossCheckService);
  });

  describe('getCheckersWithMaxScore query contract', () => {
    it('selects checkers with leave-one-out average for students checked by 3+ checkers, score outside ±10%', async () => {
      const qb = createQbMock(maxScoreRows);
      mockCreateQueryBuilder.mockReturnValue(qb);

      await service.getCheckersWithMaxScore(42);

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('ts');
      expect(qb.select).toHaveBeenCalledWith('t.name', 'taskName');
      expect(qb.addSelect).toHaveBeenCalledWith('"checkerUser"."githubId"', 'checkerGithubId');
      expect(qb.addSelect).toHaveBeenCalledWith('"studentUser"."githubId"', 'studentGithubId');
      expect(qb.addSelect).toHaveBeenCalledWith('ts.score', 'checkerScore');
      expect(qb.innerJoin).toHaveBeenCalledWith(
        expect.any(Function),
        'studentScoreSumCnt',
        'ts."studentId" = "studentScoreSumCnt"."studentId"',
      );
      expect(qb.innerJoin).toHaveBeenCalledWith(CourseTask, 'ct', 'ts."courseTaskId" = ct.id');
      expect(qb.innerJoin).toHaveBeenCalledWith(Task, 't', 'ct."taskId" = t.id');
      expect(qb.innerJoin).toHaveBeenCalledWith(Student, 'checker', 'ts."checkerId" = checker.id ');
      expect(qb.innerJoin).toHaveBeenCalledWith(User, 'checkerUser', 'checker."userId" = "checkerUser".id');
      expect(qb.innerJoin).toHaveBeenCalledWith(Student, 'student', 'ts."studentId" = student.id ');
      expect(qb.innerJoin).toHaveBeenCalledWith(User, 'studentUser', 'student."userId" = "studentUser".id');
      expect(qb.where).toHaveBeenCalledWith('ts."courseTaskId" = :taskId', { taskId: 42 });
      expect(qb.andWhere).toHaveBeenCalledWith(expect.stringContaining('"studentScoreSumCnt"."cnt" >= 3'), {
        low: 0.9,
        high: 1.1,
      });
      expect(qb.orderBy).toHaveBeenCalledWith('"checkerUser"."githubId"');
    });

    it('maps rows adding numeric studentAvgScore and a composite key', async () => {
      const qb = createQbMock(maxScoreRows);
      mockCreateQueryBuilder.mockReturnValue(qb);

      const result = await service.getCheckersWithMaxScore(42);

      expect(result).toEqual([
        {
          ...maxScoreRows[0],
          studentAvgScore: 85.5,
          key: 'checker-1.student-1.songbird',
        },
      ]);
    });
  });

  describe('getCheckersWithoutComments query contract', () => {
    it('selects checkers with short comments, non-max score, single historical score', async () => {
      const qb = createQbMock(badCommentRows);
      mockCreateQueryBuilder.mockReturnValue(qb);

      await service.getCheckersWithoutComments(42);

      expect(qb.select).toHaveBeenCalledWith('t.name', 'taskName');
      expect(qb.addSelect).toHaveBeenCalledWith('ts.score', 'checkerScore');
      expect(qb.addSelect).toHaveBeenCalledWith('ts.comment', 'comment');
      expect(qb.where).toHaveBeenCalledWith('LENGTH(ts.comment) < :length', { length: 70 });
      expect(qb.andWhere).toHaveBeenCalledWith('ts.score < ct."maxScore"');
      expect(qb.andWhere).toHaveBeenCalledWith('ts."courseTaskId" = :taskId', { taskId: 42 });
      expect(qb.andWhere).toHaveBeenCalledWith('json_array_length(ts."historicalScores") < 2');
      expect(qb.orderBy).toHaveBeenCalledWith('"checkerUser"."githubId"');
    });

    it('maps rows adding a composite key', async () => {
      const qb = createQbMock(badCommentRows);
      mockCreateQueryBuilder.mockReturnValue(qb);

      const result = await service.getCheckersWithoutComments(42);

      expect(result).toEqual([{ ...badCommentRows[0], key: 'checker-2.student-2.songbird' }]);
    });
  });
});

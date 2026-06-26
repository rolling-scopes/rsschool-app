import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseCrossCheckController } from './course-cross-checks.controller';
import { CourseCrossCheckService, OrderField, OrderDirection } from './course-cross-checks.service';
import { CourseTasksService } from '../course-tasks';
import { UserNotificationsService } from 'src/users-notifications';
import { ConfigService } from 'src/config';

// Covers the manager/admin + student-stats + csv + feedback routes that the
// per-method cross-check specs do not exercise.
const mockService = {
  runDistribution: vi.fn(),
  runCompletion: vi.fn(),
  getCheckersWithMaxScore: vi.fn(),
  getCheckersWithoutComments: vi.fn(),
  findPairs: vi.fn(),
  getAvailableCrossChecksStats: vi.fn(),
  getSolutionsUrls: vi.fn(),
  getCrossCheckSolutionReviews: vi.fn(),
  getTaskSolution: vi.fn(),
};

const mockCourseTasksService = {
  getById: vi.fn(),
  getAvailableCrossChecks: vi.fn(),
};

const buildController = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [CourseCrossCheckController],
    providers: [
      { provide: CourseCrossCheckService, useValue: mockService },
      { provide: CourseTasksService, useValue: mockCourseTasksService },
      { provide: UserNotificationsService, useValue: {} },
      { provide: ConfigService, useValue: { host: 'https://app.rs.school' } },
    ],
  }).compile();

  return module.get<CourseCrossCheckController>(CourseCrossCheckController);
};

describe('CourseCrossCheckController admin/stats/csv/feedback endpoints', () => {
  let controller: CourseCrossCheckController;

  beforeEach(async () => {
    Object.values(mockService).forEach(fn => fn.mockReset());
    Object.values(mockCourseTasksService).forEach(fn => fn.mockReset());
    controller = await buildController();
  });

  describe('createCrossCheckDistribution', () => {
    it('delegates to runDistribution with the courseTaskId and returns its result', async () => {
      const expected = { distributed: 5 };
      mockService.runDistribution.mockResolvedValue(expected);

      const result = await controller.createCrossCheckDistribution(11, 15);

      expect(mockService.runDistribution).toHaveBeenCalledWith(15);
      expect(result).toBe(expected);
    });
  });

  describe('createCrossCheckCompletion', () => {
    it('delegates to runCompletion with the courseTaskId', async () => {
      mockService.runCompletion.mockResolvedValue(undefined);

      const result = await controller.createCrossCheckCompletion(11, 15);

      expect(mockService.runCompletion).toHaveBeenCalledWith(15);
      expect(result).toBeUndefined();
    });
  });

  describe('getMaxScoreCheckers', () => {
    it('delegates to getCheckersWithMaxScore and returns its result', async () => {
      const checkers = [{ githubId: 'kate', count: 3 }];
      mockService.getCheckersWithMaxScore.mockResolvedValue(checkers);

      const result = await controller.getMaxScoreCheckers(11, 15);

      expect(mockService.getCheckersWithMaxScore).toHaveBeenCalledWith(15);
      expect(result).toBe(checkers);
    });
  });

  describe('getBadCommentCheckers', () => {
    it('delegates to getCheckersWithoutComments and returns its result', async () => {
      const checkers = [{ githubId: 'bob', count: 1 }];
      mockService.getCheckersWithoutComments.mockResolvedValue(checkers);

      const result = await controller.getBadCommentCheckers(11, 15);

      expect(mockService.getCheckersWithoutComments).toHaveBeenCalledWith(15);
      expect(result).toBe(checkers);
    });
  });

  describe('getPairs', () => {
    it('forwards pagination, filters and ordering and wraps the result in CrossCheckPairResponseDto', async () => {
      mockService.findPairs.mockResolvedValue({
        items: [],
        pagination: { current: 2, pageSize: 50, total: 0, totalPages: 0 },
      });

      const result = await controller.getPairs(
        11,
        50,
        2,
        OrderField.Checker,
        OrderDirection.Desc,
        'kate',
        'john',
        'https://x',
        'task1',
      );

      expect(mockService.findPairs).toHaveBeenCalledWith(
        11,
        { pageSize: 50, current: 2 },
        { checker: 'kate', student: 'john', url: 'https://x', task: 'task1' },
        { orderBy: OrderField.Checker, orderDirection: OrderDirection.Desc },
      );
      expect(result.items).toEqual([]);
      expect(result.pagination).toEqual({ current: 2, pageSize: 50, total: 0, totalPages: 0 });
    });

    it('maps service items into CrossCheckPairDto instances', async () => {
      mockService.findPairs.mockResolvedValue({
        items: [
          {
            id: 1,
            checker: { firstName: 'Kate', lastName: 'C', githubId: 'kate', id: 32 },
            student: { firstName: 'John', lastName: 'Doe', githubId: 'john', id: 31 },
            courseTask: { name: 'Task', id: 15 },
            url: 'https://solution',
            score: 42,
            comment: 'ok',
            submittedDate: '2026-01-01',
            reviewedDate: '2026-01-02',
            historicalScores: undefined,
            messages: undefined,
          },
        ],
        pagination: { current: 1, pageSize: 100, total: 1, totalPages: 1 },
      });

      const result = await controller.getPairs(11, 100, 1, OrderField.Student, OrderDirection.Asc, '', '', '', '');

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 1,
        score: 42,
        url: 'https://solution',
        student: { githubId: 'john' },
        checker: { githubId: 'kate' },
        task: { id: 15, name: 'Task' },
      });
    });
  });

  describe('getAvailableCrossCheckReviewStats', () => {
    const req = { user: { courses: { 11: { studentId: 77 } } } } as never;

    it('throws BadRequest when the user is not a student of the course', async () => {
      const noStudentReq = { user: { courses: {} } } as never;

      await expect(controller.getAvailableCrossCheckReviewStats(11, noStudentReq)).rejects.toThrow(BadRequestException);
      expect(mockCourseTasksService.getAvailableCrossChecks).not.toHaveBeenCalled();
    });

    it('returns an empty array without querying stats when there are no available cross-checks', async () => {
      mockCourseTasksService.getAvailableCrossChecks.mockResolvedValue([]);

      const result = await controller.getAvailableCrossCheckReviewStats(11, req);

      expect(result).toEqual([]);
      expect(mockService.getAvailableCrossChecksStats).not.toHaveBeenCalled();
    });

    it('maps the stats into AvailableReviewStatsDto instances using the resolved studentId', async () => {
      const crossChecks = [{ id: 15 }];
      mockCourseTasksService.getAvailableCrossChecks.mockResolvedValue(crossChecks);
      mockService.getAvailableCrossChecksStats.mockResolvedValue([
        { name: 'Task', id: 15, checksCount: 4, completedChecksCount: 2 },
      ]);

      const result = await controller.getAvailableCrossCheckReviewStats(11, req);

      expect(mockService.getAvailableCrossChecksStats).toHaveBeenCalledWith(crossChecks, 77);
      expect(result).toEqual([{ name: 'Task', id: 15, checksCount: 4, completedChecksCount: 2 }]);
    });
  });

  describe('getSolutionsUrls (csv)', () => {
    const createRes = () => ({ setHeader: vi.fn(), end: vi.fn() });

    it('streams the csv of solution urls with task-name filename headers', async () => {
      mockCourseTasksService.getById.mockResolvedValue({ task: { name: 'My Task' } });
      mockService.getSolutionsUrls.mockResolvedValue([{ githubId: 'john', solutionUrl: 'https://s' }]);
      const res = createRes();

      await controller.getSolutionsUrls(11, 15, res as never);

      expect(mockCourseTasksService.getById).toHaveBeenCalledWith(15);
      expect(mockService.getSolutionsUrls).toHaveBeenCalledWith(11, 15);
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith('Content-disposition', 'filename=My Task.csv');
      const csv = res.end.mock.calls[0][0] as string;
      expect(csv).toContain('"githubId","solutionUrl"');
      expect(csv).toContain('"john","https://s"');
    });
  });

  describe('getMyCrossCheckFeedbacks', () => {
    it('combines reviews and solution url into a CrossCheckFeedbackDto', async () => {
      const reviews = [{ id: 1, comment: 'good', score: 10 }];
      mockService.getCrossCheckSolutionReviews.mockResolvedValue(reviews);
      mockService.getTaskSolution.mockResolvedValue({ url: 'https://my-solution' });

      const result = await controller.getMyCrossCheckFeedbacks(77, 11, 15);

      expect(mockService.getCrossCheckSolutionReviews).toHaveBeenCalledWith(77, 15);
      expect(mockService.getTaskSolution).toHaveBeenCalledWith(77, 15);
      expect(result).toEqual({ reviews, url: 'https://my-solution' });
    });

    it('leaves the url undefined when there is no task solution', async () => {
      mockService.getCrossCheckSolutionReviews.mockResolvedValue([]);
      mockService.getTaskSolution.mockResolvedValue(null);

      const result = await controller.getMyCrossCheckFeedbacks(77, 11, 15);

      expect(result).toEqual({ reviews: [], url: undefined });
    });
  });
});

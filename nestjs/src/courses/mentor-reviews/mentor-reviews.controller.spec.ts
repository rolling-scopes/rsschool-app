import { Test, TestingModule } from '@nestjs/testing';
import { TaskSolution } from '@entities/taskSolution';
import { MentorReviewsController } from './mentor-reviews.controller';
import { MentorReviewsService } from './mentor-reviews.service';

const courseId = 7;

const mockTaskSolution = {
  id: 1,
  url: 'https://example.com/pr',
  createdDate: '2026-01-01T00:00:00.000Z',
  courseTask: { id: 11, maxScore: 100, task: { name: 'Task A', descriptionUrl: 'https://example.com/task' } },
  student: {
    id: 42,
    user: { githubId: 'jane-roe' },
    taskResults: [{ score: 80, updatedDate: '2026-01-05T00:00:00.000Z', lastChecker: { githubId: 'checker-x' } }],
    taskChecker: [],
    mentor: null,
  },
} as unknown as TaskSolution;

const mockPaginated = {
  items: [mockTaskSolution],
  meta: { itemCount: 1, total: 1, current: 1, pageSize: 10, totalPages: 1 },
};

const mockMentorReviewsService = {
  getMentorReviews: vi.fn(),
  assignReviewer: vi.fn(),
};

describe('MentorReviewsController', () => {
  let controller: MentorReviewsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MentorReviewsController],
      providers: [{ provide: MentorReviewsService, useValue: mockMentorReviewsService }],
    }).compile();

    controller = module.get(MentorReviewsController);
  });

  describe('getMentorReviews', () => {
    it('parses pagination and filters from the query, then wraps the result in a MentorReviewsDto', async () => {
      mockMentorReviewsService.getMentorReviews.mockResolvedValue(mockPaginated);
      const query = {
        current: '2',
        pageSize: '25',
        tasks: '11,12',
        student: 'jane',
        checker: 'checker-x',
        sortField: 'submittedAt',
        sortOrder: 'DESC' as const,
      };

      const result = await controller.getMentorReviews(query, courseId);

      expect(mockMentorReviewsService.getMentorReviews).toHaveBeenCalledWith(
        courseId,
        2,
        25,
        '11,12',
        'jane',
        'checker-x',
        'submittedAt',
        'DESC',
      );
      expect(result.pagination).toMatchObject({ current: 1, total: 1 });
      expect(result.content[0]).toMatchObject({ id: 1, taskName: 'Task A', student: 'jane-roe', score: 80 });
    });
  });

  describe('assignReviewer', () => {
    it('delegates to the service and returns its result', async () => {
      const dto = { courseTaskId: 11, studentId: 42, mentorId: 9 };
      mockMentorReviewsService.assignReviewer.mockResolvedValue({ affected: 1 });

      const result = await controller.assignReviewer(courseId, dto);

      expect(mockMentorReviewsService.assignReviewer).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ affected: 1 });
    });
  });
});

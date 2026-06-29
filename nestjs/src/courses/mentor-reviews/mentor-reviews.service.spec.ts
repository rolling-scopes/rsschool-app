import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskSolution } from '@entities/taskSolution';
import { Checker } from '@entities/courseTask';
import { TaskChecker } from '@entities/index';
import { MentorReviewsService } from './mentor-reviews.service';
import { paginate } from 'src/core/paginate';

vi.mock('src/core/paginate', () => ({
  paginate: vi.fn(),
}));

const courseId = 7;

// Fluent QueryBuilder stub: chainable methods return the builder; assertions are
// made against the recorded calls on each method.
function makeQb() {
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const m of [
    'innerJoin',
    'leftJoin',
    'leftJoinAndSelect',
    'where',
    'andWhere',
    'select',
    'orderBy',
    'addOrderBy',
  ]) {
    qb[m] = vi.fn(() => qb);
  }
  return qb;
}

const mockTaskSolutionRepo = {
  createQueryBuilder: vi.fn(),
};

const mockTaskCheckerRepo = {
  findOne: vi.fn(),
  delete: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
};

describe('MentorReviewsService', () => {
  let service: MentorReviewsService;
  let qb: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    qb = makeQb();
    mockTaskSolutionRepo.createQueryBuilder.mockReturnValue(qb);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentorReviewsService,
        { provide: getRepositoryToken(TaskSolution), useValue: mockTaskSolutionRepo },
        { provide: getRepositoryToken(TaskChecker), useValue: mockTaskCheckerRepo },
      ],
    }).compile();

    service = module.get(MentorReviewsService);
  });

  describe('getMentorReviews', () => {
    it('builds the base query scoped to the course and mentor-checked tasks, then paginates', async () => {
      const paginated = { items: [], meta: {} };
      vi.mocked(paginate).mockResolvedValue(paginated as never);

      const result = await service.getMentorReviews(courseId, 2, 25);

      expect(mockTaskSolutionRepo.createQueryBuilder).toHaveBeenCalledWith('taskSolution');
      expect(qb.where).toHaveBeenCalledWith('student.courseId = :courseId AND student.isExpelled = false', {
        courseId,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('courseTask.checker = :checkerType', { checkerType: Checker.Mentor });
      // always applies the stable tiebreaker order
      expect(qb.addOrderBy).toHaveBeenCalledWith('taskSolution.id', 'ASC');
      expect(paginate).toHaveBeenCalledWith(qb, { page: 2, limit: 25 });
      expect(result).toBe(paginated);
    });

    it('filters by task ids when tasks are provided', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, '11,12');

      expect(qb.andWhere).toHaveBeenCalledWith('courseTask.id IN (:...taskIds)', { taskIds: [11, 12] });
    });

    it('filters by student github id when student is provided', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, undefined, 'jane');

      expect(qb.andWhere).toHaveBeenCalledWith('studentUser.githubId ILIKE :student', { student: '%jane%' });
    });

    it('filters by checker github id (coalesced) when checker is provided', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, undefined, undefined, 'checker-x');

      expect(qb.andWhere).toHaveBeenCalledWith(
        'COALESCE(lastChecker.githubId, mentorUser.githubId, studentMentorUser.githubId) ILIKE :checker',
        { checker: '%checker-x%' },
      );
    });

    it('orders by submission date when sortField is submittedAt', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, undefined, undefined, undefined, 'submittedAt', 'DESC');

      expect(qb.orderBy).toHaveBeenCalledWith('taskSolution.createdDate', 'DESC');
    });

    it('orders by review date when sortField is reviewedAt', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, undefined, undefined, undefined, 'reviewedAt', 'ASC');

      expect(qb.orderBy).toHaveBeenCalledWith('taskResult.updatedDate', 'ASC');
    });

    it('does not apply a sort orderBy when sortOrder is missing', async () => {
      vi.mocked(paginate).mockResolvedValue({ items: [], meta: {} } as never);

      await service.getMentorReviews(courseId, 1, 10, undefined, undefined, undefined, 'submittedAt');

      expect(qb.orderBy).not.toHaveBeenCalled();
    });
  });

  describe('assignReviewer', () => {
    it('deletes the existing task-checker record when no mentor is supplied', async () => {
      mockTaskCheckerRepo.findOne.mockResolvedValue({ id: 100 });
      mockTaskCheckerRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.assignReviewer({ courseTaskId: 11, studentId: 42 } as never);

      expect(mockTaskCheckerRepo.findOne).toHaveBeenCalledWith({
        where: { studentId: 42, courseTaskId: 11 },
        select: { id: true },
      });
      expect(mockTaskCheckerRepo.delete).toHaveBeenCalledWith(100);
      expect(result).toEqual({ affected: 1 });
    });

    it('returns undefined and does nothing when no mentor and no existing record', async () => {
      mockTaskCheckerRepo.findOne.mockResolvedValue(null);

      const result = await service.assignReviewer({ courseTaskId: 11, studentId: 42 } as never);

      expect(mockTaskCheckerRepo.delete).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('updates the existing record when a mentor is supplied and a record exists', async () => {
      mockTaskCheckerRepo.findOne.mockResolvedValue({ id: 100 });
      mockTaskCheckerRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.assignReviewer({ courseTaskId: 11, studentId: 42, mentorId: 9 });

      expect(mockTaskCheckerRepo.update).toHaveBeenCalledWith(100, { courseTaskId: 11, mentorId: 9, studentId: 42 });
      expect(result).toEqual({ affected: 1 });
    });

    it('inserts a new record when a mentor is supplied and no record exists', async () => {
      mockTaskCheckerRepo.findOne.mockResolvedValue(null);
      mockTaskCheckerRepo.insert.mockResolvedValue({ identifiers: [{ id: 200 }] });

      const result = await service.assignReviewer({ courseTaskId: 11, studentId: 42, mentorId: 9 });

      expect(mockTaskCheckerRepo.insert).toHaveBeenCalledWith({ courseTaskId: 11, studentId: 42, mentorId: 9 });
      expect(result).toEqual({ identifiers: [{ id: 200 }] });
    });
  });
});

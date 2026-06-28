import type { Mocked } from 'vitest';
import { CourseTask } from '@entities/courseTask';
import { TaskSolution } from '@entities/taskSolution';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSolutionsService } from './task-solutions.service';

const courseTaskId = 11;
const studentId = 42;

const buildSolution = (data: Partial<TaskSolution> = {}): TaskSolution =>
  ({ id: 1, courseTaskId, studentId, url: 'https://example.com/pr', ...data }) as TaskSolution;

describe('TaskSolutionsService', () => {
  let service: TaskSolutionsService;
  let taskSolutionRepository: Mocked<Repository<TaskSolution>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskSolutionsService,
        { provide: getRepositoryToken(CourseTask), useValue: {} },
        {
          provide: getRepositoryToken(TaskSolution),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            findOneByOrFail: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TaskSolutionsService);
    taskSolutionRepository = module.get(getRepositoryToken(TaskSolution));
  });

  describe('saveTaskSolution', () => {
    it('updates the existing solution in place when one is already stored', async () => {
      const existing = buildSolution({ id: 7, url: 'https://example.com/old' });
      const persisted = buildSolution({ id: 7, url: 'https://example.com/new' });
      taskSolutionRepository.findOne.mockResolvedValue(existing);
      taskSolutionRepository.save.mockResolvedValue(persisted);
      taskSolutionRepository.findOneByOrFail.mockResolvedValue(persisted);

      const result = await service.saveTaskSolution(courseTaskId, studentId, { url: 'https://example.com/new' });

      expect(taskSolutionRepository.findOne).toHaveBeenCalledWith({ where: { courseTaskId, studentId } });
      // existing solution id is reused so save performs an update, not an insert
      expect(taskSolutionRepository.save).toHaveBeenCalledWith({
        id: 7,
        courseTaskId,
        studentId,
        url: 'https://example.com/new',
      });
      expect(taskSolutionRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 7 });
      expect(result).toBe(persisted);
    });

    it('inserts a new solution (id undefined) when none exists for the student/task', async () => {
      const persisted = buildSolution({ id: 99 });
      taskSolutionRepository.findOne.mockResolvedValue(null);
      taskSolutionRepository.save.mockResolvedValue(persisted);
      taskSolutionRepository.findOneByOrFail.mockResolvedValue(persisted);

      const result = await service.saveTaskSolution(courseTaskId, studentId, { url: 'https://example.com/pr' });

      expect(taskSolutionRepository.save).toHaveBeenCalledWith({
        id: undefined,
        courseTaskId,
        studentId,
        url: 'https://example.com/pr',
      });
      expect(taskSolutionRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 99 });
      expect(result).toBe(persisted);
    });

    it('treats a found solution with a falsy id as a new insert (id undefined)', async () => {
      // `solution?.id ?? undefined` only short-circuits on null/undefined, but a 0 id is falsy and
      // is passed through to save as 0 (documenting the nullish-coalescing behaviour).
      const found = buildSolution({ id: 0 });
      const persisted = buildSolution({ id: 5 });
      taskSolutionRepository.findOne.mockResolvedValue(found);
      taskSolutionRepository.save.mockResolvedValue(persisted);
      taskSolutionRepository.findOneByOrFail.mockResolvedValue(persisted);

      await service.saveTaskSolution(courseTaskId, studentId, { url: 'https://example.com/pr' });

      expect(taskSolutionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: 0, url: 'https://example.com/pr' }),
      );
    });

    it('propagates the error when the saved solution cannot be re-fetched', async () => {
      taskSolutionRepository.findOne.mockResolvedValue(null);
      taskSolutionRepository.save.mockResolvedValue(buildSolution({ id: 3 }));
      taskSolutionRepository.findOneByOrFail.mockRejectedValue(new Error('not found'));

      await expect(service.saveTaskSolution(courseTaskId, studentId, { url: 'x' })).rejects.toThrow('not found');
    });
  });
});

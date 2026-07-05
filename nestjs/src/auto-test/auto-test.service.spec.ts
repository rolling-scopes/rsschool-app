import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskType } from '@entities/task';
import { AutoTestService } from './auto-test.service';

const mockTask = { id: 1, name: 'Self education task' } as Partial<Task> as Task;

describe('AutoTestService', () => {
  let service: AutoTestService;
  let repository: Mocked<Repository<Task>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoTestService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: vi.fn(),
            findOne: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AutoTestService);
    repository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('queries self-education tasks with discipline + courses relations ordered by updatedDate DESC', async () => {
      const tasks = [mockTask];
      repository.find.mockResolvedValue(tasks);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'attributes'],
        where: {
          type: TaskType.SelfEducation,
        },
        relations: {
          discipline: true,
          courseTasks: { course: true },
        },
        order: {
          updatedDate: 'DESC',
        },
      });
      expect(result).toBe(tasks);
    });
  });

  describe('findById', () => {
    it('queries a single self-education task by id with relations', async () => {
      repository.findOne.mockResolvedValue(mockTask);

      const result = await service.findById(42);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          type: TaskType.SelfEducation,
          id: 42,
        },
        relations: {
          discipline: true,
          courseTasks: { course: true },
        },
        order: {
          updatedDate: 'DESC',
        },
      });
      expect(result).toBe(mockTask);
    });

    it('returns null when the task is not found', async () => {
      repository.findOne.mockResolvedValue(null);

      const result = await service.findById(999);

      expect(result).toBeNull();
    });
  });
});

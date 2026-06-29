import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mocked } from 'vitest';
import { Task } from '@entities/task';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

const mockTask = { id: 1, name: 'Task 1' } as Partial<Task> as Task;
const mockFindResponse = [mockTask, mockTask];
const mockSaveResponse = { id: 1 } as Task;

const mockId = 1;

describe('TasksService', () => {
  let service: TasksService;
  let repository: Mocked<Repository<Task>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            findOneByOrFail: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            softDelete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(Task));
  });

  describe('getAll', () => {
    it('should return all tasks with relations ordered by updatedDate DESC', async () => {
      repository.find.mockResolvedValue(mockFindResponse);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: {
          discipline: true,
          courseTasks: { course: true },
        },
        order: {
          updatedDate: 'DESC',
        },
      });
      expect(result).toEqual(mockFindResponse);
    });

    it('should return an empty array when there are no tasks', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return a task by id', async () => {
      repository.findOneBy.mockResolvedValue(mockTask);

      const result = await service.getById(mockId);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockId });
      expect(result).toEqual(mockTask);
    });

    it('should return null when the task is not found', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.getById(mockId);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should save the task and return the freshly fetched entity', async () => {
      const mockData = { name: 'Task 1' } as CreateTaskDto;
      repository.save.mockResolvedValue(mockSaveResponse);
      repository.findOneByOrFail.mockResolvedValue(mockTask);

      const result = await service.create(mockData);

      expect(repository.save).toHaveBeenCalledWith(mockData);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockSaveResponse.id });
      expect(result).toEqual(mockTask);
    });
  });

  describe('update', () => {
    it('should update the task and return the freshly fetched entity', async () => {
      const mockData = { name: 'Updated' } as UpdateTaskDto;
      repository.findOneByOrFail.mockResolvedValue(mockTask);

      const result = await service.update(mockId, mockData);

      expect(repository.update).toHaveBeenCalledWith(mockId, mockData);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockId });
      expect(result).toEqual(mockTask);
    });
  });

  describe('delete', () => {
    it('should soft-delete the task by id', async () => {
      await service.delete(mockId);

      expect(repository.softDelete).toHaveBeenCalledWith(mockId);
    });
  });
});

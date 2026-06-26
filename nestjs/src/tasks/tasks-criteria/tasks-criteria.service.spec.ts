import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mocked } from 'vitest';
import { CrossCheckCriteriaType, TaskCriteria } from '@entities/taskCriteria';
import { Task } from '@entities/task';
import { TasksCriteriaService } from './tasks-criteria.service';
import { CriteriaDto } from './dto/criteria.dto';

const taskId = 1;

const mockCriteria: CriteriaDto[] = [
  { type: CrossCheckCriteriaType.Title, text: 'Title', key: 'k1', index: 0 },
  { type: CrossCheckCriteriaType.Subtask, text: 'Subtask', key: 'k2', index: 1, max: 5 },
];

const mockTask = { id: taskId } as Partial<Task> as Task;

const mockTaskCriteriaEntity = {
  taskId,
  criteria: mockCriteria,
} as Partial<TaskCriteria> as TaskCriteria;

describe('TasksCriteriaService', () => {
  let service: TasksCriteriaService;
  let taskCriteriaRepository: Mocked<Repository<TaskCriteria>>;
  let taskRepository: Mocked<Repository<Task>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksCriteriaService,
        {
          provide: getRepositoryToken(TaskCriteria),
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            findOneBy: vi.fn(),
            update: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksCriteriaService>(TasksCriteriaService);
    taskCriteriaRepository = module.get(getRepositoryToken(TaskCriteria));
    taskRepository = module.get(getRepositoryToken(Task));
  });

  describe('getCriteria', () => {
    it('should return the criteria when the record exists', async () => {
      taskCriteriaRepository.findOne.mockResolvedValue(mockTaskCriteriaEntity);

      const result = await service.getCriteria(taskId);

      expect(taskCriteriaRepository.findOne).toHaveBeenCalledWith({ where: { taskId } });
      expect(result).toEqual({ criteria: mockCriteria });
    });

    it('should return undefined criteria when the record does not exist', async () => {
      taskCriteriaRepository.findOne.mockResolvedValue(null);

      const result = await service.getCriteria(taskId);

      expect(result).toEqual({ criteria: undefined });
    });
  });

  describe('createCriteria', () => {
    it('should create criteria, link them to the task and return them', async () => {
      // First getCriteria call: no existing criteria. Second: returns saved criteria.
      taskCriteriaRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockTaskCriteriaEntity);
      taskRepository.findOneBy.mockResolvedValue(mockTask);

      const result = await service.createCriteria(taskId, mockCriteria);

      expect(taskRepository.findOneBy).toHaveBeenCalledWith({ id: taskId });
      expect(taskCriteriaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ taskId, criteria: mockCriteria }),
      );
      expect(taskCriteriaRepository.save).toHaveBeenCalledWith(expect.any(TaskCriteria));
      expect(taskRepository.update).toHaveBeenCalledWith(
        { id: taskId },
        { criteria: expect.objectContaining({ taskId, criteria: mockCriteria }) },
      );
      expect(result).toEqual({ criteria: mockCriteria });
    });

    it('should throw BadRequestException when criteria already exist', async () => {
      taskCriteriaRepository.findOne.mockResolvedValue(mockTaskCriteriaEntity);

      await expect(service.createCriteria(taskId, mockCriteria)).rejects.toBeInstanceOf(BadRequestException);
      expect(taskRepository.findOneBy).not.toHaveBeenCalled();
      expect(taskCriteriaRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when the task does not exist', async () => {
      taskCriteriaRepository.findOne.mockResolvedValue(null);
      taskRepository.findOneBy.mockResolvedValue(null);

      await expect(service.createCriteria(taskId, mockCriteria)).rejects.toBeInstanceOf(NotFoundException);
      expect(taskCriteriaRepository.save).not.toHaveBeenCalled();
      expect(taskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updateCriteria', () => {
    it('should update existing criteria and return the new ones', async () => {
      const newCriteria: CriteriaDto[] = [
        { type: CrossCheckCriteriaType.Penalty, text: 'Penalty', key: 'k3', index: 0, max: -2 },
      ];
      const updatedEntity = { taskId, criteria: newCriteria } as Partial<TaskCriteria> as TaskCriteria;
      // First getCriteria: existing. Second getCriteria: updated.
      taskCriteriaRepository.findOne.mockResolvedValueOnce(mockTaskCriteriaEntity).mockResolvedValueOnce(updatedEntity);

      const result = await service.updateCriteria(taskId, { criteria: newCriteria });

      expect(taskCriteriaRepository.update).toHaveBeenCalledWith({ taskId }, { criteria: newCriteria });
      expect(result).toEqual({ criteria: newCriteria });
    });

    it('should throw NotFoundException when no criteria exist yet', async () => {
      taskCriteriaRepository.findOne.mockResolvedValue(null);

      await expect(service.updateCriteria(taskId, { criteria: mockCriteria })).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(taskCriteriaRepository.update).not.toHaveBeenCalled();
    });
  });
});

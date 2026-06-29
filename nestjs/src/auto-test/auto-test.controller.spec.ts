import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Task } from '@entities/task';
import { AutoTestController } from './auto-test.controller';
import { AutoTestService } from './auto-test.service';
import { AutoTestTaskDto } from './dto/auto-test-task.dto';
import { BasicAutoTestTaskDto } from './dto/basic-auto-test-task.dto';

const mockBasicTask = {
  id: 1,
  name: 'Self education task',
  attributes: {
    public: {
      maxAttemptsNumber: 3,
      numberOfQuestions: 10,
      strictAttemptsMode: true,
      tresholdPercentage: 70,
    },
  },
} as Partial<Task> as Task;

const mockDetailedTask = {
  id: 2,
  name: 'Detailed task',
  type: 'selfeducation',
  descriptionUrl: 'http://desc',
  description: 'desc',
  githubRepoName: 'repo',
  sourceGithubRepoUrl: 'http://repo',
  discipline: null,
  courseTasks: [],
  githubPrRequired: false,
  tags: [],
  skills: [],
  attributes: {},
  createdDate: '2024-01-01',
  updatedDate: '2024-01-02',
} as unknown as Task;

describe('AutoTestController', () => {
  let controller: AutoTestController;
  let service: Mocked<AutoTestService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutoTestController],
      providers: [
        {
          provide: AutoTestService,
          useValue: {
            getAll: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AutoTestController);
    service = module.get(AutoTestService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBasicAutoTests', () => {
    it('maps service results to BasicAutoTestTaskDto instances', async () => {
      service.getAll.mockResolvedValue([mockBasicTask]);

      const result = await controller.getBasicAutoTests();

      expect(service.getAll).toHaveBeenCalledWith();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(BasicAutoTestTaskDto);
      expect(result[0]).toMatchObject({ id: 1, name: 'Self education task', maxAttemptsNumber: 3 });
    });

    it('returns an empty array when service has no tasks', async () => {
      service.getAll.mockResolvedValue([]);

      const result = await controller.getBasicAutoTests();

      expect(result).toEqual([]);
    });
  });

  describe('getAutoTestTask', () => {
    it('returns an AutoTestTaskDto when the task exists', async () => {
      service.findById.mockResolvedValue(mockDetailedTask);

      const result = await controller.getAutoTestTask(2);

      expect(service.findById).toHaveBeenCalledWith(2);
      expect(result).toBeInstanceOf(AutoTestTaskDto);
      expect(result.id).toBe(2);
    });

    it('throws NotFoundException with the id in the message when not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.getAutoTestTask(7)).rejects.toThrow(NotFoundException);
      await expect(controller.getAutoTestTask(7)).rejects.toThrow("Couldn't find task with id = 7");
    });
  });
});

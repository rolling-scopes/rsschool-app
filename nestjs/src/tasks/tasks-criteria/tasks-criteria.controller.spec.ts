import { Test, TestingModule } from '@nestjs/testing';
import { CrossCheckCriteriaType } from '@entities/taskCriteria';
import { TasksCriteriaController } from './tasks-criteria.controller';
import { TasksCriteriaService } from './tasks-criteria.service';
import { TaskCriteriaDto } from './dto/task-criteria.dto';
import { CriteriaDto } from './dto/criteria.dto';

const taskId = 1;

const mockCriteria: CriteriaDto[] = [{ type: CrossCheckCriteriaType.Title, text: 'Title', key: 'k1', index: 0 }];

const mockTaskCriteriaDto: TaskCriteriaDto = { criteria: mockCriteria };

const mockGetCriteria = vi.fn(() => Promise.resolve(mockTaskCriteriaDto));
const mockCreateCriteria = vi.fn(() => Promise.resolve(mockTaskCriteriaDto));
const mockUpdateCriteria = vi.fn(() => Promise.resolve(mockTaskCriteriaDto));

const mockServiceFactory = vi.fn(() => ({
  getCriteria: mockGetCriteria,
  createCriteria: mockCreateCriteria,
  updateCriteria: mockUpdateCriteria,
}));

describe('TasksCriteriaController', () => {
  let controller: TasksCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksCriteriaController],
      providers: [{ provide: TasksCriteriaService, useFactory: mockServiceFactory }],
    }).compile();

    controller = module.get<TasksCriteriaController>(TasksCriteriaController);
  });

  describe('get', () => {
    it('should return the criteria for the task', async () => {
      const result = await controller.get(taskId);

      expect(mockGetCriteria).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(mockTaskCriteriaDto);
    });
  });

  describe('create', () => {
    it('should delegate the criteria array to the service', async () => {
      const result = await controller.create(taskId, mockTaskCriteriaDto);

      expect(mockCreateCriteria).toHaveBeenCalledWith(taskId, mockCriteria);
      expect(result).toEqual(mockTaskCriteriaDto);
    });
  });

  describe('update', () => {
    it('should delegate the whole dto to the service', async () => {
      const result = await controller.update(taskId, mockTaskCriteriaDto);

      expect(mockUpdateCriteria).toHaveBeenCalledWith(taskId, mockTaskCriteriaDto);
      expect(result).toEqual(mockTaskCriteriaDto);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { Task } from '@entities/task';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto';

const mockId = 1;

const mockTask = {
  id: mockId,
  name: 'Task 1',
  type: 'jstask',
  descriptionUrl: 'http://example.com',
  description: 'desc',
  githubRepoName: 'repo',
  sourceGithubRepoUrl: 'http://example.com/repo',
  discipline: null,
  courseTasks: [],
  githubPrRequired: false,
  tags: [],
  skills: [],
  attributes: {},
  createdDate: '1684609801766',
  updatedDate: '1684609810052',
} as Partial<Task> as Task;

const mockCreate = vi.fn(() => Promise.resolve(mockTask));
const mockGetAll = vi.fn(() => Promise.resolve([mockTask, mockTask]));
const mockDelete = vi.fn(() => Promise.resolve());
const mockUpdate = vi.fn(() => Promise.resolve(mockTask));

const mockTasksServiceFactory = vi.fn(() => ({
  create: mockCreate,
  getAll: mockGetAll,
  delete: mockDelete,
  update: mockUpdate,
}));

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useFactory: mockTasksServiceFactory }],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  describe('create', () => {
    it('should create a new task and wrap it in a TaskDto', async () => {
      const mockCreateTaskDto = new CreateTaskDto();

      const result = await controller.create(mockCreateTaskDto);

      expect(mockCreate).toHaveBeenCalledWith(mockCreateTaskDto);
      expect(result).toEqual(new TaskDto(mockTask));
    });
  });

  describe('getAll', () => {
    it('should get all tasks mapped to TaskDto', async () => {
      const result = await controller.getAll();

      expect(mockGetAll).toHaveBeenCalled();
      expect(result).toEqual([new TaskDto(mockTask), new TaskDto(mockTask)]);
    });
  });

  describe('delete', () => {
    it('should delete a task by id', async () => {
      await controller.delete(mockId);

      expect(mockDelete).toHaveBeenCalledWith(mockId);
    });
  });

  describe('update', () => {
    it('should update a task and wrap it in a TaskDto', async () => {
      const mockUpdateTaskDto = new UpdateTaskDto();

      const result = await controller.update(mockId, mockUpdateTaskDto);

      expect(mockUpdate).toHaveBeenCalledWith(mockId, mockUpdateTaskDto);
      expect(result).toEqual(new TaskDto(mockTask));
    });
  });
});

import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskSolutionsController } from './task-solutions.controller';
import { TaskSolutionsService } from './task-solutions.service';

const courseId = 7;
const courseTaskId = 11;
const studentId = 42;

const mockTaskSolution = { id: 1, url: 'https://example.com/pr', courseTaskId };

const mockTaskSolutionsService = {
  saveTaskSolution: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('TaskSolutionsController', () => {
  let controller: TaskSolutionsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskSolutionsController],
      providers: [{ provide: TaskSolutionsService, useValue: mockTaskSolutionsService }],
    }).compile();

    controller = module.get(TaskSolutionsController);
  });

  describe('createTaskSolution', () => {
    it('saves the solution for the session student and wraps it in a TaskSolutionDto', async () => {
      mockTaskSolutionsService.saveTaskSolution.mockResolvedValue(mockTaskSolution);
      const req = createReq({ courses: { [courseId]: { studentId } } });
      const dto = { url: 'https://example.com/pr' } as never;

      const result = await controller.createTaskSolution(req, courseId, courseTaskId, dto);

      expect(mockTaskSolutionsService.saveTaskSolution).toHaveBeenCalledWith(courseTaskId, studentId, dto);
      expect(result).toEqual({ id: 1, url: 'https://example.com/pr', courseTaskId });
    });

    it('throws BadRequestException when the user is not a student in the course', async () => {
      const req = createReq({ courses: {} });

      await expect(controller.createTaskSolution(req, courseId, courseTaskId, {} as never)).rejects.toThrow(
        new BadRequestException('You are not a student in this course'),
      );
      expect(mockTaskSolutionsService.saveTaskSolution).not.toHaveBeenCalled();
    });
  });
});

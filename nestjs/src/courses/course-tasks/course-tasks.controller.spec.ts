import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Checker, CourseTask } from '@entities/courseTask';
import { CurrentRequest } from '../../auth';
import { CourseTasksController } from './course-tasks.controller';
import { CourseTasksService, Status } from './course-tasks.service';
import { CourseTaskDetailedDto, CourseTaskDto } from './dto';

// Minimal course-task shape satisfying the CourseTaskDto / CourseTaskDetailedDto constructors.
const mockCourseTask = {
  id: 1,
  taskId: 10,
  type: 'jstask',
  checker: Checker.AutoTest,
  studentStartDate: null,
  studentEndDate: null,
  crossCheckEndDate: null,
  maxScore: 100,
  scoreWeight: 1,
  pairsCount: null,
  submitText: null,
  taskOwner: null,
  validations: null,
  taskSolutions: null,
  task: {
    name: 'Task name',
    descriptionUrl: 'http://desc',
    githubRepoName: 'repo',
    sourceGithubRepoUrl: 'http://src',
    attributes: {},
  },
} as unknown as CourseTask;

function requestWithStudent(courseId: number, studentId?: number): CurrentRequest {
  return { user: { courses: { [courseId]: studentId ? { studentId } : {} } } } as unknown as CurrentRequest;
}

describe('CourseTasksController', () => {
  let controller: CourseTasksController;
  let service: Mocked<CourseTasksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseTasksController],
      providers: [
        {
          provide: CourseTasksService,
          useValue: {
            getAll: vi.fn(),
            getAllWithStudentSolution: vi.fn(),
            createTaskDistribution: vi.fn(),
            getAllDetailed: vi.fn(),
            getById: vi.fn(),
            createCourseTask: vi.fn(),
            updateCourseTask: vi.fn(),
            disable: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CourseTasksController);
    service = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('delegates with isStudent=true when the user is a student of the course', async () => {
      service.getAll.mockResolvedValue([mockCourseTask]);
      const req = requestWithStudent(5, 50);

      const result = await controller.getAll(req, 5, Status.Started, Checker.AutoTest);

      expect(service.getAll).toHaveBeenCalledWith(5, Status.Started, true, Checker.AutoTest);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CourseTaskDto);
    });

    it('delegates with isStudent=false when the user is not a student', async () => {
      service.getAll.mockResolvedValue([]);
      const req = requestWithStudent(5);

      await controller.getAll(req, 5);

      expect(service.getAll).toHaveBeenCalledWith(5, undefined, false, undefined);
    });

    it('treats a user without any entry for the course as a non-student', async () => {
      service.getAll.mockResolvedValue([]);
      const req = { user: { courses: {} } } as unknown as CurrentRequest;

      await controller.getAll(req, 5);

      expect(service.getAll).toHaveBeenCalledWith(5, undefined, false, undefined);
    });
  });

  describe('getAllWithStudentSolution', () => {
    it('delegates for a student and maps results to DTOs', async () => {
      service.getAllWithStudentSolution.mockResolvedValue([mockCourseTask]);
      const req = requestWithStudent(5, 50);

      const result = await controller.getAllWithStudentSolution(req, 5, Status.InProgress);

      expect(service.getAllWithStudentSolution).toHaveBeenCalledWith(5, 50, Status.InProgress, true);
      expect(result[0]).toBeInstanceOf(CourseTaskDto);
    });

    it('throws BadRequestException when the user is not a student in the course', async () => {
      const req = requestWithStudent(5);

      await expect(controller.getAllWithStudentSolution(req, 5)).rejects.toThrow(BadRequestException);
      await expect(controller.getAllWithStudentSolution(req, 5)).rejects.toThrow(
        'You are not a student in this course',
      );
      expect(service.getAllWithStudentSolution).not.toHaveBeenCalled();
    });
  });

  describe('createTaskDistribution', () => {
    it('returns the distribution result on success', async () => {
      const distribution = [{ courseTaskId: 7, mentorId: 1, studentId: 11 }];
      service.createTaskDistribution.mockResolvedValue(distribution);

      const result = await controller.createTaskDistribution(5, 7, { clean: true });

      expect(service.createTaskDistribution).toHaveBeenCalledWith(5, 7, true);
      expect(result).toBe(distribution);
    });

    it('throws NotFoundException when the service returns null (task not found)', async () => {
      service.createTaskDistribution.mockResolvedValue(null);

      await expect(controller.createTaskDistribution(5, 7, { clean: false })).rejects.toThrow(NotFoundException);
      await expect(controller.createTaskDistribution(5, 7, { clean: false })).rejects.toThrow('Course task not found');
    });

    it('returns an empty object result without throwing (no active mentors)', async () => {
      service.createTaskDistribution.mockResolvedValue({});

      const result = await controller.createTaskDistribution(5, 7, { clean: undefined });

      expect(result).toEqual({});
    });
  });

  describe('getAllExtended', () => {
    it('maps detailed service results to CourseTaskDetailedDto instances', async () => {
      service.getAllDetailed.mockResolvedValue([mockCourseTask]);
      const req = {} as CurrentRequest;

      const result = await controller.getAllExtended(req, 5);

      expect(service.getAllDetailed).toHaveBeenCalledWith(5);
      expect(result[0]).toBeInstanceOf(CourseTaskDetailedDto);
    });
  });

  describe('getById', () => {
    it('delegates to the service and returns a detailed DTO', async () => {
      service.getById.mockResolvedValue(mockCourseTask);

      const result = await controller.getById(5, 1);

      expect(service.getById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(CourseTaskDetailedDto);
    });
  });

  describe('createCourseTask', () => {
    it('forwards the dto merged with the courseId from the path', async () => {
      service.createCourseTask.mockResolvedValue(undefined as never);
      const dto = { taskId: 10, checker: Checker.AutoTest, studentStartDate: 's', studentEndDate: 'e' };

      await controller.createCourseTask(5, dto as never);

      expect(service.createCourseTask).toHaveBeenCalledWith({ ...dto, courseId: 5 });
    });
  });

  describe('updateCourseTask', () => {
    it('forwards the dto merged with courseId and id', async () => {
      service.updateCourseTask.mockResolvedValue(undefined as never);
      const dto = { maxScore: 50 };

      await controller.updateCourseTask(5, 7, dto as never);

      expect(service.updateCourseTask).toHaveBeenCalledWith(7, { maxScore: 50, courseId: 5, id: 7 });
    });
  });

  describe('deleteCourseTask', () => {
    it('disables the course task', async () => {
      service.disable.mockResolvedValue(undefined as never);

      await controller.deleteCourseTask(5, 7);

      expect(service.disable).toHaveBeenCalledWith(7);
    });
  });
});

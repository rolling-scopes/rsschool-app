import { BadRequestException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { Student } from '@entities/student';
import { TaskType } from '@entities/task';
import { TaskVerification } from '@entities/taskVerification';
import { TaskVerificationsService } from './task-verifications.service';
import { CloudApiService } from 'src/cloud-api/cloud-api.service';
import { SelfEducationService } from './self-education.service';

describe('TaskVerificationsService', () => {
  let service: TaskVerificationsService;

  const taskVerificationsRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const courseTasksRepository = {
    findOneByOrFail: vi.fn(),
    findOne: vi.fn(),
  };

  const studentsRepository = {
    findOneByOrFail: vi.fn(),
  };

  const cloudService = {
    submitTask: vi.fn(),
  };

  const selfEducationService = {
    createSelfEducationVerification: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskVerificationsService,
        {
          provide: getRepositoryToken(TaskVerification),
          useValue: taskVerificationsRepository,
        },
        {
          provide: getRepositoryToken(CourseTask),
          useValue: courseTasksRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: studentsRepository,
        },
        {
          provide: CloudApiService,
          useValue: cloudService,
        },
        {
          provide: SelfEducationService,
          useValue: selfEducationService,
        },
      ],
    }).compile();

    service = module.get<TaskVerificationsService>(TaskVerificationsService);
  });

  describe('getAnswersByAttempts', () => {
    it('should throw if deadline has not passed yet', async () => {
      courseTasksRepository.findOneByOrFail.mockResolvedValueOnce({
        studentEndDate: new Date('2026-01-01T12:10:00.000Z'),
      });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.getAnswersByAttempts(1, 2)).rejects.toThrow(BadRequestException);

      vi.useRealTimers();
    });
  });

  describe('createTaskVerification', () => {
    const student = { id: 10, courseId: 20 } as Student;

    it('should throw Too Many Requests when pending verification exists', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce({ id: 77 });

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toMatchObject({
        status: HttpStatus.TOO_MANY_REQUESTS,
      });

      vi.useRealTimers();
    });

    it('should throw when task verification is expired', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T11:00:00.000Z'),
        task: { name: 'Task' },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      await expect(service.createTaskVerification(11, 10, { githubId: 'gh', body: {} })).rejects.toThrow('expired');

      vi.useRealTimers();
    });

    it('should delegate self-education tasks to self-education service', async () => {
      courseTasksRepository.findOne.mockResolvedValueOnce({
        id: 11,
        courseId: 20,
        type: TaskType.SelfEducation,
        studentStartDate: new Date('2026-01-01T08:00:00.000Z'),
        studentEndDate: new Date('2026-01-01T18:00:00.000Z'),
        task: { name: 'Task', type: TaskType.SelfEducation },
      });
      studentsRepository.findOneByOrFail.mockResolvedValueOnce(student);
      taskVerificationsRepository.findOne.mockResolvedValueOnce(null);

      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));

      const result = await service.createTaskVerification(11, 10, {
        githubId: 'gh',
        body: [{ index: 0, value: 1 }],
      });

      expect(result).toEqual({ id: undefined });
      expect(selfEducationService.createSelfEducationVerification).toHaveBeenCalledTimes(1);
      expect(taskVerificationsRepository.save).not.toHaveBeenCalled();
      expect(cloudService.submitTask).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});

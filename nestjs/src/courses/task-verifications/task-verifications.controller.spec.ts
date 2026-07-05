import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskVerificationsController } from './task-verifications.controller';
import { TaskVerificationsService } from './task-verifications.service';

const service = {
  getAnswersByAttempts: vi.fn(),
  createTaskVerification: vi.fn(),
};

describe('TaskVerificationsController', () => {
  let controller: TaskVerificationsController;

  beforeEach(async () => {
    Object.values(service).forEach(fn => fn.mockReset());
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskVerificationsController],
      providers: [{ provide: TaskVerificationsService, useValue: service }],
    }).compile();

    controller = module.get(TaskVerificationsController);
  });

  describe('getAnswers', () => {
    it('reads the studentId from the course status and delegates to getAnswersByAttempts', async () => {
      const answers = [{ courseTaskId: 15, attempt: 1 }];
      service.getAnswersByAttempts.mockResolvedValue(answers);
      const req = { user: { courses: { 11: { studentId: 99 } } } } as never;

      const result = await controller.getAnswers(req, 11, 15);

      expect(service.getAnswersByAttempts).toHaveBeenCalledWith(15, 99);
      expect(result).toBe(answers);
    });

    it('passes an undefined studentId when the user has no student record for the course', async () => {
      service.getAnswersByAttempts.mockResolvedValue([]);
      const req = { user: { courses: {} } } as never;

      await controller.getAnswers(req, 11, 15);

      expect(service.getAnswersByAttempts).toHaveBeenCalledWith(15, undefined);
    });
  });

  describe('createVerification', () => {
    const body = { answers: [{ id: 1, value: 'a' }] };

    it('creates a verification for the student passing githubId and body', async () => {
      const created = { id: 500, score: 80 };
      service.createTaskVerification.mockResolvedValue(created);
      const req = {
        user: { githubId: 'john-doe', courses: { 11: { studentId: 99, isExpelled: false } } },
      } as never;

      const result = await controller.createVerification(req, 11, 15, body);

      expect(service.createTaskVerification).toHaveBeenCalledWith(15, 99, { githubId: 'john-doe', body });
      expect(result).toBe(created);
    });

    it('throws BadRequest when the user is not a student in the course', async () => {
      const req = { user: { githubId: 'john-doe', courses: { 11: {} } } } as never;

      await expect(controller.createVerification(req, 11, 15, body)).rejects.toThrow(BadRequestException);
      expect(service.createTaskVerification).not.toHaveBeenCalled();
    });

    it('throws Forbidden when the student is expelled', async () => {
      const req = {
        user: { githubId: 'john-doe', courses: { 11: { studentId: 99, isExpelled: true } } },
      } as never;

      await expect(controller.createVerification(req, 11, 15, body)).rejects.toThrow(ForbiddenException);
      expect(service.createTaskVerification).not.toHaveBeenCalled();
    });
  });
});

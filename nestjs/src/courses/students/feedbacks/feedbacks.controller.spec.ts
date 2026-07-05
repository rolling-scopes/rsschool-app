import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentFeedback } from '@entities/student-feedback';
import { FeedbacksController } from './feedbacks.controller';
import { FeedbacksService } from './feedbacks.service';
import { StudentsService } from '../students.service';

const studentId = 42;
const feedbackId = 5;

const mockFeedback = {
  id: feedbackId,
  studentId,
  createdDate: '2026-01-01',
  updatedDate: '2026-01-02',
  content: { suggestions: 'do more' },
  recommendation: 'hire',
  author: { id: 1, firstName: 'John', lastName: 'Doe', githubId: 'john-doe' },
  mentor: null,
  englishLevel: null,
} as unknown as StudentFeedback;

const mockStudentsService = {
  canAccessStudent: vi.fn(),
};

const mockFeedbacksService = {
  createStudentFeedback: vi.fn(),
  update: vi.fn(),
  getById: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('FeedbacksController', () => {
  let controller: FeedbacksController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbacksController],
      providers: [
        { provide: StudentsService, useValue: mockStudentsService },
        { provide: FeedbacksService, useValue: mockFeedbacksService },
      ],
    }).compile();

    controller = module.get(FeedbacksController);
  });

  describe('createStudentFeedback', () => {
    it('creates the feedback using the author id and wraps it in a StudentFeedbackDto', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(true);
      mockFeedbacksService.createStudentFeedback.mockResolvedValue(mockFeedback);
      const req = createReq({ id: 1 });
      const body = { content: { suggestions: 'do more' } } as never;

      const result = await controller.createStudentFeedback(studentId, body, req);

      expect(mockStudentsService.canAccessStudent).toHaveBeenCalledWith({ id: 1 }, studentId);
      expect(mockFeedbacksService.createStudentFeedback).toHaveBeenCalledWith(studentId, body, 1);
      expect(result).toMatchObject({ id: feedbackId, recommendation: 'hire', mentor: null });
    });

    it('throws ForbiddenException and never creates when access is denied', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(false);

      await expect(controller.createStudentFeedback(studentId, {} as never, createReq({ id: 1 }))).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockFeedbacksService.createStudentFeedback).not.toHaveBeenCalled();
    });
  });

  describe('updateStudentFeedback', () => {
    it('updates the feedback by id and wraps it in a StudentFeedbackDto', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(true);
      mockFeedbacksService.update.mockResolvedValue(mockFeedback);
      const body = { content: { suggestions: 'updated' } } as never;

      const result = await controller.updateStudentFeedback(studentId, feedbackId, body, createReq({ id: 1 }));

      expect(mockFeedbacksService.update).toHaveBeenCalledWith(feedbackId, body);
      expect(result).toMatchObject({ id: feedbackId });
    });

    it('throws ForbiddenException and never updates when access is denied', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(false);

      await expect(
        controller.updateStudentFeedback(studentId, feedbackId, {} as never, createReq({ id: 1 })),
      ).rejects.toThrow(ForbiddenException);
      expect(mockFeedbacksService.update).not.toHaveBeenCalled();
    });
  });

  describe('getStudentFeedback', () => {
    it('returns the feedback wrapped in a StudentFeedbackDto when it belongs to the student', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(true);
      mockFeedbacksService.getById.mockResolvedValue(mockFeedback);

      const result = await controller.getStudentFeedback(studentId, feedbackId, createReq({ id: 1 }));

      expect(mockFeedbacksService.getById).toHaveBeenCalledWith(feedbackId);
      expect(result).toMatchObject({ id: feedbackId });
    });

    it('throws ForbiddenException when access is denied', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(false);

      await expect(controller.getStudentFeedback(studentId, feedbackId, createReq({ id: 1 }))).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockFeedbacksService.getById).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when the feedback belongs to a different student', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(true);
      mockFeedbacksService.getById.mockResolvedValue({ ...mockFeedback, studentId: 999 });

      await expect(controller.getStudentFeedback(studentId, feedbackId, createReq({ id: 1 }))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

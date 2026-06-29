import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskType } from '@entities/task';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { InterviewFeedbackService } from './interviewFeedback.service';
import { StageInterviewsService } from './stage-interviews.service';
import { CourseTasksService } from '../course-tasks';
import { UserNotificationsService } from 'src/users-notifications';

const courseId = 5;

const buildCourseTask = (overrides: Record<string, unknown> = {}) => ({
  id: 70,
  type: TaskType.Interview,
  studentStartDate: '2026-01-01',
  studentEndDate: '2026-02-01',
  studentRegistrationStartDate: null,
  task: { name: 'Interview', description: 'd', descriptionUrl: 'https://x', attributes: {} },
  ...overrides,
});

const interviewsService = {
  getAll: vi.fn(),
  getById: vi.fn(),
  getInterviewPairs: vi.fn(),
  registerStudentToStageInterview: vi.fn(),
  registerStudentToInterview: vi.fn(),
  distributeInterviewPairs: vi.fn(),
  getStageInterviewAvailableStudents: vi.fn(),
  getInterviewRegisteredStudents: vi.fn(),
  getRegisteredInterviewStudent: vi.fn(),
  getUserInterviewDetails: vi.fn(),
  getInterviewStudentsByMentor: vi.fn(),
  createInterviewResult: vi.fn(),
};
const interviewFeedbackService = {
  getCourseStageInterviewsComment: vi.fn(),
  getStageInterviewFeedback: vi.fn(),
  upsertInterviewFeedback: vi.fn(),
};
const courseTasksService = {
  getById: vi.fn(),
  changeCourseTaskProcessing: vi.fn(),
};
const stageInterviewsService = {
  findMany: vi.fn(),
  findByInterviewer: vi.fn(),
  create: vi.fn(),
  updateInterviewer: vi.fn(),
  cancel: vi.fn(),
  createAutomatically: vi.fn(),
  queryMentorByGithubId: vi.fn(),
  queryStudentByGithubId: vi.fn(),
  queryMentorById: vi.fn(),
  queryStudentById: vi.fn(),
};
const userNotificationsService = { sendEventNotification: vi.fn() };

describe('InterviewsController', () => {
  let controller: InterviewsController;

  beforeEach(async () => {
    [
      interviewsService,
      interviewFeedbackService,
      courseTasksService,
      stageInterviewsService,
      userNotificationsService,
    ].forEach(svc => Object.values(svc).forEach(fn => fn.mockReset()));
    userNotificationsService.sendEventNotification.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [
        { provide: InterviewsService, useValue: interviewsService },
        { provide: InterviewFeedbackService, useValue: interviewFeedbackService },
        { provide: CourseTasksService, useValue: courseTasksService },
        { provide: StageInterviewsService, useValue: stageInterviewsService },
        { provide: UserNotificationsService, useValue: userNotificationsService },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();

    controller = module.get(InterviewsController);
  });

  describe('getInterviews', () => {
    it('maps service results into InterviewDto using the disabled + types filters', async () => {
      interviewsService.getAll.mockResolvedValue([buildCourseTask()]);

      const result = await controller.getInterviews(courseId, false, ['interview']);

      expect(interviewsService.getAll).toHaveBeenCalledWith(courseId, { disabled: false, types: ['interview'] });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ id: 70, name: 'Interview' });
    });
  });

  describe('getStageInterviewsCommentToStudent', () => {
    it('returns the comments for a student of the course', async () => {
      const req = { user: { isAdmin: false, courses: { [courseId]: { studentId: 42 } } } } as never;
      interviewFeedbackService.getCourseStageInterviewsComment.mockResolvedValue([{ comment: 'good' }]);

      const result = await controller.getStageInterviewsCommentToStudent(courseId, req);

      expect(interviewFeedbackService.getCourseStageInterviewsComment).toHaveBeenCalledWith(courseId, 42);
      expect(result).toEqual([{ comment: 'good' }]);
    });

    it('returns an empty list for an admin who is not a student', async () => {
      const req = { user: { isAdmin: true, courses: {} } } as never;

      const result = await controller.getStageInterviewsCommentToStudent(courseId, req);

      expect(result).toEqual([]);
      expect(interviewFeedbackService.getCourseStageInterviewsComment).not.toHaveBeenCalled();
    });

    it('forbids a non-admin who is not a student of the course', async () => {
      const req = { user: { isAdmin: false, courses: {} } } as never;

      await expect(controller.getStageInterviewsCommentToStudent(courseId, req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStageInterviews', () => {
    it('delegates to the stage interviews service', async () => {
      stageInterviewsService.findMany.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getStageInterviews(courseId);

      expect(stageInterviewsService.findMany).toHaveBeenCalledWith(courseId);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('createStageInterviews', () => {
    it('creates pairs automatically and notifies each resolved student', async () => {
      stageInterviewsService.createAutomatically.mockResolvedValue([{ mentorId: 8, studentId: 42 }]);
      stageInterviewsService.queryMentorById.mockResolvedValue({ id: 8, githubId: 'mentor-x' });
      stageInterviewsService.queryStudentById.mockResolvedValue({ userId: 100 });

      const result = await controller.createStageInterviews(courseId, { noRegistration: true } as never);

      expect(stageInterviewsService.createAutomatically).toHaveBeenCalledWith(courseId, true);
      expect(userNotificationsService.sendEventNotification).toHaveBeenCalledWith({
        userId: 100,
        notificationId: 'interviewerAssigned',
        data: { interviewer: { id: 8, githubId: 'mentor-x' } },
      });
      expect(result).toEqual([{ mentorId: 8, studentId: 42 }]);
    });

    it('defaults noRegistration to false and skips notification when interviewer or student is missing', async () => {
      stageInterviewsService.createAutomatically.mockResolvedValue([{ mentorId: 8, studentId: 42 }]);
      stageInterviewsService.queryMentorById.mockResolvedValue(null);
      stageInterviewsService.queryStudentById.mockResolvedValue({ userId: 100 });

      await controller.createStageInterviews(courseId, {} as never);

      expect(stageInterviewsService.createAutomatically).toHaveBeenCalledWith(courseId, false);
      expect(userNotificationsService.sendEventNotification).not.toHaveBeenCalled();
    });

    it('wraps service errors into a BadRequestException', async () => {
      stageInterviewsService.createAutomatically.mockRejectedValue(new Error('cannot create'));

      await expect(controller.createStageInterviews(courseId, {} as never)).rejects.toThrow('cannot create');
    });
  });

  describe('getStageInterviewerStudents', () => {
    it('delegates to findByInterviewer with the current user githubId', async () => {
      const req = { user: { githubId: 'mentor-x' } } as never;
      stageInterviewsService.findByInterviewer.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getStageInterviewerStudents(req, courseId);

      expect(stageInterviewsService.findByInterviewer).toHaveBeenCalledWith(courseId, 'mentor-x');
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('createStageInterviewPair', () => {
    it('creates the pair and notifies the student', async () => {
      stageInterviewsService.create.mockResolvedValue({ id: 33 });
      stageInterviewsService.queryMentorByGithubId.mockResolvedValue({ id: 8, githubId: 'mentor-x' });
      stageInterviewsService.queryStudentByGithubId.mockResolvedValue({ userId: 100 });

      const result = await controller.createStageInterviewPair(courseId, 'mentor-x', 'john-doe');

      expect(stageInterviewsService.create).toHaveBeenCalledWith(courseId, 'john-doe', 'mentor-x');
      expect(userNotificationsService.sendEventNotification).toHaveBeenCalledWith({
        userId: 100,
        notificationId: 'interviewerAssigned',
        data: { interviewer: { id: 8, githubId: 'mentor-x' } },
      });
      expect(result).toEqual({ id: 33 });
    });

    it('returns the pair id even when notification lookup fails', async () => {
      stageInterviewsService.create.mockResolvedValue({ id: 33 });
      stageInterviewsService.queryMentorByGithubId.mockRejectedValue(new Error('boom'));

      const result = await controller.createStageInterviewPair(courseId, 'mentor-x', 'john-doe');

      expect(result).toEqual({ id: 33 });
    });

    it('returns undefined id when no pair was created', async () => {
      stageInterviewsService.create.mockResolvedValue(null);
      stageInterviewsService.queryMentorByGithubId.mockResolvedValue(null);
      stageInterviewsService.queryStudentByGithubId.mockResolvedValue(null);

      const result = await controller.createStageInterviewPair(courseId, 'mentor-x', 'john-doe');

      expect(result).toEqual({ id: undefined });
    });
  });

  describe('updateStageInterviewPair', () => {
    it('updates the interviewer and returns an empty object', async () => {
      const result = await controller.updateStageInterviewPair(courseId, 33, { githubId: 'mentor-y' } as never);

      expect(stageInterviewsService.updateInterviewer).toHaveBeenCalledWith(33, 'mentor-y');
      expect(result).toEqual({});
    });
  });

  describe('cancelStageInterviewPair', () => {
    it('cancels the stage interview pair', async () => {
      stageInterviewsService.cancel.mockResolvedValue({ affected: 1 });

      const result = await controller.cancelStageInterviewPair(courseId, 33);

      expect(stageInterviewsService.cancel).toHaveBeenCalledWith(33);
      expect(result).toEqual({ affected: 1 });
    });
  });

  describe('getInterview', () => {
    it('returns the interview wrapped in a dto', async () => {
      interviewsService.getById.mockResolvedValue(buildCourseTask());

      const result = await controller.getInterview(70);

      expect(interviewsService.getById).toHaveBeenCalledWith(70);
      expect(result).toMatchObject({ id: 70, name: 'Interview' });
    });

    it('throws NotFound when the interview is missing', async () => {
      interviewsService.getById.mockResolvedValue(null);

      await expect(controller.getInterview(70)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInterviewPairs', () => {
    it('delegates to the service', async () => {
      interviewsService.getInterviewPairs.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getInterviewPairs(70);

      expect(interviewsService.getInterviewPairs).toHaveBeenCalledWith(70);
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('registerToInterview', () => {
    const req = { user: { githubId: 'john-doe' } } as never;

    it('registers to a stage interview when the interview is a stage interview', async () => {
      interviewsService.getById.mockResolvedValue(
        buildCourseTask({ type: TaskType.StageInterview, studentRegistrationStartDate: null }),
      );
      interviewsService.registerStudentToStageInterview.mockResolvedValue({ id: 9, createdDate: 'now' });

      const result = await controller.registerToInterview(courseId, 70, req);

      expect(interviewsService.registerStudentToStageInterview).toHaveBeenCalledWith(courseId, 'john-doe');
      expect(result).toEqual({ id: 9, registrationDate: 'now' });
    });

    it('registers to a regular interview otherwise', async () => {
      interviewsService.getById.mockResolvedValue(buildCourseTask({ type: TaskType.Interview }));
      interviewsService.registerStudentToInterview.mockResolvedValue({ id: 10, createdDate: 'then' });

      const result = await controller.registerToInterview(courseId, 70, req);

      expect(interviewsService.registerStudentToInterview).toHaveBeenCalledWith(courseId, 70, 'john-doe');
      expect(result).toEqual({ id: 10, registrationDate: 'then' });
    });

    it('throws NotFound when the interview does not exist', async () => {
      interviewsService.getById.mockResolvedValue(null);

      await expect(controller.registerToInterview(courseId, 70, req)).rejects.toThrow(NotFoundException);
    });

    it('rejects registration before the registration start date', async () => {
      interviewsService.getById.mockResolvedValue(
        buildCourseTask({ studentRegistrationStartDate: new Date(Date.now() + 86400000) }),
      );

      await expect(controller.registerToInterview(courseId, 70, req)).rejects.toThrow(
        'Student registration is not available yet',
      );
    });
  });

  describe('distribute', () => {
    const dto = { clean: true, registrationEnabled: false } as never;

    it('toggles processing, distributes pairs, and always resets the processing flag', async () => {
      courseTasksService.getById.mockResolvedValue({ id: 70, isCreatingInterviewPairs: false });
      interviewsService.distributeInterviewPairs.mockResolvedValue([{ id: 1 }]);

      const result = await controller.distribute(courseId, 70, dto);

      expect(courseTasksService.changeCourseTaskProcessing).toHaveBeenNthCalledWith(1, 70, true);
      expect(interviewsService.distributeInterviewPairs).toHaveBeenCalledWith(courseId, 70, {
        clean: true,
        registrationEnabled: false,
      });
      expect(courseTasksService.changeCourseTaskProcessing).toHaveBeenNthCalledWith(2, 70, false);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('throws BadRequest when the course task is not found', async () => {
      courseTasksService.getById.mockResolvedValue(null);

      await expect(controller.distribute(courseId, 70, dto)).rejects.toThrow('Not valid course task');
      expect(courseTasksService.changeCourseTaskProcessing).not.toHaveBeenCalled();
    });

    it('throws Conflict when the course task is already being processed', async () => {
      courseTasksService.getById.mockResolvedValue({ id: 70, isCreatingInterviewPairs: true });

      await expect(controller.distribute(courseId, 70, dto)).rejects.toThrow(ConflictException);
    });

    it('throws BadRequest and still resets processing when no pairs are created', async () => {
      courseTasksService.getById.mockResolvedValue({ id: 70, isCreatingInterviewPairs: false });
      interviewsService.distributeInterviewPairs.mockResolvedValue([]);

      await expect(controller.distribute(courseId, 70, dto)).rejects.toThrow('No interview pairs were created');
      expect(courseTasksService.changeCourseTaskProcessing).toHaveBeenNthCalledWith(2, 70, false);
    });
  });

  describe('getAvailableStudents', () => {
    it('returns stage interview available students for a stage interview', async () => {
      interviewsService.getById.mockResolvedValue({ id: 70, type: 'stage-interview' });
      interviewsService.getStageInterviewAvailableStudents.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getAvailableStudents(courseId, 70);

      expect(interviewsService.getStageInterviewAvailableStudents).toHaveBeenCalledWith(courseId);
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns registered students for a regular interview', async () => {
      interviewsService.getById.mockResolvedValue({ id: 70, type: 'interview' });
      interviewsService.getInterviewRegisteredStudents.mockResolvedValue([{ id: 2 }]);

      const result = await controller.getAvailableStudents(courseId, 70);

      expect(interviewsService.getInterviewRegisteredStudents).toHaveBeenCalledWith(courseId, 70);
      expect(result).toEqual([{ id: 2 }]);
    });

    it('throws NotFound when the interview is missing', async () => {
      interviewsService.getById.mockResolvedValue(null);

      await expect(controller.getAvailableStudents(courseId, 70)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest for an unsupported interview type', async () => {
      interviewsService.getById.mockResolvedValue({ id: 70, type: 'other' });

      await expect(controller.getAvailableStudents(courseId, 70)).rejects.toThrow('Invalid interview id');
    });
  });

  describe('getInterviewRegistration', () => {
    const req = { user: { githubId: 'john-doe' } } as never;

    it('returns the registration record from the service', async () => {
      interviewsService.getRegisteredInterviewStudent.mockResolvedValue({ id: 1 });

      const result = await controller.getInterviewRegistration(req, courseId, '70');

      expect(interviewsService.getRegisteredInterviewStudent).toHaveBeenCalledWith(courseId, 'john-doe', '70');
      expect(result).toEqual({ id: 1 });
    });

    it('throws BadRequest when the registration is undefined', async () => {
      interviewsService.getRegisteredInterviewStudent.mockResolvedValue(undefined);

      await expect(controller.getInterviewRegistration(req, courseId, '70')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStudentInterviews / getMentorInterviews', () => {
    const req = { user: { githubId: 'john-doe' } } as never;

    it('returns student interview details', async () => {
      interviewsService.getUserInterviewDetails.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getStudentInterviews(req, courseId);

      expect(interviewsService.getUserInterviewDetails).toHaveBeenCalledWith(courseId, 'john-doe', 'student');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('returns mentor interview details', async () => {
      interviewsService.getUserInterviewDetails.mockResolvedValue([{ id: 2 }]);

      const result = await controller.getMentorInterviews(req, courseId);

      expect(interviewsService.getUserInterviewDetails).toHaveBeenCalledWith(courseId, 'john-doe', 'mentor');
      expect(result).toEqual([{ id: 2 }]);
    });
  });

  describe('getInterviewerStudents', () => {
    const req = { user: { githubId: 'mentor-x' } } as never;

    it('returns the students assigned to the interviewer', async () => {
      interviewsService.getInterviewStudentsByMentor.mockResolvedValue([{ id: 1 }]);

      const result = await controller.getInterviewerStudents(req, courseId, 70);

      expect(interviewsService.getInterviewStudentsByMentor).toHaveBeenCalledWith(courseId, 70, 'mentor-x');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('throws NotFound when the mentor is not found', async () => {
      interviewsService.getInterviewStudentsByMentor.mockResolvedValue(null);

      await expect(controller.getInterviewerStudents(req, courseId, 70)).rejects.toThrow('Mentor not found');
    });
  });

  describe('createInterviewResult', () => {
    const dto = { score: 9 } as never;

    it('resolves "me" to the caller githubId and submits the result', async () => {
      const req = { user: { id: 200, githubId: 'mentor-x' } } as never;
      interviewsService.createInterviewResult.mockResolvedValue({ ok: true });

      await controller.createInterviewResult(req, courseId, 70, 'me', dto);

      expect(interviewsService.createInterviewResult).toHaveBeenCalledWith(courseId, 70, 'mentor-x', 200, dto);
    });

    it('lowercases the githubId param and throws BadRequest when the service rejects', async () => {
      const req = { user: { id: 200, githubId: 'mentor-x' } } as never;
      interviewsService.createInterviewResult.mockResolvedValue({ ok: false, message: 'no pair' });

      await expect(controller.createInterviewResult(req, courseId, 70, 'John-Doe', dto)).rejects.toThrow('no pair');
      expect(interviewsService.createInterviewResult).toHaveBeenCalledWith(courseId, 70, 'john-doe', 200, dto);
    });
  });

  describe('getInterviewFeedback', () => {
    const req = { user: { githubId: 'mentor-x' } } as never;

    it('returns the stage interview feedback wrapped in a dto', async () => {
      interviewFeedbackService.getStageInterviewFeedback.mockResolvedValue({
        feedback: { version: 2, json: { a: 1 } },
        isCompleted: true,
        maxScore: 50,
      });

      const result = await controller.getInterviewFeedback(courseId, 70, 'stage-interview', req);

      expect(interviewFeedbackService.getStageInterviewFeedback).toHaveBeenCalledWith(70, 'mentor-x');
      expect(result).toEqual({ version: 2, json: { a: 1 }, isCompleted: true, maxScore: 50 });
    });

    it('rejects non stage-interview types', async () => {
      await expect(controller.getInterviewFeedback(courseId, 70, 'interview', req)).rejects.toThrow(
        'Only stage interviews are supported now.',
      );
    });
  });

  describe('createInterviewFeedback', () => {
    const dto = { json: {}, version: 1 } as never;

    it('upserts the feedback using the mentorId of the course', async () => {
      const req = { user: { courses: { [courseId]: { mentorId: 8 } } } } as never;

      await controller.createInterviewFeedback(courseId, 70, 'stage-interview', dto, req);

      expect(interviewFeedbackService.upsertInterviewFeedback).toHaveBeenCalledWith({
        interviewId: 70,
        dto,
        interviewerId: 8,
      });
    });

    it('forbids users who are not a mentor of the course', async () => {
      const req = { user: { courses: {} } } as never;

      await expect(controller.createInterviewFeedback(courseId, 70, 'stage-interview', dto, req)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('rejects non stage-interview types', async () => {
      const req = { user: { courses: { [courseId]: { mentorId: 8 } } } } as never;

      await expect(controller.createInterviewFeedback(courseId, 70, 'interview', dto, req)).rejects.toThrow(
        'Only stage interviews are supported now.',
      );
    });
  });
});

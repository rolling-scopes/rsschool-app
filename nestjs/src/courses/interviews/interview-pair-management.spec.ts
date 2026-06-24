import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { TaskInterviewStudent } from '@entities/taskInterviewStudent';
import { TaskInterviewResult } from '@entities/taskInterviewResult';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { StageInterviewStudent } from '@entities/stageInterviewStudent';
import { StageInterview } from '@entities/stageInterview';
import { TaskChecker } from '@entities/taskChecker';
import { User } from '@entities/user';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { InterviewFeedbackService } from './interviewFeedback.service';
import { CourseTasksService } from '../course-tasks';
import { StageInterviewsService } from './stage-interviews.service';
import { CrossMentorDistributionService } from './cross-mentor-distribution.service';
import { UserNotificationsService } from 'src/users-notifications';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// Fixtures mirrored from server/src/routes/course/__test__/interviewPair.test.ts to prove business-logic equivalence
const mockInterviewerRecord = {
  id: 8,
  user: { id: 200, firstName: 'Mentor', lastName: 'X', githubId: 'mentor-x' },
};
const mockStudentRecord = { id: 42, user: { id: 100, firstName: 'John', lastName: 'Doe', githubId: 'john-doe' } };

const createGetOneQb = (result: unknown) => {
  const qb = {
    innerJoin: vi.fn(),
    addSelect: vi.fn(),
    where: vi.fn(),
    andWhere: vi.fn(),
    getOne: vi.fn().mockResolvedValue(result),
  };
  qb.innerJoin.mockReturnValue(qb);
  qb.addSelect.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  return qb;
};

const repos = {
  courseTask: { findOne: vi.fn() },
  taskChecker: { findOne: vi.fn(), insert: vi.fn(), delete: vi.fn() },
  student: { createQueryBuilder: vi.fn() },
  mentor: { createQueryBuilder: vi.fn() },
};
const mockSendEventNotification = vi.fn();

const plainMentor = { id: 1, githubId: 'mentor-x', isAdmin: false, courses: { 5: { roles: ['mentor'], mentorId: 8 } } };
const admin = { id: 1, githubId: 'admin', isAdmin: true, courses: {} };

describe('interview pair management', () => {
  let controller: InterviewsController;

  beforeEach(async () => {
    Object.values(repos).forEach(repo => Object.values(repo).forEach(fn => fn.mockReset()));
    mockSendEventNotification.mockReset().mockResolvedValue(undefined);
    repos.mentor.createQueryBuilder.mockReturnValue(createGetOneQb(mockInterviewerRecord));
    repos.student.createQueryBuilder.mockReturnValue(createGetOneQb(mockStudentRecord));
    repos.taskChecker.findOne.mockResolvedValue(null);
    repos.taskChecker.insert.mockResolvedValue({ identifiers: [{ id: 99 }] });
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(CourseTask), useValue: repos.courseTask },
        { provide: getRepositoryToken(TaskInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(TaskInterviewResult), useValue: {} },
        { provide: getRepositoryToken(Student), useValue: repos.student },
        { provide: getRepositoryToken(Mentor), useValue: repos.mentor },
        { provide: getRepositoryToken(StageInterviewStudent), useValue: {} },
        { provide: getRepositoryToken(StageInterview), useValue: {} },
        { provide: getRepositoryToken(TaskChecker), useValue: repos.taskChecker },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: CrossMentorDistributionService, useValue: {} },
        { provide: StageInterviewsService, useValue: {} },
        { provide: InterviewFeedbackService, useValue: {} },
        { provide: CourseTasksService, useValue: {} },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
        { provide: CACHE_MANAGER, useValue: {} },
      ],
    }).compile();
    controller = module.get(InterviewsController);
  });

  it('forbids a plain mentor before the interview start date', async () => {
    repos.courseTask.findOne.mockResolvedValue({ studentStartDate: new Date(Date.now() + 86400000) });

    await expect(
      controller.addInterviewPair({ user: plainMentor } as never, 5, 7, 'mentor-x', 'john-doe'),
    ).rejects.toThrow(ForbiddenException);
    expect(repos.taskChecker.insert).not.toHaveBeenCalled();
  });

  it('creates the pair and sends interviewerAssigned notification to the student', async () => {
    const result = await controller.addInterviewPair({ user: admin } as never, 5, 7, 'mentor-x', 'john-doe');

    expect(repos.taskChecker.insert).toHaveBeenCalledWith({ courseTaskId: 7, studentId: 42, mentorId: 8 });
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      userId: 100,
      notificationId: 'interviewerAssigned',
      data: { interviewer: { id: 8, name: 'Mentor X', githubId: 'mentor-x' } },
    });
    expect(result).toEqual({ id: 99 });
  });

  it('returns the existing pair id without inserting a duplicate', async () => {
    repos.taskChecker.findOne.mockResolvedValue({ id: 55 });

    const result = await controller.addInterviewPair({ user: admin } as never, 5, 7, 'mentor-x', 'john-doe');

    expect(repos.taskChecker.insert).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 55 });
  });

  it('swallows notification failures', async () => {
    mockSendEventNotification.mockRejectedValue(new Error('boom'));

    const result = await controller.addInterviewPair({ user: admin } as never, 5, 7, 'mentor-x', 'john-doe');

    expect(result).toEqual({ id: 99 });
  });

  it('cancels the pair by id', async () => {
    repos.taskChecker.delete.mockResolvedValue({});

    const result = await controller.cancelInterviewPair(5, 7, 99);

    expect(repos.taskChecker.delete).toHaveBeenCalledWith(99);
    expect(result).toEqual({});
  });
});

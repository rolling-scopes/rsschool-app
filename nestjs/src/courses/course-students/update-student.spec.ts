import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CourseStudentsController } from './course-students.controller';
import { CourseStudentsService } from './course-students.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';

// Fixtures mirrored from server/src/routes/course/__test__/updateStudent.test.ts to prove business-logic equivalence
const mockStudent = { id: 42, userId: 100 };
const mockMentor = { id: 9, githubId: 'mentor-x', name: 'Mentor X', isActive: true, students: [] };
const updatedStudent = { id: 42, githubId: 'john-doe', mentor: { id: 9 } };

const service = {
  getStudentByGithubId: vi.fn(),
  getMenteeGithubIds: vi.fn(),
  getMentorBasicByGithubId: vi.fn(),
  setStudentMentor: vi.fn(),
  getStudentWithMentor: vi.fn(),
};
const mockSendEventNotification = vi.fn();

const powerUser = { id: 1, githubId: 'viewer', isAdmin: true, courses: {} } as never;
const mentorUser = { id: 1, githubId: 'viewer', isAdmin: false, courses: { 5: { roles: ['mentor'] } } } as never;

describe('updateStudent route', () => {
  let controller: CourseStudentsController;

  beforeEach(async () => {
    Object.values(service).forEach(fn => fn.mockReset());
    mockSendEventNotification.mockReset();
    service.getStudentByGithubId.mockResolvedValue(mockStudent);
    service.getMentorBasicByGithubId.mockResolvedValue(mockMentor);
    service.getStudentWithMentor.mockResolvedValue(updatedStudent);
    service.getMenteeGithubIds.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseStudentsController],
      providers: [
        { provide: CourseStudentsService, useValue: service },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
      ],
    }).compile();
    controller = module.get(CourseStudentsController);
  });

  it('responds 400 when student is missing or mentorGithuId is undefined', async () => {
    service.getStudentByGithubId.mockResolvedValue(null);
    await expect(
      controller.updateStudent({ user: powerUser } as never, 5, 'john-doe', { mentorGithuId: 'mentor-x' }),
    ).rejects.toThrow(BadRequestException);

    service.getStudentByGithubId.mockResolvedValue(mockStudent);
    await expect(controller.updateStudent({ user: powerUser } as never, 5, 'john-doe', {} as never)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('forbids a course mentor updating a non-mentee without self-assign', async () => {
    service.getMenteeGithubIds.mockResolvedValue(['other-student']);

    await expect(
      controller.updateStudent({ user: mentorUser } as never, 5, 'john-doe', { mentorGithuId: 'mentor-x' }),
    ).rejects.toThrow(ForbiddenException);
    expect(service.setStudentMentor).not.toHaveBeenCalled();
  });

  it('allows a course mentor to self-assign and sends assignment notification', async () => {
    const result = await controller.updateStudent({ user: mentorUser } as never, 5, 'john-doe', {
      mentorGithuId: 'viewer',
    });

    expect(service.setStudentMentor).toHaveBeenCalledWith(42, 9);
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      notificationId: 'mentor:assigned',
      userId: 42,
      data: { mentor: mockMentor },
    });
    expect(result).toEqual(updatedStudent);
  });

  it('responds 400 when target mentor is not found', async () => {
    service.getMentorBasicByGithubId.mockResolvedValue(null);

    await expect(
      controller.updateStudent({ user: powerUser } as never, 5, 'john-doe', { mentorGithuId: 'unknown' }),
    ).rejects.toThrow(BadRequestException);
    expect(service.setStudentMentor).not.toHaveBeenCalled();
  });

  it('unassigns mentor without notification when mentorGithuId is null', async () => {
    await controller.updateStudent({ user: powerUser } as never, 5, 'john-doe', { mentorGithuId: null });

    expect(service.setStudentMentor).toHaveBeenCalledWith(42, null);
    expect(mockSendEventNotification).not.toHaveBeenCalled();
  });
});

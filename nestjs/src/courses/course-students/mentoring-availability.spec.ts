import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { CourseStudentsController } from './course-students.controller';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CourseStudentsService } from './course-students.service';

// Fixtures mirrored from server/src/routes/course/__test__/availability.test.ts to prove business-logic equivalence
const mockGetStudentByGithubId = vi.fn();
const mockUpdate = vi.fn();

describe('updateMentoringAvailability', () => {
  let controller: CourseStudentsController;
  let service: CourseStudentsService;

  beforeEach(async () => {
    mockGetStudentByGithubId.mockReset();
    mockUpdate.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseStudentsService,
        { provide: getRepositoryToken(Student), useValue: { update: mockUpdate } },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: DataSource, useValue: { getRepository: () => ({}) } },
      ],
    }).compile();
    service = module.get(CourseStudentsService);
    vi.spyOn(service, 'getStudentByGithubId').mockImplementation(mockGetStudentByGithubId);

    const controllerModule: TestingModule = await Test.createTestingModule({
      controllers: [CourseStudentsController],
      providers: [
        { provide: CourseStudentsService, useValue: service },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();
    controller = controllerModule.get(CourseStudentsController);
  });

  it('updates student mentoring availability', async () => {
    mockGetStudentByGithubId.mockResolvedValue({ id: 42 });

    await controller.updateMentoringAvailability(5, 'john-doe', { mentoring: true });

    expect(mockGetStudentByGithubId).toHaveBeenCalledWith(5, 'john-doe');
    expect(mockUpdate).toHaveBeenCalledWith(42, { mentoring: true });
  });

  it('defaults mentoring to false when not provided', async () => {
    mockGetStudentByGithubId.mockResolvedValue({ id: 42 });

    await controller.updateMentoringAvailability(5, 'john-doe', {});

    expect(mockUpdate).toHaveBeenCalledWith(42, { mentoring: false });
  });

  it('responds 400 when student is not found in the course', async () => {
    mockGetStudentByGithubId.mockResolvedValue(null);

    await expect(controller.updateMentoringAvailability(5, 'john-doe', { mentoring: true })).rejects.toThrow(
      BadRequestException,
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MentorRegistry } from '@entities/mentorRegistry';
import { Student } from '@entities/student';
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { Course } from '@entities/course';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UsersService } from 'src/users/users.service';
import { CoursesService } from 'src/courses/courses.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';

// Fixtures mirrored from server/src/routes/registry/__test__/registerMentor.test.ts to prove business-logic equivalence
const mockPayload = {
  preferedCourses: ['10', '20'],
  maxStudentsLimit: 4,
  preferedStudentsLocation: 'any',
  languagesMentoring: ['EN', 'RU'],
  technicalMentoring: ['nodejs'],
};

const expectedMentorData = {
  maxStudentsLimit: 4,
  preferedStudentsLocation: 'any',
  englishMentoring: true,
  languagesMentoring: ['EN', 'RU'],
  preferedCourses: ['10', '20'],
  technicalMentoring: ['nodejs'],
  canceled: false,
};

const mentorRegistryRepository = { findOne: vi.fn(), insert: vi.fn(), update: vi.fn() };
const mockGetByGithubId = vi.fn();
const mockSendEventNotification = vi.fn();

describe('registerMentor', () => {
  let service: RegistryService;
  let controller: RegistryController;

  beforeEach(async () => {
    Object.values(mentorRegistryRepository).forEach(fn => fn.mockReset());
    mockGetByGithubId.mockReset();
    mockSendEventNotification.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistryService,
        { provide: getRepositoryToken(MentorRegistry), useValue: mentorRegistryRepository },
        { provide: getRepositoryToken(Student), useValue: {} },
        { provide: getRepositoryToken(Registry), useValue: {} },
        { provide: getRepositoryToken(Mentor), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: UsersService, useValue: { getByGithubId: mockGetByGithubId } },
        { provide: CoursesService, useValue: {} },
        { provide: NotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get(RegistryService);

    const controllerModule: TestingModule = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [
        { provide: RegistryService, useValue: service },
        { provide: UserNotificationsService, useValue: { sendEventNotification: mockSendEventNotification } },
        { provide: CoursesService, useValue: {} },
        { provide: DisciplinesService, useValue: {} },
      ],
    }).compile();

    controller = controllerModule.get(RegistryController);
  });

  it('does nothing when user is not found', async () => {
    mockGetByGithubId.mockResolvedValue(null);

    await service.registerMentor('john-doe', mockPayload);

    expect(mentorRegistryRepository.findOne).not.toHaveBeenCalled();
    expect(mentorRegistryRepository.insert).not.toHaveBeenCalled();
  });

  it('inserts a new mentor registry with computed english mentoring flag', async () => {
    mockGetByGithubId.mockResolvedValue({ id: 11 });
    mentorRegistryRepository.findOne.mockResolvedValue(null);

    await service.registerMentor('john-doe', mockPayload);

    expect(mentorRegistryRepository.findOne).toHaveBeenCalledWith({ where: { userId: 11 } });
    expect(mentorRegistryRepository.insert).toHaveBeenCalledWith({ userId: 11, ...expectedMentorData });
    expect(mentorRegistryRepository.update).not.toHaveBeenCalled();
  });

  it('updates existing mentor registry and resets preselected courses', async () => {
    mockGetByGithubId.mockResolvedValue({ id: 11 });
    mentorRegistryRepository.findOne.mockResolvedValue({ id: 7, userId: 11 });

    await service.registerMentor('john-doe', { ...mockPayload, languagesMentoring: ['RU'] });

    expect(mentorRegistryRepository.insert).not.toHaveBeenCalled();
    expect(mentorRegistryRepository.update).toHaveBeenCalledWith(7, {
      ...expectedMentorData,
      englishMentoring: false,
      languagesMentoring: ['RU'],
      preselectedCourses: [],
    });
  });

  it('registers mentor for current user and sends approval-submitted notification', async () => {
    mockGetByGithubId.mockResolvedValue({ id: 11 });
    mentorRegistryRepository.findOne.mockResolvedValue(null);

    await controller.registerMentor({ user: { id: 11, githubId: 'john-doe' } } as never, mockPayload);

    expect(mentorRegistryRepository.insert).toHaveBeenCalledWith({ userId: 11, ...expectedMentorData });
    expect(mockSendEventNotification).toHaveBeenCalledWith({
      data: {},
      notificationId: 'mentorRegistrationApproval:submit',
      userId: 11,
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { CoursesService } from 'src/courses/courses.service';
import { DisciplinesService } from 'src/disciplines/disciplines.service';
import { CourseRole, CurrentRequest } from 'src/auth';
import { RegistrationResultDto } from './dto/create-registration.dto';
import { RegistrationDto, UpdateRegistrationsResponseDto } from './dto/registration.dto';
import { OwnMentorRegistryDto } from './dto/own-mentor-registry.dto';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from './constants';

const mockMentorRegistryEntity = {
  id: 1,
  englishMentoring: true,
  preferedCourses: ['5'],
  preselectedCourses: ['5'],
  maxStudentsLimit: 3,
  preferedStudentsLocation: 'any',
  technicalMentoring: ['nodejs'],
  languagesMentoring: ['en'],
  sendDate: null,
  updatedDate: new Date('2024-01-01'),
  createdDate: new Date('2024-01-01'),
  comment: null,
  user: {
    githubId: 'mentor-john',
    cityName: 'Minsk',
    firstName: 'John',
    lastName: 'Doe',
    primaryEmail: 'john@example.com',
    contactsEpamEmail: 'john@epam.com',
    mentors: [],
    students: [],
  },
};

const mockOwnRegistry = {
  maxStudentsLimit: 3,
  preferedStudentsLocation: 'any',
  preselectedCourses: ['5'],
  preferedCourses: ['5'],
};

const mockRegistration = { id: 1, type: 'mentor', status: 'pending', user: null };

const mockRegistryService = {
  registerMentor: vi.fn(),
  createRegistration: vi.fn(),
  getRegistrations: vi.fn(),
  updateRegistrations: vi.fn(),
  getOwnMentorRegistry: vi.fn(),
  approveMentor: vi.fn(),
  buildMentorApprovalData: vi.fn(),
  cancelMentorRegistry: vi.fn(),
  commentMentorRegistry: vi.fn(),
  findAllMentorRegistries: vi.fn(),
  filterMentorRegistries: vi.fn(),
  getMentorRegistriesForExport: vi.fn(),
  sendInvitationsToMentors: vi.fn(),
};

const mockNotificationService = {
  sendEventNotification: vi.fn(),
};

const mockCoursesService = {
  getByIds: vi.fn(),
};

const mockDisciplinesService = {
  getByIds: vi.fn(),
};

describe('RegistryController', () => {
  let controller: RegistryController;

  beforeEach(async () => {
    [mockRegistryService, mockNotificationService, mockCoursesService, mockDisciplinesService].forEach(svc =>
      Object.values(svc).forEach(fn => fn.mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistryController],
      providers: [
        { provide: RegistryService, useValue: mockRegistryService },
        { provide: UserNotificationsService, useValue: mockNotificationService },
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: DisciplinesService, useValue: mockDisciplinesService },
      ],
    }).compile();

    controller = module.get<RegistryController>(RegistryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerMentor', () => {
    it('registers the mentor and sends a submission notification', async () => {
      const req = { user: { id: 11, githubId: 'mentor-john' } } as CurrentRequest;
      const dto = { maxStudentsLimit: 3 } as never;
      mockRegistryService.registerMentor.mockResolvedValue(undefined);
      mockNotificationService.sendEventNotification.mockResolvedValue(undefined);

      await controller.registerMentor(req, dto);

      expect(mockRegistryService.registerMentor).toHaveBeenCalledWith('mentor-john', dto);
      expect(mockNotificationService.sendEventNotification).toHaveBeenCalledWith({
        data: {},
        notificationId: 'mentorRegistrationApproval:submit',
        userId: 11,
      });
    });
  });

  describe('createRegistration', () => {
    it('creates a registration scoped to the current user and wraps the result', async () => {
      const req = { user: { id: 11, githubId: 'john' } } as CurrentRequest;
      const dto = { courseId: 5 } as never;
      const registry = { id: 7, courseId: 5 };
      mockRegistryService.createRegistration.mockResolvedValue(registry);

      const result = await controller.createRegistration(req, dto);

      expect(mockRegistryService.createRegistration).toHaveBeenCalledWith({ id: 11, githubId: 'john' }, dto);
      expect(result).toBeInstanceOf(RegistrationResultDto);
    });
  });

  describe('getRegistrations', () => {
    it('maps registrations and parses courseId to a number when present', async () => {
      mockRegistryService.getRegistrations.mockResolvedValue([mockRegistration]);

      const result = await controller.getRegistrations('mentor', 5 as never);

      expect(mockRegistryService.getRegistrations).toHaveBeenCalledWith('mentor', 5);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(RegistrationDto);
    });

    it('passes undefined courseId when none is supplied', async () => {
      mockRegistryService.getRegistrations.mockResolvedValue([]);

      const result = await controller.getRegistrations(undefined, undefined);

      expect(mockRegistryService.getRegistrations).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual([]);
    });
  });

  describe('updateRegistrations', () => {
    it('delegates ids and status to the service and wraps the result', async () => {
      const dto = { ids: [1, 2], status: 'approved' } as never;
      mockRegistryService.updateRegistrations.mockResolvedValue({ registries: [] });

      const result = await controller.updateRegistrations(dto);

      expect(mockRegistryService.updateRegistrations).toHaveBeenCalledWith([1, 2], 'approved');
      expect(result).toBeInstanceOf(UpdateRegistrationsResponseDto);
    });
  });

  describe('getOwnMentorRegistry', () => {
    it('returns an OwnMentorRegistryDto when a record exists', async () => {
      const req = { user: { id: 11 } } as CurrentRequest;
      mockRegistryService.getOwnMentorRegistry.mockResolvedValue(mockOwnRegistry);

      const result = await controller.getOwnMentorRegistry(req);

      expect(mockRegistryService.getOwnMentorRegistry).toHaveBeenCalledWith(11);
      expect(result).toBeInstanceOf(OwnMentorRegistryDto);
    });

    it('throws NotFoundException when no record exists', async () => {
      const req = { user: { id: 11 } } as CurrentRequest;
      mockRegistryService.getOwnMentorRegistry.mockResolvedValue(null);

      await expect(controller.getOwnMentorRegistry(req)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('approveMentor', () => {
    it('approves the mentor, builds notification data and notifies the approved user', async () => {
      const body = { preselectedCourses: ['5'] } as never;
      mockRegistryService.approveMentor.mockResolvedValue({ id: 11 });
      mockRegistryService.buildMentorApprovalData.mockResolvedValue({ courses: ['JS'] });
      mockNotificationService.sendEventNotification.mockResolvedValue(undefined);

      await controller.approveMentor('mentor-john', body);

      expect(mockRegistryService.approveMentor).toHaveBeenCalledWith('mentor-john', ['5']);
      expect(mockRegistryService.buildMentorApprovalData).toHaveBeenCalledWith(['5']);
      expect(mockNotificationService.sendEventNotification).toHaveBeenCalledWith({
        data: { courses: ['JS'] },
        notificationId: 'mentorRegistrationApproval',
        userId: 11,
      });
    });
  });

  describe('cancelMentorRegistry', () => {
    it('delegates to the service with the githubId', async () => {
      mockRegistryService.cancelMentorRegistry.mockResolvedValue(undefined);

      await controller.cancelMentorRegistry('mentor-john');

      expect(mockRegistryService.cancelMentorRegistry).toHaveBeenCalledWith('mentor-john');
    });
  });

  describe('commentMentorRegistry', () => {
    it('delegates the githubId and comment to the service', async () => {
      const body = { comment: 'looks good' } as never;
      mockRegistryService.commentMentorRegistry.mockResolvedValue(undefined);

      await controller.commentMentorRegistry('mentor-john', body);

      expect(mockRegistryService.commentMentorRegistry).toHaveBeenCalledWith('mentor-john', 'looks good');
    });
  });

  describe('getMentorRegistries', () => {
    it('returns all registries via the admin fast-path when req.query is absent', async () => {
      const req = { user: { isAdmin: true, courses: {} }, query: undefined } as unknown as CurrentRequest;
      mockRegistryService.findAllMentorRegistries.mockResolvedValue([mockMentorRegistryEntity]);

      const result = await controller.getMentorRegistries(req);

      expect(mockRegistryService.findAllMentorRegistries).toHaveBeenCalled();
      expect(mockRegistryService.filterMentorRegistries).not.toHaveBeenCalled();
      expect(result.total).toBe(1);
      expect(result.mentors).toHaveLength(1);
    });

    it('filters with undefined course/discipline scoping for an admin when req.query is present', async () => {
      const req = {
        user: { isAdmin: true, courses: {} },
        query: { status: 'all' },
      } as unknown as CurrentRequest;
      mockRegistryService.filterMentorRegistries.mockResolvedValue({ total: 0, mentors: [] });

      const result = await controller.getMentorRegistries(req);

      expect(mockRegistryService.findAllMentorRegistries).not.toHaveBeenCalled();
      expect(mockRegistryService.filterMentorRegistries).toHaveBeenCalledWith(
        expect.objectContaining({
          page: DEFAULT_PAGE_NUMBER,
          limit: DEFAULT_PAGE_SIZE,
          coursesIds: undefined,
          disciplineNames: undefined,
          status: 'all',
        }),
      );
      expect(result).toEqual({ total: 0, mentors: [] });
    });

    it('scopes a non-admin manager to their managed course ids and discipline names', async () => {
      const req = {
        user: {
          isAdmin: false,
          courses: {
            5: { roles: [CourseRole.Manager] },
            6: { roles: [CourseRole.Student] },
            7: { roles: [CourseRole.Supervisor] },
          },
        },
        query: { status: 'new' },
      } as unknown as CurrentRequest;
      mockCoursesService.getByIds.mockResolvedValue([{ disciplineId: 1 }, { disciplineId: 2 }, { disciplineId: null }]);
      mockDisciplinesService.getByIds.mockResolvedValue([{ name: 'frontend' }, { name: 'backend' }]);
      mockRegistryService.filterMentorRegistries.mockResolvedValue({
        total: 1,
        mentors: [mockMentorRegistryEntity],
      });

      const result = await controller.getMentorRegistries(
        req,
        'new' as never,
        50,
        2,
        'gh',
        'Minsk',
        [5],
        [6],
        ['nodejs'],
      );

      expect(mockCoursesService.getByIds).toHaveBeenCalledWith([5, 7]);
      expect(mockDisciplinesService.getByIds).toHaveBeenCalledWith([1, 2]);
      expect(mockRegistryService.filterMentorRegistries).toHaveBeenCalledWith({
        page: 2,
        limit: 50,
        githubId: 'gh',
        cityName: 'Minsk',
        preferedCourses: [5],
        preselectedCourses: [6],
        technicalMentoring: ['nodejs'],
        coursesIds: [5, 7],
        disciplineNames: ['frontend', 'backend'],
        status: 'new',
      });
      expect(result.total).toBe(1);
      expect(result.mentors).toHaveLength(1);
    });

    it('falls back to default page/limit for a non-admin when pagination is omitted', async () => {
      const req = {
        user: { isAdmin: false, courses: {} },
        query: { status: 'all' },
      } as unknown as CurrentRequest;
      mockCoursesService.getByIds.mockResolvedValue([]);
      mockDisciplinesService.getByIds.mockResolvedValue([]);
      mockRegistryService.filterMentorRegistries.mockResolvedValue({ total: 0, mentors: [] });

      await controller.getMentorRegistries(req);

      expect(mockRegistryService.filterMentorRegistries).toHaveBeenCalledWith(
        expect.objectContaining({
          page: DEFAULT_PAGE_NUMBER,
          limit: DEFAULT_PAGE_SIZE,
          coursesIds: [],
          disciplineNames: [],
        }),
      );
    });
  });

  describe('inviteMentors', () => {
    it('delegates the invite body to the service', async () => {
      const body = { courseId: 5, mentorIds: [1, 2] } as never;
      mockRegistryService.sendInvitationsToMentors.mockResolvedValue(undefined);

      await controller.inviteMentors(body);

      expect(mockRegistryService.sendInvitationsToMentors).toHaveBeenCalledWith(body);
    });
  });
});

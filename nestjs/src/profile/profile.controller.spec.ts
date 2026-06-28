import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { EndorsementService } from './endorsement.service';
import { CoursesService } from 'src/courses/courses.service';
import { ProfileInfoService } from './profile-info/profile-info.service';
import { CurrentRequest } from '../auth/auth.service';
import { ProfileCourseDto, ProfileInfoExtendedDto, MyProfileDto } from './dto';
import { ProfileDto } from './dto/profile.dto';
import { PersonalProfileDto } from './dto/personal-profile.dto';
import { EndorsementDataDto, EndorsementDto } from './dto/endorsement.dto';

const mockAdminUser = {
  id: 1,
  githubId: 'admin',
  isAdmin: true,
} as Partial<CurrentRequest['user']> as CurrentRequest['user'];

const mockUser = {
  id: 2,
  githubId: 'john-doe',
  isAdmin: false,
} as Partial<CurrentRequest['user']> as CurrentRequest['user'];

const mockCourse = {
  id: 5,
  name: 'JS 2024',
  createdDate: new Date('2024-01-01'),
  updatedDate: new Date('2024-01-01'),
} as never;

const mockProfileInfo = {
  generalInfo: { name: 'John Doe' },
  contacts: {},
  permissionsSettings: {},
  discord: null,
};

const mockMyProfileUser = { id: 2, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' } as never;

const mockEndorsementData = {
  user: { id: 2 },
  courses: [],
  mentors: [],
  studentsCount: 0,
  interviewsCount: 0,
  feedbacks: [],
};

const mockProfileService = {
  getCourses: vi.fn(),
  updateUser: vi.fn(),
  updateProfileFlat: vi.fn(),
  getMyProfile: vi.fn(),
  getProfile: vi.fn(),
  getPersonalProfile: vi.fn(),
  obfuscateProfile: vi.fn(),
};

const mockEndorsementService = {
  getEndorsement: vi.fn(),
  getEndorsmentData: vi.fn(),
};

const mockCoursesService = {
  getAll: vi.fn(),
};

const mockProfileInfoService = {
  getProfileInfo: vi.fn(),
};

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(async () => {
    [mockProfileService, mockEndorsementService, mockCoursesService, mockProfileInfoService].forEach(svc =>
      Object.values(svc).forEach(fn => fn.mockReset()),
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: mockProfileService },
        { provide: EndorsementService, useValue: mockEndorsementService },
        { provide: CoursesService, useValue: mockCoursesService },
        { provide: ProfileInfoService, useValue: mockProfileInfoService },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCourses', () => {
    it('returns all courses for an admin regardless of username', async () => {
      const req = { user: mockAdminUser } as CurrentRequest;
      mockCoursesService.getAll.mockResolvedValue([mockCourse]);

      const result = await controller.getCourses(req, 'someone-else');

      expect(mockCoursesService.getAll).toHaveBeenCalled();
      expect(mockProfileService.getCourses).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProfileCourseDto);
    });

    it('returns own courses when a non-admin requests their own githubId', async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileService.getCourses.mockResolvedValue([mockCourse]);

      const result = await controller.getCourses(req, 'john-doe');

      expect(mockProfileService.getCourses).toHaveBeenCalledWith(mockUser);
      expect(result[0]).toBeInstanceOf(ProfileCourseDto);
    });

    it("returns own courses when a non-admin requests the 'me' alias", async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileService.getCourses.mockResolvedValue([mockCourse]);

      const result = await controller.getCourses(req, 'me');

      expect(mockProfileService.getCourses).toHaveBeenCalledWith(mockUser);
      expect(result).toHaveLength(1);
    });

    it("throws ForbiddenException when a non-admin requests another user's courses", async () => {
      const req = { user: mockUser } as CurrentRequest;

      await expect(controller.getCourses(req, 'someone-else')).rejects.toBeInstanceOf(ForbiddenException);
      expect(mockProfileService.getCourses).not.toHaveBeenCalled();
      expect(mockCoursesService.getAll).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    it('delegates to service.updateUser with the current user id and dto', async () => {
      const req = { user: mockUser } as CurrentRequest;
      const dto = { firstName: 'Johnny' } as never;
      mockProfileService.updateUser.mockResolvedValue(undefined);

      await controller.updateUser(req, dto);

      expect(mockProfileService.updateUser).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('updateProfileFlatInfo', () => {
    it('delegates to service.updateProfileFlat with the current user id and dto', async () => {
      const req = { user: mockUser } as CurrentRequest;
      const dto = { name: 'John Doe' } as never;
      mockProfileService.updateProfileFlat.mockResolvedValue(undefined);

      await controller.updateProfileFlatInfo(req, dto);

      expect(mockProfileService.updateProfileFlat).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('getFullProfileInfo', () => {
    it('passes the current user and githubId to ProfileInfoService and wraps in ProfileInfoExtendedDto', async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileInfoService.getProfileInfo.mockResolvedValue(mockProfileInfo);

      const result = await controller.getFullProfileInfo(req, 'other-user');

      expect(mockProfileInfoService.getProfileInfo).toHaveBeenCalledWith(mockUser, 'other-user');
      expect(result).toBeInstanceOf(ProfileInfoExtendedDto);
    });

    it('passes undefined githubId when none is supplied', async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileInfoService.getProfileInfo.mockResolvedValue(mockProfileInfo);

      await controller.getFullProfileInfo(req);

      expect(mockProfileInfoService.getProfileInfo).toHaveBeenCalledWith(mockUser, undefined);
    });
  });

  describe('getMyProfile', () => {
    it('returns a MyProfileDto for the looked-up user', async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileService.getMyProfile.mockResolvedValue(mockMyProfileUser);

      const result = await controller.getMyProfile(req);

      expect(mockProfileService.getMyProfile).toHaveBeenCalledWith('john-doe');
      expect(result).toBeInstanceOf(MyProfileDto);
    });

    it('throws NotFoundException when the user is not found', async () => {
      const req = { user: mockUser } as CurrentRequest;
      mockProfileService.getMyProfile.mockResolvedValue(null);

      await expect(controller.getMyProfile(req)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getProfileInfo', () => {
    it('returns a ProfileDto built from the service result', async () => {
      mockProfileService.getProfile.mockResolvedValue({ resume: null });

      const result = await controller.getProfileInfo('john-doe');

      expect(mockProfileService.getProfile).toHaveBeenCalledWith('john-doe');
      expect(result).toBeInstanceOf(ProfileDto);
    });
  });

  describe('getPersonalProfile', () => {
    it('returns a PersonalProfileDto built from the service result', async () => {
      mockProfileService.getPersonalProfile.mockResolvedValue(mockMyProfileUser);

      const result = await controller.getPersonalProfile('john-doe');

      expect(mockProfileService.getPersonalProfile).toHaveBeenCalledWith('john-doe');
      expect(result).toBeInstanceOf(PersonalProfileDto);
    });
  });

  describe('getEndorsement', () => {
    it('returns an EndorsementDto built from the service result', async () => {
      mockEndorsementService.getEndorsement.mockResolvedValue({ content: 'great', data: {} });

      const result = await controller.getEndorsement('john-doe');

      expect(mockEndorsementService.getEndorsement).toHaveBeenCalledWith('john-doe');
      expect(result).toBeInstanceOf(EndorsementDto);
    });

    it('handles a null endorsement from the service', async () => {
      mockEndorsementService.getEndorsement.mockResolvedValue(null);

      const result = await controller.getEndorsement('john-doe');

      expect(result).toBeInstanceOf(EndorsementDto);
    });
  });

  describe('getEndorsementData', () => {
    it('returns an EndorsementDataDto built from the service result', async () => {
      mockEndorsementService.getEndorsmentData.mockResolvedValue(mockEndorsementData);

      const result = await controller.getEndorsementData('john-doe');

      expect(mockEndorsementService.getEndorsmentData).toHaveBeenCalledWith('john-doe');
      expect(result).toBeInstanceOf(EndorsementDataDto);
    });
  });

  describe('obfuscateProfile', () => {
    it('delegates to service.obfuscateProfile with the githubId', async () => {
      mockProfileService.obfuscateProfile.mockResolvedValue(undefined);

      await controller.obfuscateProfile('john-doe');

      expect(mockProfileService.obfuscateProfile).toHaveBeenCalledWith('john-doe');
    });
  });
});

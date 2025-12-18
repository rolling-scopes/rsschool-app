import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { CourseTasksService } from '../courses';
import { AuthService } from './auth.service';
import { JwtService } from '../core/jwt/jwt.service';
import { ConfigService } from '../config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { UserNotificationsService } from '../users-notifications/users.notifications.service';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { LoginState } from '@entities/loginState';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Profile } from 'passport';
import { AuthUser } from './auth-user.model';
import { User } from '@entities/user';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let courseTasksService: jest.Mocked<CourseTasksService>;

  const mockProfile: Profile = {
    provider: 'github',
    id: '12345',
    displayName: 'John Doe',
    username: 'johndoe',
    emails: [{ value: 'john@example.com', primary: true }] as unknown as Profile['emails'],
    name: { givenName: 'John', familyName: 'Doe' },
  };

  const mockUser = {
    id: 1,
    githubId: 'johndoe',
    provider: 'github',
    providerUserId: '12345',
    primaryEmail: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
  } as Partial<User> as User;

  const mockAuthDetails = {
    id: 1,
    githubId: 'johndoe',
    students: [],
    mentors: [],
    courseUsers: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: {} },
        {
          provide: CourseTasksService,
          useValue: {
            getByOwner: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserByProvider: jest.fn(),
            getByGithubId: jest.fn(),
            saveUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            users: { admins: ['admin'], hirers: ['hirer'] },
          },
        },
        { provide: getRepositoryToken(LoginState), useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
        { provide: HttpService, useValue: {} },
        { provide: getRepositoryToken(NotificationUserConnection), useValue: {} },
        { provide: CACHE_MANAGER, useValue: { del: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    courseTasksService = module.get(CourseTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuthUser', () => {
    beforeEach(() => {
      jest.spyOn(service, 'getAuthDetails').mockResolvedValue(mockAuthDetails);
      courseTasksService.getByOwner.mockResolvedValue([]);
    });

    it('should create a new user when user does not exist', async () => {
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(null);
      usersService.saveUser.mockResolvedValue({} as User);

      const result = await service.createAuthUser(mockProfile);

      expect(usersService.getUserByProvider).toHaveBeenCalledWith('github', '12345');
      expect(usersService.getByGithubId).toHaveBeenCalledWith('johndoe');
      expect(usersService.saveUser).toHaveBeenCalledWith({
        githubId: 'johndoe',
        providerUserId: '12345',
        provider: 'github',
        primaryEmail: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        lastActivityTime: expect.any(Number),
      });
      expect(result).toBeInstanceOf(AuthUser);
    });

    it('should update user provider info when user exists but has no provider', async () => {
      const existingUser = { ...mockUser, provider: null as never, providerUserId: null as never } satisfies User;
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(existingUser);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(mockProfile);

      expect(usersService.saveUser).toHaveBeenCalledWith({
        id: 1,
        provider: 'github',
        providerUserId: '12345',
        githubId: 'johndoe',
      });
    });

    it('should update user githubId when it differs from username', async () => {
      const existingUser = { ...mockUser, githubId: 'oldjohndoe' };
      usersService.getUserByProvider.mockResolvedValue(existingUser as User);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(mockProfile);

      expect(usersService.saveUser).toHaveBeenCalledWith({
        id: 1,
        provider: 'github',
        providerUserId: '12345',
        githubId: 'johndoe',
      });
    });

    it('should update primary email when user exists but has no primary email', async () => {
      const existingUser = { ...mockUser, primaryEmail: null };
      usersService.getUserByProvider.mockResolvedValue(existingUser as User);
      usersService.updateUser.mockResolvedValue();

      await service.createAuthUser(mockProfile);

      expect(usersService.updateUser).toHaveBeenCalledWith(1, {
        primaryEmail: 'john@example.com',
      });
    });

    it('should not update email when user already has primary email', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);

      await service.createAuthUser(mockProfile);

      expect(usersService.updateUser).not.toHaveBeenCalled();
    });

    it('should handle profile with lowercase username', async () => {
      const profileWithUppercase = { ...mockProfile, username: 'JohnDoe' };
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(null);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(profileWithUppercase);

      expect(usersService.getByGithubId).toHaveBeenCalledWith('johndoe');
      expect(usersService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          githubId: 'johndoe',
        }),
      );
    });

    it('should handle profile without emails', async () => {
      const profileWithoutEmail = { ...mockProfile, emails: undefined };
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(null);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(profileWithoutEmail);

      expect(usersService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryEmail: undefined,
        }),
      );
    });

    it('should use first email when multiple emails exist', async () => {
      const profileWithMultipleEmails = {
        ...mockProfile,
        emails: [
          { value: 'first@example.com' },
          { value: 'second@example.com' },
          { value: 'third@example.com' },
        ] as unknown as Profile['emails'],
      };
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(null);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(profileWithMultipleEmails);

      expect(usersService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          primaryEmail: 'first@example.com',
        }),
      );
    });

    it('should handle profile without name', async () => {
      const profileWithoutName = { ...mockProfile, name: undefined };
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(null);
      usersService.saveUser.mockResolvedValue({} as User);

      await service.createAuthUser(profileWithoutName);

      expect(usersService.saveUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: '',
          lastName: '',
        }),
      );
    });

    it('should return AuthUser with admin privileges when admin is true', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);

      const result = await service.createAuthUser(mockProfile, true);

      expect(result).toBeInstanceOf(AuthUser);
      expect(result.isAdmin).toBe(true);
    });

    it('should return AuthUser with admin privileges when user is in admin list', async () => {
      const adminProfile = { ...mockProfile, username: 'admin' };
      const adminAuthDetails = { ...mockAuthDetails, githubId: 'admin' };
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);
      jest.spyOn(service, 'getAuthDetails').mockResolvedValue(adminAuthDetails);

      const result = await service.createAuthUser(adminProfile, false);

      expect(result).toBeInstanceOf(AuthUser);
      expect(result.isAdmin).toBe(true);
    });

    it('should return AuthUser without admin privileges for regular users', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);

      const result = await service.createAuthUser(mockProfile, false);

      expect(result).toBeInstanceOf(AuthUser);
      expect(result.isAdmin).toBe(false);
    });

    it('should prefer getUserByProvider over getByGithubId when provider exists', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);
      usersService.getByGithubId.mockResolvedValue(null);

      await service.createAuthUser(mockProfile);

      expect(usersService.getUserByProvider).toHaveBeenCalled();
      expect(usersService.getByGithubId).not.toHaveBeenCalled();
    });

    it('should fallback to getByGithubId when getUserByProvider returns null', async () => {
      usersService.getUserByProvider.mockResolvedValue(null);
      usersService.getByGithubId.mockResolvedValue(mockUser as User);

      await service.createAuthUser(mockProfile);

      expect(usersService.getUserByProvider).toHaveBeenCalled();
      expect(usersService.getByGithubId).toHaveBeenCalled();
    });

    it('should call getAuthUser with correct parameters', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);
      const getAuthUserSpy = jest.spyOn(service, 'getAuthUser');

      await service.createAuthUser(mockProfile, true);

      expect(getAuthUserSpy).toHaveBeenCalledWith('johndoe', true);
    });

    it('should not update user when all fields are already correct', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);

      await service.createAuthUser(mockProfile);

      expect(usersService.saveUser).not.toHaveBeenCalled();
      expect(usersService.updateUser).not.toHaveBeenCalled();
    });
  });
});

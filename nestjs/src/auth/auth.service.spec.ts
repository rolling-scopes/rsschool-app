import type { Mocked } from 'vitest';
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
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import type { Repository } from 'typeorm';
import type { Cache } from '@nestjs/cache-manager';
import type { CurrentRequest } from './auth.service';
import type { LoginData } from '@entities/loginState';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Mocked<UsersService>;
  let courseTasksService: Mocked<CourseTasksService>;
  let jwtService: Mocked<JwtService>;
  let loginStateRepository: Mocked<Repository<LoginState>>;
  let notificationUserConnectionRepository: Mocked<Repository<NotificationUserConnection>>;
  let httpService: Mocked<HttpService>;
  let cacheManager: Mocked<Cache>;

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

  // Sub-query builder handed to the `addSelect(qb => ...)` callbacks in getAuthDetails.
  const mockSubQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
  };

  const mockQueryBuilder = {
    select: vi.fn().mockReturnThis(),
    // Execute any sub-query callback so its arrow function body is exercised.
    addSelect: vi.fn(function (this: unknown, arg: unknown) {
      if (typeof arg === 'function') {
        (arg as (qb: typeof mockSubQueryBuilder) => unknown)(mockSubQueryBuilder);
      }
      return this;
    }),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getRawOne: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            createToken: vi.fn(),
          },
        },
        {
          provide: CourseTasksService,
          useValue: {
            getByOwner: vi.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUserByProvider: vi.fn(),
            getByGithubId: vi.fn(),
            saveUser: vi.fn(),
            updateUser: vi.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            users: { admins: ['admin'], hirers: ['hirer'] },
            awsServices: { restApiUrl: 'https://aws.example.com', restApiKey: 'secret-key' },
          },
        },
        {
          provide: getRepositoryToken(LoginState),
          useValue: {
            save: vi.fn(),
            findOne: vi.fn(),
            delete: vi.fn(),
            manager: {
              createQueryBuilder: vi.fn().mockReturnValue(mockQueryBuilder),
            },
          },
        },
        { provide: UserNotificationsService, useValue: {} },
        {
          provide: HttpService,
          useValue: {
            post: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(NotificationUserConnection),
          useValue: {
            save: vi.fn(),
          },
        },
        { provide: CACHE_MANAGER, useValue: { del: vi.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    courseTasksService = module.get(CourseTasksService);
    jwtService = module.get(JwtService);
    loginStateRepository = module.get(getRepositoryToken(LoginState));
    notificationUserConnectionRepository = module.get(getRepositoryToken(NotificationUserConnection));
    httpService = module.get(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuthUser', () => {
    beforeEach(() => {
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(mockAuthDetails);
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
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(adminAuthDetails);

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

    it('should skip getUserByProvider lookup when the profile provider is empty', async () => {
      const profileWithoutProvider = { ...mockProfile, provider: '' };
      usersService.getByGithubId.mockResolvedValue(mockUser as User);

      await service.createAuthUser(profileWithoutProvider);

      expect(usersService.getUserByProvider).not.toHaveBeenCalled();
      expect(usersService.getByGithubId).toHaveBeenCalledWith('johndoe');
    });

    it('should call getAuthUser with correct parameters', async () => {
      usersService.getUserByProvider.mockResolvedValue(mockUser as User);
      const getAuthUserSpy = vi.spyOn(service, 'getAuthUser');

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

  describe('getAuthUser', () => {
    it('should build an AuthUser from auth details and owned course tasks', async () => {
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(mockAuthDetails);
      courseTasksService.getByOwner.mockResolvedValue([]);

      const result = await service.getAuthUser('johndoe');

      expect(service.getAuthDetails).toHaveBeenCalledWith('johndoe');
      expect(courseTasksService.getByOwner).toHaveBeenCalledWith('johndoe');
      expect(result).toBeInstanceOf(AuthUser);
      expect(result.isAdmin).toBe(false);
      expect(result.isHirer).toBe(false);
    });

    it('should mark the user as admin when present in the admins config list', async () => {
      const adminDetails = { ...mockAuthDetails, githubId: 'admin' };
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(adminDetails);
      courseTasksService.getByOwner.mockResolvedValue([]);

      const result = await service.getAuthUser('admin');

      expect(result.isAdmin).toBe(true);
    });

    it('should mark the user as admin when the admin flag is true', async () => {
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(mockAuthDetails);
      courseTasksService.getByOwner.mockResolvedValue([]);

      const result = await service.getAuthUser('johndoe', true);

      expect(result.isAdmin).toBe(true);
    });

    it('should mark the user as hirer when present in the hirers config list', async () => {
      const hirerDetails = { ...mockAuthDetails, githubId: 'hirer' };
      vi.spyOn(service, 'getAuthDetails').mockResolvedValue(hirerDetails);
      courseTasksService.getByOwner.mockResolvedValue([]);

      const result = await service.getAuthUser('hirer');

      expect(result.isHirer).toBe(true);
      expect(result.isAdmin).toBe(false);
    });
  });

  describe('validateGithub', () => {
    it('should return null when the request has no user', () => {
      const req = { user: undefined } as unknown as CurrentRequest;

      const result = service.validateGithub(req);

      expect(result).toBeNull();
      expect(jwtService.createToken).not.toHaveBeenCalled();
    });

    it('should create and return a token when the request has a user', () => {
      const authUser = { id: 1, githubId: 'johndoe' } as unknown as AuthUser;
      const req = { user: authUser } as unknown as CurrentRequest;
      jwtService.createToken.mockReturnValue('jwt-token');

      const result = service.validateGithub(req);

      expect(jwtService.createToken).toHaveBeenCalledWith(authUser);
      expect(result).toBe('jwt-token');
    });
  });

  describe('createLoginState', () => {
    it('should persist the login state and return the generated id', async () => {
      loginStateRepository.save.mockResolvedValue({} as LoginState);
      const data: LoginData = { redirectUrl: '/home' };

      const id = await service.createLoginState({ userId: 7, expires: '2030-01-01', data });

      expect(typeof id).toBe('string');
      expect(id).toHaveLength(10);
      expect(id).toMatch(/^[0-9a-f]{10}$/);
      expect(loginStateRepository.save).toHaveBeenCalledWith({
        id,
        data,
        userId: 7,
        expires: '2030-01-01',
      });
    });

    it('should persist the login state without an optional userId/expires', async () => {
      loginStateRepository.save.mockResolvedValue({} as LoginState);
      const data: LoginData = {};

      const id = await service.createLoginState({ data });

      expect(loginStateRepository.save).toHaveBeenCalledWith({
        id,
        data,
        userId: undefined,
        expires: undefined,
      });
    });
  });

  describe('getLoginStateById', () => {
    it('should look up a non-expired login state by id ordered by newest', () => {
      const state = { id: 'abc' } as LoginState;
      loginStateRepository.findOne.mockResolvedValue(state);

      const result = service.getLoginStateById('abc');

      expect(loginStateRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'abc',
          expires: expect.anything(),
        },
        order: {
          createdDate: 'DESC',
        },
      });
      return expect(result).resolves.toBe(state);
    });
  });

  describe('getLoginStateByUserId', () => {
    it('should look up a non-expired login state by userId ordered by newest', () => {
      const state = { id: 'abc', userId: 5 } as LoginState;
      loginStateRepository.findOne.mockResolvedValue(state);

      const result = service.getLoginStateByUserId(5);

      expect(loginStateRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 5,
          expires: expect.anything(),
        },
        order: {
          createdDate: 'DESC',
        },
      });
      return expect(result).resolves.toBe(state);
    });
  });

  describe('deleteLoginState', () => {
    it('should delegate deletion to the repository', () => {
      const deleteResult = { affected: 1, raw: [] };
      loginStateRepository.delete.mockResolvedValue(deleteResult);

      const result = service.deleteLoginState('abc');

      expect(loginStateRepository.delete).toHaveBeenCalledWith('abc');
      return expect(result).resolves.toBe(deleteResult);
    });
  });

  describe('getRedirectUrl', () => {
    it('should return / when no loginData is provided', () => {
      expect(service.getRedirectUrl(undefined)).toBe('/');
    });

    it('should return / when loginData has no redirectUrl', () => {
      expect(service.getRedirectUrl({})).toBe('/');
    });

    it('should return a valid relative path', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/dashboard' })).toBe('/dashboard');
    });

    it('should return a relative path with query string', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/course?id=123' })).toBe('/course?id=123');
    });

    it('should decode a percent-encoded relative path', () => {
      expect(service.getRedirectUrl({ redirectUrl: '%2Fcourse%2F1' })).toBe('/course/1');
      expect(service.getRedirectUrl({ redirectUrl: '/course%3Fid%3D123' })).toBe('/course?id=123');
    });

    it('should allow a deep relative path containing a backslash in a later segment', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/course/a\\b' })).toBe('/course/a\\b');
    });

    it('should return / for an absolute URL (open redirect prevention)', () => {
      expect(service.getRedirectUrl({ redirectUrl: 'https://evil.com' })).toBe('/');
    });

    it('should return / for an http URL (open redirect prevention)', () => {
      expect(service.getRedirectUrl({ redirectUrl: 'http://evil.com/path' })).toBe('/');
    });

    it('should return / for a protocol-relative URL (open redirect prevention)', () => {
      expect(service.getRedirectUrl({ redirectUrl: '//evil.com' })).toBe('/');
    });

    it('should return / for a backslash protocol-relative URL (open redirect prevention)', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/\\evil.com' })).toBe('/');
    });

    it('should return / for a percent-encoded backslash protocol-relative URL', () => {
      // decodes to /\evil.com, which browsers normalise to //evil.com
      expect(service.getRedirectUrl({ redirectUrl: '/%5Cevil.com' })).toBe('/');
    });

    it('should return / for a mixed slash/backslash protocol-relative URL', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/\\/evil.com' })).toBe('/');
    });

    it('should return / for malformed percent-encoding', () => {
      expect(service.getRedirectUrl({ redirectUrl: '/path%GGinvalid' })).toBe('/');
    });
  });

  describe('onConnectionComplete', () => {
    it('should do nothing when channelId is missing', async () => {
      await service.onConnectionComplete({ externalId: 'ext-1' }, 1);

      expect(notificationUserConnectionRepository.save).not.toHaveBeenCalled();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should do nothing when externalId is missing', async () => {
      await service.onConnectionComplete({ channelId: 'telegram' }, 1);

      expect(notificationUserConnectionRepository.save).not.toHaveBeenCalled();
      expect(httpService.post).not.toHaveBeenCalled();
    });

    it('should save the connection and notify the AWS rest api for telegram', async () => {
      notificationUserConnectionRepository.save.mockResolvedValue({} as NotificationUserConnection);
      httpService.post.mockReturnValue(of({}) as never);

      await service.onConnectionComplete({ channelId: 'telegram', externalId: 'ext-1' }, 42);

      expect(notificationUserConnectionRepository.save).toHaveBeenCalledWith({
        channelId: 'telegram',
        enabled: true,
        externalId: 'ext-1',
        userId: 42,
      });
      expect(httpService.post).toHaveBeenCalledWith(
        'https://aws.example.com/connection/complete',
        { channelId: 'telegram', externalId: 'ext-1' },
        { headers: { 'x-api-key': 'secret-key' } },
      );
    });

    it('should save the connection but skip the AWS call for non-telegram channels', async () => {
      notificationUserConnectionRepository.save.mockResolvedValue({} as NotificationUserConnection);

      await service.onConnectionComplete({ channelId: 'discord' as never, externalId: 'ext-2' }, 9);

      expect(notificationUserConnectionRepository.save).toHaveBeenCalledWith({
        channelId: 'discord',
        enabled: true,
        externalId: 'ext-2',
        userId: 9,
      });
      expect(httpService.post).not.toHaveBeenCalled();
    });
  });

  describe('getAuthDetails', () => {
    it('should return mapped auth details when the user is found', async () => {
      const rawResult = {
        id: 3,
        githubId: 'johndoe',
        students: [{ id: 10, courseId: 100, isExpelled: false }],
        mentors: [{ id: 20, courseId: 200 }],
        courseUsers: [{ id: 30 }],
      };
      mockQueryBuilder.getRawOne.mockResolvedValue(rawResult);

      const result = await service.getAuthDetails('johndoe');

      expect(result).toEqual(rawResult);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ githubId: 'johndoe' });
    });

    it('should default students, mentors and courseUsers to empty arrays when null', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue({
        id: 4,
        githubId: 'janedoe',
        students: null,
        mentors: null,
        courseUsers: null,
      });

      const result = await service.getAuthDetails('janedoe');

      expect(result).toEqual({
        id: 4,
        githubId: 'janedoe',
        students: [],
        mentors: [],
        courseUsers: [],
      });
    });

    it('should throw NotFoundException when the user is not found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      await expect(service.getAuthDetails('ghost')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('clearAuthUserSessionCache', () => {
    it('should delete the cached auth-user entry for the given user id', async () => {
      cacheManager.del.mockResolvedValue(true as never);

      await service.clearAuthUserSessionCache(123);

      expect(cacheManager.del).toHaveBeenCalledWith('auth-user-123');
    });
  });
});

import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { Course } from '@entities/course';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { User } from '@entities/user';
import { Certificate } from '@entities/certificate';
import { ProfilePermissions } from '@entities/profilePermissions';
import { Resume } from '@entities/resume';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { AuthUser } from 'src/auth';
import { ProfileService } from './profile.service';

// Fluent update query-builder mock that resolves to a configurable UpdateResult.
function createUpdateQb(executeResult: unknown = { raw: [{}] }) {
  const qb = {
    update: vi.fn(),
    set: vi.fn(),
    returning: vi.fn(),
    where: vi.fn(),
    execute: vi.fn().mockResolvedValue(executeResult),
  };
  qb.update.mockReturnValue(qb);
  qb.set.mockReturnValue(qb);
  qb.returning.mockReturnValue(qb);
  qb.where.mockReturnValue(qb);
  return qb;
}

const mockUser = {
  id: 11,
  githubId: 'john-doe',
  firstName: 'John',
  lastName: 'Doe',
  students: [{ id: 100 }, { id: 200 }],
} as Partial<User> as User;

describe('ProfileService', () => {
  let service: ProfileService;
  let courseRepository: Mocked<{ find: ReturnType<typeof vi.fn> }>;
  let notificationConnectionsRepository: Mocked<{
    delete: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  }>;
  let userRepository: Mocked<{
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneOrFail: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  }>;
  let certificateRepository: Mocked<{ delete: ReturnType<typeof vi.fn> }>;
  let resumeRepository: Mocked<{ findOne: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> }>;
  let profilePermissionsRepository: Mocked<{ findOne: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> }>;
  let userNotificationsService: Mocked<{ sendEmailConfirmation: ReturnType<typeof vi.fn> }>;

  beforeEach(async () => {
    courseRepository = { find: vi.fn() };
    notificationConnectionsRepository = { delete: vi.fn(), findOne: vi.fn(), save: vi.fn() };
    userRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
    };
    certificateRepository = { delete: vi.fn() };
    resumeRepository = { findOne: vi.fn(), delete: vi.fn() };
    profilePermissionsRepository = { findOne: vi.fn(), save: vi.fn() };
    userNotificationsService = { sendEmailConfirmation: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Course), useValue: courseRepository },
        { provide: getRepositoryToken(NotificationUserConnection), useValue: notificationConnectionsRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Certificate), useValue: certificateRepository },
        { provide: getRepositoryToken(Resume), useValue: resumeRepository },
        { provide: getRepositoryToken(ProfilePermissions), useValue: profilePermissionsRepository },
        { provide: UserNotificationsService, useValue: userNotificationsService },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCourses', () => {
    it('loads courses for every course id on the auth user ordered by start date desc', async () => {
      const courses = [{ id: 1 }, { id: 2 }];
      courseRepository.find.mockResolvedValue(courses);
      const authUser = { courses: { 1: {}, 2: {} } } as unknown as AuthUser;

      const result = await service.getCourses(authUser);

      expect(courseRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          cache: 120 * 1000,
          order: { startDate: 'DESC' },
          relations: ['discipline'],
        }),
      );
      expect(result).toBe(courses);
    });

    it('queries with an empty id list when the auth user has no courses', async () => {
      courseRepository.find.mockResolvedValue([]);
      const authUser = { courses: {} } as unknown as AuthUser;

      const result = await service.getCourses(authUser);

      expect(result).toEqual([]);
      expect(courseRepository.find).toHaveBeenCalled();
    });
  });

  describe('getMyProfile', () => {
    it('returns the user looked up by githubId', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getMyProfile('john-doe');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { githubId: 'john-doe' } });
      expect(result).toBe(mockUser);
    });
  });

  describe('updateUser', () => {
    it('updates the user record scoped by id', async () => {
      const qb = createUpdateQb();
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateUser(11, { firstName: 'Johnny', primaryEmail: 'new@example.com' });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Johnny', primaryEmail: 'new@example.com' }),
      );
      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: 11 });
      expect(qb.execute).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('saves permission settings (reusing an existing record id) when permissions changed', async () => {
      profilePermissionsRepository.findOne.mockResolvedValue({ id: 99 });

      await service.updateProfile(11, {
        isPermissionsSettingsChanged: true,
        isProfileSettingsChanged: false,
        permissionsSettings: { isProfileVisible: { all: true } },
      } as never);

      expect(profilePermissionsRepository.findOne).toHaveBeenCalledWith({ where: { userId: 11 } });
      expect(profilePermissionsRepository.save).toHaveBeenCalledWith({
        id: 99,
        userId: 11,
        isProfileVisible: { all: true },
      });
    });

    it('saves permission settings with undefined id when no record exists yet', async () => {
      profilePermissionsRepository.findOne.mockResolvedValue(null);

      await service.updateProfile(11, {
        isPermissionsSettingsChanged: true,
        isProfileSettingsChanged: false,
        permissionsSettings: {},
      } as never);

      expect(profilePermissionsRepository.save).toHaveBeenCalledWith({ id: undefined, userId: 11 });
    });

    it('updates the user, splitting the name and applying defaults for empty fields', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfile(11, {
        isPermissionsSettingsChanged: false,
        isProfileSettingsChanged: true,
        generalInfo: { name: 'John Doe', location: {}, educationHistory: null },
        contacts: {},
        discord: null,
      } as never);

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          educationHistory: [],
          englishLevel: 'a0',
          aboutMyself: '',
          contactsEmail: '',
        }),
      );
      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: 11 });
    });

    it('defaults lastName to empty string when the name has no space', async () => {
      const qb = createUpdateQb({ raw: [{}] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfile(11, {
        isPermissionsSettingsChanged: false,
        isProfileSettingsChanged: true,
        generalInfo: { name: 'Cher', location: {} },
        contacts: {},
        discord: null,
      } as never);

      expect(qb.set).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Cher', lastName: '' }));
    });

    it('throws BadRequestException for an invalid contact email', async () => {
      await expect(
        service.updateProfile(11, {
          isPermissionsSettingsChanged: false,
          isProfileSettingsChanged: true,
          generalInfo: { name: 'John Doe', location: {} },
          contacts: { email: 'not-an-email' },
          discord: null,
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(userRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('throws BadRequestException for an invalid epam email', async () => {
      await expect(
        service.updateProfile(11, {
          isPermissionsSettingsChanged: false,
          isProfileSettingsChanged: true,
          generalInfo: { name: 'John Doe', location: {} },
          contacts: { email: 'good@example.com', epamEmail: 'bad' },
          discord: null,
        } as never),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('does nothing when neither permissions nor profile settings changed', async () => {
      await service.updateProfile(11, {
        isPermissionsSettingsChanged: false,
        isProfileSettingsChanged: false,
      } as never);

      expect(profilePermissionsRepository.save).not.toHaveBeenCalled();
      expect(userRepository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('updateProfileFlat', () => {
    it('throws BadRequestException for an invalid contact email', async () => {
      await expect(service.updateProfileFlat(11, { contactsEmail: 'nope' } as never)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('throws BadRequestException for an invalid epam email', async () => {
      await expect(service.updateProfileFlat(11, { contactsEpamEmail: 'nope' } as never)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('omits undefined fields and splits the name when provided', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfileFlat(11, {
        name: 'John Doe',
        aboutMyself: 'hi',
        contactsEmail: 'good@example.com',
      } as never);

      const setArg = qb.set.mock.calls[0][0];
      expect(setArg).toMatchObject({ firstName: 'John', lastName: 'Doe', aboutMyself: 'hi' });
      // undefined fields removed by omitBy(isUndefined)
      expect(setArg).not.toHaveProperty('contactsPhone');
      expect(qb.where).toHaveBeenCalledWith('id = :id', { id: 11 });
    });

    it('leaves lastName undefined when no name is provided', async () => {
      const qb = createUpdateQb({ raw: [{}] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfileFlat(11, { aboutMyself: 'hi' } as never);

      const setArg = qb.set.mock.calls[0][0];
      expect(setArg).not.toHaveProperty('firstName');
      expect(setArg).not.toHaveProperty('lastName');
    });

    it('defaults lastName to empty string when the name has a first name but no last name', async () => {
      const qb = createUpdateQb({ raw: [{}] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfileFlat(11, { name: 'Cher' } as never);

      expect(qb.set.mock.calls[0][0]).toMatchObject({ firstName: 'Cher', lastName: '' });
    });
  });

  describe('email/discord notification channels (via updateProfileFlat)', () => {
    it('deletes the email channel when the new email is empty', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      expect(notificationConnectionsRepository.delete).toHaveBeenCalledWith({ channelId: 'email', userId: 11 });
    });

    it('sends a confirmation and saves a disabled connection when the email is new', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: 'fresh@example.com', discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);
      notificationConnectionsRepository.findOne.mockResolvedValue(null);

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      expect(userNotificationsService.sendEmailConfirmation).toHaveBeenCalledWith(11, false);
      expect(notificationConnectionsRepository.save).toHaveBeenCalledWith({
        channelId: 'email',
        userId: 11,
        externalId: 'fresh@example.com',
        enabled: false,
      });
    });

    it('keeps the connection enabled and skips confirmation when the email is unchanged and confirmed', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: 'same@example.com', discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);
      notificationConnectionsRepository.findOne.mockResolvedValue({
        externalId: 'same@example.com',
        enabled: true,
      });

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      expect(userNotificationsService.sendEmailConfirmation).not.toHaveBeenCalled();
      expect(notificationConnectionsRepository.save).toHaveBeenCalledWith({
        channelId: 'email',
        userId: 11,
        externalId: 'same@example.com',
        enabled: true,
      });
    });

    it('deletes the discord channel when there is no new discord value', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: null }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      expect(notificationConnectionsRepository.delete).toHaveBeenCalledWith({ channelId: 'discord', userId: 11 });
    });

    it('creates a discord connection when the discord id differs from the stored one', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: { id: 555 } }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);
      // first findOne is for email (null email -> delete, no findOne), discord findOne returns existing different id
      notificationConnectionsRepository.findOne.mockResolvedValue({ externalId: '111' });

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      expect(notificationConnectionsRepository.save).toHaveBeenCalledWith({
        channelId: 'discord',
        userId: 11,
        externalId: '555',
        enabled: true,
      });
    });

    it('does not re-create the discord connection when the id already matches', async () => {
      const qb = createUpdateQb({ raw: [{ contactsEmail: null, discord: { id: 555 } }] });
      userRepository.createQueryBuilder.mockReturnValue(qb);
      notificationConnectionsRepository.findOne.mockResolvedValue({ externalId: '555' });

      await service.updateProfileFlat(11, { aboutMyself: 'x' } as never);

      const discordSaves = notificationConnectionsRepository.save.mock.calls.filter(
        ([arg]) => arg.channelId === 'discord',
      );
      expect(discordSaves).toHaveLength(0);
    });
  });

  describe('getProfile', () => {
    it('returns the named resume when one exists', async () => {
      userRepository.findOneOrFail.mockResolvedValue({ id: 11 });
      const resume = { id: 5, name: 'CV' };
      resumeRepository.findOne.mockResolvedValue(resume);

      const result = await service.getProfile('john-doe');

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({ where: { githubId: 'john-doe' } });
      expect(result).toEqual({ resume });
    });

    it('returns a null resume when none exists', async () => {
      userRepository.findOneOrFail.mockResolvedValue({ id: 11 });
      resumeRepository.findOne.mockResolvedValue(null);

      const result = await service.getProfile('john-doe');

      expect(result).toEqual({ resume: null });
    });

    it('propagates the rejection when the user is not found', async () => {
      const err = new Error('not found');
      userRepository.findOneOrFail.mockRejectedValue(err);

      await expect(service.getProfile('ghost')).rejects.toBe(err);
    });
  });

  describe('getPersonalProfile', () => {
    it('returns the user with the students relation', async () => {
      userRepository.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.getPersonalProfile('john-doe');

      expect(userRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { githubId: 'john-doe' },
        relations: ['students'],
      });
      expect(result).toBe(mockUser);
    });
  });

  describe('obfuscateProfile', () => {
    it('scrubs the user, deletes connections/resumes and removes certificates per student', async () => {
      userRepository.findOneOrFail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({});

      await service.obfuscateProfile('john-doe');

      expect(userRepository.update).toHaveBeenCalledWith(
        11,
        expect.objectContaining({
          obfuscated: true,
          firstName: 'Removed',
          lastName: 'Removed',
          aboutMyself: null,
          languages: [],
        }),
      );
      // anonymised githubId is generated with a gdpr- prefix
      const updatePayload = userRepository.update.mock.calls[0][1];
      expect(updatePayload.githubId).toMatch(/^gdpr-[a-z0-9_-]+$/);
      expect(notificationConnectionsRepository.delete).toHaveBeenCalledWith({ userId: 11 });
      expect(resumeRepository.delete).toHaveBeenCalledWith({ userId: 11 });
      expect(certificateRepository.delete).toHaveBeenCalledWith({ studentId: 100 });
      expect(certificateRepository.delete).toHaveBeenCalledWith({ studentId: 200 });
    });

    it('skips certificate deletion when the user has no students', async () => {
      userRepository.findOneOrFail.mockResolvedValue({ id: 12, students: undefined });
      userRepository.update.mockResolvedValue({});

      await service.obfuscateProfile('john-doe');

      expect(certificateRepository.delete).not.toHaveBeenCalled();
    });

    it('propagates the rejection when the user is not found', async () => {
      const err = new Error('not found');
      userRepository.findOneOrFail.mockRejectedValue(err);

      await expect(service.obfuscateProfile('ghost')).rejects.toBe(err);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
  });
});

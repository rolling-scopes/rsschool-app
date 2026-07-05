import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { User } from '@entities/user';
import { Certificate } from '@entities/certificate';
import { ProfilePermissions } from '@entities/profilePermissions';
import { Resume } from '@entities/resume';
import { UserNotificationsService } from 'src/users-notifications/users.notifications.service';
import { ProfileService } from './profile.service';

// Fixtures mirrored from server/src/routes/profile/__test__/me.test.ts to prove business-logic equivalence
const mockUser = {
  id: 11,
  githubId: 'john-doe',
  firstName: 'John',
  lastName: 'Doe',
  primaryEmail: 'john@example.com',
  cityName: 'Warsaw',
  countryName: 'Poland',
  createdDate: '2020-01-01',
  updatedDate: '2025-01-01',
};

const userRepository = {
  findOne: vi.fn(),
  createQueryBuilder: vi.fn(),
};

describe('profile me', () => {
  let service: ProfileService;

  beforeEach(async () => {
    userRepository.findOne.mockReset();
    userRepository.createQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Course), useValue: {} },
        { provide: getRepositoryToken(NotificationUserConnection), useValue: {} },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Certificate), useValue: {} },
        { provide: getRepositoryToken(ProfilePermissions), useValue: {} },
        { provide: getRepositoryToken(Resume), useValue: {} },
        { provide: UserNotificationsService, useValue: {} },
      ],
    }).compile();

    service = module.get(ProfileService);
  });

  it('returns own user record looked up by session githubId', async () => {
    userRepository.findOne.mockResolvedValue(mockUser);

    const result = await service.getMyProfile('john-doe');

    expect(userRepository.findOne).toHaveBeenCalledWith({ where: { githubId: 'john-doe' } });
    expect(result).toBe(mockUser);
  });

  it('updateUser persists profile fields including primaryEmail as the legacy update did', async () => {
    const qb = {
      update: vi.fn(),
      set: vi.fn(),
      returning: vi.fn(),
      where: vi.fn(),
      execute: vi.fn().mockResolvedValue({}),
    };
    qb.update.mockReturnValue(qb);
    qb.set.mockReturnValue(qb);
    qb.returning.mockReturnValue(qb);
    qb.where.mockReturnValue(qb);
    userRepository.createQueryBuilder.mockReturnValue(qb);

    await service.updateUser(11, {
      firstName: 'Johnny',
      lastName: 'Doe',
      primaryEmail: 'new@example.com',
      cityName: 'Krakow',
      countryName: 'Poland',
    });

    expect(qb.set).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Johnny',
        lastName: 'Doe',
        primaryEmail: 'new@example.com',
        cityName: 'Krakow',
        countryName: 'Poland',
      }),
    );
    expect(qb.where).toHaveBeenCalledWith('id = :id', { id: 11 });
  });
});

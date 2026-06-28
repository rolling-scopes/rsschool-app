import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { User } from '@entities/user';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Module-scope fixtures
const mockUser = {
  id: 1,
  githubId: 'john-doe',
  firstName: 'John',
  lastName: 'Doe',
  primaryEmail: 'john@example.com',
} as Partial<User> as User;

type QueryBuilderMock = {
  where: ReturnType<typeof vi.fn>;
  orWhere: ReturnType<typeof vi.fn>;
  andWhere: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  limit: ReturnType<typeof vi.fn>;
  getMany: ReturnType<typeof vi.fn>;
  getRawMany: ReturnType<typeof vi.fn>;
};

const createQueryBuilderMock = (): QueryBuilderMock => {
  const qb: Partial<QueryBuilderMock> = {
    where: vi.fn(),
    orWhere: vi.fn(),
    andWhere: vi.fn(),
    select: vi.fn(),
    limit: vi.fn(),
    getMany: vi.fn(),
    getRawMany: vi.fn(),
  };
  qb.where!.mockReturnValue(qb);
  qb.orWhere!.mockReturnValue(qb);
  qb.andWhere!.mockReturnValue(qb);
  qb.select!.mockReturnValue(qb);
  qb.limit!.mockReturnValue(qb);
  return qb as QueryBuilderMock;
};

describe('UsersService (extended)', () => {
  let service: UsersService;
  let repo: Mocked<{
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findOneOrFail: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
  }>;

  beforeEach(async () => {
    const repoValue = {
      find: vi.fn(),
      findOne: vi.fn(),
      findOneOrFail: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      createQueryBuilder: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getRepositoryToken(User), useValue: repoValue }],
    }).compile();

    service = module.get(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  describe('getByGithubId', () => {
    it('lowercases the id and returns the first matched user', async () => {
      repo.find.mockResolvedValue([mockUser]);

      const result = await service.getByGithubId('John-Doe');

      expect(repo.find).toHaveBeenCalledWith({ where: { githubId: 'john-doe' } });
      expect(result).toBe(mockUser);
    });

    it('returns null when no user is found', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getByGithubId('Nobody');

      expect(repo.find).toHaveBeenCalledWith({ where: { githubId: 'nobody' } });
      expect(result).toBeNull();
    });
  });

  describe('getUserByProvider', () => {
    it('queries by provider and providerUserId with relations', async () => {
      repo.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserByProvider('github', '12345');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { provider: 'github', providerUserId: '12345' },
        relations: ['mentors', 'students', 'mentors.course', 'students.course', 'courseUsers', 'courseUsers.course'],
      });
      expect(result).toBe(mockUser);
    });
  });

  describe('saveUser', () => {
    it('delegates to the repository save', async () => {
      const partial = { githubId: 'john-doe' };
      repo.save.mockResolvedValue(mockUser);

      const result = await service.saveUser(partial);

      expect(repo.save).toHaveBeenCalledWith(partial);
      expect(result).toBe(mockUser);
    });
  });

  describe('updateUser', () => {
    it('delegates to the repository update with id and partial', async () => {
      repo.update.mockResolvedValue({} as never);

      await service.updateUser(1, { firstName: 'Jane' });

      expect(repo.update).toHaveBeenCalledWith(1, { firstName: 'Jane' });
    });
  });

  describe('getUserByUserId', () => {
    it('uses findOneOrFail by id', async () => {
      repo.findOneOrFail.mockResolvedValue(mockUser);

      const result = await service.getUserByUserId(1);

      expect(repo.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(mockUser);
    });
  });

  describe('getUsersByUserIds', () => {
    it('queries with an In clause on ids', async () => {
      repo.find.mockResolvedValue([mockUser]);

      const result = await service.getUsersByUserIds([1, 2, 3]);

      expect(repo.find).toHaveBeenCalledWith({ where: { id: In([1, 2, 3]) } });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('getFullName (static)', () => {
    it('joins trimmed first and last names', () => {
      expect(UsersService.getFullName({ firstName: ' John ', lastName: ' Doe ' })).toBe('John Doe');
    });

    it('returns only first name when last name is empty', () => {
      expect(UsersService.getFullName({ firstName: 'John', lastName: '' })).toBe('John');
    });

    it('returns only last name when first name is empty', () => {
      expect(UsersService.getFullName({ firstName: '', lastName: 'Doe' })).toBe('Doe');
    });

    it('returns an empty string when both are empty', () => {
      expect(UsersService.getFullName({ firstName: '', lastName: '' })).toBe('');
    });
  });

  describe('searchUsers', () => {
    it('returns an empty list when query is missing', async () => {
      const result = await service.searchUsers();

      expect(result).toEqual([]);
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('returns an empty list when query is an empty string', async () => {
      const result = await service.searchUsers('');

      expect(result).toEqual([]);
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('builds one bracket per search term and loads full users by ids', async () => {
      const qb = createQueryBuilderMock();
      qb.getRawMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      repo.createQueryBuilder.mockReturnValue(qb);
      repo.find.mockResolvedValue([mockUser]);

      const result = await service.searchUsers(' John Doe ');

      // 'John Doe%' split by space => two terms => two andWhere calls
      expect(qb.select).toHaveBeenCalledWith(['id']);
      expect(qb.limit).toHaveBeenCalledWith(20);
      expect(qb.andWhere).toHaveBeenCalledTimes(2);
      expect(repo.find).toHaveBeenCalledWith({
        where: { id: In([1, 2]) },
        relations: ['mentors', 'students', 'mentors.course', 'students.course', 'students.certificate'],
      });
      expect(result).toEqual([mockUser]);
    });

    it('returns an empty list and skips the second query when no ids match', async () => {
      const qb = createQueryBuilderMock();
      qb.getRawMany.mockResolvedValue([]);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.searchUsers('ghost');

      expect(result).toEqual([]);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('getPrimaryUserFields (static)', () => {
    it('uses the default "user" model name', () => {
      expect(UsersService.getPrimaryUserFields()).toEqual([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.githubId',
        'user.cityName',
        'user.countryName',
        'user.discord',
      ]);
    });

    it('prefixes with a custom model name', () => {
      expect(UsersService.getPrimaryUserFields('student')).toEqual([
        'student.id',
        'student.firstName',
        'student.lastName',
        'student.githubId',
        'student.cityName',
        'student.countryName',
        'student.discord',
      ]);
    });
  });

  describe('getUserContactsFields (static)', () => {
    it('uses the default "user" model name', () => {
      expect(UsersService.getUserContactsFields()).toEqual([
        'user.contactsEmail',
        'user.contactsTelegram',
        'user.contactsLinkedIn',
        'user.contactsSkype',
        'user.contactsPhone',
      ]);
    });

    it('prefixes with a custom model name', () => {
      expect(UsersService.getUserContactsFields('m')).toEqual([
        'm.contactsEmail',
        'm.contactsTelegram',
        'm.contactsLinkedIn',
        'm.contactsSkype',
        'm.contactsPhone',
      ]);
    });
  });
});

describe('UsersController.searchUsers', () => {
  const mockSearchUsers = vi.fn();
  let controller: UsersController;

  const adminReq = { user: { isAdmin: true, isHirer: false } } as never;
  const hirerReq = { user: { isAdmin: false, isHirer: true } } as never;
  const plainReq = { user: { isAdmin: false, isHirer: false } } as never;

  const fullUser = {
    id: 1,
    githubId: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    primaryEmail: 'john@example.com',
    cityName: 'Minsk',
    countryName: 'Belarus',
    discord: null,
    contactsEmail: 'john@contact.com',
    students: [],
    mentors: [],
  } as Partial<User> as User;

  beforeEach(async () => {
    mockSearchUsers.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { searchUsers: mockSearchUsers } }],
    }).compile();

    controller = module.get(UsersController);
  });

  it('delegates the query to the service', async () => {
    mockSearchUsers.mockResolvedValue([]);

    await controller.searchUsers(plainReq, 'john');

    expect(mockSearchUsers).toHaveBeenCalledWith('john');
  });

  it('passes elevated visibility (true) for admins, exposing contacts', async () => {
    mockSearchUsers.mockResolvedValue([fullUser]);

    const result = await controller.searchUsers(adminReq, 'john');

    // Admin visibility => UserSearchDto exposes the real contact/city fields
    expect(result).toHaveLength(1);
    expect(result[0].contactsEmail).toBe('john@contact.com');
    expect(result[0].primaryEmail).toBe('john@example.com');
    expect(result[0].cityName).toBe('Minsk');
  });

  it('passes elevated visibility (true) for hirers, exposing contacts', async () => {
    mockSearchUsers.mockResolvedValue([fullUser]);

    const result = await controller.searchUsers(hirerReq, 'john');

    expect(result).toHaveLength(1);
    expect(result[0].contactsEmail).toBe('john@contact.com');
  });

  it('passes restricted visibility (false) for regular users, masking contacts', async () => {
    mockSearchUsers.mockResolvedValue([fullUser]);

    const result = await controller.searchUsers(plainReq, 'john');

    expect(result).toHaveLength(1);
    expect(result[0].contactsEmail).toBeNull();
    expect(result[0].primaryEmail).toBeNull();
    expect(result[0].cityName).toBeNull();
  });

  it('maps an empty result list to an empty array', async () => {
    mockSearchUsers.mockResolvedValue([]);

    const result = await controller.searchUsers(adminReq, 'nobody');

    expect(result).toEqual([]);
  });
});

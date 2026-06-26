import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mocked } from 'vitest';
import { User } from '@entities/user';
import { UserGroup } from '@entities/userGroup';
import { UsersService } from 'src/users/users.service';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto';

const mockId = 1;

const makeUser = (id: number, githubId: string, firstName: string, lastName: string): User =>
  ({ id, githubId, firstName, lastName }) as Partial<User> as User;

const userA = makeUser(10, 'github-a', 'Anna', 'Apple');
const userB = makeUser(20, 'github-b', 'Bob', 'Berry');

const makeGroup = (id: number, name: string, users: number[]): UserGroup =>
  ({ id, name, users, roles: [] }) as Partial<UserGroup> as UserGroup;

describe('UserGroupsService', () => {
  let service: UserGroupsService;
  let repository: Mocked<Repository<UserGroup>>;
  let usersService: Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserGroupsService,
        {
          provide: getRepositoryToken(UserGroup),
          useValue: {
            find: vi.fn(),
            create: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            findOneByOrFail: vi.fn(),
            delete: vi.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUsersByUserIds: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserGroupsService>(UserGroupsService);
    repository = module.get(getRepositoryToken(UserGroup));
    usersService = module.get(UsersService);
  });

  describe('getAll', () => {
    it('should collect distinct user ids across groups, format and sort groups by name', async () => {
      const groupZ = makeGroup(1, 'Zebra', [10, 20]);
      const groupA = makeGroup(2, 'Alpha', [10, 10]); // duplicate user within a group
      repository.find.mockResolvedValue([groupZ, groupA]);
      usersService.getUsersByUserIds.mockResolvedValue([userA, userB]);

      const result = await service.getAll();

      // distinct ids only, preserving discovery order
      expect(usersService.getUsersByUserIds).toHaveBeenCalledWith([10, 20]);
      // sorted alphabetically: Alpha before Zebra
      expect(result.map(g => g.name)).toEqual(['Alpha', 'Zebra']);
      expect(result[0].users).toEqual([
        { id: 10, githubId: 'github-a', name: 'Anna Apple' },
        { id: 10, githubId: 'github-a', name: 'Anna Apple' },
      ]);
      expect(result[1].users).toEqual([
        { id: 10, githubId: 'github-a', name: 'Anna Apple' },
        { id: 20, githubId: 'github-b', name: 'Bob Berry' },
      ]);
    });

    it('should substitute an UNKNOWN placeholder for users that cannot be resolved', async () => {
      const group = makeGroup(1, 'Group', [99]);
      repository.find.mockResolvedValue([group]);
      usersService.getUsersByUserIds.mockResolvedValue([]);

      const result = await service.getAll();

      expect(result[0].users).toEqual([{ id: -1, githubId: 'UNKNOWN', name: '' }]);
    });

    it('should handle groups with no users', async () => {
      const group = makeGroup(1, 'Empty', []);
      repository.find.mockResolvedValue([group]);
      usersService.getUsersByUserIds.mockResolvedValue([]);

      const result = await service.getAll();

      expect(usersService.getUsersByUserIds).toHaveBeenCalledWith([]);
      expect(result[0].users).toEqual([]);
    });

    it('should join only the non-empty parts of the user name', async () => {
      const onlyFirst = makeUser(30, 'github-c', 'Cleo', '');
      const group = makeGroup(1, 'Group', [30]);
      repository.find.mockResolvedValue([group]);
      usersService.getUsersByUserIds.mockResolvedValue([onlyFirst]);

      const result = await service.getAll();

      expect(result[0].users).toEqual([{ id: 30, githubId: 'github-c', name: 'Cleo' }]);
    });
  });

  describe('create', () => {
    it('should create, save and format the new group', async () => {
      const dto = { name: 'New', users: [10], roles: [] } as CreateUserGroupDto;
      const created = makeGroup(5, 'New', [10]);
      repository.create.mockReturnValue(created);
      repository.save.mockResolvedValue(created);
      usersService.getUsersByUserIds.mockResolvedValue([userA]);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(created);
      expect(usersService.getUsersByUserIds).toHaveBeenCalledWith([10]);
      expect(result).toEqual({
        id: 5,
        name: 'New',
        roles: [],
        users: [{ id: 10, githubId: 'github-a', name: 'Anna Apple' }],
      });
    });
  });

  describe('update', () => {
    it('should update, reload and format the group', async () => {
      const dto = { name: 'Updated', users: [20], roles: [] } as UpdateUserGroupDto;
      const reloaded = makeGroup(mockId, 'Updated', [20]);
      repository.findOneByOrFail.mockResolvedValue(reloaded);
      usersService.getUsersByUserIds.mockResolvedValue([userB]);

      const result = await service.update(mockId, dto);

      expect(repository.update).toHaveBeenCalledWith(mockId, dto);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: mockId });
      expect(usersService.getUsersByUserIds).toHaveBeenCalledWith([20]);
      expect(result).toEqual({
        id: mockId,
        name: 'Updated',
        roles: [],
        users: [{ id: 20, githubId: 'github-b', name: 'Bob Berry' }],
      });
    });
  });

  describe('delete', () => {
    it('should hard-delete the group by id', async () => {
      await service.delete(mockId);

      expect(repository.delete).toHaveBeenCalledWith(mockId);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@entities/user';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Fixtures mirrored from server/src/routes/users/__test__/search.test.ts to prove business-logic equivalence
const mockUsers = [
  {
    id: 1,
    githubId: 'john-doe',
    firstName: 'John',
    lastName: 'Doe',
    primaryEmail: 'john@example.com',
    discord: { id: '100', username: 'john', discriminator: '1234' },
  },
  {
    id: 2,
    githubId: 'no-name',
    firstName: null,
    lastName: null,
    primaryEmail: 'secret@example.com',
    discord: null,
  },
] as unknown as User[];

const createQueryBuilderMock = (result: User[]) => {
  const qb = {
    where: vi.fn(),
    orWhere: vi.fn(),
    limit: vi.fn(),
    getMany: vi.fn().mockResolvedValue(result),
  };
  qb.where.mockReturnValue(qb);
  qb.orWhere.mockReturnValue(qb);
  qb.limit.mockReturnValue(qb);
  return qb;
};

describe('users search basic', () => {
  let service: UsersService;
  let controller: UsersController;
  const mockCreateQueryBuilder = vi.fn();

  beforeEach(async () => {
    mockCreateQueryBuilder.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: { createQueryBuilder: mockCreateQueryBuilder },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    controller = module.get(UsersController);
  });

  describe('UsersService.searchUsersBasic query contract', () => {
    it('searches by githubId (case-sensitive like), name (ilike, incl. full name) and discord username, prefix-based, limited to 20', async () => {
      const qb = createQueryBuilderMock(mockUsers);
      mockCreateQueryBuilder.mockReturnValue(qb);

      await service.searchUsersBasic('JoH');

      expect(mockCreateQueryBuilder).toHaveBeenCalledWith('user');
      expect(qb.where).toHaveBeenCalledWith(
        "user.githubId like :text OR user.firstName ilike :text OR user.lastName ilike :text OR CONCAT(user.firstName, ' ', user.lastName) ilike :text",
        { text: 'joh%' },
      );
      expect(qb.orWhere).toHaveBeenCalledWith(`CAST(user.discord AS jsonb)->>'username' ILIKE :search`, {
        search: 'JoH%',
      });
      expect(qb.limit).toHaveBeenCalledWith(20);
    });

    it('returns an empty list without querying when search text is empty', async () => {
      const result = await service.searchUsersBasic('');

      expect(mockCreateQueryBuilder).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('UsersController.searchUsersBasic response shape', () => {
    it('returns users limited to id, githubId, built name and discord tag, identical to the legacy response', async () => {
      const qb = createQueryBuilderMock(mockUsers);
      mockCreateQueryBuilder.mockReturnValue(qb);

      const result = await controller.searchUsersBasic('jo');

      // Same data as the legacy response; `discord` is null instead of legacy undefined (omitted in JSON)
      expect(result).toEqual([
        { id: 1, githubId: 'john-doe', name: 'John Doe', discord: 'john#1234' },
        { id: 2, githubId: 'no-name', name: '', discord: null },
      ]);
      expect(result[0]).not.toHaveProperty('primaryEmail');
    });
  });
});

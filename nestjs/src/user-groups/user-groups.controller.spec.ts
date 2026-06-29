import { Test, TestingModule } from '@nestjs/testing';
import { UserGroupsController } from './user-groups.controller';
import { UserGroupsService } from './user-groups.service';
import { CreateUserGroupDto, UpdateUserGroupDto } from './dto';
import { UserGroupDto } from './dto/user-group.dto';

const mockId = 1;

const mockUserGroup = {
  id: mockId,
  name: 'Group',
  roles: [],
  users: [{ id: 10, githubId: 'github-a', name: 'Anna Apple' }],
} as unknown as UserGroupDto;

const mockCreate = vi.fn(() => Promise.resolve(mockUserGroup));
const mockGetAll = vi.fn(() => Promise.resolve([mockUserGroup, mockUserGroup]));
const mockUpdate = vi.fn(() => Promise.resolve(mockUserGroup));
const mockDelete = vi.fn(() => Promise.resolve());

const mockUserGroupsServiceFactory = vi.fn(() => ({
  create: mockCreate,
  getAll: mockGetAll,
  update: mockUpdate,
  delete: mockDelete,
}));

describe('UserGroupsController', () => {
  let controller: UserGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserGroupsController],
      providers: [{ provide: UserGroupsService, useFactory: mockUserGroupsServiceFactory }],
    }).compile();

    controller = module.get<UserGroupsController>(UserGroupsController);
  });

  describe('create', () => {
    it('should create a user group and wrap it in a UserGroupDto', async () => {
      const dto = new CreateUserGroupDto();

      const result = await controller.create(dto);

      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(new UserGroupDto(mockUserGroup));
    });
  });

  describe('getAll', () => {
    it('should get all user groups mapped to UserGroupDto', async () => {
      const result = await controller.getAll();

      expect(mockGetAll).toHaveBeenCalled();
      expect(result).toEqual([new UserGroupDto(mockUserGroup), new UserGroupDto(mockUserGroup)]);
    });
  });

  describe('update', () => {
    it('should update a user group and wrap it in a UserGroupDto', async () => {
      const dto = new UpdateUserGroupDto();

      const result = await controller.update(mockId, dto);

      expect(mockUpdate).toHaveBeenCalledWith(mockId, dto);
      expect(result).toEqual(new UserGroupDto(mockUserGroup));
    });
  });

  describe('delete', () => {
    it('should delete a user group by id', async () => {
      await controller.delete(mockId);

      expect(mockDelete).toHaveBeenCalledWith(mockId);
    });
  });
});

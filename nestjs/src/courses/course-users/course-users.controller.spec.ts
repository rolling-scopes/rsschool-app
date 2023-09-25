import { Test, TestingModule } from '@nestjs/testing';
import { CourseUsersController } from './course-users.controller';
import { CourseUsersService } from './course-users.service';
import { BadRequestException } from '@nestjs/common';
import { ExtendedCourseUser } from './types';
import { omit } from 'lodash';
import { UsersService } from 'src/users/users.service';

const mockUserId = 111;
const mockCourseId = 333;
const mockGithubId = 'john-doe';

const mockCourseUser = {
  id: mockUserId,
  courseId: mockCourseId,
  userId: mockUserId,
  isManager: false,
  isSupervisor: true,
  isJuryActivist: false,
  isDementor: true,
  isActivist: false,
  githubId: mockGithubId,
  name: 'Foo Bar',
} as ExtendedCourseUser;

const mockGetByUserId = jest.fn();
const mockGetCourseUsersByCourseId = jest.fn();
const mockGetUsersToUpdateAndToInsert = jest.fn();
const mockSaveCourseUsers = jest.fn();
const mockUpdateCourseUser = jest.fn();
const mockUpdateCourseUsersRoles = jest.fn();

const mockCourseUsersServiceFactory = jest.fn(() => ({
  getByUserId: mockGetByUserId,
  getCourseUsersByCourseId: mockGetCourseUsersByCourseId,
  getUsersToUpdateAndToInsert: mockGetUsersToUpdateAndToInsert,
  saveCourseUsers: mockSaveCourseUsers,
  updateCourseUser: mockUpdateCourseUser,
  updateCourseUsersRoles: mockUpdateCourseUsersRoles,
}));

const mockGetByGithubId = jest.fn();

const mockUsersServiceFactory = jest.fn(() => ({
  getByGithubId: mockGetByGithubId,
}));

describe('CourseUsersController', () => {
  let controller: CourseUsersController;
  let mockCourseUsersService: CourseUsersService;
  let mockUsersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseUsersController],
      providers: [
        { provide: CourseUsersService, useFactory: mockCourseUsersServiceFactory },
        { provide: UsersService, useFactory: mockUsersServiceFactory },
      ],
    }).compile();

    controller = module.get<CourseUsersController>(CourseUsersController);
    mockCourseUsersService = module.get<CourseUsersService>(CourseUsersService);
    mockUsersService = module.get<UsersService>(UsersService);
  });

  describe('getUsers', () => {
    it('should get users from service and map it to dto', async () => {
      mockGetCourseUsersByCourseId.mockResolvedValueOnce([mockCourseUser]);
      const expected = omit(mockCourseUser, ['userId']);

      const result = await controller.getUsers(mockCourseId);

      expect(mockCourseUsersService.getCourseUsersByCourseId).toHaveBeenCalledWith(mockCourseId);
      expect(result).toMatchObject([expected]);
    });
  });

  describe('putUser', () => {
    it('should update user roles and update course user if user exists', async () => {
      mockGetByGithubId.mockResolvedValueOnce({ id: mockUserId });
      mockGetByUserId.mockResolvedValueOnce({ id: mockUserId });

      await controller.putUser(mockCourseId, mockGithubId, mockCourseUser);

      const { isManager, isDementor, isSupervisor, isActivist } = mockCourseUser;

      expect(mockUsersService.getByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(mockCourseUsersService.getByUserId).toHaveBeenCalledWith(mockUserId, mockCourseId);
      expect(mockCourseUsersService.updateCourseUser).toHaveBeenCalledWith(mockUserId, {
        isDementor,
        isManager,
        isSupervisor,
        isActivist,
      });
      expect(mockCourseUsersService.saveCourseUsers).not.toHaveBeenCalled();
    });

    it('should create course user if user does not exist', async () => {
      mockGetByGithubId.mockResolvedValueOnce({ id: mockUserId });
      mockGetByUserId.mockResolvedValueOnce(null);

      await controller.putUser(mockCourseId, mockGithubId, mockCourseUser);

      const { isManager, isDementor, isSupervisor, isActivist } = mockCourseUser;

      expect(mockUsersService.getByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(mockCourseUsersService.getByUserId).toHaveBeenCalledWith(mockUserId, mockCourseId);
      expect(mockCourseUsersService.saveCourseUsers).toHaveBeenCalledWith({
        courseId: mockCourseId,
        userId: mockUserId,
        isDementor,
        isManager,
        isSupervisor,
        isActivist,
      });
      expect(mockCourseUsersService.updateCourseUser).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if user does not exist', async () => {
      mockGetByGithubId.mockResolvedValueOnce(null);

      await expect(() => controller.putUser(mockCourseId, mockGithubId, mockCourseUser)).rejects.toThrow(
        new BadRequestException(`User with githubid ${mockGithubId} is not found`),
      );

      expect(mockUsersService.getByGithubId).toHaveBeenCalledWith(mockGithubId);
      expect(mockCourseUsersService.getByUserId).not.toHaveBeenCalled();
      expect(mockCourseUsersService.saveCourseUsers).not.toHaveBeenCalled();
      expect(mockCourseUsersService.updateCourseUser).not.toHaveBeenCalled();
    });
  });

  describe('putUsers', () => {
    it('should process users and put them to update and insert', async () => {
      mockGetUsersToUpdateAndToInsert.mockResolvedValueOnce({
        usersToInsert: [mockCourseUser],
        usersToUpdate: [mockCourseUser],
      });

      await controller.putUsers(mockCourseId, [mockCourseUser, mockCourseUser]);

      expect(mockCourseUsersService.getUsersToUpdateAndToInsert).toHaveBeenCalledWith(
        [mockCourseUser, mockCourseUser],
        mockCourseId,
      );
      expect(mockCourseUsersService.saveCourseUsers).toHaveBeenCalledWith([mockCourseUser]);
      expect(mockCourseUsersService.updateCourseUsersRoles).toHaveBeenCalledWith([mockCourseUser]);
    });
  });
});

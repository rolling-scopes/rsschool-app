import { Test, TestingModule } from '@nestjs/testing';
import { CourseUsersController } from './course-users.controller';
import { CourseUsersService } from './course-users.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ExtendedCourseUser } from './types';
import { omit } from 'lodash';

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
  githubId: mockGithubId,
  name: 'Foo Bar',
} as ExtendedCourseUser;

const mockGetByUserId = jest.fn();
const mockGetByGithubId = jest.fn();
const mockGetCourseUsersByCourseId = jest.fn();
const mockGetUsersToUpdateAndToInsert = jest.fn();
const mockSaveCourseUsers = jest.fn();
const mockUpdateCourseUser = jest.fn();
const mockUpdateCourseUsersRoles = jest.fn();

const mockCourseUsersServiceFactory = jest.fn(() => ({
  getByUserId: mockGetByUserId,
  getByGithubId: mockGetByGithubId,
  getCourseUsersByCourseId: mockGetCourseUsersByCourseId,
  getUsersToUpdateAndToInsert: mockGetUsersToUpdateAndToInsert,
  saveCourseUsers: mockSaveCourseUsers,
  updateCourseUser: mockUpdateCourseUser,
  updateCourseUsersRoles: mockUpdateCourseUsersRoles,
}));

describe('CourseUsersController', () => {
  let controller: CourseUsersController;
  let mockService: CourseUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseUsersController],
      providers: [{ provide: CourseUsersService, useFactory: mockCourseUsersServiceFactory }],
    }).compile();

    controller = module.get<CourseUsersController>(CourseUsersController);
    mockService = module.get<CourseUsersService>(CourseUsersService);
  });

  describe('getUsers', () => {
    it('shouldd get users from service and map it to dto', async () => {
      mockGetCourseUsersByCourseId.mockResolvedValueOnce([mockCourseUser]);
      const expected = omit(mockCourseUser, ['userId']);

      const result = await controller.getUsers(mockCourseId);

      expect(mockService.getCourseUsersByCourseId).toHaveBeenCalledWith(mockCourseId);
      expect(result).toMatchObject([expected]);
    });

    it('shouldd throw NotFoundException if users not found', async () => {
      mockGetCourseUsersByCourseId.mockResolvedValueOnce([]);
      await expect(() => controller.getUsers(mockCourseId)).rejects.toThrow(
        new NotFoundException(`Users for course ${mockCourseId} are not found`),
      );

      expect(mockService.getCourseUsersByCourseId).toHaveBeenCalledWith(mockCourseId);
    });
  });

  describe('putUser', () => {
    it('shouldd update user roles and update course user if user exists', async () => {
      mockGetByGithubId.mockResolvedValueOnce({ id: mockUserId });
      mockGetByUserId.mockResolvedValueOnce(true);

      await controller.putUser(mockCourseId, mockGithubId, mockCourseUser);

      const { isManager, isDementor, isSupervisor } = mockCourseUser;

      expect(mockService.getByGithubId).toHaveBeenCalledWith(mockGithubId, mockCourseId);
      expect(mockService.getByUserId).toHaveBeenCalledWith(mockUserId, mockCourseId);
      expect(mockService.updateCourseUser).toHaveBeenCalledWith(mockUserId, { isDementor, isManager, isSupervisor });
      expect(mockService.saveCourseUsers).not.toHaveBeenCalled();
    });

    it('shouldd create course user if user does not exist', async () => {
      mockGetByGithubId.mockResolvedValueOnce({ id: mockUserId });
      mockGetByUserId.mockResolvedValueOnce(false);

      await controller.putUser(mockCourseId, mockGithubId, mockCourseUser);

      const { isManager, isDementor, isSupervisor } = mockCourseUser;

      expect(mockService.getByGithubId).toHaveBeenCalledWith(mockGithubId, mockCourseId);
      expect(mockService.getByUserId).toHaveBeenCalledWith(mockUserId, mockCourseId);
      expect(mockService.saveCourseUsers).toHaveBeenCalledWith({
        courseId: mockCourseId,
        userId: mockUserId,
        isDementor,
        isManager,
        isSupervisor,
      });
      expect(mockService.updateCourseUser).not.toHaveBeenCalled();
    });

    it('shouldd throw BadRequestException if user does not exist', async () => {
      mockGetByGithubId.mockResolvedValueOnce(null);
      mockGetByUserId.mockResolvedValueOnce(false);

      await expect(() => controller.putUser(mockCourseId, mockGithubId, mockCourseUser)).rejects.toThrow(
        new BadRequestException(`User with ${mockGithubId} is not found`),
      );

      expect(mockService.getByGithubId).toHaveBeenCalledWith(mockGithubId, mockCourseId);
      expect(mockService.getByUserId).not.toHaveBeenCalled();
      expect(mockService.saveCourseUsers).not.toHaveBeenCalled();
      expect(mockService.updateCourseUser).not.toHaveBeenCalled();
    });
  });

  describe('putUsers', () => {
    it('shouldd process users and put them to update and insert', async () => {
      mockGetUsersToUpdateAndToInsert.mockResolvedValueOnce({
        usersToInsert: [mockCourseUser],
        usersToUpdate: [mockCourseUser],
      });

      await controller.putUsers(mockCourseId, [mockCourseUser, mockCourseUser]);

      expect(mockService.getUsersToUpdateAndToInsert).toHaveBeenCalledWith(
        [mockCourseUser, mockCourseUser],
        mockCourseId,
      );
      expect(mockService.saveCourseUsers).toHaveBeenCalledWith([mockCourseUser]);
      expect(mockService.updateCourseUsersRoles).toHaveBeenCalledWith([mockCourseUser]);
    });
  });
});

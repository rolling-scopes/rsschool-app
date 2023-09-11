import { Test, TestingModule } from '@nestjs/testing';
import { CourseUsersService } from './course-users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseUser } from '@entities/courseUser';
import { In } from 'typeorm';

const mockUserId = 111;
const mockUserId2 = 112;
const mockUserId3 = 113;
const mockCourseUserId = 222;
const mockCourseId = 333;
const mockGithubId = 'john-doe';
const mockFullName = 'Foo Bar';

const mockCourseUser = {
  id: mockCourseUserId,
  courseId: mockCourseId,
  userId: mockUserId,
  isManager: false,
  isSupervisor: true,
  isJuryActivist: false,
  isDementor: true,
  isActivist: true,
  user: {
    id: mockUserId,
    firstName: ' Foo ',
    lastName: ' Bar ',
    githubId: mockGithubId,
  },
  course: {
    id: mockCourseId,
  },
} as CourseUser;

const mockUsersToInsert = [
  {
    userId: mockUserId3,
    isDementor: true,
    isManager: true,
    isSupervisor: true,
    isActivist: false,
  },
];
const mockUsersToUpdate = [
  {
    userId: mockUserId,
    isDementor: true,
    isManager: false,
    isSupervisor: true,
    isActivist: true,
  },
  {
    userId: mockUserId2,
    isDementor: true,
    isManager: true,
    isSupervisor: true,
    isActivist: false,
  },
];

const mockCourseUsersWithRoles = [...mockUsersToInsert, ...mockUsersToUpdate];

const mockFindResponse = [mockCourseUser, { ...mockCourseUser, userId: mockUserId2 }];
const mockFindOneResponse = mockCourseUser;
const mockInsertResponse = { a: 1 };
const mockUpdateResponse = { b: 2 };

const mockFind = jest.fn(() => Promise.resolve(mockFindResponse));
const mockFindOne = jest.fn(() => Promise.resolve(mockFindOneResponse));
const mockInsert = jest.fn(() => Promise.resolve(mockInsertResponse));
const mockUpdate = jest.fn(() => Promise.resolve(mockUpdateResponse));

const mockCourseUserRepositoryFactory = jest.fn(() => ({
  find: mockFind,
  findOne: mockFindOne,
  insert: mockInsert,
  update: mockUpdate,
}));

describe('CourseUsersService', () => {
  let service: CourseUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseUsersService,
        {
          provide: getRepositoryToken(CourseUser),
          useFactory: mockCourseUserRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<CourseUsersService>(CourseUsersService);
  });

  describe('getByUserId', () => {
    it('should find one user by userId and return it', async () => {
      const response = await service.getByUserId(mockUserId, mockCourseId);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { userId: mockUserId, courseId: mockCourseId },
      });
      expect(response).toBe(mockFindOneResponse);
    });
  });

  describe('getByGithubId', () => {
    it('should find one user by githubId and return it', async () => {
      const response = await service.getByGithubId(mockGithubId, mockCourseId);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { user: { githubId: mockGithubId }, courseId: mockCourseId },
      });
      expect(response).toBe(mockFindOneResponse);
    });
  });

  describe('getCourseUsersByCourseId', () => {
    it('should find users by course id and return it', async () => {
      const expectedResponse = mockFindResponse.map(({ user, course, ...rest }) => ({
        ...rest,
        name: mockFullName,
        githubId: user.githubId,
      }));

      const response = await service.getCourseUsersByCourseId(mockCourseId);

      expect(mockFind).toHaveBeenCalledWith({
        where: { courseId: mockCourseId },
        relations: ['user', 'course'],
      });
      expect(response).toStrictEqual(expectedResponse);
    });
  });

  describe('getUsersToUpdateAndToInsert', () => {
    it('should check existance of incoming users and correctly split them between upsert and update', async () => {
      const { usersToInsert, usersToUpdate } = await service.getUsersToUpdateAndToInsert(
        mockCourseUsersWithRoles,
        mockCourseId,
      );
      const mockUsersIds = mockCourseUsersWithRoles.map(({ userId }) => userId);

      expect(mockFind).toHaveBeenCalledWith({
        where: {
          courseId: mockCourseId,
          userId: In(mockUsersIds),
        },
      });

      expect(usersToInsert).toStrictEqual(mockUsersToInsert.map(user => ({ ...user, courseId: mockCourseId })));
      expect(usersToUpdate).toStrictEqual(
        mockFindResponse.map((user, index) => ({ ...user, ...mockUsersToUpdate[index] })),
      );
    });
  });

  describe('saveCourseUsers', () => {
    it('should save users data and return response', async () => {
      const response = await service.saveCourseUsers(mockCourseUser);
      expect(mockInsert).toHaveBeenCalledWith(mockCourseUser);
      expect(response).toBe(mockInsertResponse);
    });
  });

  describe('updateCourseUser', () => {
    it('should update user and return response', async () => {
      const response = await service.updateCourseUser(mockCourseUserId, mockCourseUser);
      expect(mockUpdate).toHaveBeenCalledWith(mockCourseUserId, mockCourseUser);
      expect(response).toBe(mockUpdateResponse);
    });
  });

  describe('updateCourseUsersRoles', () => {
    it('should update users roles', async () => {
      await service.updateCourseUsersRoles(mockFindResponse);
      expect(mockUpdate).toHaveBeenCalledTimes(mockFindResponse.length);
      mockFindResponse.forEach(({ userId, isManager, isSupervisor, isDementor }, idx) => {
        expect(mockUpdate).toHaveBeenNthCalledWith(idx + 1, { userId }, { isManager, isSupervisor, isDementor });
      });
    });
  });
});

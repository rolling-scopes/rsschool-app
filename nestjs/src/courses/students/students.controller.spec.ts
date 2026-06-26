import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

const mockStudentEntity = {
  id: 1,
  isExpelled: false,
  rank: 3,
  totalScore: 100,
  user: { githubId: 'jane-roe', firstName: 'Jane', lastName: 'Roe', cityName: 'Minsk', countryName: 'Belarus' },
};

const mockUserStudentsResult = {
  items: [],
  meta: { itemCount: 0, total: 0, current: 1, pageSize: 10, totalPages: 0 },
};

const mockStudentsService = {
  findUserStudents: vi.fn(),
  canAccessStudent: vi.fn(),
  getById: vi.fn(),
};

const createReq = (user: Record<string, unknown>) => ({ user }) as never;

describe('StudentsController', () => {
  let controller: StudentsController;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockStudentsService }],
    }).compile();

    controller = module.get(StudentsController);
  });

  describe('getUserStudents', () => {
    it('passes the query to the service and wraps the result in a UserStudentsDto', async () => {
      mockStudentsService.findUserStudents.mockResolvedValue(mockUserStudentsResult);
      const query = { current: 1, pageSize: 10 } as never;

      const result = await controller.getUserStudents(query);

      expect(mockStudentsService.findUserStudents).toHaveBeenCalledWith(query);
      expect(result).toMatchObject({ content: [] });
      expect(result.pagination).toMatchObject({ current: 1, total: 0 });
    });
  });

  describe('getOne', () => {
    it('returns a StudentDto when the user has access', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(true);
      mockStudentsService.getById.mockResolvedValue(mockStudentEntity);
      const req = createReq({ id: 5 });

      const result = await controller.getOne(1, req);

      expect(mockStudentsService.canAccessStudent).toHaveBeenCalledWith({ id: 5 }, 1);
      expect(mockStudentsService.getById).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({ id: 1, githubId: 'jane-roe', active: true, cityName: 'Minsk' });
    });

    it('throws ForbiddenException and never loads the student when access is denied', async () => {
      mockStudentsService.canAccessStudent.mockResolvedValue(false);

      await expect(controller.getOne(1, createReq({ id: 5 }))).rejects.toThrow(ForbiddenException);
      expect(mockStudentsService.getById).not.toHaveBeenCalled();
    });
  });
});

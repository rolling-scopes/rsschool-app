import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mocked } from 'vitest';
import { Repository, In } from 'typeorm';
import { Course } from '@entities/course';
import { CoursesService } from './courses.service';

const mockCourse = { id: 42, name: 'RS School' } as Course;

describe('CoursesService', () => {
  let service: CoursesService;
  let repository: Mocked<Repository<Course>>;

  beforeEach(async () => {
    const repoMock = {
      find: vi.fn(),
      findOneOrFail: vi.fn(),
      findOneByOrFail: vi.fn(),
      update: vi.fn(),
      save: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CoursesService, { provide: getRepositoryToken(Course), useValue: repoMock }],
    }).compile();

    service = module.get(CoursesService);
    repository = module.get(getRepositoryToken(Course));
  });

  describe('getAll', () => {
    it('returns all courses ordered by start date desc with discipline relation', async () => {
      repository.find.mockResolvedValue([mockCourse]);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalledWith({ order: { startDate: 'DESC' }, relations: ['discipline'] });
      expect(result).toEqual([mockCourse]);
    });
  });

  describe('getById', () => {
    it('fetches one course by id with discipline relation', async () => {
      repository.findOneOrFail.mockResolvedValue(mockCourse);

      const result = await service.getById(42);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 42 }, relations: ['discipline'] });
      expect(result).toBe(mockCourse);
    });
  });

  describe('update', () => {
    it('applies the update then returns the reloaded course', async () => {
      const dto = { name: 'New' } as never;
      repository.findOneByOrFail.mockResolvedValue(mockCourse);

      const result = await service.update(42, dto);

      expect(repository.update).toHaveBeenCalledWith(42, dto);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 42 });
      expect(result).toBe(mockCourse);
    });
  });

  describe('create', () => {
    it('saves the course then returns the reloaded course by the saved id', async () => {
      const dto = { name: 'New' } as never;
      repository.save.mockResolvedValue({ id: 42 } as Course);
      repository.findOneByOrFail.mockResolvedValue(mockCourse);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 42 });
      expect(result).toBe(mockCourse);
    });
  });

  describe('getByIds', () => {
    it('queries by an In(ids) clause without a filter', async () => {
      repository.find.mockResolvedValue([mockCourse]);

      const result = await service.getByIds([1, 2]);

      expect(repository.find).toHaveBeenCalledWith({ where: { id: In([1, 2]) } });
      expect(result).toEqual([mockCourse]);
    });

    it('merges the optional filter into the where clause', async () => {
      repository.find.mockResolvedValue([]);

      await service.getByIds([1], { completed: true });

      expect(repository.find).toHaveBeenCalledWith({ where: { id: In([1]), completed: true } });
    });
  });

  describe('getActiveCourses', () => {
    it('returns non-completed courses, passing through optional relations', async () => {
      repository.find.mockResolvedValue([mockCourse]);

      const result = await service.getActiveCourses(['students']);

      expect(repository.find).toHaveBeenCalledWith({ where: { completed: false }, relations: ['students'] });
      expect(result).toEqual([mockCourse]);
    });

    it('omits relations when none are provided', async () => {
      repository.find.mockResolvedValue([]);

      await service.getActiveCourses();

      expect(repository.find).toHaveBeenCalledWith({ where: { completed: false }, relations: undefined });
    });
  });
});

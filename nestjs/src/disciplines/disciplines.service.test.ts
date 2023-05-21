import { Test, TestingModule } from '@nestjs/testing';
import { FindOptionsWhere, In } from 'typeorm';
import { DisciplinesService } from './disciplines.service';
import { Discipline } from '@entities/discipline';
import { CreateDisciplineDto, UpdateDisciplineDto } from './dto';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockDiscipline = {
  foo: 'bar',
} as unknown as Discipline;

const mockFindResponse = [mockDiscipline, mockDiscipline];
const mockFindOneByResponse = mockDiscipline;
const mockSaveResponse = { id: 1 };
const mockSoftDeleteResponse = { a: 1 };

const mockId = 1;

const mockFind = jest.fn(() => Promise.resolve(mockFindResponse));
const mockFindOneBy = jest.fn(() => Promise.resolve(mockFindOneByResponse));
const mockFindOneByOrFail = jest.fn(() => Promise.resolve(mockFindOneByResponse));
const mockSave = jest.fn(() => Promise.resolve(mockSaveResponse));
const mockUpdate = jest.fn(() => Promise.resolve(mockSaveResponse));
const mockSoftDelete = jest.fn(() => Promise.resolve(mockSoftDeleteResponse));

const mockDisciplinesRepositoryFactory = jest.fn(() => ({
  find: mockFind,
  findOneBy: mockFindOneBy,
  findOneByOrFail: mockFindOneByOrFail,
  save: mockSave,
  update: mockUpdate,
  softDelete: mockSoftDelete,
}));
describe('DisciplinesService', () => {
  let service: DisciplinesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisciplinesService,
        {
          provide: getRepositoryToken(Discipline),
          useFactory: mockDisciplinesRepositoryFactory,
        },
      ],
    }).compile();

    service = module.get<DisciplinesService>(DisciplinesService);
  });

  describe('getAll', () => {
    it('should return all disciplines', async () => {
      const result = await service.getAll();

      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual(mockFindResponse);
    });
  });

  describe('getById', () => {
    it('should return a discipline by id', async () => {
      const result = await service.getById(mockId);

      expect(result).toEqual(mockFindOneByResponse);
      expect(mockFindOneBy).toHaveBeenCalledWith({ id: mockId });
    });
  });

  describe('getByIds', () => {
    it('should return disciplines by ids', async () => {
      const mockIds = [1, 2];
      const mockFilter = { bar: 'baz' } as FindOptionsWhere<Discipline>;

      const result = await service.getByIds(mockIds, mockFilter);

      expect(result).toEqual(mockFindResponse);
      expect(mockFind).toHaveBeenCalledWith({
        where: { id: In(mockIds), ...mockFilter },
      });
    });
  });

  describe('create', () => {
    it('should create a new discipline', async () => {
      const mockData = {} as CreateDisciplineDto;

      const result = await service.create(mockData);

      expect(result).toEqual(mockDiscipline);
      expect(mockSave).toHaveBeenCalledWith(mockData);
      expect(mockFindOneByOrFail).toHaveBeenCalledWith({ id: mockSaveResponse.id });
    });
  });

  describe('update', () => {
    it('should update a discipline', async () => {
      const mockData = {} as UpdateDisciplineDto;

      const result = await service.update(mockId, mockData);

      expect(result).toEqual(mockDiscipline);
      expect(mockUpdate).toHaveBeenCalledWith(mockId, mockData);
      expect(mockFindOneByOrFail).toHaveBeenCalledWith({ id: mockId });
    });
  });

  describe('delete', () => {
    it('should delete a discipline', async () => {
      await service.delete(mockId);

      expect(mockSoftDelete).toHaveBeenCalledWith(mockId);
    });
  });
});

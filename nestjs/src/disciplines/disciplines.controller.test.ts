import { Test, TestingModule } from '@nestjs/testing';
import { DisciplinesController } from './disciplines.controller';
import { DisciplinesService } from './disciplines.service';
import { CreateDisciplineDto, DisciplineDto, UpdateDisciplineDto } from './dto';

const mockId = 1;

const mockDiscipline = {
  id: mockId,
  name: 'NodeJs',
  createdDate: '1684609801766',
  updatedDate: '1684609810052',
  deletedDate: '1684609892046',
};

const mockCreate = jest.fn(() => Promise.resolve(mockDiscipline));
const mockGetAll = jest.fn(() => Promise.resolve([mockDiscipline, mockDiscipline]));
const mockDelete = jest.fn(() => Promise.resolve());
const mockUpdate = jest.fn(() => Promise.resolve(mockDiscipline));

const mockDisciplinesServiceFactory = jest.fn(() => ({
  create: mockCreate,
  getAll: mockGetAll,
  delete: mockDelete,
  update: mockUpdate,
}));

describe('DisciplinesController', () => {
  let controller: DisciplinesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisciplinesController],
      providers: [{ provide: DisciplinesService, useFactory: mockDisciplinesServiceFactory }],
    }).compile();

    controller = module.get<DisciplinesController>(DisciplinesController);
  });

  describe('create', () => {
    it('should create a new discipline', async () => {
      const mockCreateDisciplineDto = new CreateDisciplineDto();

      const result = await controller.create(mockCreateDisciplineDto);

      expect(result).toEqual(new DisciplineDto(mockDiscipline));
      expect(mockCreate).toHaveBeenCalledWith(mockCreateDisciplineDto);
    });
  });

  describe('getAll', () => {
    it('should get all disciplines', async () => {
      const result = await controller.getAll();

      expect(result).toEqual([new DisciplineDto(mockDiscipline), new DisciplineDto(mockDiscipline)]);
      expect(mockGetAll).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a discipline', async () => {
      await controller.delete(mockId);

      expect(mockDelete).toHaveBeenCalledWith(mockId);
    });
  });

  describe('update', () => {
    it('should update a discipline', async () => {
      const mockUpdateDisciplineDto = new UpdateDisciplineDto();

      const result = await controller.update(mockId, mockUpdateDisciplineDto);

      expect(result).toEqual(new DisciplineDto(mockDiscipline));
      expect(mockUpdate).toHaveBeenCalledWith(mockId, mockUpdateDisciplineDto);
    });
  });
});

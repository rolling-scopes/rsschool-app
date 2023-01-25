import { Test, TestingModule } from '@nestjs/testing';
import { TeamDistributionService } from './team-distribution.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TeamDistribution } from '@entities/teamDistribution';
import { Repository } from 'typeorm';

const mockDistribution = {
  id: 1,
  courseId: 1,
  minTotalScore: 0,
  teams: [],
  teamDistributionStudents: [],
} as unknown as TeamDistribution;

describe('TeamDistributionService', () => {
  let service: TeamDistributionService;
  let repository: Repository<TeamDistribution>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamDistributionService,
        {
          provide: getRepositoryToken(TeamDistribution),
          useValue: {
            find: jest.fn(() => [mockDistribution]),
            findOneOrFail: jest.fn(() => mockDistribution),
            save: jest.fn(() => mockDistribution),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TeamDistributionService>(TeamDistributionService);
    repository = module.get(getRepositoryToken(TeamDistribution));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save the distribution and return it', async () => {
      const result = await service.create(mockDistribution);
      expect(result).toBe(mockDistribution);
      expect(repository.save).toHaveBeenCalledWith(mockDistribution);
    });
  });

  describe('findByCourseId', () => {
    it('should return the distributions of the given courseId', async () => {
      const result = await service.findByCourseId(1);
      expect(result).toEqual([mockDistribution]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { courseId: 1 },
        order: {
          startDate: 'ASC',
        },
      });
    });
  });

  describe('getById', () => {
    it('should return the distribution with the given id', async () => {
      const result = await service.getById(1);
      expect(result).toBe(mockDistribution);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getDistributionDetailedById', () => {
    it('should return the distribution with the given id, including teams and teamDistributionStudents relations', async () => {
      const result = await service.getDistributionDetailedById(1);
      expect(result).toBe(mockDistribution);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        relations: ['teams', 'teamDistributionStudents'],
      });
    });
  });

  describe('update', () => {
    it('should update the distribution with the given id', async () => {
      await service.update(1, mockDistribution);
      expect(repository.update).toHaveBeenCalledWith(1, mockDistribution);
    });
  });

  describe('remove', () => {
    it('should remove the distribution with the given id', async () => {
      await service.remove(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });
  });
});

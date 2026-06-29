import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contributor } from '@entities/contributor';
import { ContributorsService } from './contributors.service';
import { CreateContributorDto, UpdateContributorDto } from './dto';

const mockContributor = {
  id: 1,
  description: 'Core maintainer',
  user: { id: 11, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
} as Partial<Contributor> as Contributor;

describe('ContributorsService', () => {
  let service: ContributorsService;
  let repository: Mocked<Repository<Contributor>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributorsService,
        {
          provide: getRepositoryToken(Contributor),
          useValue: {
            find: vi.fn(),
            findOneOrFail: vi.fn(),
            save: vi.fn(),
            update: vi.fn(),
            softDelete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContributorsService>(ContributorsService);
    repository = module.get(getRepositoryToken(Contributor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('loads all contributors with the user relation', async () => {
      const items = [mockContributor];
      repository.find.mockResolvedValue(items);

      const result = await service.getAll();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['user'] });
      expect(result).toBe(items);
    });
  });

  describe('getById', () => {
    it('loads a single contributor with the user relation', async () => {
      repository.findOneOrFail.mockResolvedValue(mockContributor);

      const result = await service.getById(1);

      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toBe(mockContributor);
    });
  });

  describe('create', () => {
    it('saves the dto and returns the reloaded contributor', async () => {
      const dto: CreateContributorDto = { description: 'Core maintainer', userId: 11 };
      repository.save.mockResolvedValue({ id: 1 } as Contributor);
      repository.findOneOrFail.mockResolvedValue(mockContributor);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toBe(mockContributor);
    });
  });

  describe('update', () => {
    it('updates the contributor and returns the reloaded entity', async () => {
      const dto: UpdateContributorDto = { description: 'Updated' };
      repository.update.mockResolvedValue({} as never);
      repository.findOneOrFail.mockResolvedValue(mockContributor);

      const result = await service.update(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, dto);
      expect(repository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['user'],
      });
      expect(result).toBe(mockContributor);
    });
  });

  describe('delete', () => {
    it('soft-deletes the contributor by id and resolves to undefined', async () => {
      repository.softDelete.mockResolvedValue({} as never);

      const result = await service.delete(1);

      expect(repository.softDelete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});

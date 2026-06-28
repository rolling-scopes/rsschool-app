import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Contributor } from '@entities/contributor';
import { ContributorsController } from './contributors.controller';
import { ContributorsService } from './contributors.service';
import { ContributorDto, CreateContributorDto, UpdateContributorDto } from './dto';

const mockContributor = {
  id: 1,
  description: 'Core maintainer',
  createdDate: '2026-01-01T00:00:00.000Z',
  updatedDate: '2026-01-02T00:00:00.000Z',
  user: { id: 11, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
} as Partial<Contributor> as Contributor;

describe('ContributorsController', () => {
  let controller: ContributorsController;
  let service: Mocked<ContributorsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributorsController],
      providers: [
        {
          provide: ContributorsService,
          useValue: {
            create: vi.fn(),
            getAll: vi.fn(),
            getById: vi.fn(),
            delete: vi.fn(),
            update: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContributorsController>(ContributorsController);
    service = module.get(ContributorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the service and wraps the result in a ContributorDto', async () => {
      const dto: CreateContributorDto = { description: 'Core maintainer', userId: 11 };
      service.create.mockResolvedValue(mockContributor);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(ContributorDto);
      expect(result).toEqual({
        id: 1,
        description: 'Core maintainer',
        createdDate: '2026-01-01T00:00:00.000Z',
        updatedDate: '2026-01-02T00:00:00.000Z',
        user: { id: 11, githubId: 'john-doe', firstName: 'John', lastName: 'Doe' },
      });
    });
  });

  describe('getAll', () => {
    it('maps every contributor to a ContributorDto', async () => {
      service.getAll.mockResolvedValue([mockContributor]);

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ContributorDto);
      expect(result[0].id).toBe(1);
    });

    it('returns an empty list when there are no contributors', async () => {
      service.getAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getContributor', () => {
    it('fetches a contributor by id and wraps it in a ContributorDto', async () => {
      service.getById.mockResolvedValue(mockContributor);

      const result = await controller.getContributor(1);

      expect(service.getById).toHaveBeenCalledWith(1);
      expect(result).toBeInstanceOf(ContributorDto);
      expect(result.id).toBe(1);
    });
  });

  describe('delete', () => {
    it('delegates deletion to the service', async () => {
      service.delete.mockResolvedValue(undefined);

      const result = await controller.delete(1);

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('delegates the update and wraps the result in a ContributorDto', async () => {
      const dto: UpdateContributorDto = { description: 'Updated' };
      service.update.mockResolvedValue(mockContributor);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeInstanceOf(ContributorDto);
      expect(result.id).toBe(1);
    });
  });
});

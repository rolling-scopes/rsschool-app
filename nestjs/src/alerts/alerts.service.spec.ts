import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from '@entities/alert';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

const mockAlert = {
  id: 1,
  text: 'Maintenance window tonight',
  type: 'warning',
  courseId: 5,
  enabled: true,
} as Partial<Alert> as Alert;

describe('AlertsService', () => {
  let service: AlertsService;
  let repository: Mocked<Repository<Alert>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Alert),
          useValue: {
            save: vi.fn(),
            find: vi.fn(),
            findOneByOrFail: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    repository = module.get(getRepositoryToken(Alert));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('saves the alert and returns the freshly loaded entity', async () => {
      const dto: CreateAlertDto = { text: 'Hi', type: 'info', courseId: 5, enabled: true };
      repository.save.mockResolvedValue({ id: 1 } as Alert);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      const result = await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith({
        text: 'Hi',
        type: 'info',
        courseId: 5,
        enabled: true,
      });
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(mockAlert);
    });

    it('defaults enabled to false when omitted', async () => {
      const dto: CreateAlertDto = { text: 'Hi', type: 'info', courseId: 5 };
      repository.save.mockResolvedValue({ id: 2 } as Alert);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith({
        text: 'Hi',
        type: 'info',
        courseId: 5,
        enabled: false,
      });
    });

    it('passes through an undefined courseId', async () => {
      const dto: CreateAlertDto = { text: 'Global', type: 'info' };
      repository.save.mockResolvedValue({ id: 3 } as Alert);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      await service.create(dto);

      expect(repository.save).toHaveBeenCalledWith({
        text: 'Global',
        type: 'info',
        courseId: undefined,
        enabled: false,
      });
    });
  });

  describe('findAll', () => {
    it('loads enabled alerts with the selected fields and cache window', async () => {
      const items = [mockAlert];
      repository.find.mockResolvedValue(items);

      const result = await service.findAll({ enabled: true });

      expect(repository.find).toHaveBeenCalledWith({
        where: { enabled: true },
        select: ['id', 'text', 'type', 'courseId', 'enabled'],
        cache: 5 * 60 * 1000,
      });
      expect(result).toBe(items);
    });

    it('loads disabled alerts when enabled is false', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll({ enabled: false });

      expect(repository.find).toHaveBeenCalledWith(expect.objectContaining({ where: { enabled: false } }));
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('strips undefined fields before updating and returns the reloaded entity', async () => {
      const dto: UpdateAlertDto = { text: 'New text', enabled: false };
      repository.update.mockResolvedValue({} as never);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      const result = await service.update(1, dto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        text: 'New text',
        enabled: false,
      });
      expect(repository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(mockAlert);
    });

    it('keeps all provided fields including falsy enabled', async () => {
      const dto: UpdateAlertDto = { text: 'T', type: 'info', courseId: 0, enabled: false };
      repository.update.mockResolvedValue({} as never);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      await service.update(2, dto);

      expect(repository.update).toHaveBeenCalledWith(2, {
        text: 'T',
        type: 'info',
        courseId: 0,
        enabled: false,
      });
    });

    it('passes an empty object when no fields are provided', async () => {
      repository.update.mockResolvedValue({} as never);
      repository.findOneByOrFail.mockResolvedValue(mockAlert);

      await service.update(3, {});

      expect(repository.update).toHaveBeenCalledWith(3, {});
    });
  });

  describe('remove', () => {
    it('deletes the alert by id and resolves to undefined', async () => {
      repository.delete.mockResolvedValue({} as never);

      const result = await service.remove(7);

      expect(repository.delete).toHaveBeenCalledWith(7);
      expect(result).toBeUndefined();
    });
  });
});

import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { Alert } from '@entities/alert';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertDto, CreateAlertDto, UpdateAlertDto } from './dto';

const mockAlert = {
  id: 1,
  type: 'warning',
  text: 'Maintenance window tonight',
  enabled: true,
  courseId: 5,
  createdDate: '2026-01-01T00:00:00.000Z',
  updatedDate: '2026-01-02T00:00:00.000Z',
} as Partial<Alert> as Alert;

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: Mocked<AlertsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        {
          provide: AlertsService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
    service = module.get(AlertsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the service and wraps the result in an AlertDto', async () => {
      const dto: CreateAlertDto = { type: 'warning', text: 'Maintenance window tonight', enabled: true, courseId: 5 };
      service.create.mockResolvedValue(mockAlert);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(AlertDto);
      expect(result).toEqual({
        id: 1,
        type: 'warning',
        text: 'Maintenance window tonight',
        enabled: true,
        courseId: 5,
        createdDate: '2026-01-01T00:00:00.000Z',
        updatedDate: '2026-01-02T00:00:00.000Z',
      });
    });
  });

  describe('getAll', () => {
    it('requests alerts for the given enabled flag and maps them to DTOs', async () => {
      service.findAll.mockResolvedValue([mockAlert]);

      const result = await controller.getAll(true);

      expect(service.findAll).toHaveBeenCalledWith({ enabled: true });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AlertDto);
      expect(result[0].id).toBe(1);
    });

    it('forwards a false enabled flag and returns an empty list', async () => {
      service.findAll.mockResolvedValue([]);

      const result = await controller.getAll(false);

      expect(service.findAll).toHaveBeenCalledWith({ enabled: false });
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('delegates removal to the service', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('delegates the update and wraps the result in an AlertDto', async () => {
      const dto: UpdateAlertDto = { text: 'Updated' };
      service.update.mockResolvedValue(mockAlert);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeInstanceOf(AlertDto);
      expect(result.id).toBe(1);
    });
  });
});

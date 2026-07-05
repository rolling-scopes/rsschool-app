import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DevtoolsController } from './devtools.controller';
import { DevtoolsService } from './devtools.service';

describe('DevtoolsController', () => {
  let controller: DevtoolsController;
  let service: Mocked<DevtoolsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevtoolsController],
      providers: [
        {
          provide: DevtoolsService,
          useValue: {
            getUsers: vi.fn(),
            getDevUserLogin: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DevtoolsController>(DevtoolsController);
    service = module.get(DevtoolsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDevUsers', () => {
    it('returns the users produced by the service', async () => {
      const users = [{ id: 1, githubId: 'john-doe', mentor: [], student: [], students: [] }];
      service.getUsers.mockResolvedValue(users);

      const result = await controller.getDevUsers();

      expect(service.getUsers).toHaveBeenCalledTimes(1);
      expect(result).toBe(users);
    });
  });

  describe('getDevUserLogin', () => {
    it('delegates to the service with the githubId from the route param', async () => {
      service.getDevUserLogin.mockResolvedValue(undefined);

      const result = await controller.getDevUserLogin('john-doe');

      expect(service.getDevUserLogin).toHaveBeenCalledWith({ githubId: 'john-doe' });
      expect(result).toBeUndefined();
    });
  });
});

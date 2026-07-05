import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscordServer } from '@entities/discordServer';
import { IdNameDto } from 'src/core/dto';
import { DiscordServersController } from './discord-servers.controller';
import { DiscordServersService } from './discord-servers.service';
import { DiscordServerDto, CreateDiscordServerDto, UpdateDiscordServerDto } from './dto';

const mockDiscordServer = {
  id: 1,
  name: 'RS School',
  gratitudeUrl: 'https://discord.gg/gratitude',
  mentorsChatUrl: 'https://discord.gg/mentors',
  createdDate: 1700000000000,
  updatedDate: 1700000001000,
} as Partial<DiscordServer> as DiscordServer;

describe('DiscordServersController', () => {
  let controller: DiscordServersController;
  let service: Mocked<DiscordServersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordServersController],
      providers: [
        {
          provide: DiscordServersService,
          useValue: {
            create: vi.fn(),
            getAll: vi.fn(),
            getById: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscordServersController>(DiscordServersController);
    service = module.get(DiscordServersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to the service and wraps the result in a DiscordServerDto', async () => {
      const dto: CreateDiscordServerDto = {
        name: 'RS School',
        gratitudeUrl: 'https://discord.gg/gratitude',
        mentorsChatUrl: 'https://discord.gg/mentors',
      };
      service.create.mockResolvedValue(mockDiscordServer);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBeInstanceOf(DiscordServerDto);
      expect(result).toEqual({
        id: 1,
        name: 'RS School',
        gratitudeUrl: 'https://discord.gg/gratitude',
        mentorsChatUrl: 'https://discord.gg/mentors',
        createdDate: 1700000000000,
        updatedDate: 1700000001000,
      });
    });
  });

  describe('getAll', () => {
    it('maps every server to a DiscordServerDto', async () => {
      service.getAll.mockResolvedValue([mockDiscordServer]);

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DiscordServerDto);
      expect(result[0].id).toBe(1);
    });

    it('returns an empty list when there are no servers', async () => {
      service.getAll.mockResolvedValue([]);

      const result = await controller.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('getReducedAll', () => {
    it('maps every server to an IdNameDto with only id and name', async () => {
      service.getAll.mockResolvedValue([mockDiscordServer]);

      const result = await controller.getReducedAll();

      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(IdNameDto);
      expect(result[0]).toEqual({ id: 1, name: 'RS School' });
    });
  });

  describe('getInviteLinkById', () => {
    it('returns the mentorsChatUrl of the requested server', async () => {
      service.getById.mockResolvedValue(mockDiscordServer);

      const result = await controller.getInviteLinkById(7, 1);

      expect(service.getById).toHaveBeenCalledWith(1);
      expect(result).toBe('https://discord.gg/mentors');
    });

    it('returns undefined when the server is not found', async () => {
      service.getById.mockResolvedValue(null);

      const result = await controller.getInviteLinkById(7, 99);

      expect(service.getById).toHaveBeenCalledWith(99);
      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('delegates the update and wraps the result in a DiscordServerDto', async () => {
      const dto: UpdateDiscordServerDto = {
        name: 'RS School Updated',
        gratitudeUrl: 'https://discord.gg/gratitude',
        mentorsChatUrl: 'https://discord.gg/mentors',
      };
      service.update.mockResolvedValue(mockDiscordServer);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeInstanceOf(DiscordServerDto);
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
});

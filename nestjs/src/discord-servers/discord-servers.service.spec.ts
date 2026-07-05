import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordServer } from '@entities/discordServer';
import { DiscordServersService } from './discord-servers.service';
import { CreateDiscordServerDto, UpdateDiscordServerDto } from './dto';

const mockDiscordServer = {
  id: 1,
  name: 'RS School',
  gratitudeUrl: 'https://discord.gg/gratitude',
  mentorsChatUrl: 'https://discord.gg/mentors',
} as Partial<DiscordServer> as DiscordServer;

describe('DiscordServersService', () => {
  let service: DiscordServersService;
  let repository: Mocked<Repository<DiscordServer>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordServersService,
        {
          provide: getRepositoryToken(DiscordServer),
          useValue: {
            find: vi.fn(),
            findOneBy: vi.fn(),
            save: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DiscordServersService>(DiscordServersService);
    repository = module.get(getRepositoryToken(DiscordServer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('returns all discord servers from the repository', () => {
      const items = [mockDiscordServer];
      repository.find.mockReturnValue(items as never);

      const result = service.getAll();

      expect(repository.find).toHaveBeenCalledWith();
      expect(result).toBe(items as never);
    });
  });

  describe('getById', () => {
    it('looks up a discord server by id', async () => {
      repository.findOneBy.mockResolvedValue(mockDiscordServer);

      const result = await service.getById(1);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toBe(mockDiscordServer);
    });

    it('returns null when no server matches', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.getById(99);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('saves the provided dto', () => {
      const dto: CreateDiscordServerDto = {
        name: 'RS School',
        gratitudeUrl: 'https://discord.gg/gratitude',
        mentorsChatUrl: 'https://discord.gg/mentors',
      };
      repository.save.mockReturnValue(mockDiscordServer as never);

      const result = service.create(dto);

      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toBe(mockDiscordServer as never);
    });
  });

  describe('update', () => {
    it('saves the dto merged with the id', () => {
      const dto: UpdateDiscordServerDto = {
        name: 'RS School Updated',
        gratitudeUrl: 'https://discord.gg/gratitude',
        mentorsChatUrl: 'https://discord.gg/mentors',
      };
      repository.save.mockReturnValue(mockDiscordServer as never);

      const result = service.update(5, dto);

      expect(repository.save).toHaveBeenCalledWith({ id: 5, ...dto });
      expect(result).toBe(mockDiscordServer as never);
    });
  });

  describe('delete', () => {
    it('deletes the server by id and resolves to undefined', async () => {
      repository.delete.mockResolvedValue({} as never);

      const result = await service.delete(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});

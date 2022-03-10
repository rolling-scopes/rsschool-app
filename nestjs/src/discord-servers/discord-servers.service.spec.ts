import { Test, TestingModule } from '@nestjs/testing';
import { DiscordServersService } from './discord-servers.service';

describe('DiscordServersService', () => {
  let service: DiscordServersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscordServersService],
    }).compile();

    service = module.get<DiscordServersService>(DiscordServersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

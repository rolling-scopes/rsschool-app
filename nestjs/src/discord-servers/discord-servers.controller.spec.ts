import { Test, TestingModule } from '@nestjs/testing';
import { DiscordServersController } from './discord-servers.controller';

describe('DiscordServersController', () => {
  let controller: DiscordServersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordServersController],
    }).compile();

    controller = module.get<DiscordServersController>(DiscordServersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from '@entities/discordServer';
import { DiscordServersController } from './discord-servers.controller';
import { DiscordServersService } from './discord-servers.service';

@Module({
  imports: [TypeOrmModule.forFeature([DiscordServer])],
  controllers: [DiscordServersController],
  providers: [DiscordServersService],
})
export class DiscordServersModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from '@entities/feedback';
import { HttpModule } from '@nestjs/axios';
import { GratitudesController } from './gratitudes.controller';
import { GratitudesService } from './gratitudes.service';
import { DiscordService } from './discord.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Feedback])],
  controllers: [GratitudesController],
  providers: [GratitudesService, DiscordService],
})
export class GratitudesModule {}

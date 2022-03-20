import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { CourseTask } from '@entities/courseTask';
import { ConfigModule } from '../config/config.module';
import { CrossCheckService } from './cross-check.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([CourseTask]), HttpModule, ConfigModule],
  providers: [CrossCheckService],
})
export class CrossCheckModule {}

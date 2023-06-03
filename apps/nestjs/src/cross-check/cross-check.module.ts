import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CourseTask } from '@entities/courseTask';
import { ConfigModule } from '../config/config.module';
import { CrossCheckService } from './cross-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseTask]), HttpModule, ConfigModule],
  providers: [CrossCheckService],
})
export class CrossCheckModule {}

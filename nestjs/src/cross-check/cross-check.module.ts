import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseTask } from '@entities/courseTask';
import { CoursesModule } from '../courses/courses.module';
import { CrossCheckService } from './cross-check.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseTask]), CoursesModule],
  providers: [CrossCheckService],
})
export class CrossCheckModule {}

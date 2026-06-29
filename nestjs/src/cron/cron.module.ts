import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { CourseTask } from '@entities/courseTask';
import { TaskVerification } from '@entities/taskVerification';
import { ScoreRecalculationService } from './score-recalculation.service';
import { TaskVerificationCleanupService } from './task-verification-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Student, CourseTask, TaskVerification])],
  providers: [ScoreRecalculationService, TaskVerificationCleanupService],
})
export class CronModule {}

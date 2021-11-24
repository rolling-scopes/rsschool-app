import { Module } from '@nestjs/common';
import { CourseTaskService } from './course-task.service';
import { CourseUserService } from './course-user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { Task } from '@entities/task';
import { Student, Mentor, TaskChecker, StudentFeedback, StageInterview, StageInterviewFeedback } from '@entities/index';
import { FeedbackService, FeedbackController } from './feedback';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Mentor,
      StageInterview,
      StageInterviewFeedback,
      Course,
      CourseTask,
      Task,
      CourseUser,
      TaskChecker,
      StudentFeedback,
    ]),
  ],
  controllers: [FeedbackController, CourseController],
  providers: [CourseTaskService, CourseUserService, FeedbackService, CourseService],
  exports: [CourseTaskService, CourseUserService],
})
export class CourseModule {}

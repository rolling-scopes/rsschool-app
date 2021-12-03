import { Module } from '@nestjs/common';
import { CourseTasksService } from './course-tasks.service';
import { CourseUsersService } from './course-users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { Task } from '@entities/task';
import { Student, Mentor, TaskChecker, StudentFeedback, StageInterview, StageInterviewFeedback } from '@entities/index';
import { FeedbacksService, FeedbacksController } from './feedbacks';
import { CourseController } from './courses.controller';
import { CoursesService } from './courses.service';
import { StudentsService, StudentsController } from './students';
import { CourseAccessService } from './course-access.service';

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
  controllers: [FeedbacksController, CourseController, StudentsController],
  providers: [
    CourseTasksService,
    CourseUsersService,
    FeedbacksService,
    CoursesService,
    StudentsService,
    CourseAccessService,
  ],
  exports: [CourseTasksService, CourseUsersService],
})
export class CoursesModule {}

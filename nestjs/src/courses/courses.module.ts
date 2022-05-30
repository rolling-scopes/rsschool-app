import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CourseUsersService } from './course-users.service';
import { Course } from '@entities/course';
import { CourseTask } from '@entities/courseTask';
import { CourseUser } from '@entities/courseUser';
import { Task } from '@entities/task';
import {
  Student,
  Mentor,
  TaskChecker,
  StudentFeedback,
  StageInterview,
  StageInterviewFeedback,
  TaskSolutionChecker,
  TaskSolutionResult,
} from '@entities/index';

import { UsersModule } from 'src/users';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';

import { FeedbacksService, FeedbacksController } from './students/feedbacks';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { StudentsService, StudentsController } from './students';
import { MentorsService, MentorsController } from './mentors';
import { CourseAccessService } from './course-access.service';
import { CourseTasksController, CourseTasksService } from './courseTasks';
import { InterviewsController, InterviewsService } from './interviews';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { CourseStatsController, CourseStatsService } from './stats';
import { CrossCheckController, CrossCheckPairsService } from './cross-checks';
import { ScoreController, ScoreService } from './score';

@Module({
  imports: [
    CacheModule.register(),
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
      TaskSolutionChecker,
      TaskSolutionResult,
    ]),
    UsersModule,
    UsersNotificationsModule,
  ],
  controllers: [
    FeedbacksController,
    CoursesController,
    StudentsController,
    MentorsController,
    CourseTasksController,
    InterviewsController,
    TasksController,
    CourseStatsController,
    CrossCheckController,
    ScoreController,
  ],
  providers: [
    CourseTasksService,
    CourseUsersService,
    FeedbacksService,
    CoursesService,
    StudentsService,
    MentorsService,
    CourseAccessService,
    InterviewsService,
    TasksService,
    CourseStatsService,
    CrossCheckPairsService,
    ScoreService,
  ],
  exports: [CourseTasksService, CourseUsersService, CoursesService, StudentsService],
})
export class CoursesModule {}

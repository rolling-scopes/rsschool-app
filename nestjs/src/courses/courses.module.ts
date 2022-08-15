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
  CourseEvent,
  TaskSolution,
} from '@entities/index';

import { UsersModule } from 'src/users';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';

import { FeedbacksService, FeedbacksController } from './students/feedbacks';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { StudentsService, StudentsController } from './students';
import { MentorsService, MentorsController } from './mentors';
import { CourseAccessService } from './course-access.service';
import { CourseTasksController, CourseTasksService } from './course-tasks';
import { InterviewsController, InterviewsService } from './interviews';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { CourseStatsController, CourseStatsService } from './stats';
import { CrossCheckController, CrossCheckPairsService } from './cross-checks';
import { CourseEventsController, CourseEventsService } from './course-events';
import { ScoreController, ScoreService } from './score';
import { TaskSolutionsController, TaskSolutionsService } from './task-solutions';

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
      CourseEvent,
      TaskSolution,
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
    CourseEventsController,
    InterviewsController,
    TasksController,
    CourseStatsController,
    CrossCheckController,
    ScoreController,
    TaskSolutionsController,
  ],
  providers: [
    CourseTasksService,
    CourseEventsService,
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
    TaskSolutionsService,
  ],
  exports: [CourseTasksService, CourseUsersService, CoursesService, StudentsService],
})
export class CoursesModule {}

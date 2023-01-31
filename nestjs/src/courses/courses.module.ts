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
  TaskResult,
  TaskInterviewResult,
  User,
  TaskInterviewStudent,
  TeamDistribution,
  Team,
  TaskVerification,
  TeamDistributionStudent,
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
import { CourseCrossCheckController, CourseCrossCheckService } from './cross-checks';
import { CourseEventsController, CourseEventsService } from './course-events';
import { ScoreController, ScoreService } from './score';
import { TaskSolutionsController, TaskSolutionsService } from './task-solutions';
import {
  CourseScheduleService,
  CourseScheduleController,
  CourseICalendarService,
  CourseICalendarController,
} from './course-schedule';
import { CoreModule } from 'src/core/core.module';
import { TeamDistributionController } from './team-distribution/team-distribution.controller';
import { TeamDistributionService } from './team-distribution/team-distribution.service';
import { TeamService } from './team-distribution/team.service';
import { TeamController } from './team-distribution/team.controller';
import { TaskVerificationsController } from './task-verifications/task-verifications.controller';
import { TaskVerificationsService } from './task-verifications/task-verifications.service';
import { TeamDistributionStudentService } from './team-distribution/team-distribution-student.service';
import { DistributeStudentsService } from './team-distribution/distribute-students.service';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      User,
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
      TaskResult,
      TaskInterviewResult,
      TaskInterviewStudent,
      TeamDistribution,
      TeamDistributionStudent,
      Team,
      TaskVerification,
    ]),
    CoreModule,
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
    CourseCrossCheckController,
    ScoreController,
    TaskSolutionsController,
    CourseScheduleController,
    CourseICalendarController,
    TeamDistributionController,
    TeamController,
    TaskVerificationsController,
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
    CourseCrossCheckService,
    ScoreService,
    TaskSolutionsService,
    CourseScheduleService,
    CourseICalendarService,
    TeamDistributionService,
    TeamDistributionStudentService,
    TeamService,
    DistributeStudentsService,
    TaskVerificationsService,
  ],
  exports: [CourseTasksService, CourseUsersService, CoursesService, StudentsService],
})
export class CoursesModule {}

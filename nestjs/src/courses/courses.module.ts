import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  StageInterviewStudent,
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
import { InterviewsController, InterviewsService, InterviewFeedbackService } from './interviews';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { CourseStatsController, CourseStatsService } from './stats';
import { CourseCrossCheckController, CourseCrossCheckService } from './cross-checks';
import { CourseEventsController, CourseEventsService } from './course-events';
import { ScoreController, ScoreService, WriteScoreService } from './score';
import { TaskSolutionsController, TaskSolutionsService } from './task-solutions';
import {
  CourseScheduleService,
  CourseScheduleController,
  CourseICalendarService,
  CourseICalendarController,
} from './course-schedule';
import { CoreModule } from '../core/core.module';
import { TeamDistributionController } from './team-distribution/team-distribution.controller';
import { TeamDistributionService } from './team-distribution/team-distribution.service';
import { TeamService } from './team-distribution/team.service';
import { TeamController } from './team-distribution/team.controller';
import { TaskVerificationsController } from './task-verifications/task-verifications.controller';
import { TaskVerificationsService } from './task-verifications/task-verifications.service';
import { TeamDistributionStudentService } from './team-distribution/team-distribution-student.service';
import { DistributeStudentsService } from './team-distribution/distribute-students.service';
import { CourseUsersController } from './course-users/course-users.controller';
import { CourseUsersService } from './course-users/course-users.service';
import { CloudApiModule } from 'src/cloud-api/cloud-api.module';
import { SelfEducationService } from './task-verifications/self-education.service';
import { CourseMentorsController, CourseMentorsService } from './course-mentors';
import { CourseStudentsController } from './course-students/course-students.controller';
import { CourseStudentsService } from './course-students/course-students.service';
import { MentorReviewsController, MentorReviewsService } from './mentor-reviews';
import { ConfigModule } from '../config';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      Course,
      CourseEvent,
      CourseTask,
      CourseUser,
      Mentor,
      StageInterview,
      StageInterviewFeedback,
      StageInterviewStudent,
      Student,
      StudentFeedback,
      Task,
      TaskChecker,
      TaskInterviewResult,
      TaskInterviewStudent,
      TaskResult,
      TaskSolution,
      TaskSolutionChecker,
      TaskSolutionResult,
      TaskVerification,
      Team,
      TeamDistribution,
      TeamDistributionStudent,
      User,
    ]),
    CoreModule,
    UsersModule,
    UsersNotificationsModule,
    CloudApiModule,
    ConfigModule,
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
    CourseUsersController,
    CourseMentorsController,
    CourseStudentsController,
    MentorReviewsController,
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
    InterviewFeedbackService,
    TasksService,
    CourseStatsService,
    CourseCrossCheckService,
    ScoreService,
    WriteScoreService,
    TaskSolutionsService,
    CourseScheduleService,
    CourseICalendarService,
    TeamDistributionService,
    TeamDistributionStudentService,
    TeamService,
    DistributeStudentsService,
    SelfEducationService,
    TaskVerificationsService,
    CourseMentorsService,
    CourseStudentsService,
    MentorReviewsService,
  ],
  exports: [CourseTasksService, CourseUsersService, CoursesService, StudentsService],
})
export class CoursesModule {}

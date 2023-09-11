import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { ProfileController } from './profile.controller';
import { CoursesModule } from '../courses/courses.module';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { User } from '@entities/user';
import { ProfilePermissions } from '@entities/profilePermissions';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import { Resume } from '@entities/resume';
import { EndorsementService } from './endorsement.service';
import { Feedback, Mentor, Prompt, Student, TaskInterviewResult } from '@entities/index';
import { ConfigModule } from 'src/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Course,
      NotificationUserConnection,
      User,
      ProfilePermissions,
      Resume,
      Student,
      Mentor,
      Prompt,
      Feedback,
      TaskInterviewResult,
    ]),
    UsersNotificationsModule,
    CoursesModule,
    ConfigModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, EndorsementService],
  exports: [ProfileService],
})
export class ProfileModule {}

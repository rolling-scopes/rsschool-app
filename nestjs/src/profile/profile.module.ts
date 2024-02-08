import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndorsementService } from './endorsement.service';
import { PermissionsService } from './permissions.service';
import { ProfileService } from './profile.service';
import { ProfileInfoService } from './profile-info.service';
import { UserInfoService } from './user-info.service';
import { PublicFeedbackService } from './public-feedback.service';
import { StudentInfoService } from './student-info.service';
import { MentorInfoService } from './mentor-info.service';
import { ProfileController } from './profile.controller';
import { ConfigModule } from 'src/config';
import { CoursesModule } from 'src/courses/courses.module';
import { RegistryModule } from 'src/registry/registry.module';
import { UsersModule } from 'src/users/users.module';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import {
  Certificate,
  Course,
  Feedback,
  Mentor,
  NotificationUserConnection,
  ProfilePermissions,
  Prompt,
  Resume,
  Student,
  TaskInterviewResult,
  User,
} from '@entities/index';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Certificate,
      Course,
      Feedback,
      Mentor,
      NotificationUserConnection,
      ProfilePermissions,
      Prompt,
      Resume,
      Student,
      TaskInterviewResult,
      User,
    ]),
    ConfigModule,
    CoursesModule,
    RegistryModule,
    UsersModule,
    UsersNotificationsModule,
  ],
  controllers: [ProfileController],
  providers: [
    EndorsementService,
    MentorInfoService,
    PermissionsService,
    ProfileService,
    ProfileInfoService,
    PublicFeedbackService,
    StudentInfoService,
    UserInfoService,
  ],
  exports: [ProfileService],
})
export class ProfileModule {}

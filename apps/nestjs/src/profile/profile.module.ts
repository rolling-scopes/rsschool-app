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

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, NotificationUserConnection, User, ProfilePermissions, Resume]),
    UsersNotificationsModule,
    CoursesModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

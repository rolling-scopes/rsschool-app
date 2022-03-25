import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { ProfileController } from './profile.controller';
import { CoursesModule } from '../courses/courses.module';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { User } from '@entities/user';
import { ProfilePermissions } from '@entities/profilePermissions';
import { UsersNotificationsModule } from 'src/usersNotifications/usersNotifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, NotificationUserConnection, User, ProfilePermissions]),
    UsersNotificationsModule,
    CoursesModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

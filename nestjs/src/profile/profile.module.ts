import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '@entities/course';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { CoursesModule } from '../courses/courses.module';
import { NotificationUserConnection } from '@entities/notificationUserConnection';
import { User } from '@entities/user';
import { ProfilePermissions } from '@entities/profilePermissions';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, NotificationUserConnection, User, ProfilePermissions]),
    UsersModule,
    CoursesModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}

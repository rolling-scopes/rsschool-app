import { MentorRegistry } from '@entities/mentorRegistry';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { DisciplinesModule } from 'src/disciplines';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Student } from '@entities/student';
import { Registry } from '@entities/registry';
import { Mentor } from '@entities/mentor';
import { User } from '@entities/user';
import { Course } from '@entities/course';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorRegistry]),
    UsersModule,
    UsersNotificationsModule,
    CoursesModule,
    DisciplinesModule,
    NotificationsModule,
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forFeature([Registry, Mentor, User, Course]),
  ],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class RegistryModule {}

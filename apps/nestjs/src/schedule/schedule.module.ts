import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import { User } from '@entities/user';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from '@entities/history';
import { CourseEvent } from '@entities/courseEvent';

@Module({
  imports: [UsersNotificationsModule, CoursesModule, TypeOrmModule.forFeature([User, History, CourseEvent])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}

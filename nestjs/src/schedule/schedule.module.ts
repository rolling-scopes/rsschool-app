import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import { User } from '@entities/user';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [UsersNotificationsModule, CoursesModule, TypeOrmModule.forFeature([User])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}

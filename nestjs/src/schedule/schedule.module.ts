import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { CoursesModule } from 'src/courses/courses.module';

@Module({
  imports: [UsersModule, CoursesModule, NotificationsModule],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}

import { MentorRegistry } from '@entities/mentorRegistry';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UsersModule } from 'src/users';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';

@Module({
  imports: [TypeOrmModule.forFeature([MentorRegistry]), NotificationsModule, UsersModule, CoursesModule],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class RegistryModule {}

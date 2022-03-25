import { MentorRegistry } from '@entities/mentorRegistry';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users';
import { UsersNotificationsModule } from 'src/usersNotifications/usersNotifications.module';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';

@Module({
  imports: [TypeOrmModule.forFeature([MentorRegistry]), UsersModule, UsersNotificationsModule, CoursesModule],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class RegistryModule {}

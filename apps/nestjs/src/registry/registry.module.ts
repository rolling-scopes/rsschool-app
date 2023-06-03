import { MentorRegistry } from '@entities/mentorRegistry';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from 'src/courses/courses.module';
import { UsersModule } from 'src/users';
import { UsersNotificationsModule } from 'src/users-notifications/users-notifications.module';
import { RegistryController } from './registry.controller';
import { RegistryService } from './registry.service';
import { DisciplinesModule } from 'src/disciplines';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorRegistry]),
    UsersModule,
    UsersNotificationsModule,
    CoursesModule,
    DisciplinesModule,
  ],
  controllers: [RegistryController],
  providers: [RegistryService],
})
export class RegistryModule {}

import { Certificate } from '@entities/certificate';
import { Course } from '@entities/course';
import { Student } from '@entities/student';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersNotificationsModule } from '../users-notifications';
import { ConfigModule } from '../config';
import { CoursesModule } from '../courses/courses.module';
import { CertificatesController } from './certificates.controller';
import { CertificationsService } from './certificates.service';
import { User } from '@entities/user';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, Student, Course, User]),
    ConfigModule,
    UsersNotificationsModule,
    CoursesModule,
    HttpModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificationsService],
})
export class CertificatesModule {}

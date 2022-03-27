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

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, Student, Course]),
    ConfigModule,
    UsersNotificationsModule,
    CoursesModule,
  ],
  controllers: [CertificatesController],
  providers: [CertificationsService],
})
export class CertificatesModule {}

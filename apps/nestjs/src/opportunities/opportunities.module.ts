import { User } from '@entities/user';
import { Feedback } from '@entities/feedback';
import { Resume } from '@entities/resume';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/student-feedback';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from 'src/config';
import { UsersModule } from 'src/users';
import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Resume, User, Student, Feedback, StudentFeedback]),
    ConfigModule,
    HttpModule,
    UsersModule,
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}

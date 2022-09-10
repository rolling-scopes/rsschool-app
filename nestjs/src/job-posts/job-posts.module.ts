import { JobPost } from '@entities/job-post';
import { Student } from '@entities/student';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostsController } from './job-posts.controller';
import { JobPostsService } from './job-posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([JobPost, Student])],
  controllers: [JobPostsController],
  providers: [JobPostsService],
})
export class JobPostsModule {}

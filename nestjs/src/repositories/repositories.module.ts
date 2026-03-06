import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryEvent } from '@entities/repositoryEvent';
import { Student } from '@entities/student';
import { User } from '@entities/user';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepositoryEvent, Student, User])],
  controllers: [RepositoriesController],
  providers: [RepositoriesService],
})
export class RepositoriesModule {}

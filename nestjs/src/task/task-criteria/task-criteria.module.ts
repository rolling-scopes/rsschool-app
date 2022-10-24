import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskCriteria } from '@entities/taskCriteria';
import { Task } from '@entities/task';

import { TaskCriteriaService } from './task-criteria.service';
import { TaskCriteriaController } from './task-criteria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaskCriteria, Task])],
  controllers: [TaskCriteriaController],
  providers: [TaskCriteriaService],
})
export class TaskCriteriaModule {}

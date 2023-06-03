import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '@entities/task';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskCriteria } from '@entities/taskCriteria';
import { TasksCriteriaController, TasksCriteriaService } from './tasks-criteria';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskCriteria])],
  controllers: [TasksController, TasksCriteriaController],
  providers: [TasksService, TasksCriteriaService],
})
export class TasksModule {}

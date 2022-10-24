import { Module } from '@nestjs/common';
import { TaskCriteriaModule } from './task-criteria/task-criteria.module';

@Module({
  imports: [TaskCriteriaModule],
  controllers: [],
  providers: [],
})
export class TaskModule {}

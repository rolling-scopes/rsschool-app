import { CourseTask } from '@entities/courseTask';
import { TaskSolution } from '@entities/taskSolution';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TaskSolutionsService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(TaskSolution)
    readonly taskSolutionRepository: Repository<TaskSolution>,
  ) {}

  public async createTaskSolution(courseTaskId: number, studentId: number, data: { url: string }) {
    const { id } = await this.taskSolutionRepository.save({
      courseTaskId: courseTaskId,
      studentId: studentId,
      url: data.url,
    });
    return this.taskSolutionRepository.findOneOrFail(id);
  }
}

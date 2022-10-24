import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskCriteria } from '@entities/taskCriteria';
import { Repository } from 'typeorm';
import { Task } from '@entities/task';

import { TaskCriteriaDto } from './dto/task-criteria.dto';
import { CriteriaDto } from './dto/criteria.dto';

@Injectable()
export class TaskCriteriaService {
  constructor(
    @InjectRepository(TaskCriteria)
    private readonly taskCriteriaRepository: Repository<TaskCriteria>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async createCriteria(taskId: number, criteria: CriteriaDto[]) {
    const { criteria: existingCriteria } = await this.getCriteria(taskId);

    if (existingCriteria) {
      throw new BadRequestException('Criteria already exists');
    }

    const task = await this.taskRepository.findOneBy({ id: taskId });
    if (!task) {
      throw new NotFoundException('Task does not exist');
    }

    const taskCriteria = new TaskCriteria(taskId, criteria);
    await this.taskCriteriaRepository.save(taskCriteria);
    await this.taskRepository.update({ id: taskId }, { criteria: taskCriteria });

    return this.getCriteria(taskId);
  }

  async getCriteria(taskId: number): Promise<TaskCriteriaDto> {
    const data = await this.taskCriteriaRepository.findOne({ where: { taskId } });
    return { criteria: data?.criteria } as TaskCriteriaDto;
  }

  async updateCriteria(taskId: number, taskCriteriaDto: TaskCriteriaDto) {
    const { criteria: existingCriteria } = await this.getCriteria(taskId);

    if (!existingCriteria) {
      throw new NotFoundException('Criteria does not exist');
    }

    await this.taskCriteriaRepository.update({ taskId }, { criteria: taskCriteriaDto.criteria });

    return this.getCriteria(taskId);
  }
}

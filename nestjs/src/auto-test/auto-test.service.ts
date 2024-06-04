import { Task, TaskType } from '@entities/task';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AutoTestService {
  constructor(@InjectRepository(Task) private repository: Repository<Task>) {}

  public async getAll() {
    return this.repository.find({
      where: {
        type: TaskType.SelfEducation,
      },
      relations: {
        discipline: true,
        courseTasks: { course: true },
      },
      order: {
        updatedDate: 'DESC',
      },
    });
  }
}

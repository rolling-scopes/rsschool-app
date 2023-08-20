import { Task } from '@entities/task';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private repository: Repository<Task>,
  ) {}

  public async getAll() {
    return this.repository.find({
      relations: {
        discipline: true,
        courseTasks: { course: true },
      },
      order: {
        updatedDate: 'DESC',
      },
    });
  }

  public async getById(id: number) {
    return this.repository.findOneBy({ id });
  }

  public async create(data: CreateTaskDto) {
    const { id } = await this.repository.save(data);
    return this.repository.findOneByOrFail({ id });
  }

  public async update(id: number, data: UpdateTaskDto) {
    await this.repository.update(id, data);
    return this.repository.findOneByOrFail({ id });
  }

  public async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}

import { BadRequestException } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';

export abstract class CrudService<T> {
  constructor(private repository: Repository<T>) {}

  public async getAll(): Promise<T[]> {
    return this.repository.find();
  }

  public async getById(id: number): Promise<T> {
    return this.repository.findOne(id);
  }

  public async create(data: DeepPartial<T>): Promise<T> {
    if (this.repository.hasId(data as T)) {
      throw new BadRequestException('Id is not allowed');
    }
    return this.repository.create(data);
  }

  public async update(id: number, data: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, data);
    return this.repository.findOne(id);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

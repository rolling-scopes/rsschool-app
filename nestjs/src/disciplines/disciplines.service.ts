import { Discipline } from '@entities/discipline';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDisciplineDto, UpdateDisciplineDto } from './dto';

@Injectable()
export class DisciplinesService {
  constructor(
    @InjectRepository(Discipline)
    private repository: Repository<Discipline>,
  ) {}

  public async getAll() {
    return this.repository.find();
  }

  public async getById(id: number) {
    return this.repository.findOne(id);
  }

  public async create(data: CreateDisciplineDto) {
    const { id } = await this.repository.save(data);
    return this.repository.findOneOrFail(id);
  }

  public async update(id: number, data: UpdateDisciplineDto) {
    await this.repository.update(id, data);
    return this.repository.findOneOrFail(id);
  }

  public async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }
}

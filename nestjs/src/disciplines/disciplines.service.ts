import { Discipline } from '@entities/discipline';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CrudService } from 'src/core';
import { Repository } from 'typeorm';

@Injectable()
export class DisciplinesService extends CrudService<Discipline> {
  constructor(
    @InjectRepository(Discipline)
    repository: Repository<Discipline>,
  ) {
    super(repository);
  }

  public async getAll(): Promise<Discipline[]> {
    return this.repository.find({ where: { deleted: false } });
  }
}

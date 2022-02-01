import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  public getByAlias(alias: string): Promise<Course> {
    return this.repository.findOne({ where: { alias } });
  }

  public async getAll() {
    return this.repository.find({ order: { startDate: 'DESC' } });
  }

  public async getById(id: number) {
    return this.repository.findOne(id);
  }
}

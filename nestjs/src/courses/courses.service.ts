import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../core';

@Injectable()
export class CoursesService extends CrudService<Course> {
  constructor(
    @InjectRepository(Course)
    readonly coursesRepository: Repository<Course>,
  ) {
    super(coursesRepository);
  }

  public getByAlias(alias: string): Promise<Course> {
    return this.coursesRepository.findOne({ where: { alias } });
  }
}

import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '../core';

@Injectable()
export class CourseService extends CrudService<Course> {
  constructor(
    @InjectRepository(Course)
    readonly courseRepository: Repository<Course>,
  ) {
    super(courseRepository);
  }

  public getByAlias(alias: string): Promise<Course> {
    return this.courseRepository.findOne({ where: { alias } });
  }
}

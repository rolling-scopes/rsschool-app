import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    readonly courseRepository: Repository<Course>,
  ) {}

  public getAll(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  public getOne(id: number): Promise<Course> {
    return this.courseRepository.findOne(id);
  }
}

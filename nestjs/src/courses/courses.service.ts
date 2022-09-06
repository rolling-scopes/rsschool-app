import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  public async getAll() {
    return this.repository.find({ order: { startDate: 'DESC' }, relations: ['discipline'] });
  }

  public async getById(id: number) {
    return this.repository.findOneOrFail({ where: { id }, relations: ['discipline'] });
  }

  public async update(id: number, course: UpdateCourseDto) {
    await this.repository.update(id, course);
    return this.repository.findOneByOrFail({ id });
  }

  public async getByIds(ids: number[]) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    });
  }

  public getActiveCourses(relations?: ('students' | 'mentors')[]) {
    return this.repository.find({
      where: {
        completed: false,
      },
      relations,
    });
  }
}

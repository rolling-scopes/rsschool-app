import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import type { AuthUser } from '../auth';
import { CourseRole } from '../auth';
import { UpdateCourseDto, CreateCourseDto } from './dto';

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
    const updated = await this.repository.findOneByOrFail({ id });
    return updated;
  }

  public async create(course: CreateCourseDto) {
    const { id } = await this.repository.save(course);
    const created = await this.repository.findOneByOrFail({ id });
    return created;
  }

  public async getByIds(ids: number[], filter?: FindOptionsWhere<Course>) {
    return this.repository.find({
      where: {
        id: In(ids),
        ...filter,
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

  public async findManagedByUser(user: AuthUser) {
    if (user.isAdmin) {
      return this.getAll();
    }
    const managedCourseIds = Object.entries(user.courses)
      .filter(([, info]) => info.roles.includes(CourseRole.Manager))
      .map(([id]) => Number(id));
    if (managedCourseIds.length === 0) return [];
    return this.repository.find({
      where: { id: In(managedCourseIds) },
      order: { startDate: 'DESC' },
      relations: ['discipline'],
    });
  }
}

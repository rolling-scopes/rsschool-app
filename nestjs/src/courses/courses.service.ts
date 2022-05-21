import { Injectable } from '@nestjs/common';
import { Course } from '@entities/course';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import { CourseTask } from '@entities/courseTask';
import { CourseEvent } from '@entities/courseEvent';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  public async getAll() {
    return this.repository.find({ order: { startDate: 'DESC' } });
  }

  public async getById(id: number) {
    return this.repository.findOneOrFail(id);
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

  public async getCoursesWithUpdateScheduleWithin(lastHours: number) {
    const date = dayjs().subtract(lastHours, 'hours');

    const courses = await (this.repository
      .createQueryBuilder('course')
      .leftJoinAndMapOne(
        'course.task',
        CourseTask,
        'courseTask',
        'course.id = courseTask.courseId and courseTask.updatedDate >= :date',
        {
          date: date.toISOString(),
        },
      )
      .leftJoinAndMapOne(
        'course.event',
        CourseEvent,
        'courseEvent',
        'course.id = courseEvent.courseId and courseEvent.updatedDate >= :date',
        {
          date: date.toISOString(),
        },
      )
      .where('course.completed = false')
      .getMany() as Promise<(Course & { task?: CourseTask; event?: CourseEvent })[]>);

    return courses.filter(course => !!course.task || !!course.event);
  }
}

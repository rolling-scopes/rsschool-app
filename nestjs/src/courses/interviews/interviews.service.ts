import { CourseTask } from '@entities/courseTask';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
  ) {}

  public getAll(courseId: number) {
    return this.courseTaskRepository.find({
      where: { courseId, type: 'interview' },
      relations: ['task'],
    });
  }
}

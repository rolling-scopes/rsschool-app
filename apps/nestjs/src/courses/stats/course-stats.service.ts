import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseStatsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  public async getById(courseId: number) {
    const [studentsTotalCount, studentsActiveCount] = await Promise.all([
      this.studentRepository.count({ where: { courseId } }),
      this.studentRepository.count({ where: { courseId, isExpelled: false, isFailed: false } }),
    ]);
    return {
      studentsActiveCount,
      studentsTotalCount,
    };
  }
}

import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CourseStudentsService {
  constructor(
    @InjectRepository(Student)
    readonly studentRepository: Repository<Student>,
  ) {}


  public async getStudentSummary(courseId: number, studentId: number) {
    console.log('summary', { studentId, courseId });
  }
}

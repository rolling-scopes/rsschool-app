import { Injectable } from '@nestjs/common';
import { StudentFeedback } from '@entities/studentFeedback';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentFeedbackDto } from './dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(StudentFeedback)
    readonly studentFeedbackRepository: Repository<StudentFeedback>,
  ) {}

  public async createStudentFeedback(studentId: number, data: StudentFeedback) {
    return this.studentFeedbackRepository.create({
      studentId,
      content: data.content,
      mentorId: data.mentorId,
      recommendation: data.recommendation,
    });
  }
}

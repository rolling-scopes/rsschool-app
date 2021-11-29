import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/studentFeedback';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentFeedbackDto } from './dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(StudentFeedback)
    private readonly studentFeedbackRepository: Repository<StudentFeedback>,
    private readonly studentsRepository: Repository<Student>,
    private readonly mentorsRepository: Repository<Mentor>,
  ) {}

  public async createStudentFeedback(
    studentId: number,
    data: CreateStudentFeedbackDto,
    authorId: number,
  ): Promise<StudentFeedback> {
    const student = await this.studentsRepository.findOne(studentId);
    const mentor = await this.mentorsRepository.findOne({ userId: authorId, courseId: student.courseId });

    return this.studentFeedbackRepository.create({
      student: student.id,
      mentorId: mentor?.id,
      auhtorId: authorId,
      content: data.content,
      recommendation: data.recommendation,
    });
  }

  public async getStudentFeedback(studentId: number, id: number): Promise<StudentFeedback> {
    return this.studentFeedbackRepository.findOne({
      where: { studentId, id },
    });
  }
}

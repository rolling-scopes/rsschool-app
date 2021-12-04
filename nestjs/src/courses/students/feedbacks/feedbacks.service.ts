import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/student-feedback';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentFeedbackDto, UpdateStudentFeedbackDto } from './dto';
import { PersonDto } from '../../../core/dto';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(StudentFeedback)
    private readonly studentFeedbacksRepository: Repository<StudentFeedback>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Mentor)
    private readonly mentorsRepository: Repository<Mentor>,
  ) {}

  public async createStudentFeedback(
    studentId: number,
    feedback: CreateStudentFeedbackDto,
    authorId: number,
  ): Promise<StudentFeedback> {
    const student = await this.studentsRepository.findOne(studentId);
    const mentor = await this.mentorsRepository.findOne({ userId: authorId, courseId: student.courseId });

    const { id } = await this.studentFeedbacksRepository.save<Partial<StudentFeedback>>({
      studentId: student.id,
      mentorId: mentor?.id,
      auhtorId: authorId,
      content: feedback.content,
      recommendation: feedback.recommendation,
      englishLevel: feedback.englishLevel,
    });

    return this.getStudentFeedback(id);
  }

  public async updateStudentFeedback(id: number, feedback: UpdateStudentFeedbackDto): Promise<StudentFeedback> {
    await this.studentFeedbacksRepository.save({
      id,
      content: feedback.content,
      recommendation: feedback.recommendation,
      englishLevel: feedback.englishLevel,
    });

    return this.getStudentFeedback(id);
  }

  public async getStudentFeedback(id: number): Promise<StudentFeedback> {
    return this.studentFeedbacksRepository
      .createQueryBuilder('f')
      .leftJoin('f.mentor', 'mentor')
      .addSelect(['mentor.id'])
      .leftJoin('f.author', 'author')
      .addSelect(PersonDto.getQueryFields('author'))
      .where('f.id = :id', { id })
      .getOneOrFail();
  }
}

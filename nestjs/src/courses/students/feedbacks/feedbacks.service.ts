import { Mentor } from '@entities/mentor';
import { Student } from '@entities/student';
import { StudentFeedback } from '@entities/student-feedback';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    const student = await this.studentsRepository.findOneOrFail(studentId);
    const mentor = await this.mentorsRepository.findOneOrFail({ userId: authorId, courseId: student.courseId });
    const current = await this.getByStudentAndMentor(student.id, mentor.id);

    if (current) {
      throw new BadRequestException('Feedback already exists');
    }

    const { id } = await this.studentFeedbacksRepository.save<Partial<StudentFeedback>>({
      studentId: student.id,
      mentorId: mentor?.id,
      auhtorId: authorId,
      content: feedback.content,
      recommendation: feedback.recommendation,
      englishLevel: feedback.englishLevel,
    });

    return this.getById(id);
  }

  public async update(id: number, feedback: UpdateStudentFeedbackDto): Promise<StudentFeedback> {
    await this.studentFeedbacksRepository.save({
      id,
      content: feedback.content,
      recommendation: feedback.recommendation,
      englishLevel: feedback.englishLevel,
    });

    return this.getById(id);
  }

  public async getById(id: number): Promise<StudentFeedback> {
    return this.getStudentFeedbackQuery().where('f.id = :id', { id }).getOneOrFail();
  }

  public async getByStudentAndMentor(studentId: number, mentorId: number): Promise<StudentFeedback | null> {
    return (
      (await this.getStudentFeedbackQuery()
        .where('f.studentId = :studentId', { studentId })
        .andWhere('f.mentorId = :mentorId', { mentorId })
        .getOne()) ?? null
    );
  }

  private getStudentFeedbackQuery() {
    return this.studentFeedbacksRepository
      .createQueryBuilder('f')
      .leftJoin('f.mentor', 'mentor')
      .leftJoin('mentor.user', 'user')
      .addSelect(['mentor.id', 'mentor.userId'])
      .leftJoin('f.author', 'author')
      .addSelect(PersonDto.getQueryFields('author'))
      .addSelect(PersonDto.getQueryFields('user'));
  }
}

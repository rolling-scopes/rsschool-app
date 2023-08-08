import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, Mentor } from '@entities/index';
import { MentorDetails } from '@common/models';
import { UsersService } from 'src/users/users.service';
import { MentorsService } from '../mentors';

@Injectable()
export class CourseMentorsService {
  constructor(
    @InjectRepository(Mentor)
    readonly mentorsRepository: Repository<Mentor>,
    @InjectRepository(Course)
    readonly courseRepository: Repository<Course>,
  ) {}
  public async findAll(courseId: number): Promise<MentorDetails[]> {
    const records = await this.mentorsRepository
      .createQueryBuilder('mentor')
      .innerJoin('mentor.user', 'user')
      .addSelect(UsersService.getPrimaryUserFields())
      .innerJoin('mentor.course', 'course')
      .leftJoin('mentor.students', 'students')
      .addSelect(['students.id'])
      .leftJoinAndSelect('mentor.stageInterviews', 'stageInterviews')
      .where(`course.id = :courseId`, { courseId })
      .orderBy('mentor.createdDate')
      .getMany();

    const mentors = records.map(MentorsService.convertMentorToMentorDetails);
    return mentors;
  }
}

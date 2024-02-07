import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryStatDto } from './dto';
import { Mentor } from '@entities/index';

@Injectable()
export class CourseStatsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
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

  public async getMentors(courseId: number) {
    const queryBuilder = this.mentorRepository
      .createQueryBuilder('mentor')
      .leftJoinAndSelect('mentor.user', 'user')
      .select('COUNT(*)', 'total_mentors')
      .addSelect('COUNT(CASE WHEN mentor.isExpelled = false THEN 1 END)', 'active_mentors')
      .addSelect(
        "COUNT(DISTINCT CASE WHEN user.contactsEpamEmail IS NOT NULL AND user.contactsEpamEmail != '' THEN mentor.userId END)",
        'mentors_with_email',
      )
      .where('mentor.courseId = :courseId', { courseId });

    const result = await queryBuilder.getRawOne();

    return {
      mentorsTotalCount: Number(result.total_mentors),
      mentorsActiveCount: Number(result.active_mentors),
      epamMentorsCount: Number(result.mentors_with_email),
    };
  }

  public async getStudentCounts(
    courseId: number,
  ): Promise<{ studentsActiveCount: number; studentsTotalCount: number }> {
    const studentsTotalCount = await this.studentRepository.count({ where: { courseId } });
    const studentsActiveCount = await this.studentRepository.count({
      where: { courseId, isExpelled: false, isFailed: false },
    });

    return { studentsActiveCount, studentsTotalCount };
  }

  public async getMentorCountries(courseId: number): Promise<{ countries: CountryStatDto[] }> {
    return this.getCountries(courseId, this.mentorRepository);
  }

  public async getStudentCountries(courseId: number): Promise<{ countries: CountryStatDto[] }> {
    return this.getCountries(courseId, this.studentRepository);
  }

  private async getCountries(
    courseId: number,
    repository: Repository<Mentor | Student>,
  ): Promise<{ countries: CountryStatDto[] }> {
    const countries = await repository
      .createQueryBuilder('role')
      .where('role.courseId = :courseId', { courseId })
      .andWhere('role.isExpelled = false')
      .leftJoin('role.user', 'user')
      .select('user.countryName', 'countryName')
      .addSelect('COUNT(role.id)', 'count')
      .groupBy('user.countryName')
      .orderBy('COUNT(role.id)', 'DESC')
      .getRawMany<CountryStatDto>();

    return {
      countries: countries.map(country => ({
        countryName: country.countryName,
        count: Number(country.count),
      })),
    };
  }
}

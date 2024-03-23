import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryStatDto } from './dto';
import { Certificate, Mentor } from '@entities/index';

@Injectable()
export class CourseStatsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
  ) {}

  public async getStudents(courseId: number) {
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
      .select('COUNT(*)', 'total_students')
      .addSelect(
        'COUNT(CASE WHEN student.isExpelled = false AND student.isFailed = false THEN 1 END)',
        'active_students',
      )
      .addSelect(
        'COUNT(CASE WHEN student.isExpelled = false AND student.isFailed = false AND student.mentorId IS NOT NULL THEN 1 END)',
        'students_with_mentor',
      )
      .addSelect(
        'COUNT(DISTINCT CASE WHEN certificate.publicId IS NOT NULL THEN student.id END)',
        'students_with_certificate',
      )
      .where('student.courseId = :courseId', { courseId });

    const result = await queryBuilder.getRawOne();

    return {
      totalStudents: Number(result.total_students),
      activeStudentsCount: Number(result.active_students),
      studentsWithMentorCount: Number(result.students_with_mentor),
      certifiedStudentsCount: Number(result.students_with_certificate),
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

  public async getStudentCounts(courseId: number): Promise<{ activeStudentsCount: number; totalStudents: number }> {
    const totalStudents = await this.studentRepository.count({ where: { courseId } });
    const activeStudentsCount = await this.studentRepository.count({
      where: { courseId, isExpelled: false, isFailed: false },
    });

    return { activeStudentsCount, totalStudents };
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

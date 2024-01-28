import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryStatDto } from './dto';

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

  public async getStudentCountries(courseId: number) {
    const countries = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.courseId = :courseId', { courseId })
      .andWhere('student.isExpelled = false')
      .leftJoin('student.user', 'user')
      .select('user.countryName', 'country')
      .addSelect('COUNT(student.id)', 'studentsCount')
      .groupBy('user.countryName')
      .orderBy('COUNT(student.id)', 'DESC')
      .getRawMany<CountryStatDto>();

    return {
      countries: countries.map(country => ({ country: country.country, studentsCount: Number(country.studentsCount) })),
    };
  }
}

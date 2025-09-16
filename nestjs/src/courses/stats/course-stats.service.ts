import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountriesStatsDto, CountryStatDto } from './dto';
import { Certificate, CourseTask, Mentor, StageInterview, TaskInterviewResult, TaskResult } from '@entities/index';
import { TaskType } from '@entities/task';
import { CourseTasksService } from '../course-tasks';
import { CourseTaskDto } from '../course-tasks/dto';

@Injectable()
export class CourseStatsService {
  constructor(
    private taskService: CourseTasksService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    @InjectRepository(CourseTask)
    readonly courseTaskRepository: Repository<CourseTask>,
    @InjectRepository(TaskResult)
    readonly taskResultRepository: Repository<TaskResult>,
    @InjectRepository(TaskInterviewResult)
    readonly taskInterviewResultRepository: Repository<TaskInterviewResult>,
    @InjectRepository(StageInterview)
    readonly stageInterviewRepository: Repository<StageInterview>,
  ) {}

  private async getMaxScore(courseId: number): Promise<number> {
    const { maxScore } = await this.studentRepository
      .createQueryBuilder('student')
      .select('MAX(student.totalScore)', 'maxScore')
      .where('student.courseId = :courseId', { courseId })
      .getRawOne();

    return Number(maxScore);
  }

  public async getStudents(courseId: number) {
    const maxScore = await this.getMaxScore(courseId);

    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoin(Certificate, 'certificate', '"certificate"."studentId" = "student"."id"')
      .leftJoin('student.course', 'course')
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
      .addSelect(
        `COUNT(CASE WHEN student.isExpelled = false AND student.totalScore >= (${maxScore} * course.certificateThreshold / 100) THEN 1 END)`,
        'eligible_for_certification',
      )
      .where('student.courseId = :courseId', { courseId });

    const result = await queryBuilder.getRawOne();

    return {
      totalStudents: Number(result.total_students),
      activeStudentsCount: Number(result.active_students),
      studentsWithMentorCount: Number(result.students_with_mentor),
      certifiedStudentsCount: Number(result.students_with_certificate),
      eligibleForCertificationCount: Number(result.eligible_for_certification),
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

  public async getStudentsWithCertificatesCountries(courseId: number): Promise<{ countries: CountryStatDto[] }> {
    const countries = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoin('student.user', 'user')
      .leftJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .select('user.countryName', 'countryName')
      .addSelect('COUNT(DISTINCT student.id)', 'count')
      .where('student.courseId = :courseId', { courseId })
      .andWhere('certificate.publicId IS NOT NULL')
      .groupBy('user.countryName')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .getRawMany<CountryStatDto>();

    return {
      countries: countries.map(country => ({
        countryName: country.countryName,
        count: Number(country.count),
      })),
    };
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

  private getResultRepositoryByTaskType(taskType: TaskType) {
    switch (taskType) {
      case 'interview':
        return this.taskInterviewResultRepository;
      case 'stage-interview':
        return this.stageInterviewRepository;
      default:
        return this.taskResultRepository;
    }
  }

  public async getTaskPerformance(courseTaskId: number) {
    const courseTask = await this.courseTaskRepository.findOneOrFail({
      where: { id: courseTaskId },
      relations: ['task'],
    });
    const resultRepository = this.getResultRepositoryByTaskType(courseTask.task.type);

    const ranges = [
      { key: 'minimalAchievement', minScore: 0, maxScore: 0.2 },
      { key: 'lowAchievement', minScore: 0.2, maxScore: 0.5 },
      { key: 'moderateAchievement', minScore: 0.5, maxScore: 0.7 },
      { key: 'highAchievement', minScore: 0.7, maxScore: 0.9 },
      { key: 'exceptionalAchievement', minScore: 0.9, maxScore: 1.0 },
    ];

    const query = await resultRepository
      .createQueryBuilder('result')
      .select('COUNT(CASE WHEN result.score > 0 THEN 1 END)', 'totalAchievement')
      .addSelect(`COUNT(CASE WHEN result.score = ${courseTask.maxScore} THEN 1 END)`, 'perfectScores');

    ranges.forEach(({ key, minScore, maxScore }) => {
      query.addSelect(
        `COUNT(CASE WHEN result.score / CAST(${courseTask.maxScore} AS float) >= ${minScore} AND result.score / CAST(${courseTask.maxScore} AS float) < ${maxScore} THEN 1 END)`,
        key,
      );
    });

    const performanceStats = await query.where('result.courseTaskId = :courseTaskId', { courseTaskId }).getRawOne();

    return {
      totalAchievement: Number(performanceStats.totalAchievement),
      minimalAchievement: Number(performanceStats.minimalAchievement),
      lowAchievement: Number(performanceStats.lowAchievement),
      moderateAchievement: Number(performanceStats.moderateAchievement),
      highAchievement: Number(performanceStats.highAchievement),
      exceptionalAchievement: Number(performanceStats.exceptionalAchievement),
      perfectScores: Number(performanceStats.perfectScores),
    };
  }

  private mergeCountries(data: CountriesStatsDto[]): CountriesStatsDto {
    const countries = data
      .map(item => item.countries)
      .flat()
      .filter(el => !!el.countryName);

    const count = countries.reduce<Record<string, number>>((acc, el) => {
      const country = el.countryName;
      if (acc[country]) {
        acc[country] += el.count;
      } else {
        acc[country] = el.count;
      }
      return acc;
    }, {});

    const result: { countryName: string; count: number }[] = [];

    for (const key in count) {
      result.push({
        countryName: key,
        count: count[key] || 0,
      });
    }

    return { countries: result } as CountriesStatsDto;
  }

  private mergeStats<T extends Record<string, number>>(data: T[]): T {
    const result = data.reduce<Record<string, number>>((acc, el) => {
      for (const key in el) {
        const value = el[key] || 0;
        if (acc[key]) {
          acc[key] = acc[key] + value;
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    return result as T;
  }

  public async getCoursesStats(ids: number[] = []) {
    const [
      studentsStatsResolved,
      studentsCountriesResolved,
      mentorsCountriesResolved,
      mentorsStatsResolved,
      courseTasksResolved,
      studentsCertificatesCountriesResolved,
    ] = await Promise.all([
      Promise.all(ids.map(courseId => this.getStudents(courseId))),
      Promise.all(ids.map(courseId => this.getStudentCountries(courseId))),
      Promise.all(ids.map(courseId => this.getMentorCountries(courseId))),
      Promise.all(ids.map(courseId => this.getMentors(courseId))),
      Promise.all(ids.map(courseId => this.taskService.getAll(courseId, undefined, false))),
      Promise.all(ids.map(courseId => this.getStudentsWithCertificatesCountries(courseId))),
    ]);

    return {
      studentsCountries: this.mergeCountries(studentsCountriesResolved),
      studentsStats: this.mergeStats(studentsStatsResolved),
      mentorsCountries: this.mergeCountries(mentorsCountriesResolved),
      mentorsStats: this.mergeStats(mentorsStatsResolved),
      courseTasks: courseTasksResolved.flat().map(item => new CourseTaskDto(item)),
      studentsCertificatesCountries: this.mergeCountries(studentsCertificatesCountriesResolved),
    };
  }
}

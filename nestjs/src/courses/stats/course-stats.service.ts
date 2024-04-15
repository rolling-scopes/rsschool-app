import { Student } from '@entities/student';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryStatDto } from './dto';
import { Certificate, CourseTask, Mentor, StageInterview, TaskInterviewResult, TaskResult } from '@entities/index';
import { TaskType } from '@entities/task';

@Injectable()
export class CourseStatsService {
  constructor(
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
        `COUNT(CASE WHEN student.totalScore >= (${maxScore} * course.certificateThreshold / 100) THEN 1 END)`,
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

    const performanceStats = await resultRepository
      .createQueryBuilder('result')
      .select('COUNT(CASE WHEN result.score > 0 THEN 1 END)', 'totalAchievement')
      .addSelect(
        `COUNT(CASE WHEN result.score > 0 AND result.score / CAST(${courseTask.maxScore} AS float) < 0.2 THEN 1 END)`,
        'minimalAchievement',
      )
      .addSelect(
        `COUNT(CASE WHEN result.score / CAST(${courseTask.maxScore} AS float) >= 0.2 AND result.score / CAST(${courseTask.maxScore} AS float) < 0.5 THEN 1 END)`,
        'lowAchievement',
      )
      .addSelect(
        `COUNT(CASE WHEN result.score / CAST(${courseTask.maxScore} AS float) >= 0.5 AND result.score / CAST(${courseTask.maxScore} AS float) < 0.7 THEN 1 END)`,
        'moderateAchievement',
      )
      .addSelect(
        `COUNT(CASE WHEN result.score / CAST(${courseTask.maxScore} AS float) >= 0.7 AND result.score / CAST(${courseTask.maxScore} AS float) < 0.9 THEN 1 END)`,
        'highAchievement',
      )
      .addSelect(
        `COUNT(CASE WHEN result.score / CAST(${courseTask.maxScore} AS float) >= 0.9 AND result.score / CAST(${courseTask.maxScore} AS float) < 1.0 THEN 1 END)`,
        'exceptionalAchievement',
      )
      .addSelect(`COUNT(CASE WHEN result.score = ${courseTask.maxScore} THEN 1 END)`, 'perfectScores')
      .where('result.courseTaskId = :courseTaskId', { courseTaskId })
      .getRawOne();

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
}

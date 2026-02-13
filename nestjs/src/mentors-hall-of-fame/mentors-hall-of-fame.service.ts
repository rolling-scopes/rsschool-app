import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { Feedback, Mentor, Student, Certificate, Course, User } from '@entities/index';
import { MentorCourseStatsDto, TopMentorDto } from './dto';

const ONCE_A_DAY_AT_01_00 = '0 1 * * *';

@Injectable()
export class MentorsHallOfFameService implements OnModuleInit {
  private readonly logger = new Logger(MentorsHallOfFameService.name);

  private readonly cache = new Map<boolean, TopMentorDto[]>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.refreshCache();
  }

  @Cron(ONCE_A_DAY_AT_01_00, { timeZone: 'UTC' })
  public async refreshCache(): Promise<void> {
    this.logger.log('Refreshing mentors hall of fame cache...');

    try {
      const [lastYear, allTime] = await Promise.all([
        this.fetchTopMentorsFromDb(false),
        this.fetchTopMentorsFromDb(true),
      ]);

      this.cache.set(false, lastYear);
      this.cache.set(true, allTime);

      this.logger.log(`Cache refreshed: ${lastYear.length} mentors (last year), ${allTime.length} mentors (all time)`);
    } catch (error) {
      this.logger.error('Failed to refresh cache', error);
    }
  }

  public getTopMentors(allTime = false): TopMentorDto[] {
    return this.cache.get(allTime) ?? [];
  }

  private async fetchTopMentorsFromDb(allTime = false): Promise<TopMentorDto[]> {
    // Get all mentors with their certified students count
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Mentor, 'mentor', 'mentor.userId = user.id')
      .innerJoin(Student, 'student', 'student.mentorId = mentor.id')
      .innerJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .innerJoin(Course, 'course', 'course.id = student.courseId');

    if (!allTime) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      queryBuilder.where('certificate.issueDate >= :oneYearAgo', { oneYearAgo });
    }

    const gratitudesSubquery = this.userRepository.manager
      .createQueryBuilder()
      .select('feedback.toUserId', 'toUserId')
      // TODO: Check if we need to count distinct feedback.id or not on real data
      .addSelect('COUNT(DISTINCT feedback.id)', 'gratitudesCount')
      .from(Feedback, 'feedback')
      .groupBy('feedback.toUserId');

    const allMentors = await queryBuilder
      .leftJoin(`(${gratitudesSubquery.getQuery()})`, 'gratitudes', 'gratitudes."toUserId" = user.id')
      .select('user.id', 'userId')
      .addSelect('user.githubId', 'githubId')
      .addSelect('user.firstName', 'firstName')
      .addSelect('user.lastName', 'lastName')
      .addSelect('COUNT(DISTINCT student.id)', 'totalStudents')
      .addSelect('COALESCE(MAX(gratitudes."gratitudesCount"), 0)', 'totalGratitudes')
      .addSelect(`JSON_AGG(JSON_BUILD_OBJECT('courseName', course.name, 'studentId', student.id))`, 'courseStatsRaw')
      .groupBy('user.id')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .addOrderBy('user.githubId', 'ASC')
      .getRawMany();

    if (allMentors.length === 0) {
      return [];
    }

    // Filter to top 100 mentors, including all ties at the boundary
    return this.filterTop100Mentors(allMentors);
  }

  private filterTop100Mentors(rawMentors: Record<string, unknown>[]): TopMentorDto[] {
    const TOP_MENTORS_COUNT = 100;

    if (rawMentors.length <= TOP_MENTORS_COUNT) {
      return this.mapToTopMentorDtos(rawMentors);
    }

    // Find boundary student count (at position 100)
    const boundaryCount = Number(rawMentors[TOP_MENTORS_COUNT - 1]!.totalStudents);

    // Include all mentors until student count drops below boundary
    const filteredMentors = rawMentors.filter((mentor, index) => {
      return index < TOP_MENTORS_COUNT || Number(mentor.totalStudents) === boundaryCount;
    });

    return this.mapToTopMentorDtos(filteredMentors);
  }

  private mapToTopMentorDtos(rawMentors: Record<string, unknown>[]): TopMentorDto[] {
    return rawMentors.map((raw, index) => {
      const totalStudents = this.toNumberOrZero(raw.totalStudents);
      const totalGratitudes = this.toNumberOrZero(raw.totalGratitudes);
      const firstName = raw.firstName as string | null;
      const lastName = raw.lastName as string | null;
      const githubId = raw.githubId as string;
      const name = [firstName, lastName].filter(Boolean).join(' ') || githubId;

      // Aggregate course stats from raw JSON
      const courseStatsRaw = Array.isArray(raw.courseStatsRaw)
        ? (raw.courseStatsRaw as { courseName: string; studentId: number }[])
        : [];
      const courseStatsMap = new Map<string, Set<number>>();

      for (const item of courseStatsRaw) {
        const courseName = item.courseName;
        if (!courseStatsMap.has(courseName)) {
          courseStatsMap.set(courseName, new Set<number>());
        }
        courseStatsMap.get(courseName)!.add(item.studentId);
      }

      const courseStats: MentorCourseStatsDto[] = Array.from(courseStatsMap.entries())
        .map(([courseName, studentIds]) => new MentorCourseStatsDto(courseName, studentIds.size))
        .sort((a, b) => b.studentsCount - a.studentsCount);

      return new TopMentorDto({
        rank: index + 1,
        githubId,
        name,
        totalStudents,
        totalGratitudes,
        courseStats,
      });
    });
  }

  private toNumberOrZero(value: unknown): number {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : 0;
  }
}

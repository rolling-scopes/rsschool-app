import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor, Student, Certificate, Course, User } from '@entities/index';
import { CourseStatsDto, TopMentorDto } from './dto';
import { PaginationDto } from 'src/core/dto/pagination.dto';

@Injectable()
export class MentorsHallOfFameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getTopMentors(
    page: number,
    limit: number,
  ): Promise<{ items: TopMentorDto[]; pagination: PaginationDto }> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // First, get the total count of unique mentors with certified students
    const countQuery = this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Mentor, 'mentor', 'mentor.userId = user.id')
      .innerJoin(Student, 'student', 'student.mentorId = mentor.id')
      .innerJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .where('certificate.issueDate >= :oneYearAgo', { oneYearAgo })
      .select('COUNT(DISTINCT user.id)', 'count');

    const countResult = await countQuery.getRawOne();
    const total = Number(countResult?.count ?? 0);
    const totalPages = Math.ceil(total / limit);

    if (total === 0) {
      return {
        items: [],
        pagination: new PaginationDto(limit, page, 0, 0),
      };
    }

    // Get aggregated data with course stats using a subquery approach
    const rawMentors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Mentor, 'mentor', 'mentor.userId = user.id')
      .innerJoin(Student, 'student', 'student.mentorId = mentor.id')
      .innerJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .innerJoin(Course, 'course', 'course.id = student.courseId')
      .where('certificate.issueDate >= :oneYearAgo', { oneYearAgo })
      .select('user.githubId', 'odtGithubId')
      .addSelect('user.firstName', 'odtFirstName')
      .addSelect('user.lastName', 'odtLastName')
      .addSelect('COUNT(DISTINCT student.id)', 'totalStudents')
      .addSelect(
        `JSON_AGG(JSON_BUILD_OBJECT('courseName', course.name, 'count', 1) ORDER BY course.name)`,
        'courseStatsRaw',
      )
      .groupBy('user.id')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .addOrderBy('user.githubId', 'ASC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    // Process raw data and calculate ranks
    const mentorsWithStats = await this.processRawMentorData(rawMentors);

    return {
      items: mentorsWithStats,
      pagination: new PaginationDto(limit, page, total, totalPages),
    };
  }

  private async processRawMentorData(rawMentors: Record<string, unknown>[]): Promise<TopMentorDto[]> {
    // Get all mentor totals to calculate proper ranks
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get counts for all mentors to determine correct rank including ties
    const allCounts = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Mentor, 'mentor', 'mentor.userId = user.id')
      .innerJoin(Student, 'student', 'student.mentorId = mentor.id')
      .innerJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .where('certificate.issueDate >= :oneYearAgo', { oneYearAgo })
      .select('user.githubId', 'githubId')
      .addSelect('COUNT(DISTINCT student.id)', 'totalStudents')
      .groupBy('user.id')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .addOrderBy('user.githubId', 'ASC')
      .getRawMany();

    // Build a map of githubId -> rank (with ties)
    const rankMap = new Map<string, number>();
    let currentRank = 1;
    let prevCount = -1;
    let sameRankCount = 0;

    for (const mentor of allCounts) {
      const count = Number(mentor.totalStudents);
      if (count === prevCount) {
        sameRankCount++;
      } else {
        currentRank += sameRankCount;
        sameRankCount = 1;
        prevCount = count;
      }
      rankMap.set(mentor.githubId, currentRank);
    }

    return rawMentors.map(raw => {
      const firstName = raw.odtFirstName as string | null;
      const lastName = raw.odtLastName as string | null;
      const githubId = raw.odtGithubId as string;
      const name = [firstName, lastName].filter(Boolean).join(' ') || githubId;
      const totalStudents = Number(raw.totalStudents);
      const rank = rankMap.get(githubId) ?? 0;

      // Aggregate course stats from raw JSON
      const courseStatsRaw = (raw.courseStatsRaw as { courseName: string; count: number }[]) || [];
      const courseStatsMap = new Map<string, number>();

      for (const item of courseStatsRaw) {
        const courseName = item.courseName;
        courseStatsMap.set(courseName, (courseStatsMap.get(courseName) || 0) + 1);
      }

      const courseStats: CourseStatsDto[] = Array.from(courseStatsMap.entries())
        .map(([courseName, studentsCount]) => new CourseStatsDto(courseName, studentsCount))
        .sort((a, b) => b.studentsCount - a.studentsCount);

      return new TopMentorDto({
        rank,
        githubId,
        name,
        totalStudents,
        courseStats,
      });
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor, Student, Certificate, Course, User } from '@entities/index';
import { CourseStatsDto, TopMentorDto } from './dto';

@Injectable()
export class MentorsHallOfFameService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getTopMentors(): Promise<TopMentorDto[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get all mentors with their certified students count
    const allMentors = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin(Mentor, 'mentor', 'mentor.userId = user.id')
      .innerJoin(Student, 'student', 'student.mentorId = mentor.id')
      .innerJoin(Certificate, 'certificate', 'certificate.studentId = student.id')
      .innerJoin(Course, 'course', 'course.id = student.courseId')
      .where('certificate.issueDate >= :oneYearAgo', { oneYearAgo })
      .select('user.id', 'userId')
      .addSelect('user.githubId', 'odtGithubId')
      .addSelect('user.firstName', 'odtFirstName')
      .addSelect('user.lastName', 'odtLastName')
      .addSelect('COUNT(DISTINCT student.id)', 'totalStudents')
      .addSelect(`JSON_AGG(JSON_BUILD_OBJECT('courseName', course.name, 'studentId', student.id))`, 'courseStatsRaw')
      .groupBy('user.id')
      .orderBy('COUNT(DISTINCT student.id)', 'DESC')
      .addOrderBy('user.githubId', 'ASC')
      .getRawMany();

    if (allMentors.length === 0) {
      return [];
    }

    // Calculate dense ranks and filter to top 10 positions
    const mentorsWithRanks = this.calculateDenseRanksAndFilterTop10(allMentors);

    return mentorsWithRanks;
  }

  private calculateDenseRanksAndFilterTop10(rawMentors: Record<string, unknown>[]): TopMentorDto[] {
    const result: TopMentorDto[] = [];
    let currentRank = 1;
    let prevCount = -1;

    for (const raw of rawMentors) {
      const totalStudents = Number(raw.totalStudents);

      // Use dense ranking: increment rank only when count changes
      if (totalStudents !== prevCount && prevCount !== -1) {
        currentRank++;
      }

      // Stop if we've passed top 10 positions
      if (currentRank > 10) {
        break;
      }

      prevCount = totalStudents;

      const firstName = raw.odtFirstName as string | null;
      const lastName = raw.odtLastName as string | null;
      const githubId = raw.odtGithubId as string;
      const name = [firstName, lastName].filter(Boolean).join(' ') || githubId;

      // Aggregate course stats from raw JSON
      const courseStatsRaw = (raw.courseStatsRaw as { courseName: string; studentId: number }[]) || [];
      const courseStatsMap = new Map<string, Set<number>>();

      for (const item of courseStatsRaw) {
        const courseName = item.courseName;
        if (!courseStatsMap.has(courseName)) {
          courseStatsMap.set(courseName, new Set<number>());
        }
        courseStatsMap.get(courseName)!.add(item.studentId);
      }

      const courseStats: CourseStatsDto[] = Array.from(courseStatsMap.entries())
        .map(([courseName, studentIds]) => new CourseStatsDto(courseName, studentIds.size))
        .sort((a, b) => b.studentsCount - a.studentsCount);

      result.push(
        new TopMentorDto({
          rank: currentRank,
          githubId,
          name,
          totalStudents,
          courseStats,
        }),
      );
    }

    return result;
  }
}

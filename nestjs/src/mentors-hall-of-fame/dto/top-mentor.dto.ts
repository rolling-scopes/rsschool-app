import { ApiProperty } from '@nestjs/swagger';
import { MentorCourseStatsDto } from './course-stats.dto';

export class TopMentorDto {
  constructor(data: {
    rank: number;
    githubId: string;
    name: string;
    totalStudents: number;
    courseStats: MentorCourseStatsDto[];
  }) {
    this.rank = data.rank;
    this.githubId = data.githubId;
    this.name = data.name;
    this.totalStudents = data.totalStudents;
    this.courseStats = data.courseStats;
  }

  @ApiProperty({ description: 'Position in the mentors ranking' })
  public rank: number;

  @ApiProperty({ description: 'GitHub username' })
  public githubId: string;

  @ApiProperty({ description: 'Full name of the mentor' })
  public name: string;

  @ApiProperty({ description: 'Total number of certified students mentored' })
  public totalStudents: number;

  @ApiProperty({ type: [MentorCourseStatsDto], description: 'Student counts per course' })
  public courseStats: MentorCourseStatsDto[];
}

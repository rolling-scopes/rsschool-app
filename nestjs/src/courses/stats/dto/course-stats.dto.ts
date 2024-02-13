import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsDto {
  constructor(stats: { studentsActiveCount: number; studentsTotalCount: number; studentsWithMentorCount: number }) {
    this.studentsActiveCount = stats.studentsActiveCount;
    this.studentsTotalCount = stats.studentsTotalCount;
    this.studentsWithMentorCount = stats.studentsWithMentorCount;
  }

  @ApiProperty()
  studentsActiveCount: number;

  @ApiProperty()
  studentsTotalCount: number;

  @ApiProperty()
  studentsWithMentorCount: number;
}

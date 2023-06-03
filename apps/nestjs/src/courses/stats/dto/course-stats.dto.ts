import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsDto {
  constructor(stats: { studentsActiveCount: number; studentsTotalCount: number }) {
    this.studentsActiveCount = stats.studentsActiveCount;
    this.studentsTotalCount = stats.studentsTotalCount;
  }

  @ApiProperty()
  studentsActiveCount: number;

  @ApiProperty()
  studentsTotalCount: number;
}

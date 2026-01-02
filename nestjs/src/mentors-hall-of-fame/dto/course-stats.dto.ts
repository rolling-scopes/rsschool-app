import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsDto {
  constructor(courseName: string, studentsCount: number) {
    this.courseName = courseName;
    this.studentsCount = studentsCount;
  }

  @ApiProperty({ description: 'Name of the course' })
  public courseName: string;

  @ApiProperty({ description: 'Number of certified students mentored in this course' })
  public studentsCount: number;
}

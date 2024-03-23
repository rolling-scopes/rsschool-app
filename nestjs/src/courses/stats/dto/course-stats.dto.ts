import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsDto {
  constructor(stats: {
    studentsActiveCount: number;
    studentsTotalCount: number;
    studentsWithMentorCount: number;
    studentsWithCertificateCount: number;
  }) {
    this.studentsActiveCount = stats.studentsActiveCount;
    this.studentsTotalCount = stats.studentsTotalCount;
    this.studentsWithMentorCount = stats.studentsWithMentorCount;
    this.studentsWithCertificateCount = stats.studentsWithCertificateCount;
  }

  @ApiProperty()
  studentsActiveCount: number;

  @ApiProperty()
  studentsTotalCount: number;

  @ApiProperty()
  studentsWithMentorCount: number;

  @ApiProperty()
  studentsWithCertificateCount: number;
}

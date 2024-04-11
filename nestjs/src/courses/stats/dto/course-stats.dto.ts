import { ApiProperty } from '@nestjs/swagger';

export class CourseStatsDto {
  constructor(stats: {
    activeStudentsCount: number;
    totalStudents: number;
    studentsWithMentorCount: number;
    certifiedStudentsCount: number;
    eligibleForCertificationCount: number;
  }) {
    this.activeStudentsCount = stats.activeStudentsCount;
    this.totalStudents = stats.totalStudents;
    this.studentsWithMentorCount = stats.studentsWithMentorCount;
    this.certifiedStudentsCount = stats.certifiedStudentsCount;
    this.eligibleForCertificationCount = stats.eligibleForCertificationCount;
  }

  @ApiProperty()
  activeStudentsCount: number;

  @ApiProperty()
  totalStudents: number;

  @ApiProperty()
  studentsWithMentorCount: number;

  @ApiProperty()
  certifiedStudentsCount: number;

  @ApiProperty()
  eligibleForCertificationCount: number;
}

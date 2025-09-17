import { ApiProperty } from '@nestjs/swagger';
import { CountriesStatsDto } from './countries-stats.dto';
import { CourseMentorsStatsDto } from './course-mentors-stats.dto';
import { CourseTaskDto } from '../../course-tasks/dto';

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

export class CourseAggregateStatsDto {
  constructor(stats: {
    studentsCountries: CountriesStatsDto;
    studentsStats: CourseStatsDto;
    mentorsCountries: CountriesStatsDto;
    mentorsStats: CourseMentorsStatsDto;
    courseTasks: CourseTaskDto[];
    studentsCertificatesCountries: CountriesStatsDto;
  }) {
    this.studentsCountries = stats.studentsCountries;
    this.studentsStats = stats.studentsStats;
    this.mentorsCountries = stats.mentorsCountries;
    this.mentorsStats = stats.mentorsStats;
    this.courseTasks = stats.courseTasks;
    this.studentsCertificatesCountries = stats.studentsCertificatesCountries;
  }

  @ApiProperty()
  studentsCountries: CountriesStatsDto;

  @ApiProperty()
  studentsStats: CourseStatsDto;

  @ApiProperty()
  mentorsCountries: CountriesStatsDto;

  @ApiProperty()
  mentorsStats: CourseMentorsStatsDto;

  @ApiProperty()
  courseTasks: CourseTaskDto[];

  @ApiProperty()
  studentsCertificatesCountries: CountriesStatsDto;
}

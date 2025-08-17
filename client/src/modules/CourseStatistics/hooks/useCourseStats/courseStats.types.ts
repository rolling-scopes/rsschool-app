import { CountriesStatsDto, CourseMentorsStatsDto, CourseStatsDto, CourseTaskDto } from '@client/api';

export type CourseStatsData = {
  studentsCountries: CountriesStatsDto;
  studentsStats: CourseStatsDto;
  mentorsCountries: CountriesStatsDto;
  mentorsStats: CourseMentorsStatsDto;
  courseTasks: CourseTaskDto[];
  studentsCertificatesCountries: CountriesStatsDto;
};

export type CourseStatsError = {
  error: boolean;
};

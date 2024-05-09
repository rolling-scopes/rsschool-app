export interface FilterMentorRegistriesDto {
  githubId?: string;
  cityName?: string;
  currentPage: number;
  pageSize: number;
  preselectedCourses?: number[];
  preferedCourses?: number[];
  technicalMentoring?: string[];
}

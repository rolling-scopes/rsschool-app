export interface CourseStats {
  courseName: string;
  studentsCount: number;
}

export interface TopMentor {
  rank: number;
  githubId: string;
  name: string;
  totalStudents: number;
  courseStats: CourseStats[];
}

export interface Pagination {
  pageSize: number;
  current: number;
  total: number;
  totalPages: number;
}

export interface PaginatedTopMentors {
  items: TopMentor[];
  pagination: Pagination;
}

import { MentorDashboardDto, ProfileCourseDto } from 'api';

export type StudentsTableRow = MentorDashboardDto;

export interface StudentsTableProps {
  data: StudentsTableRow[];
  course: ProfileCourseDto;
}

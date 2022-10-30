import { MentorDashboardDto } from 'api';

export type StudentsTableRow = MentorDashboardDto;

export interface StudentsTableProps {
  data: StudentsTableRow[];
}

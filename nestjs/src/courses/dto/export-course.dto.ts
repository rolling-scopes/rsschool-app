import { Course } from '@entities/course';

export class ExportCourseDto {
  constructor(course: Course) {
    this.id = course.id;
    this.name = course.name;
    this.startDate = course.startDate.toISOString();
    this.endDate = course.endDate.toISOString();
    this.alias = course.alias;
    this.discipline = course.discipline;
    this.description = course.description;
  }

  id: number;
  name: string;
  alias: string;
  description: string;
  discipline: { id: number; name: string } | null;
  registrationEndDate: string;
  startDate: string;
  endDate: string;
}

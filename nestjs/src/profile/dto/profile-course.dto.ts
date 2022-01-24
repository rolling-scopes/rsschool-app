import { Course } from '@entities/course';
import { CourseDto } from '../../courses/dto';

export class ProfileCourseDto extends CourseDto {
  constructor(course: Course) {
    super(course);
  }
}

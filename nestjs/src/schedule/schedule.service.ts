import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { CourseTasksService } from 'src/courses';
import { Student } from '@entities/student';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('schedule');
  constructor(private courseService: CoursesService, private courseTasksService: CourseTasksService) {}

  public async getChangedStudentsCourses() {
    const activeCourses = await this.courseService.getActiveCourses(['students']);

    const updatedCourseSchedule = [];
    for (const course of activeCourses) {
      const tasks = await this.courseTasksService.getUpdatedTasks(course.id, 1);

      const updatedTasks = tasks.length > 0;

      if (updatedTasks) {
        this.logger.log({ message: `course: ${course.id} has ${tasks.length} tasks updated` });

        updatedCourseSchedule.push({
          alias: course.alias,
          name: course.name,
          students: course.students,
        });
      }
    }

    return this.mapChangedCourseToStudents(updatedCourseSchedule);
  }

  private mapChangedCourseToStudents(courses: { alias: string; students: Student[] }[]) {
    const studentMap = new Map<number, { alias: string }[]>();

    for (const course of courses) {
      const { students, ...rest } = course;

      for (const student of students) {
        const studentCourses = studentMap.get(student.userId) ?? [];

        studentCourses.push(rest);
        studentMap.set(student.userId, studentCourses);
      }
    }

    return studentMap.entries();
  }
}

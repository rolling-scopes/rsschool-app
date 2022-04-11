import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { CourseTasksService } from 'src/courses';
import { Student } from '@entities/student';
import { Mentor } from '@entities/mentor';
import { unionBy } from 'lodash';
import { StudentsService } from 'src/courses/students';
import { MentorsService } from 'src/courses/mentors';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger('schedule');
  constructor(
    private courseService: CoursesService,
    private courseTasksService: CourseTasksService,
    private studentsService: StudentsService,
    private mentorsService: MentorsService,
  ) {}

  public async getChangedCoursesRecipients() {
    const activeCourses = await this.courseService.getActiveCourses();

    const updatedCourseSchedule = [];
    for (const course of activeCourses) {
      const tasks = await this.courseTasksService.getUpdatedTasks(course.id, 1);

      const updatedTasks = tasks.length > 0;

      const [students, mentors] = await Promise.all([
        this.studentsService.getActiveByCourseId(course.id),
        this.mentorsService.getActiveByCourseId(course.id),
      ]);

      this.logger.log({ message: `course: ${course.id} has ${tasks.length} tasks updated` });

      if (updatedTasks) {
        updatedCourseSchedule.push({
          alias: course.alias,
          name: course.name,
          students,
          mentors,
        });
      }
    }

    return this.mapChangedCoursesToRecipients(updatedCourseSchedule);
  }

  private mapChangedCoursesToRecipients(courses: { alias: string; students: Student[]; mentors: Mentor[] }[]) {
    const recipientMap = new Map<number, { alias: string }[]>();

    for (const course of courses) {
      const { students, mentors, ...rest } = course;
      const users = unionBy<{ userId: number }>(students, mentors, 'userId');

      for (const user of users) {
        const userCourses = recipientMap.get(user.userId) ?? [];

        userCourses.push(rest);
        recipientMap.set(user.userId, userCourses);
      }
    }

    return recipientMap.entries();
  }
}

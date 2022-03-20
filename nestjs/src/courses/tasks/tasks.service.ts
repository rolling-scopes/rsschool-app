import { Injectable, Logger } from '@nestjs/common';
import { CoursesService } from 'src/courses/courses.service';
import { CourseTasksService } from 'src/courses';
import { Course } from '@entities/course';
import { Task } from '@entities/task';

@Injectable()
export class TasksService {
  private readonly logger = new Logger('tasks');

  constructor(private courseService: CoursesService, private courseTasksService: CourseTasksService) {}

  public async getPendingTasksDeadline(deadlineWithinHours: number) {
    const activeCourses = await this.courseService.getActiveCourses(['students']);
    const studentMap = new Map<number, { course: Omit<Course, 'students'>; task: Task }[]>();

    for (const course of activeCourses) {
      const { students, ...courseInfo } = course;
      const courseTasks = await this.courseTasksService.getTasksPendingDeadline(courseInfo.id, {
        deadlineWithinHours,
      });
      this.logger.log({ message: `course: ${course.id} has ${courseTasks.length} tasks pending deadline` });

      const taskSolutions = courseTasks.map(courseTask => ({
        course: courseInfo,
        task: courseTask.task,
        studentHasSolution: new Set<number>(courseTask.taskSolutions.map(solution => solution.studentId)),
      }));

      for (const student of students) {
        for (const solutionInfo of taskSolutions) {
          const { studentHasSolution, ...rest } = solutionInfo;
          if (!studentHasSolution.has(student.id)) {
            const studentPendingTasks = studentMap.get(student.userId) ?? [];

            studentPendingTasks.push(rest);
            studentMap.set(student.userId, studentPendingTasks);
          }
        }
      }
    }
    this.logger.log({ message: `students missing deadlines ${studentMap.size}` });

    return studentMap;
  }
}

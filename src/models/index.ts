import { User } from './user';
import { Feedback } from './feedback';
import { Course } from './course';
import { Task } from './task';
import { TaskResult } from './taskResult';
import { CourseTask } from './courseTask';
import { Student } from './student';
import { Mentor } from './mentor';
import { Stage } from './stage';
import { Checker } from './checker';

export * from './session';

export const models = [Stage, Mentor, Checker, Student, User, Feedback, Course, Task, TaskResult, CourseTask];

export { Stage, User, Checker, Feedback, CourseTask, Course, Task, Student, Mentor, TaskResult };

export interface IApiResponse<T> {
  data: T | T[] | null;
}

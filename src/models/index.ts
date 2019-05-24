import { User } from './user';
import { Feedback } from './feedback';
import { Course } from './course';
import { Task } from './task';
import { TaskResult } from './taskResult';
import { CourseTask } from './courseTask';
import { Student } from './student';
import { Mentor } from './mentor';
import { Stage } from './stage';
import { TaskChecker } from './taskChecker';
<<<<<<< HEAD
import { TaskArtefact } from './taskArtefact';

export * from './session';

export const models = [
  Stage,
  Mentor,
  TaskChecker,
  TaskArtefact,
  Student,
  User,
  Feedback,
  Course,
  Task,
  TaskResult,
  CourseTask,
];

export { Stage, User, TaskChecker, Feedback, TaskArtefact, CourseTask, Course, Task, Student, Mentor, TaskResult };
=======

export * from './session';

export const models = [Stage, Mentor, TaskChecker, Student, User, Feedback, Course, Task, TaskResult, CourseTask];

export { Stage, User, TaskChecker, Feedback, CourseTask, Course, Task, Student, Mentor, TaskResult };
>>>>>>> feat: update task checker

export interface IApiResponse<T> {
  data: T | T[] | null;
}

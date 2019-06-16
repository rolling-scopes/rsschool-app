import { User } from './user';
import { Registry } from './registry';
import { Feedback } from './feedback';
import { Course } from './course';
import { Task } from './task';
import { TaskResult } from './taskResult';
import { CourseTask } from './courseTask';
import { Student } from './student';
import { Mentor } from './mentor';
import { Stage } from './stage';
import { TaskChecker } from './taskChecker';
import { TaskArtefact } from './taskArtefact';

export * from './session';

export const models = [
  Stage,
  Mentor,
  TaskChecker,
  TaskArtefact,
  Student,
  User,
  Registry,
  Feedback,
  Course,
  Task,
  TaskResult,
  CourseTask,
];

export {
  Stage,
  User,
  Registry,
  TaskChecker,
  Feedback,
  TaskArtefact,
  CourseTask,
  Course,
  Task,
  Student,
  Mentor,
  TaskResult,
};

export interface IApiResponse<T> {
  data: T | T[] | null;
}

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
import { TaskArtefact } from './taskArtefact';
import { TaskInterviewResult } from './taskInterviewResult';

export * from './session';

export const models = [
  Course,
  CourseTask,
  Feedback,
  Mentor,
  Stage,
  Student,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskResult,
  User,
];

export {
  Course,
  CourseTask,
  Feedback,
  Mentor,
  Stage,
  Student,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskResult,
  User,
};

export interface IApiResponse<T> {
  data: T | T[] | null;
}

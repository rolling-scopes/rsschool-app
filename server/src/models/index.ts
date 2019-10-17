import { User, ExternalAccount } from './user';
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
import { CourseManager } from './courseManager';
import { TaskInterviewResult } from './taskInterviewResult';
import { StudentFeedback } from './studentFeedback';
import { PrivateFeedback } from './privateFeedback';
import { Event } from './event';
import { CourseEvent } from './courseEvent';
import { Certificate } from './certificate';
import { TaskVerification } from './taskVerification';
import { StageInterview } from './stageInterview';

export * from './session';

export const models = [
  Course,
  CourseTask,
  Feedback,
  Mentor,
  Stage,
  Student,
  Registry,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskResult,
  User,
  StudentFeedback,
  CourseManager,
  PrivateFeedback,
  CourseEvent,
  Event,
  Certificate,
  TaskVerification,
  StageInterview,
];

export {
  Course,
  CourseTask,
  Feedback,
  Mentor,
  Stage,
  Student,
  Registry,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskInterviewResult,
  TaskResult,
  User,
  StudentFeedback,
  ExternalAccount,
  CourseManager,
  PrivateFeedback,
  Certificate,
  Event,
  CourseEvent,
  TaskVerification,
  StageInterview,
};

export interface IApiResponse<T> {
  data: T | T[] | null;
}

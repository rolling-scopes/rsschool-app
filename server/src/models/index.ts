import { Alert, AlertType } from './alert';
import { Certificate } from './certificate';
import { Contributor } from './contributor';
import { Course } from './course';
import { CourseEvent } from './courseEvent';
import { CourseManager } from './courseManager';
import { CourseTask } from './courseTask';
import { CourseUser } from './courseUser';
import { CourseLeaveSurveyResponse } from './course-leave-survey-response';
import { Discipline } from './discipline';
import { DiscordServer } from './discordServer';
import { Event } from './event';
import { ExternalAccount, User } from './user';
import { Session } from 'inspector';
import { Feedback } from './feedback';
import { History } from './history';
import { LoginState } from './loginState';
import { Mentor } from './mentor';
import { MentorRegistry } from './mentorRegistry';
import { Notification } from './notification';
import { NotificationChannel } from './notificationChannel';
import { NotificationChannelSettings } from './notificationChannelSettings';
import { NotificationUserConnection } from './notificationUserConnection';
import { NotificationUserSettings } from './notificationUserSettings';
import { PrivateFeedback } from './privateFeedback';
import { ProfilePermissions } from './profilePermissions';
import { Prompt } from './prompt';
import { Registry } from './registry';
import { RepositoryEvent } from './repositoryEvent';
import { Resume } from './resume';
import { StageInterview } from './stageInterview';
import { StageInterviewFeedback } from './stageInterviewFeedback';
import { StageInterviewStudent } from './stageInterviewStudent';
import { Student } from './student';
import { StudentFeedback } from './student-feedback';
import { Task } from './task';
import { TaskArtefact } from './taskArtefact';
import { TaskChecker } from './taskChecker';
import { TaskCriteria } from './taskCriteria';
import { TaskInterviewResult } from './taskInterviewResult';
import { TaskInterviewStudent } from './taskInterviewStudent';
import { TaskResult } from './taskResult';
import { TaskSolution } from './taskSolution';
import { TaskSolutionChecker } from './taskSolutionChecker';
import { TaskSolutionResult } from './taskSolutionResult';
import { TaskVerification } from './taskVerification';
import { UserGroup } from './userGroup';
import { TeamDistribution } from './teamDistribution';
import { Team } from './team';
import { TeamDistributionStudent } from './teamDistributionStudent';

export * from './session';
export {
  Alert,
  AlertType as AlertTypes,
  Certificate,
  Contributor,
  Course,
  CourseEvent,
  CourseManager,
  CourseTask,
  CourseUser,
  CourseLeaveSurveyResponse,
  Discipline,
  DiscordServer,
  Event,
  ExternalAccount,
  Feedback,
  LoginState,
  Mentor,
  MentorRegistry,
  Notification,
  NotificationChannel,
  NotificationChannelSettings,
  NotificationUserConnection,
  NotificationUserSettings,
  PrivateFeedback,
  ProfilePermissions,
  Prompt,
  Registry,
  RepositoryEvent,
  Resume,
  Session,
  StageInterview,
  StageInterviewFeedback,
  StageInterviewStudent,
  Student,
  StudentFeedback,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskCriteria,
  TaskInterviewResult,
  TaskInterviewStudent,
  TaskResult,
  TaskSolution,
  TaskSolutionChecker,
  TaskSolutionResult,
  TaskVerification,
  Team,
  TeamDistribution,
  TeamDistributionStudent,
  User,
  UserGroup,
};

export const models = [
  Alert,
  Certificate,
  Contributor,
  Course,
  CourseEvent,
  CourseManager,
  CourseTask,
  CourseUser,
  CourseLeaveSurveyResponse,
  Discipline,
  DiscordServer,
  Event,
  Feedback,
  History,
  LoginState,
  Mentor,
  MentorRegistry,
  Notification,
  NotificationChannel,
  NotificationChannelSettings,
  NotificationUserConnection,
  NotificationUserSettings,
  PrivateFeedback,
  ProfilePermissions,
  Prompt,
  Registry,
  RepositoryEvent,
  Resume,
  Session,
  StageInterview,
  StageInterviewFeedback,
  StageInterviewStudent,
  Student,
  StudentFeedback,
  Task,
  TaskArtefact,
  TaskChecker,
  TaskCriteria,
  TaskInterviewResult,
  TaskInterviewStudent,
  TaskResult,
  TaskSolution,
  TaskSolutionChecker,
  TaskSolutionResult,
  TaskVerification,
  Team,
  TeamDistribution,
  TeamDistributionStudent,
  User,
  UserGroup,
];

export interface IApiResponse<T> {
  data: T | T[] | null;
  error?: {
    message: string;
  };
}

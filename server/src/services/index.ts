import * as userService from './userService';
import * as studentsService from './studentsService';
import * as courseService from './courseService';
import * as taskResultsService from './taskResultsService';
import * as taskService from './tasksService';
import * as awsTaskService from './awsTaskService';
import * as stageInterviewService from './stageInterviewService';
import * as consentService from './consentService';
import * as notificationService from './notificationService';

export * from './operationResult';
export {
  userService,
  taskService,
  studentsService,
  courseService,
  taskResultsService,
  awsTaskService,
  stageInterviewService,
  consentService,
  notificationService,
};

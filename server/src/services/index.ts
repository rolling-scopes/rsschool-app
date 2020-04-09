import * as userService from './user.service';
import * as courseService from './course.service';
import * as taskResultsService from './taskResults.service';
import * as taskService from './tasks.service';
import * as awsTaskService from './aws.service';
import * as stageInterviewService from './stageInterview.service';
import * as consentService from './consent.service';
import * as notificationService from './notification.service';

export * from './operationResult';
export {
  userService,
  taskService,
  courseService,
  taskResultsService,
  awsTaskService,
  stageInterviewService,
  consentService,
  notificationService,
};

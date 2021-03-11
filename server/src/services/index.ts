import * as userService from './user.service';
import * as courseService from './course.service';
import * as taskResultsService from './taskResults.service';
import * as taskService from './tasks.service';
import * as awsTaskService from './aws.service';
import * as stageInterviewService from './stageInterview.service';
import * as notificationService from './notification.service';
import * as studentService from './student.service';
import * as interviewService from './interview.service';

export { RepositoryService } from './repository.service';
export { CrossCheckService } from './crossCheck.service';

export * from './operationResult';
export {
  studentService,
  userService,
  taskService,
  courseService,
  taskResultsService,
  awsTaskService,
  stageInterviewService,
  notificationService,
  interviewService,
};

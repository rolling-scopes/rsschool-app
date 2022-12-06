import { StageInterviewFeedbackVerdict, InterviewDetails as CommonInterviewDetails } from 'common/models';
import moment from 'moment';

export function friendlyStageInterviewVerdict(value: StageInterviewFeedbackVerdict) {
  switch (value) {
    case 'didNotDecideYet':
      return 'No decision yet';
    case 'no':
      return 'No';
    case 'yes':
      return 'Yes';
    case 'noButGoodCandidate':
      return 'No, but good student';
    default:
      return value;
  }
}

export type InterviewDetails = CommonInterviewDetails;

export enum InterviewStatus {
  NotCompleted,
  Completed,
  Canceled,
}

export const stageInterviewType = 'stage-interview';

export function isInterviewRegistrationInProgess(interviewStartDate: string) {
  const startDate = moment(interviewStartDate).subtract(2, 'weeks');

  return moment().isBetween(startDate, interviewStartDate);
}

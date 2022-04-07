import { StageInterviewFeedbackVerdict, InterviewDetails as CommonInterviewDetails } from 'common/models';

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

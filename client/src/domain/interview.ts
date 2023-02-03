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

export function isInterviewStarted(interviewStartDate: string) {
  return moment().isAfter(moment(interviewStartDate));
}

export function getInterviewFeedbackUrl({
  courseAlias,
  interviewName,
  studentGithubId,
  template,
}: {
  courseAlias: string;
  studentGithubId: string;
  template?: string | null;
  interviewName: string;
}) {
  if (!isTechnicalScreening(interviewName)) {
    return `/course/interview/${template}/feedback?course=${courseAlias}&githubId=${studentGithubId}`;
  }

  return `/course/mentor/interview-technical-screening?course=${courseAlias}&githubId=${studentGithubId}`;
}

export function isTechnicalScreening(name: string) {
  return name.includes('Technical Screening');
}

export const getInterviewWaitList = (courseAlias: string, interviewId: number) =>
  `/course/mentor/interview-wait-list?course=${courseAlias}&interviewId=${interviewId}`;
